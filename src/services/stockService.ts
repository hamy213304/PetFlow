import { StockVoucher, NotificationItem, CatalogItem } from '../types/petflow';
import {
  loadDatabase,
  saveDatabase,
  getCatalogItemById,
  saveCatalogItem,
  addStockVoucher,
  addNotification
} from './storage';

export interface StockInRequest {
  itemId: string;
  quantity: number;
  expiryDate?: string;
  notes?: string;
}

export interface StockOutRequest {
  itemId: string;
  quantity: number;
  notes?: string;
}

export function performStockIn(req: StockInRequest): { success: boolean; message: string } {
  if (req.quantity <= 0) {
    return { success: false, message: 'Số lượng nhập phải lớn hơn 0.' };
  }

  const item = getCatalogItemById(req.itemId);
  if (!item) {
    return { success: false, message: 'Không tìm thấy hàng hóa.' };
  }

  if (item.type !== 'GOODS') {
    return { success: false, message: 'Dịch vụ không áp dụng nhập/xuất kho.' };
  }

  const now = new Date();
  const previousStock = item.stockQuantity;
  const newStock = previousStock + req.quantity;

  item.stockQuantity = newStock;
  if (req.expiryDate) {
    item.expiryDate = req.expiryDate;
  }
  saveCatalogItem(item);

  const voucherCode = `PN${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${Math.floor(100 + Math.random() * 900)}`;
  const voucher: StockVoucher = {
    id: `vch_${Date.now()}`,
    voucherCode,
    type: 'IMPORT',
    timestamp: now.toISOString(),
    itemId: item.id,
    itemName: item.name,
    quantity: req.quantity,
    previousStock,
    newStock,
    expiryDate: req.expiryDate,
    notes: req.notes || 'Nhập kho hàng hóa'
  };
  addStockVoucher(voucher);

  // Check 3-month expiry alert if applicable
  checkItemExpiryAlert(item);

  return { success: true, message: `Nhập kho thành công ${req.quantity} ${item.name}. Tồn mới: ${newStock}.` };
}

export function performStockOut(req: StockOutRequest): { success: boolean; message: string } {
  if (req.quantity <= 0) {
    return { success: false, message: 'Số lượng xuất phải lớn hơn 0.' };
  }

  const item = getCatalogItemById(req.itemId);
  if (!item) {
    return { success: false, message: 'Không tìm thấy hàng hóa.' };
  }

  if (item.type !== 'GOODS') {
    return { success: false, message: 'Dịch vụ không áp dụng nhập/xuất kho.' };
  }

  // Section 8.1 rule: không cho xuất kho lớn hơn số lượng hệ thống đang có theo luồng xuất kho thủ công
  if (req.quantity > item.stockQuantity) {
    return {
      success: false,
      message: `Không thể xuất kho lớn hơn số lượng hệ thống đang có (Tồn hiện tại: ${item.stockQuantity}, yêu cầu xuất: ${req.quantity}).`
    };
  }

  const now = new Date();
  const previousStock = item.stockQuantity;
  const newStock = previousStock - req.quantity;

  item.stockQuantity = newStock;
  saveCatalogItem(item);

  const voucherCode = `PX${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${Math.floor(100 + Math.random() * 900)}`;
  const voucher: StockVoucher = {
    id: `vch_${Date.now()}`,
    voucherCode,
    type: 'EXPORT',
    timestamp: now.toISOString(),
    itemId: item.id,
    itemName: item.name,
    quantity: req.quantity,
    previousStock,
    newStock,
    notes: req.notes || 'Xuất kho thủ công'
  };
  addStockVoucher(voucher);

  // Check stock threshold alerts (Section 8.3)
  if (newStock === 0) {
    addNotification({
      id: `notif_out_${Date.now()}_${item.id}`,
      type: 'STOCK_OUT',
      category: 'Tồn kho',
      relatedEntityId: item.id,
      relatedEntityType: 'catalog',
      title: 'Hết hàng trong kho',
      body: `Sản phẩm "${item.name}" đã hết hàng (số lượng: 0).`,
      createdAt: now.toISOString(),
      deduplicationKey: `stock_out_${item.id}_${now.toISOString().slice(0, 10)}`
    });
  } else if (newStock >= 1 && newStock <= 5) {
    addNotification({
      id: `notif_low_${Date.now()}_${item.id}`,
      type: 'STOCK_LOW',
      category: 'Tồn kho',
      relatedEntityId: item.id,
      relatedEntityType: 'catalog',
      title: 'Sắp hết hàng',
      body: `Sản phẩm "${item.name}" chỉ còn ${newStock} sản phẩm trong kho.`,
      createdAt: now.toISOString(),
      deduplicationKey: `stock_low_${item.id}_${now.toISOString().slice(0, 10)}`
    });
  }

  return { success: true, message: `Xuất kho thành công ${req.quantity} ${item.name}. Tồn mới: ${newStock}.` };
}

/**
 * Check if item is within 3 months of expiration (Section 8.3 & 12.3)
 */
export function checkItemExpiryAlert(item: CatalogItem): void {
  if (!item.expiryDate) return;
  const now = new Date();
  const expiry = new Date(`${item.expiryDate}T00:00:00`);
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  // If expiring within 3 months and not already expired long ago
  if (expiry <= threeMonthsFromNow && expiry >= now) {
    const [y, m, d] = item.expiryDate.split('-');
    const formatted = `${d}/${m}/${y}`;
    addNotification({
      id: `notif_exp_${item.id}`,
      type: 'EXPIRY_ALERT',
      category: 'Tồn kho',
      relatedEntityId: item.id,
      relatedEntityType: 'catalog',
      title: 'Hàng hóa sắp hết hạn sử dụng',
      body: `Hàng hóa "${item.name}" sắp hết hạn sử dụng vào ngày ${formatted}. Hãy kiểm tra và đưa ra biện pháp xử lý phù hợp.`,
      createdAt: now.toISOString(),
      deduplicationKey: `expiry_alert_${item.id}_${item.expiryDate}`
    });
  }
}
