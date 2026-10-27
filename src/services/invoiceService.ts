import { Invoice, InvoiceLine, StockVoucher, NotificationItem } from '../types/petflow';
import {
  loadDatabase,
  saveDatabase,
  getInvoices,
  getCatalogItems,
  getAppointmentById,
  saveAppointment
} from './storage';

// In-memory atomic lock to prevent concurrent double-click execution (TC-02)
let isInvoiceProcessing = false;

/**
 * Generate unique invoice code in format HDYYYYMMDDnnn
 * Expands to 4+ digits if count exceeds 999 (TC-15)
 */
export function generateInvoiceCode(targetDate: Date = new Date()): string {
  const yyyy = targetDate.getFullYear().toString();
  const mm = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const dd = targetDate.getDate().toString().padStart(2, '0');
  const datePrefix = `HD${yyyy}${mm}${dd}`;

  const allInvoices = getInvoices();
  // Filter invoices completed on the same date
  const sameDayInvoices = allInvoices.filter(inv => inv.invoiceCode.startsWith(datePrefix));

  let maxSequence = 0;
  for (const inv of sameDayInvoices) {
    const seqStr = inv.invoiceCode.slice(datePrefix.length);
    const seqNum = parseInt(seqStr, 10);
    if (!isNaN(seqNum) && seqNum > maxSequence) {
      maxSequence = seqNum;
    }
  }

  const nextSeq = maxSequence + 1;
  const seqPadded = nextSeq < 1000 ? nextSeq.toString().padStart(3, '0') : nextSeq.toString();
  return `${datePrefix}${seqPadded}`;
}

export interface CompleteInvoiceRequest {
  customerId: string;
  customerName: string;
  customerPhone: string;
  isRetailCustomer?: boolean;
  appointmentId?: string;
  lines: Array<{
    itemId?: string;
    itemName: string;
    itemType: 'GOODS' | 'SERVICE' | 'VACCINE_PRODUCT' | 'VACCINE_SERVICE';
    quantity: number;
    unitPrice: number;
    discount: number;
    costPrice?: number;
  }>;
  otherCharge?: number;
}

export interface CompleteInvoiceResult {
  success: boolean;
  invoice?: Invoice;
  message?: string;
  shouldPromptVaccineReminder: boolean;
  hasStockWarnings: boolean;
  stockWarnings: string[];
}

