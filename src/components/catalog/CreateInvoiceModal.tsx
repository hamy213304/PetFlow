import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  Plus,
  Trash2,
  DollarSign,
  User,
  Scissors,
  Package,
  AlertTriangle,
  CheckCircle2,
  Syringe,
  ArrowRight
} from 'lucide-react';
import { Customer, CatalogItem, Appointment, Invoice } from '../../types/petflow';
import { getCustomers, getCatalogItems, getPetsByCustomerId } from '../../services/storage';
import { completeInvoice } from '../../services/invoiceService';
import { formatVND } from '../../utils/formatters';
import { VaccinationModal } from '../customers/VaccinationModal';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedAppointment?: Appointment | null;
  onInvoiceCreated: (invoice: Invoice) => void;
}

interface WorkingLine {
  id: string;
  itemId?: string;
  itemName: string;
  itemType: 'GOODS' | 'SERVICE' | 'VACCINE_PRODUCT' | 'VACCINE_SERVICE';
  quantity: number;
  unitPrice: number;
  discount: number;
  currentStock?: number;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  linkedAppointment,
  onInvoiceCreated
}) => {
  const customers = getCustomers();
  const catalog = getCatalogItems().filter(i => i.status === 'ACTIVE');

  // Customer search & selection
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Invoice lines
  const [lines, setLines] = useState<WorkingLine[]>([]);
  const [otherCharge, setOtherCharge] = useState<string>('0');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post-completion Vaccine Prompt state (SRS Section 9.6 & TC-05)
  const [completedInvoiceForPrompt, setCompletedInvoiceForPrompt] = useState<Invoice | null>(null);
  const [showVaccinePrompt, setShowVaccinePrompt] = useState(false);
  const [selectedPetForVac, setSelectedPetForVac] = useState<string>('');
  const [isVacModalOpen, setIsVacModalOpen] = useState(false);

  // Pre-fill from appointment if provided
  useEffect(() => {
    if (linkedAppointment) {
      const cust = customers.find(c => c.id === linkedAppointment.customerId);
      if (cust) {
        setSelectedCustomer(cust);
        setCustomerSearch(cust.fullName);
      } else {
        setSelectedCustomer(null);
        setCustomerSearch('');
      }

      // Convert appointment services to invoice lines
      const aptLines: WorkingLine[] = linkedAppointment.services.map((s, idx) => {
        const catItem = catalog.find(i => i.id === s.serviceId);
        const isVaccineSrv = s.serviceName.toLowerCase().includes('tiêm') || s.serviceName.toLowerCase().includes('vaccine');
        return {
          id: `line_init_${idx}`,
          itemId: s.serviceId,
          itemName: s.serviceName,
          itemType: isVaccineSrv ? 'VACCINE_SERVICE' : 'SERVICE',
          quantity: s.quantity,
          unitPrice: s.price,
          discount: 0
        };
      });
      setLines(aptLines);
    } else {
      setSelectedCustomer(null);
      setCustomerSearch('');
      setLines([]);
    }
  }, [linkedAppointment, isOpen]);

  if (!isOpen) return null;

  // Handle Customer Selection
  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setCustomerSearch(c.fullName);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
  };

  // Add Item to Lines
  const handleAddItemToLines = (itemId: string) => {
    const item = catalog.find(i => i.id === itemId);
    if (!item) return;

    let lineType: 'GOODS' | 'SERVICE' | 'VACCINE_PRODUCT' | 'VACCINE_SERVICE' = item.type;
    if (item.type === 'GOODS' && (item.subType === 'Vaccine' || item.group === 'Tiêm chủng')) {
      lineType = 'VACCINE_PRODUCT';
    } else if (item.type === 'SERVICE' && (item.name.toLowerCase().includes('tiêm') || item.name.toLowerCase().includes('vaccine'))) {
      lineType = 'VACCINE_SERVICE';
    }

    setLines([
      ...lines,
      {
        id: `line_${Date.now()}_${Math.random()}`,
        itemId: item.id,
        itemName: item.name,
        itemType: lineType,
        quantity: 1,
        unitPrice: item.sellingPrice,
        discount: 0,
        currentStock: item.type === 'GOODS' ? item.stockQuantity : undefined
      }
    ]);
  };

  const handleLineQuantityChange = (id: string, qty: number) => {
    if (qty <= 0) return;
    setLines(lines.map(l => (l.id === id ? { ...l, quantity: qty } : l)));
  };

  const handleLineDiscountChange = (id: string, discountVal: number) => {
    setLines(
      lines.map(l => {
        if (l.id !== id) return l;
        const maxDiscount = l.unitPrice * l.quantity;
        return {
          ...l,
          discount: Math.min(Math.max(0, discountVal), maxDiscount)
        };
      })
    );
  };

  const handleRemoveLine = (id: string) => {
    setLines(lines.filter(l => l.id !== id));
  };

  // Calculations
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const totalDiscount = lines.reduce((sum, l) => sum + l.discount, 0);
  const otherChargeNum = Math.max(0, parseInt(otherCharge, 10) || 0);
  const totalPayable = Math.max(0, subtotal - totalDiscount + otherChargeNum);

  // Check for stock warnings (TC-03)
  const stockWarnings: string[] = [];
  lines.forEach(l => {
    if (l.currentStock !== undefined && l.quantity > l.currentStock) {
      stockWarnings.push(
        `"${l.itemName}": Trong kho còn ${l.currentStock}, bán ${l.quantity}. Tồn kho hệ thống sẽ bị âm (${l.currentStock - l.quantity}).`
      );
    }
  });

  const handleCompletePayment = async () => {
    setErrorMsg(null);
    if (lines.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất một mặt hàng hoặc dịch vụ vào hóa đơn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const isRetailCustomer = !selectedCustomer;
      const customerId = selectedCustomer ? selectedCustomer.id : 'retail_walkin';
      const customerName = selectedCustomer ? selectedCustomer.fullName : 'Khách lẻ';
      const customerPhone = selectedCustomer ? selectedCustomer.phoneNumber : '---';

      const res = await completeInvoice({
        customerId,
        customerName,
        customerPhone,
        isRetailCustomer,
        appointmentId: linkedAppointment?.id,
        lines: lines.map(l => ({
          itemId: l.itemId,
          itemName: l.itemName,
          itemType: l.itemType,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discount: l.discount
        })),
        otherCharge: otherChargeNum
      });

      if (!res.success || !res.invoice) {
        setErrorMsg(res.message || 'Lỗi khi hoàn thành hóa đơn.');
        setIsSubmitting(false);
        return;
      }

      onInvoiceCreated(res.invoice);

      // TC-05: Check if vaccine service was performed -> prompt to add vaccination history once
      if (res.shouldPromptVaccineReminder && selectedCustomer) {
        setCompletedInvoiceForPrompt(res.invoice);
        setShowVaccinePrompt(true);
      } else {
        alert(`Hóa đơn ${res.invoice.invoiceCode} đã hoàn tất thanh toán thành công!`);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const customerPets = selectedCustomer ? getPetsByCustomerId(selectedCustomer.id) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#17365D] text-white rounded-xl shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Lập hóa đơn thanh toán</h2>
              <p className="text-[11px] text-slate-500">
                {linkedAppointment ? `Theo lịch hẹn (${linkedAppointment.customerName})` : 'Hóa đơn bán hàng & Spa'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Stock Warning Banner (TC-03) */}
        {stockWarnings.length > 0 && (
          <div className="mx-5 mt-2.5 p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cảnh báo số lượng tồn kho:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
              {stockWarnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-500 pt-1">
              * Hệ thống vẫn cho phép hoàn thành theo quy định của SRS; tồn kho sẽ chuyển sang số âm.
            </p>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Customer Selection Section (SRS Section 9.1 & User Request 8) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#17365D]" /> Khách hàng
              </span>
              <button
                type="button"
                onClick={handleClearCustomer}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  !selectedCustomer ? 'bg-[#17365D] text-white shadow-xs' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Khách lẻ
              </button>
            </div>

            {selectedCustomer ? (
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Đã chọn khách
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">{selectedCustomer.fullName}</h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{selectedCustomer.phoneNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-red-600 text-[11px] font-semibold transition-colors"
                >
                  Chọn lại
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc số điện thoại..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-[#17365D] focus:outline-none"
                  />
                  {customerSearch && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
                  <span className="text-emerald-700 font-medium">✓ Mặc định: Khách lẻ</span>
                  <span className="text-[10px] text-slate-400">(nếu để trống hoặc không tìm thấy)</span>
                </div>

                {customerSearch.trim() && (
                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl shadow-md">
                    {customers.filter(
                      c =>
                        c.fullName.toLowerCase().includes(customerSearch.trim().toLowerCase()) ||
                        c.phoneNumber.includes(customerSearch.trim())
                    ).length === 0 ? (
                      <div className="p-2.5 text-center text-slate-400 text-[11px]">
                        Không tìm thấy khách hàng "{customerSearch}" &rarr; mặc định là <b>Khách lẻ</b>
                      </div>
                    ) : (
                      customers
                        .filter(
                          c =>
                            c.fullName.toLowerCase().includes(customerSearch.trim().toLowerCase()) ||
                            c.phoneNumber.includes(customerSearch.trim())
                        )
                        .map(c => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCustomer(c)}
                            className="p-2.5 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <span className="font-bold text-slate-800 text-xs block">{c.fullName}</span>
                              <span className="text-[10px] text-slate-400">{c.address.province}</span>
                            </div>
                            <span className="font-mono text-blue-700 font-semibold text-[11px]">{c.phoneNumber}</span>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Line selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Chi tiết mặt hàng & Dịch vụ</label>
              <span className="text-[11px] text-slate-500">{lines.length} mục</span>
            </div>
            <select
              onChange={e => {
                if (e.target.value) {
                  handleAddItemToLines(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800"
            >
              <option value="" disabled>+ Thêm sản phẩm / dịch vụ vào hóa đơn...</option>
              <optgroup label="Hàng hóa (Trừ tồn kho)">
                {catalog
                  .filter(i => i.type === 'GOODS')
                  .map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} (Tồn: {g.stockQuantity} - {formatVND(g.sellingPrice)})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Dịch vụ spa & Tiêm chủng">
                {catalog
                  .filter(i => i.type === 'SERVICE')
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatVND(s.sellingPrice)})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Lines List */}
          <div className="space-y-2">
            {lines.length === 0 ? (
              <div className="py-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có mặt hàng nào. Vui lòng chọn ở danh sách trên.
              </div>
            ) : (
              lines.map(line => {
                const maxDiscount = line.unitPrice * line.quantity;
                return (
                  <div
                    key={line.id}
                    className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`p-1 rounded-md text-[10px] font-bold ${
                              line.itemType.startsWith('VACCINE')
                                ? 'bg-emerald-100 text-emerald-800'
                                : line.itemType === 'GOODS'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {line.itemType === 'VACCINE_SERVICE'
                              ? 'Tiêm vaccine'
                              : line.itemType === 'VACCINE_PRODUCT'
                              ? 'Vaccine (Lọ)'
                              : line.itemType === 'GOODS'
                              ? 'Hàng hóa'
                              : 'Dịch vụ'}
                          </span>
                          <h4 className="font-bold text-slate-900 truncate">{line.itemName}</h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                          Đơn giá: {formatVND(line.unitPrice)}
                          {line.currentStock !== undefined && ` • Tồn: ${line.currentStock}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(line.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity & Discount Inputs */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Số lượng</label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleLineQuantityChange(line.id, line.quantity - 1)}
                            className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={e =>
                              handleLineQuantityChange(line.id, parseInt(e.target.value, 10) || 1)
                            }
                            className="w-12 text-center py-1 border border-slate-200 rounded font-mono font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleLineQuantityChange(line.id, line.quantity + 1)}
                            className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>Giảm giá (VNĐ)</span>
                          <span className="text-[9px]">Max: {formatVND(maxDiscount)}</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={maxDiscount}
                          step="1000"
                          value={line.discount}
                          onChange={e =>
                            handleLineDiscountChange(line.id, parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full px-2 py-1 rounded border border-slate-200 text-right font-mono text-xs font-semibold text-rose-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400">Thành tiền dòng:</span>
                      <span className="font-bold font-mono text-slate-900">
                        {formatVND(line.unitPrice * line.quantity - line.discount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Phụ thu / Thu khác */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 block">Phụ thu / Thu khác (VNĐ)</span>
              <span className="text-[10px] text-slate-400">Sấy lông rối, dịch vụ ngoài giờ...</span>
            </div>
            <input
              type="number"
              min="0"
              step="1000"
              value={otherCharge}
              onChange={e => setOtherCharge(e.target.value)}
              className="w-28 px-3 py-1.5 rounded-xl border border-slate-300 text-right font-mono font-bold text-xs"
            />
          </div>

          {/* Summary Box */}
          <div className="p-4 bg-slate-100/90 rounded-2xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tổng tiền hàng:</span>
              <span className="font-mono">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>Tổng giảm giá:</span>
              <span className="font-mono">-{formatVND(totalDiscount)}</span>
            </div>
            {otherChargeNum > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Phụ thu:</span>
                <span className="font-mono">+{formatVND(otherChargeNum)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>TỔNG CẦN THANH TOÁN:</span>
              <span className="text-base text-emerald-700 font-mono">{formatVND(totalPayable)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors min-h-[44px]"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleCompletePayment}
            disabled={isSubmitting || lines.length === 0}
            className="flex-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Đang xử lý...' : 'Hoàn thành'}
          </button>
        </div>
      </div>

      {/* Vaccine Reminder Prompt Modal (SRS Section 9.6 & TC-05) */}
      {showVaccinePrompt && completedInvoiceForPrompt && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3.5">
            <div className="flex items-center gap-2 text-emerald-700">
              <Syringe className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Ghi nhận lịch sử tiêm vaccine?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hóa đơn <b>{completedInvoiceForPrompt.invoiceCode}</b> có dịch vụ tiêm vaccine. Bạn có muốn bổ sung ngay hồ sơ mũi tiêm cho thú cưng của khách hàng <b>"{selectedCustomer.fullName}"</b> không?
            </p>

            {customerPets.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Chọn thú cưng được tiêm:
                </label>
                <select
                  value={selectedPetForVac}
                  onChange={e => setSelectedPetForVac(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="">-- Chọn thú cưng --</option>
                  {customerPets.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species} - {p.breed})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowVaccinePrompt(false);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Bỏ qua
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVaccinePrompt(false);
                  setIsVacModalOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Bổ sung ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vaccination Modal trigger from invoice */}
      {isVacModalOpen && selectedCustomer && (
        <VaccinationModal
          isOpen={isVacModalOpen}
          onClose={() => {
            setIsVacModalOpen(false);
            onClose();
          }}
          petId={selectedPetForVac || customerPets[0]?.id || ''}
          petName={
            customerPets.find(p => p.id === selectedPetForVac)?.name ||
            customerPets[0]?.name ||
            'Thú cưng'
          }
          onSaved={() => {
            alert('Đã cập nhật lịch sử tiêm thành công!');
            setIsVacModalOpen(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};
