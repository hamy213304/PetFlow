import { Appointment, AppointmentServiceItem, NotificationItem } from '../types/petflow';
import {
  getAppointments,
  getAllAppointmentsIncludingCanceled,
  saveAppointment,
  cancelAppointment as storageCancelAppointment,
  addNotification,
  loadDatabase,
  saveDatabase
} from './storage';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingAppointments: Appointment[];
  message?: string;
}

/**
 * Checks for time overlaps with other active appointments
 */
export function checkAppointmentConflict(
  proposedStart: string,
  proposedDurationMinutes: number,
  excludeAppointmentId?: string
): ConflictCheckResult {
  const startMs = new Date(proposedStart).getTime();
  const endMs = startMs + proposedDurationMinutes * 60 * 1000;

  const activeAppointments = getAppointments().filter(a => a.id !== excludeAppointmentId);
  const conflicting = activeAppointments.filter(a => {
    const aStartMs = new Date(a.startDateTime).getTime();
    const aEndMs = aStartMs + a.durationMinutes * 60 * 1000;
    // Overlap condition: start < otherEnd and end > otherStart
    return startMs < aEndMs && endMs > aStartMs;
  });

  return {
    hasConflict: conflicting.length > 0,
    conflictingAppointments: conflicting,
    message:
      conflicting.length > 0
        ? `Lịch hẹn bị trùng giờ với ${conflicting.length} lịch hẹn khác (${conflicting.map(c => `${c.customerName} lúc ${new Date(c.startDateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`).join(', ')}). Bạn có muốn tiếp tục không?`
        : undefined
  };
}

/**
 * Validates appointment start time (cannot be in the past for new appointments)
 */
export function validateAppointmentTime(startDateTime: string, isNew: boolean): { isValid: boolean; message?: string } {
  const startMs = new Date(startDateTime).getTime();
  const nowMs = Date.now();

  if (isNew && startMs < nowMs) {
    return {
      isValid: false,
      message: 'Không thể tạo lịch hẹn mới trong quá khứ. Vui lòng chọn thời gian hiện tại hoặc tương lai.'
    };
  }
  return { isValid: true };
}

/**
 * Determine if an appointment should be displayed as GRAY
 * Rule: now > startDateTime && !linkedInvoiceId (TC-12 & SRS 6.3)
 */
export function isAppointmentPastUnhandled(appointment: Appointment): boolean {
  if (appointment.linkedInvoiceId) return false;
  if (appointment.isCanceled) return false;
  const startMs = new Date(appointment.startDateTime).getTime();
  return Date.now() > startMs;
}

/**
 * Create or Update Appointment with reminder notifications
 */
export function createOrUpdateAppointment(
  appointment: Appointment,
  isNew: boolean
): { success: boolean; message?: string } {
  const timeValidation = validateAppointmentTime(appointment.startDateTime, isNew);
  if (!timeValidation.isValid) {
    return { success: false, message: timeValidation.message };
  }

  saveAppointment(appointment);

  // Handle 30-minute reminder notification (Section 6.4)
  const startMs = new Date(appointment.startDateTime).getTime();
  const nowMs = Date.now();
  const thirtyMinBeforeMs = startMs - 30 * 60 * 1000;

  // If appointment is in future
  if (startMs > nowMs) {
    const notifKey = `apt_remind_${appointment.id}_30m`;
    const notifBody = `Khách ${appointment.customerName} sẽ đến trong 30 phút nữa. Hãy chuẩn bị để phục vụ khách một cách tốt nhất.`;

    if (nowMs >= thirtyMinBeforeMs) {
      // Within 30 minutes window: notify immediately
      addNotification({
        id: `notif_${Date.now()}_apt`,
        type: 'APPOINTMENT_REMINDER',
        category: 'Lịch hẹn',
        relatedEntityId: appointment.id,
        relatedEntityType: 'appointment',
        title: 'Nhắc lịch hẹn khách sắp đến',
        body: notifBody,
        createdAt: new Date().toISOString(),
        deduplicationKey: notifKey
      });
    } else {
      // Schedule reminder
      addNotification({
        id: `notif_${Date.now()}_apt`,
        type: 'APPOINTMENT_REMINDER',
        category: 'Lịch hẹn',
        relatedEntityId: appointment.id,
        relatedEntityType: 'appointment',
        title: 'Nhắc lịch hẹn khách sắp đến',
        body: notifBody,
        scheduledFor: new Date(thirtyMinBeforeMs).toISOString(),
        createdAt: new Date().toISOString(),
        deduplicationKey: notifKey
      });
    }
  }

  return { success: true };
}

export function cancelAppointmentWithCleanup(id: string): void {
  storageCancelAppointment(id);
}