export async function completeInvoice(request: CompleteInvoiceRequest): Promise<CompleteInvoiceResult> {
  // Prevent double-click execution
  if (isInvoiceProcessing) {
    return {
      success: false,
      message: 'Hệ thống đang xử lý hóa đơn, vui lòng không bấm liên tục.',
      shouldPromptVaccineReminder: false,
      hasStockWarnings: false,
      stockWarnings: []
    };
  }

  isInvoiceProcessing = true;

  try {
    if (!request.lines || request.lines.length === 0) {
      return {
        success: false,
        message: 'Hóa đơn phải có ít nhất một dòng hàng hóa hoặc dịch vụ.',
        shouldPromptVaccineReminder: false,
        hasStockWarnings: false,
        stockWarnings: []
      };
    }

    const db = loadDatabase();
    const now = new Date();
    const invoiceCode = generateInvoiceCode(now);
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let subtotal = 0;
    let totalDiscount = 0;
    const processedLines: InvoiceLine[] = [];
    const stockWarnings: string[] = [];
    let hasVaccineService = false;
    const newStockVouchers: StockVoucher[] = [];
    const newNotifications: NotificationItem[] = [];

    // Calculate lines and prepare stock deductions
    for (let i = 0; i < request.lines.length; i++) {
      const lineReq = request.lines[i];
      const maxDiscount = lineReq.unitPrice * lineReq.quantity;
      // Clamp discount so it cannot exceed line total before discount
      const safeDiscount = Math.min(Math.max(0, lineReq.discount || 0), maxDiscount);
      const lineTotal = maxDiscount - safeDiscount;

      subtotal += maxDiscount;
      totalDiscount += safeDiscount;

      let costPrice = lineReq.costPrice ?? 0;
      // If itemId is provided, check catalog item
      if (lineReq.itemId) {
        const catalogItem = db.catalog.find(it => it.id === lineReq.itemId);
        if (catalogItem) {
          costPrice = catalogItem.costPrice || 0;

          // Check if goods or vaccine product needs inventory deduction
          if (catalogItem.type === 'GOODS') {
            const previousStock = catalogItem.stockQuantity;
            const newStock = previousStock - lineReq.quantity;

            // Warn if stock becomes negative (TC-03)
            if (previousStock < lineReq.quantity) {
              stockWarnings.push(
                `Sản phẩm "${catalogItem.name}" chỉ còn ${previousStock} trong kho (bán ${lineReq.quantity}). Tồn kho hệ thống sẽ thành ${newStock}.`
              );
            }

            // Update item stock directly
            catalogItem.stockQuantity = newStock;

            // Record StockVoucher
            const voucherCode = `PX${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${Math.floor(100 + Math.random() * 900)}`;
            const voucher: StockVoucher = {
              id: `vch_${Date.now()}_${i}`,
              voucherCode,
              type: 'EXPORT',
              timestamp: now.toISOString(),
              itemId: catalogItem.id,
              itemName: catalogItem.name,
              quantity: lineReq.quantity,
              previousStock,
              newStock,
              notes: `Xuất kho tự động theo hóa đơn ${invoiceCode}`
            };
            newStockVouchers.push(voucher);

            // Check stock threshold alerts (Section 8.3)
            if (newStock < 0) {
              newNotifications.push({
                id: `notif_neg_${Date.now()}_${catalogItem.id}`,
                type: 'STOCK_NEGATIVE',
                category: 'Tồn kho',
                relatedEntityId: catalogItem.id,
                relatedEntityType: 'catalog',
                title: 'Cảnh báo tồn kho âm',
                body: `Sản phẩm "${catalogItem.name}" có số tồn kho âm (${newStock}). Cần kiểm tra và nhập bù kho thực tế.`,
                createdAt: now.toISOString(),
                deduplicationKey: `stock_negative_${catalogItem.id}_${now.toISOString().slice(0, 10)}`
              });
            } else if (newStock === 0) {
              newNotifications.push({
                id: `notif_out_${Date.now()}_${catalogItem.id}`,
                type: 'STOCK_OUT',
                category: 'Tồn kho',
                relatedEntityId: catalogItem.id,
                relatedEntityType: 'catalog',
                title: 'Hết hàng trong kho',
                body: `Sản phẩm "${catalogItem.name}" đã hết hàng (số lượng: 0).`,
                createdAt: now.toISOString(),
                deduplicationKey: `stock_out_${catalogItem.id}_${now.toISOString().slice(0, 10)}`
              });
            } else if (newStock >= 1 && newStock <= 5) {
              newNotifications.push({
                id: `notif_low_${Date.now()}_${catalogItem.id}`,
                type: 'STOCK_LOW',
                category: 'Tồn kho',
                relatedEntityId: catalogItem.id,
                relatedEntityType: 'catalog',
                title: 'Sắp hết hàng',
                body: `Sản phẩm "${catalogItem.name}" chỉ còn ${newStock} sản phẩm trong kho.`,
                createdAt: now.toISOString(),
                deduplicationKey: `stock_low_${catalogItem.id}_${now.toISOString().slice(0, 10)}`
              });
            }
          }
        }
      }

      // Check vaccine service flag
      if (lineReq.itemType === 'VACCINE_SERVICE') {
        hasVaccineService = true;
      }

      processedLines.push({
        id: `line_${invoiceId}_${i + 1}`,
        itemId: lineReq.itemId,
        itemNameSnapshot: lineReq.itemName,
        itemTypeSnapshot: lineReq.itemType,
        quantity: lineReq.quantity,
        unitPriceSnapshot: lineReq.unitPrice,
        discount: safeDiscount,
        lineTotal,
        costPriceSnapshot: costPrice
      });
    }

    const otherCharge = Math.max(0, request.otherCharge || 0);
    const totalPayable = Math.max(0, subtotal - totalDiscount + otherCharge);

    const newInvoice: Invoice = {
      id: invoiceId,
      invoiceCode,
      customerId: request.customerId,
      customerNameSnapshot: request.customerName,
      customerPhoneSnapshot: request.customerPhone,
      isRetailCustomer: request.isRetailCustomer,
      appointmentId: request.appointmentId,
      completedAt: now.toISOString(),
      subtotal,
      totalDiscount,
      otherCharge,
      totalPayable,
      paidAmount: totalPayable,
      status: 'COMPLETED',
      lines: processedLines
    };

    // Save invoice to database atomically
    db.invoices.unshift(newInvoice);

    // Save stock vouchers and notifications
    newStockVouchers.forEach(v => db.stockVouchers.push(v));
    newNotifications.forEach(n => {
      // Check deduplication key
      if (!db.notifications.some(existing => existing.deduplicationKey === n.deduplicationKey)) {
        db.notifications.unshift(n);
      }
    });

    // If linked to an appointment, link it
    if (request.appointmentId) {
      const apt = db.appointments.find(a => a.id === request.appointmentId);
      if (apt) {
        apt.linkedInvoiceId = invoiceId;
      }
    }

    saveDatabase(db);

    return {
      success: true,
      invoice: newInvoice,
      message: 'Hoàn thành hóa đơn và thanh toán thành công!',
      shouldPromptVaccineReminder: hasVaccineService, // TC-05 vs TC-04
      hasStockWarnings: stockWarnings.length > 0,
      stockWarnings
    };
  } finally {
    isInvoiceProcessing = false;
  }
}
