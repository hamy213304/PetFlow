import React, { useState, useEffect } from 'react';
import {
  Package,
  Building2,
  Receipt,
  Search,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
  AlertTriangle,
  Calendar,
  DollarSign,
  Phone,
  Scissors
} from 'lucide-react';
import { CatalogItem, Supplier, Invoice, CatalogItemType, CatalogGroup, ItemStatus } from '../../types/petflow';
import {
  getCatalogItems,
  getSuppliers,
  getInvoices,
  deleteCatalogItem,
  deleteSupplier
} from '../../services/storage';
import { formatVND, formatDateVN, formatDateTimeVN } from '../../utils/formatters';
import { ItemModal } from './ItemModal';
import { ItemDetailModal } from './ItemDetailModal';
import { SupplierModal } from './SupplierModal';
import { SupplierDetailModal } from './SupplierDetailModal';
import { StockInModal } from './StockInModal';
import { StockOutModal } from './StockOutModal';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';

export type CatalogSubTab = 'items' | 'suppliers' | 'invoices';

interface CatalogScreenProps {
  initialSubTab?: CatalogSubTab;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({ initialSubTab = 'items' }) => {
  const [subTab, setSubTab] = useState<CatalogSubTab>(initialSubTab);

  // Data states
  const [items, setItems] = useState<CatalogItem[]>(getCatalogItems());
  const [suppliers, setSuppliers] = useState<Supplier[]>(getSuppliers());
  const [invoices, setInvoices] = useState<Invoice[]>(getInvoices());

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | CatalogItemType>('ALL');
  const [filterGroup, setFilterGroup] = useState<'ALL' | CatalogGroup>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | ItemStatus>('ALL');

  // Multi-select for items
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Modals for creating new
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CatalogItem | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  // Modals for viewing & editing existing items
  const [activeDetailItem, setActiveDetailItem] = useState<CatalogItem | null>(null);
  const [activeDetailSupplier, setActiveDetailSupplier] = useState<Supplier | null>(null);

  // Stock modals
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [stockActionItemId, setStockActionItemId] = useState<string | undefined>();
  const [stockInItemsList, setStockInItemsList] = useState<CatalogItem[]>([]);

  // Bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [activeInvoiceDetail, setActiveInvoiceDetail] = useState<Invoice | null>(null);

  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const reloadData = () => {
    setItems(getCatalogItems());
    setSuppliers(getSuppliers());
    setInvoices(getInvoices());
  };

  useEffect(() => {
    reloadData();
    const handleDataChange = () => reloadData();
    window.addEventListener('petflow_data_change', handleDataChange);
    return () => window.removeEventListener('petflow_data_change', handleDataChange);
  }, []);

  // Filter items
  const filteredItems = items.filter(i => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      i.name.toLowerCase().includes(term) ||
      i.code.toLowerCase().includes(term);
    const matchesType = filterType === 'ALL' || i.type === filterType;
    const matchesGroup = filterGroup === 'ALL' || i.group === filterGroup;
    const matchesStatus = filterStatus === 'ALL' || i.status === filterStatus;
    return matchesSearch && matchesType && matchesGroup && matchesStatus;
  });

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      s.phoneNumber.includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  });

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const term = searchTerm.trim().toLowerCase();
    return (
      !term ||
      inv.invoiceCode.toLowerCase().includes(term) ||
      inv.customerNameSnapshot.toLowerCase().includes(term) ||
      inv.customerPhoneSnapshot.includes(term)
    );
  });

  const isAllItemsSelected =
    filteredItems.length > 0 && selectedItemIds.size === filteredItems.length;

  const toggleSelectAllItems = () => {
    if (isAllItemsSelected) setSelectedItemIds(new Set());
    else setSelectedItemIds(new Set(filteredItems.map(i => i.id)));
  };

  const toggleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedItemIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItemIds(next);
  };

  const handleBatchDeleteItems = () => {
    if (selectedItemIds.size === 0) return;
    let notice = '';
    selectedItemIds.forEach(id => {
      const res = deleteCatalogItem(id);
      if (res.message) notice = res.message;
    });
    setSelectedItemIds(new Set());
    if (notice) setStatusNotice(notice);
    reloadData();
  };

  return (
    <div className="pb-24 px-4 pt-3 max-w-md mx-auto space-y-3.5">
      {/* 3 Sub-tabs bar (SRS Section 7.1: Tab Hàng hóa, Nhà cung cấp, Hóa đơn nằm ở phần Hàng hóa) */}
      <div className="grid grid-cols-3 p-1 bg-slate-200/80 rounded-2xl text-xs font-bold shadow-inner">
        <button
          onClick={() => {
            setSubTab('items');
            setSearchTerm('');
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'items'
              ? 'bg-white text-[#17365D] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Hàng hóa</span>
        </button>

        <button
          onClick={() => {
            setSubTab('suppliers');
            setSearchTerm('');
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'suppliers'
              ? 'bg-white text-[#17365D] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Nhà cung cấp</span>
        </button>

        <button
          onClick={() => {
            setSubTab('invoices');
            setSearchTerm('');
          }}
          className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            subTab === 'invoices'
              ? 'bg-white text-[#17365D] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Hóa đơn</span>
        </button>
      </div>

      {statusNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-start justify-between gap-2 text-xs text-blue-900">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice(null)} className="font-bold text-slate-400 hover:text-slate-700">
            ×
          </button>
        </div>
      )}

      {/* SUB-TAB 1: HÀNG HÓA & DỊCH VỤ */}
      {subTab === 'items' && (
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã hoặc tên hàng hóa/dịch vụ..."
              className="w-full px-3.5 py-2.5 pl-10 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-[11px]">

            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 text-[11px]"
            >
              <option value="ALL">Tất cả nhóm</option>
              <option value="Thức ăn">Thức ăn</option>
              <option value="Chăm sóc body">Chăm sóc body</option>
              <option value="Tiêm chủng">Tiêm chủng</option>
              <option value="Dịch vụ">Dịch vụ</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 text-[11px]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang kinh doanh</option>
              <option value="DISCONTINUED">Ngừng kinh doanh</option>
            </select>
          </div>

          {/* Multi-Select Toolbar & Stock Actions */}
          <div className="flex items-center justify-between text-xs px-1">
            <button
              onClick={toggleSelectAllItems}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold py-1"
            >
              {isAllItemsSelected ? (
                <CheckSquare className="w-4 h-4 text-[#17365D]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{isAllItemsSelected ? 'Bỏ chọn' : 'Chọn tất cả'}</span>
            </button>

            {selectedItemIds.size > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    // Check if only goods (User Request 4)
                    const goodsSelected = items.filter(
                      i => selectedItemIds.has(i.id) && i.type === 'GOODS'
                    );
                    if (goodsSelected.length === 0) {
                      setStatusNotice('Chỉ các sản phẩm là Hàng hóa mới áp dụng nhập kho.');
                      return;
                    }
                    setStockInItemsList(goodsSelected);
                    setIsStockInModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center gap-1"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" /> Nhập kho ({selectedItemIds.size})
                </button>

                <button
                  onClick={() => {
                    const goodsSelected = items.filter(
                      i => selectedItemIds.has(i.id) && i.type === 'GOODS'
                    );
                    if (goodsSelected.length === 0) {
                      setStatusNotice('Dịch vụ không áp dụng xuất kho.');
                      return;
                    }
                    setStockActionItemId(goodsSelected[0]?.id);
                    setIsStockOutModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold flex items-center gap-1"
                >
                  <ArrowUpFromLine className="w-3.5 h-3.5" /> Xuất kho
                </button>

                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg"
                  title="Xóa đã chọn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Cards List (SRS Section 7.1: hiển thị dạng thẻ, ảnh, mã, tên, loại, giá bán, giá vốn, tồn kho, checkbox) */}
          <div className="space-y-2.5">
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-200">
                <Package className="w-10 h-10 mx-auto text-slate-300 stroke-[1.2] mb-2" />
                <p className="text-xs font-semibold text-slate-700">Không có mặt hàng nào</p>
                <p className="text-[11px] text-slate-400 mt-1">Bấm nút "Thêm mới" để tạo hàng hóa hoặc dịch vụ.</p>
              </div>
            ) : (
              filteredItems.map(item => {
                const isSelected = selectedItemIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveDetailItem(item);
                    }}
                    className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer shadow-xs hover:shadow-md relative ${
                      isSelected
                        ? 'border-[#17365D] bg-blue-50/20 ring-1 ring-[#17365D]'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={e => toggleSelectItem(item.id, e)}
                        className="p-1 text-slate-400 hover:text-[#17365D] mt-0.5 shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#17365D]" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>

                      {/* Photo Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            {item.type === 'GOODS' ? <Package className="w-6 h-6" /> : <Scissors className="w-6 h-6" />}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {item.code}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {item.group}
                          </span>
                          {item.subType && item.subType !== item.group && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                              {item.subType}
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              item.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {item.status === 'ACTIVE' ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                          </span>
                        </div>

                        {/* Prices & Stock */}
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                          <div>
                            <span className="text-slate-400 text-[10px]">Giá bán: </span>
                            <span className="font-bold text-slate-900">{formatVND(item.sellingPrice)}</span>
                            {item.type === 'GOODS' && (
                              <span className="text-[10px] text-slate-400 ml-1.5">
                                (Vốn: {formatVND(item.costPrice)})
                              </span>
                            )}
                          </div>

                          {item.type === 'GOODS' ? (
                            <div className="shrink-0">
                              <span
                                className={`font-bold px-2 py-0.5 rounded-lg ${
                                  item.stockQuantity <= 0
                                    ? 'bg-red-100 text-red-800'
                                    : item.stockQuantity <= 5
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                Tồn: {item.stockQuantity}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-blue-700 font-sans font-medium">
                              {item.durationMinutes} phút
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FAB Add Item Button */}
          <div className="fixed bottom-20 right-5 z-30">
            <button
              onClick={() => {
                setItemToEdit(null);
                setIsItemModalOpen(true);
              }}
              className="w-14 h-14 rounded-full bg-[#17365D] hover:bg-[#1f4e79] text-white flex items-center justify-center shadow-xl shadow-[#17365D]/30 active:scale-95 transition-all"
              title="Thêm mặt hàng"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: NHÀ CUNG CẤP */}
      {subTab === 'suppliers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm nhà cung cấp theo tên, mã, SĐT..."
                className="w-full px-3.5 py-2.5 pl-10 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            <button
              onClick={() => {
                setSupplierToEdit(null);
                setIsSupplierModalOpen(true);
              }}
              className="py-2.5 px-3 bg-[#17365D] hover:bg-[#1f4e79] text-white text-xs font-bold rounded-2xl flex items-center gap-1 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" /> Thêm NCC
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredSuppliers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-200">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 stroke-[1.2] mb-2" />
                <p className="text-xs font-semibold text-slate-700">Chưa có nhà cung cấp nào</p>
                <p className="text-[11px] text-slate-400 mt-1">Bấm "Thêm NCC" để thêm đối tác phân phối.</p>
              </div>
            ) : (
              filteredSuppliers.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveDetailSupplier(s);
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 shadow-xs cursor-pointer space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                          {s.businessType}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        Mã: {s.code} {s.taxCode ? `• MST: ${s.taxCode}` : ''}
                      </span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm(`Xác nhận xóa nhà cung cấp "${s.name}"?`)) {
                          deleteSupplier(s.id);
                          reloadData();
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-mono">{s.phoneNumber || 'Chưa cập nhật SĐT'}</span>
                    </div>
                    {s.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">"{s.notes}"</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: HÓA ĐƠN & BÁN HÀNG */}
      {subTab === 'invoices' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm mã HD..., tên khách hoặc số điện thoại..."
                className="w-full px-3.5 py-2.5 pl-10 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#17365D]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            {/* Tạo hóa đơn button */}
            <button
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" /> Tạo hóa đơn
            </button>
          </div>

          {/* Invoices List */}
          <div className="space-y-2.5">
            {filteredInvoices.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-200">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 stroke-[1.2] mb-2" />
                <p className="text-xs font-semibold text-slate-700">Chưa có hóa đơn nào</p>
                <p className="text-[11px] text-slate-400 mt-1">Bấm "Tạo hóa đơn" để bán hàng và thanh toán dịch vụ.</p>
              </div>
            ) : (
              filteredInvoices.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => setActiveInvoiceDetail(inv)}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 shadow-xs cursor-pointer space-y-2 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-[#17365D]">
                          {inv.invoiceCode}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Đã thanh toán
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 mt-1">
                        {inv.customerNameSnapshot}
                        <span className="text-[11px] text-slate-500 font-mono ml-1">
                          ({inv.customerPhoneSnapshot})
                        </span>
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald-700">
                        {formatVND(inv.totalPayable)}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDateTimeVN(inv.completedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{inv.lines.length} mặt hàng/dịch vụ</span>
                    <span className="text-blue-700 font-semibold">Xem chi tiết &rarr;</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Item Modal (For creating new) */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        itemToEdit={itemToEdit}
        onSaved={reloadData}
      />

      {/* Item Detail Modal (View first, then edit or delete with confirmation) */}
      <ItemDetailModal
        isOpen={Boolean(activeDetailItem)}
        onClose={() => setActiveDetailItem(null)}
        item={activeDetailItem}
        onSaved={reloadData}
        onDeleted={() => {
          setActiveDetailItem(null);
          reloadData();
        }}
      />

      {/* Supplier Modal (For creating new) */}
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        supplierToEdit={supplierToEdit}
        onSaved={reloadData}
      />

      {/* Supplier Detail Modal (View first, then edit or delete with confirmation) */}
      <SupplierDetailModal
        isOpen={Boolean(activeDetailSupplier)}
        onClose={() => setActiveDetailSupplier(null)}
        supplier={activeDetailSupplier}
        onSaved={reloadData}
        onDeleted={() => {
          setActiveDetailSupplier(null);
          reloadData();
        }}
      />

      {/* Stock In Modal (Multi-item batch import) */}
      <StockInModal
        isOpen={isStockInModalOpen}
        onClose={() => {
          setIsStockInModalOpen(false);
          setStockInItemsList([]);
        }}
        items={stockInItemsList.length > 0 ? stockInItemsList : items.filter(i => i.type === 'GOODS')}
        defaultItemId={stockActionItemId}
        onSuccess={() => {
          reloadData();
          setSelectedItemIds(new Set());
        }}
      />

      {/* Stock Out Modal */}
      <StockOutModal
        isOpen={isStockOutModalOpen}
        onClose={() => setIsStockOutModalOpen(false)}
        items={items}
        defaultItemId={stockActionItemId}
        onSuccess={reloadData}
      />

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onInvoiceCreated={newInv => {
          reloadData();
          setActiveInvoiceDetail(newInv);
        }}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={Boolean(activeInvoiceDetail)}
        onClose={() => setActiveInvoiceDetail(null)}
        invoice={activeInvoiceDetail}
      />

      {/* Bulk Delete Confirmation Modal (Item 6) */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-3.5">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Xác nhận xóa {selectedItemIds.size} mặt hàng đã chọn?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống sẽ kiểm tra và xóa các mặt hàng này nếu chưa phát sinh giao dịch trong hóa đơn. Hành động này không thể hoàn tác.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs min-h-[44px]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkDeleteConfirm(false);
                  handleBatchDeleteItems();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md min-h-[44px]"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
