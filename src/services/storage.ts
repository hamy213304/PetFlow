import {
  Customer,
  Pet,
  VaccinationRecord,
  CatalogItem,
  Supplier,
  Appointment,
  Invoice,
  StockVoucher,
  UserAccount,
  NotificationItem,
  PetFlowBackup
} from '../types/petflow';
import {
  INITIAL_USER_ACCOUNT,
  INITIAL_CUSTOMERS,
  INITIAL_PETS,
  INITIAL_VACCINATIONS,
  INITIAL_CATALOG,
  INITIAL_SUPPLIERS,
  INITIAL_APPOINTMENTS,
  INITIAL_INVOICES,
  INITIAL_STOCK_VOUCHERS,
  INITIAL_NOTIFICATIONS
} from './seedData';

const DB_KEY = 'petflow_db_v2';
const SESSION_KEY = 'petflow_session_v1';
const DATA_CHANGE_EVENT = 'petflow_data_change';

interface PetFlowDatabase {
  version: string;
  userAccount: UserAccount;
  customers: Customer[];
  pets: Pet[];
  vaccinations: VaccinationRecord[];
  catalog: CatalogItem[];
  suppliers: Supplier[];
  appointments: Appointment[];
  invoices: Invoice[];
  stockVouchers: StockVoucher[];
  notifications: NotificationItem[];
}

function getInitialDB(): PetFlowDatabase {
  return {
    version: '1.0.2',
    userAccount: { ...INITIAL_USER_ACCOUNT },
    customers: [...INITIAL_CUSTOMERS],
    pets: [...INITIAL_PETS],
    vaccinations: [...INITIAL_VACCINATIONS],
    catalog: [...INITIAL_CATALOG],
    suppliers: [...INITIAL_SUPPLIERS],
    appointments: [...INITIAL_APPOINTMENTS],
    invoices: [...INITIAL_INVOICES],
    stockVouchers: [...INITIAL_STOCK_VOUCHERS],
    notifications: [...INITIAL_NOTIFICATIONS]
  };
}

export function loadDatabase(): PetFlowDatabase {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const initial = getInitialDB();
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as PetFlowDatabase;
    // Defensive checks for missing arrays
    if (!parsed.customers) parsed.customers = [];
    if (!parsed.pets) parsed.pets = [];
    if (!parsed.vaccinations) parsed.vaccinations = [];
    if (!parsed.catalog) parsed.catalog = [];
    if (!parsed.suppliers) parsed.suppliers = [];
    if (!parsed.appointments) parsed.appointments = [];
    if (!parsed.invoices) parsed.invoices = [];
    if (!parsed.stockVouchers) parsed.stockVouchers = [];
    if (!parsed.notifications) parsed.notifications = [];
    if (!parsed.userAccount) parsed.userAccount = { ...INITIAL_USER_ACCOUNT };
    return parsed;
  } catch (err) {
    console.error('Failed to parse database from localStorage, initializing fresh:', err);
    const initial = getInitialDB();
    saveDatabase(initial);
    return initial;
  }
}

export function saveDatabase(db: PetFlowDatabase): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Dispatch event for UI reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
    }
  } catch (err) {
    console.error('Failed to save database to localStorage:', err);
  }
}

export function notifyDataChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
  }
}

