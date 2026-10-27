import { VaccinationRecord, NotificationItem } from '../types/petflow';
import {
  saveVaccination,
  deleteVaccination as storageDeleteVaccination,
  getPetById,
  getCustomerById,
  addNotification,
  loadDatabase,
  saveDatabase
} from './storage';

/**
 * Handle vaccination notification rules (BR-008, BR-009, BR-010, BR-011, TC-06, TC-07, TC-08, TC-09)
 */
export function processVaccinationNotifications(record: VaccinationRecord, petName: string, customerName: string): void {
  // BR-009 / TC-06: Next due date empty -> no reminder
  if (!record.nextDueDate || record.nextDueDate.trim() === '') {
    return;
  }

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const nextDueDate = new Date(`${record.nextDueDate}T09:00:00`);
  const nextDueDateStr = record.nextDueDate;
  const isPast = nextDueDateStr < todayStr;

  // Clear previous notifications for this vaccine to re-schedule
  const db = loadDatabase();
  db.notifications = db.notifications.filter(
    n => !(n.relatedEntityId === record.id && n.relatedEntityType === 'vaccine')
  );
  saveDatabase(db);

  if (isPast) {
    // BR-010 / TC-07: Next due date already past at save time -> send 1 overdue notification immediately
    addNotification({
      id: `notif_${Date.now()}_vac_overdue`,
      type: 'VACCINE_OVERDUE',
      category: 'Tiêm phòng',
      relatedEntityId: record.id,
      relatedEntityType: 'vaccine',
      title: 'Nhắc lịch tiêm quá hạn',
      body: `Bé ${petName} (khách ${customerName}) đã quá hạn tiêm "${record.vaccineType}" vào ngày ${formatDateVN(record.nextDueDate)}. Hãy liên hệ khách hàng để đặt lịch tiêm bù.`,
      createdAt: now.toISOString(),
      deduplicationKey: `vaccine_overdue_${record.id}_${record.nextDueDate}`
    });
    return;
  }

  // Future due date:
  const dueMs = nextDueDate.getTime();
  const nowMs = now.getTime();
  const sevenDaysBeforeMs = dueMs - 7 * 24 * 60 * 60 * 1000;

  // BR-011 / TC-08: If already past the 7-day mark at save time, skip 7-day notification
  if (nowMs < sevenDaysBeforeMs) {
    // Schedule 7-day reminder
    addNotification({
      id: `notif_${Date.now()}_vac_7d`,
      type: 'VACCINE_7_DAY',
      category: 'Tiêm phòng',
      relatedEntityId: record.id,
      relatedEntityType: 'vaccine',
      title: 'Nhắc lịch tiêm sắp đến (còn 7 ngày)',
      body: `Bé ${petName} (khách ${customerName}) sắp đến lịch tiêm "${record.vaccineType}" vào ngày ${formatDateVN(record.nextDueDate)}.`,
      scheduledFor: new Date(sevenDaysBeforeMs).toISOString(),
      createdAt: now.toISOString(),
      deduplicationKey: `vaccine_7d_${record.id}_${record.nextDueDate}`
    });
  }

  // Schedule Due Date reminder
  addNotification({
    id: `notif_${Date.now()}_vac_due`,
    type: 'VACCINE_DUE',
    category: 'Tiêm phòng',
    relatedEntityId: record.id,
    relatedEntityType: 'vaccine',
    title: 'Lịch tiêm phòng hôm nay',
    body: `Hôm nay là ngày tiêm phòng "${record.vaccineType}" của bé ${petName} (khách ${customerName}).`,
    scheduledFor: nextDueDate.toISOString(),
    createdAt: now.toISOString(),
    deduplicationKey: `vaccine_due_${record.id}_${record.nextDueDate}`
  });
}

export function saveVaccinationWithRules(record: VaccinationRecord): void {
  saveVaccination(record);

  const pet = getPetById(record.petId);
  const petName = pet?.name || 'Thú cưng';
  let customerName = 'Khách hàng';
  if (pet?.customerId) {
    const cust = getCustomerById(pet.customerId);
    if (cust) customerName = cust.fullName;
  }

  processVaccinationNotifications(record, petName, customerName);
}

export function deleteVaccinationWithRules(recordId: string): void {
  // TC-09: Delete vaccination and cancel notifications
  storageDeleteVaccination(recordId);
}

function formatDateVN(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}
