export type Species = 'Chó' | 'Mèo';
export type Gender = 'Đực' | 'Cái';
export type NeuteredStatus = 'Chưa triệt sản' | 'Đã triệt sản';
export type CatalogItemType = 'GOODS' | 'SERVICE';
export type CatalogGroup = 'Thức ăn' | 'Chăm sóc body' | 'Tiêm chủng' | 'Dịch vụ';
export type ItemStatus = 'ACTIVE' | 'DISCONTINUED';
export type SupplierBusinessType = 'Cá nhân/Hộ kinh doanh' | 'Công ty';

export interface UserAccount {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: {
    province: string;
    ward: string;
    streetDetail: string;
  };
  passwordHash: string; // Stored securely
}

export interface Customer {
  id: string;
  code: string;
  fullName: string;
  address: {
    province: string;
    ward: string;
    streetDetail: string;
  };
  phoneNumber: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface Pet {
  id: string;
  customerId: string;
  species: Species;
  name: string;
  breed: string;
  gender: Gender;
  neutered: NeuteredStatus;
  weightKg: number;
  dob: string; // YYYY-MM-DD
  identificationNotes?: string;
  color?: string;
  photoUrl: string;
  createdAt: string;
  isDeleted?: boolean;
}

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineType: string; // Tên vaccine
  vaccinationDate: string; // YYYY-MM-DD
  validityYears: number; // Thời gian hiệu lực (năm)
  certificatePhotoUrl: string; // Ảnh chứng nhận
  notes?: string;
  nextDueDate?: string; // YYYY-MM-DD (Tùy chọn, nhập thủ công, không tự tính)
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface CatalogItem {
  id: string;
  code: string;
  name: string;
  type: CatalogItemType;
  group: CatalogGroup;
  subType?: string; // Hạt, Pate, Súp thưởng, Sữa tắm, Vaccine, etc.
  photoUrl?: string;
  costPrice: number; // Giá vốn (bắt buộc cho hàng hóa)
  sellingPrice: number; // Giá bán (không âm)
  status: ItemStatus;
  supplierId?: string;
  expiryDate?: string; // YYYY-MM-DD
  durationMinutes?: number; // Chỉ cho dịch vụ
  stockQuantity: number; // Chỉ cho hàng hóa
  isDeleted?: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  businessType: SupplierBusinessType;
  phoneNumber: string;
  email: string;
  taxCode: string;
  address: {
    province: string;
    ward: string;
    streetDetail: string;
  };
  notes?: string;
  photoUrl?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface StockVoucher {
  id: string;
  voucherCode: string; // PN... or PX...
  type: 'IMPORT' | 'EXPORT' | 'ADJUSTMENT';
  timestamp: string;
  itemId: string;
  itemName: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  notes?: string;
  expiryDate?: string;
  refVoucherId?: string;
}

export interface AppointmentServiceItem {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
  quantity: number;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  startDateTime: string; // ISO String (YYYY-MM-DDTHH:mm)
  durationMinutes: number; // Total calculated duration
  expectedEndDateTime: string;
  services: AppointmentServiceItem[];
  notes?: string;
  isCanceled?: boolean;
  linkedInvoiceId?: string;
  createdAt: string;
}

export interface InvoiceLine {
  id: string;
  itemId?: string;
  itemNameSnapshot: string;
  itemTypeSnapshot: 'GOODS' | 'SERVICE' | 'VACCINE_PRODUCT' | 'VACCINE_SERVICE';
  quantity: number;
  unitPriceSnapshot: number;
  discount: number; // Giảm giá dòng (không vượt quá đơn giá * số lượng)
  lineTotal: number; // (unitPrice * quantity) - discount
  costPriceSnapshot: number; // Giá vốn tại thời điểm bán
}

export interface Invoice {
  id: string;
  invoiceCode: string; // HDYYYYMMDDnnn
  customerId: string;
  customerNameSnapshot: string;
  customerPhoneSnapshot: string;
  isRetailCustomer?: boolean; // Khách lẻ
  appointmentId?: string;
  completedAt: string; // ISO string
  subtotal: number;
  totalDiscount: number;
  otherCharge: number; // Phụ thu / Thu khác
  totalPayable: number; // subtotal - totalDiscount + otherCharge
  paidAmount: number; // Luôn bằng totalPayable
  status: 'COMPLETED';
  lines: InvoiceLine[];
}

export type NotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'VACCINE_7_DAY'
  | 'VACCINE_DUE'
  | 'VACCINE_OVERDUE'
  | 'EXPIRY_ALERT'
  | 'STOCK_LOW'
  | 'STOCK_OUT'
  | 'STOCK_NEGATIVE';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  category: 'Lịch hẹn' | 'Tiêm phòng' | 'Tồn kho';
  relatedEntityId: string;
  relatedEntityType: 'appointment' | 'vaccine' | 'catalog' | 'invoice';
  title: string;
  body: string;
  scheduledFor?: string;
  createdAt: string;
  readAt?: string;
  isArchived?: boolean;
  deduplicationKey: string;
}

export interface PetFlowBackup {
  version: string;
  exportedAt: string;
  app: string;
  data: {
    userAccount: UserAccount | null;
    customers: Customer[];
    pets: Pet[];
    vaccinations: VaccinationRecord[];
    catalog: CatalogItem[];
    suppliers: Supplier[];
    stockVouchers: StockVoucher[];
    appointments: Appointment[];
    invoices: Invoice[];
    notifications: NotificationItem[];
  };
}