// -------------------------------------------------------------
// Auth & Session
// -------------------------------------------------------------
export function getCurrentSession(): { isLoggedIn: boolean; email: string; fullName: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentSession(session: { isLoggedIn: boolean; email: string; fullName: string } | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  notifyDataChange();
}

// -------------------------------------------------------------
// Customers & Pets
// -------------------------------------------------------------
export function getCustomers(): Customer[] {
  return loadDatabase().customers.filter(c => !c.isDeleted);
}

export function getCustomerById(id: string): Customer | undefined {
  return loadDatabase().customers.find(c => c.id === id && !c.isDeleted);
}

export function saveCustomer(customer: Customer): void {
  const db = loadDatabase();
  const index = db.customers.findIndex(c => c.id === customer.id);
  if (index >= 0) {
    db.customers[index] = { ...customer, updatedAt: new Date().toISOString() };
  } else {
    db.customers.push({ ...customer, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveDatabase(db);
}

export function deleteCustomer(id: string): void {
  const db = loadDatabase();
  // Soft delete customer and their pets per SRS section 5.4 & 13
  const custIndex = db.customers.findIndex(c => c.id === id);
  if (custIndex >= 0) {
    db.customers[custIndex].isDeleted = true;
    db.customers[custIndex].updatedAt = new Date().toISOString();
  }
  db.pets.forEach(p => {
    if (p.customerId === id) {
      p.isDeleted = true;
    }
  });
  saveDatabase(db);
}

export function getPetsByCustomerId(customerId: string): Pet[] {
  return loadDatabase().pets.filter(p => p.customerId === customerId && !p.isDeleted);
}

export function getAllPets(): Pet[] {
  return loadDatabase().pets.filter(p => !p.isDeleted);
}

export function getPetById(id: string): Pet | undefined {
  return loadDatabase().pets.find(p => p.id === id && !p.isDeleted);
}

export function savePet(pet: Pet): void {
  const db = loadDatabase();
  const index = db.pets.findIndex(p => p.id === pet.id);
  if (index >= 0) {
    db.pets[index] = { ...pet };
  } else {
    db.pets.push({ ...pet, createdAt: new Date().toISOString() });
  }
  saveDatabase(db);
}

export function deletePet(petId: string): void {
  const db = loadDatabase();
  const pet = db.pets.find(p => p.id === petId);
  if (pet) {
    pet.isDeleted = true;
  }
  // Soft delete its vaccinations as well
  db.vaccinations.forEach(v => {
    if (v.petId === petId) {
      v.isDeleted = true;
    }
  });
  saveDatabase(db);
}

// -------------------------------------------------------------
// Vaccinations
// -------------------------------------------------------------
export function getVaccinationsByPetId(petId: string): VaccinationRecord[] {
  return loadDatabase()
    .vaccinations.filter(v => v.petId === petId && !v.isDeleted)
    .sort((a, b) => new Date(b.vaccinationDate).getTime() - new Date(a.vaccinationDate).getTime());
}

export function getLatestVaccinationDate(petId: string): string | null {
  const vacs = getVaccinationsByPetId(petId);
  return vacs.length > 0 ? vacs[0].vaccinationDate : null;
}

export function saveVaccination(record: VaccinationRecord): void {
  const db = loadDatabase();
  const index = db.vaccinations.findIndex(v => v.id === record.id);
  if (index >= 0) {
    db.vaccinations[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    db.vaccinations.push({
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  saveDatabase(db);
}

export function deleteVaccination(recordId: string): void {
  const db = loadDatabase();
  const index = db.vaccinations.findIndex(v => v.id === recordId);
  if (index >= 0) {
    db.vaccinations[index].isDeleted = true;
  }
  // Remove pending notifications associated with this vaccination (TC-09)
  db.notifications = db.notifications.filter(
    n => !(n.relatedEntityId === recordId && n.relatedEntityType === 'vaccine')
  );
  saveDatabase(db);
}

// -------------------------------------------------------------
// Catalog & Suppliers
// -------------------------------------------------------------
export function getCatalogItems(): CatalogItem[] {
  return loadDatabase().catalog.filter(i => !i.isDeleted);
}

export function getCatalogItemById(id: string): CatalogItem | undefined {
  return loadDatabase().catalog.find(i => i.id === id && !i.isDeleted);
}

export function saveCatalogItem(item: CatalogItem): void {
  const db = loadDatabase();
  const index = db.catalog.findIndex(i => i.id === item.id);
  if (index >= 0) {
    db.catalog[index] = { ...item };
  } else {
    db.catalog.push({ ...item, createdAt: new Date().toISOString() });
  }
  saveDatabase(db);
}

export function deleteCatalogItem(id: string): { success: boolean; message?: string } {
  const db = loadDatabase();
  // Check if item was used in any completed invoices (TC-13)
  const isUsedInInvoice = db.invoices.some(inv => inv.lines.some(l => l.itemId === id));
  const itemIndex = db.catalog.findIndex(i => i.id === id);
  if (itemIndex < 0) return { success: false, message: 'Không tìm thấy hàng hóa.' };

  if (isUsedInInvoice) {
    // Cannot physically delete; mark as DISCONTINUED to preserve audit trail
    db.catalog[itemIndex].status = 'DISCONTINUED';
    saveDatabase(db);
    return {
      success: true,
      message: 'Hàng hóa đã từng phát sinh hóa đơn, hệ thống đã chuyển sang trạng thái "Ngừng kinh doanh" để bảo toàn lịch sử.'
    };
  }

  db.catalog[itemIndex].isDeleted = true;
  saveDatabase(db);
  return { success: true };
}

export function getSuppliers(): Supplier[] {
  return loadDatabase().suppliers.filter(s => !s.isDeleted);
}

export function getSupplierById(id: string): Supplier | undefined {
  return loadDatabase().suppliers.find(s => s.id === id && !s.isDeleted);
}

export function saveSupplier(supplier: Supplier): void {
  const db = loadDatabase();
  const index = db.suppliers.findIndex(s => s.id === supplier.id);
  if (index >= 0) {
    db.suppliers[index] = { ...supplier };
  } else {
    db.suppliers.push({ ...supplier, createdAt: new Date().toISOString() });
  }
  saveDatabase(db);
}

export function deleteSupplier(id: string): void {
  const db = loadDatabase();
  const index = db.suppliers.findIndex(s => s.id === id);
  if (index >= 0) {
    db.suppliers[index].isDeleted = true;
  }
  saveDatabase(db);
}

// -------------------------------------------------------------
// Stock Vouchers
// -------------------------------------------------------------
export function getStockVouchers(): StockVoucher[] {
  return loadDatabase()
    .stockVouchers.slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addStockVoucher(voucher: StockVoucher): void {
  const db = loadDatabase();
  db.stockVouchers.push(voucher);
  saveDatabase(db);
}

// -------------------------------------------------------------
// Appointments
// -------------------------------------------------------------
export function getAppointments(): Appointment[] {
  return loadDatabase()
    .appointments.filter(a => !a.isCanceled)
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
}

export function getAllAppointmentsIncludingCanceled(): Appointment[] {
  return loadDatabase()
    .appointments.slice()
    .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
}

export function getAppointmentById(id: string): Appointment | undefined {
  return loadDatabase().appointments.find(a => a.id === id);
}

export function saveAppointment(appointment: Appointment): void {
  const db = loadDatabase();
  const index = db.appointments.findIndex(a => a.id === appointment.id);
  if (index >= 0) {
    db.appointments[index] = { ...appointment };
  } else {
    db.appointments.push({ ...appointment, createdAt: new Date().toISOString() });
  }
  saveDatabase(db);
}

export function cancelAppointment(id: string): void {
  const db = loadDatabase();
  const apt = db.appointments.find(a => a.id === id);
  if (apt) {
    apt.isCanceled = true;
  }
  // Cancel pending notification for this appointment (TC-11)
  db.notifications = db.notifications.filter(
    n => !(n.relatedEntityId === id && n.relatedEntityType === 'appointment')
  );
  saveDatabase(db);
}

// -------------------------------------------------------------
// Invoices
// -------------------------------------------------------------
export function getInvoices(): Invoice[] {
  return loadDatabase()
    .invoices.slice()
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

export function getInvoiceById(id: string): Invoice | undefined {
  return loadDatabase().invoices.find(inv => inv.id === id);
}

// -------------------------------------------------------------
// Notifications
// -------------------------------------------------------------
export function getNotifications(): NotificationItem[] {
  return loadDatabase()
    .notifications.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addNotification(notif: NotificationItem): void {
  const db = loadDatabase();
  // Check deduplicationKey to avoid repeating identical alerts
  const exists = db.notifications.some(n => n.deduplicationKey === notif.deduplicationKey);
  if (!exists) {
    db.notifications.unshift(notif);
    saveDatabase(db);
  }
}

export function markNotificationAsRead(id: string): void {
  const db = loadDatabase();
  const notif = db.notifications.find(n => n.id === id);
  if (notif && !notif.readAt) {
    notif.readAt = new Date().toISOString();
    saveDatabase(db);
  }
}

export function markAllNotificationsAsRead(): void {
  const db = loadDatabase();
  const now = new Date().toISOString();
  db.notifications.forEach(n => {
    if (!n.readAt) n.readAt = now;
  });
  saveDatabase(db);
}

// -------------------------------------------------------------
// User Account Profile
// -------------------------------------------------------------
export function getUserAccount(): UserAccount {
  return loadDatabase().userAccount;
}

export function saveUserAccount(account: UserAccount): void {
  const db = loadDatabase();
  db.userAccount = { ...account };
  saveDatabase(db);
}

// -------------------------------------------------------------
// Full Backup & Restore (JSON)
// -------------------------------------------------------------
export function exportFullBackup(): PetFlowBackup {
  const db = loadDatabase();
  return {
    version: db.version,
    exportedAt: new Date().toISOString(),
    app: 'PetFlow Android v1.0',
    data: {
      userAccount: db.userAccount,
      customers: db.customers,
      pets: db.pets,
      vaccinations: db.vaccinations,
      catalog: db.catalog,
      suppliers: db.suppliers,
      stockVouchers: db.stockVouchers,
      appointments: db.appointments,
      invoices: db.invoices,
      notifications: db.notifications
    }
  };
}

export function importFullBackup(backup: PetFlowBackup): { success: boolean; message: string } {
  if (!backup || !backup.data) {
    return { success: false, message: 'Dữ liệu sao lưu không hợp lệ.' };
  }
  try {
    const freshDB: PetFlowDatabase = {
      version: backup.version || '1.0.2',
      userAccount: backup.data.userAccount || { ...INITIAL_USER_ACCOUNT },
      customers: Array.isArray(backup.data.customers) ? backup.data.customers : [],
      pets: Array.isArray(backup.data.pets) ? backup.data.pets : [],
      vaccinations: Array.isArray(backup.data.vaccinations) ? backup.data.vaccinations : [],
      catalog: Array.isArray(backup.data.catalog) ? backup.data.catalog : [],
      suppliers: Array.isArray(backup.data.suppliers) ? backup.data.suppliers : [],
      appointments: Array.isArray(backup.data.appointments) ? backup.data.appointments : [],
      invoices: Array.isArray(backup.data.invoices) ? backup.data.invoices : [],
      stockVouchers: Array.isArray(backup.data.stockVouchers) ? backup.data.stockVouchers : [],
      notifications: Array.isArray(backup.data.notifications) ? backup.data.notifications : []
    };

    saveDatabase(freshDB);
    return { success: true, message: 'Khôi phục dữ liệu thành công!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Lỗi khôi phục: ${errorMsg}` };
  }
}

export function resetToDefaults(): void {
  const initial = getInitialDB();
  saveDatabase(initial);
}
