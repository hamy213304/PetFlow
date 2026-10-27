/**
 * Format number to Vietnamese currency VND (e.g., 150000 -> 150.000 đ)
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 đ';
  }
  return `${Math.round(amount).toLocaleString('vi-VN')} đ`;
}

/**
 * Format YYYY-MM-DD or ISO string to dd/MM/yyyy
 */
export function formatDateVN(dateStr?: string | null): string {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format ISO string to HH:mm dd/MM/yyyy
 */
export function formatDateTimeVN(isoStr?: string | null): string {
  if (!isoStr) return '---';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const hour = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${hour}:${min} ${day}/${month}/${year}`;
  } catch {
    return isoStr;
  }
}

/**
 * Format ISO string to HH:mm
 */
export function formatTimeVN(isoStr?: string | null): string {
  if (!isoStr) return '--:--';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const hour = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${hour}:${min}`;
  } catch {
    return isoStr;
  }
}

/**
 * Password validation:
 * Min 8 chars, uppercase, lowercase, number, special char (SRS Section 4.1)
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Mật khẩu phải có tối thiểu 8 ký tự.' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper) {
    return { isValid: false, message: 'Mật khẩu phải chứa ít nhất một chữ cái in hoa (A-Z).' };
  }
  if (!hasLower) {
    return { isValid: false, message: 'Mật khẩu phải chứa ít nhất một chữ cái thường (a-z).' };
  }
  if (!hasNumber) {
    return { isValid: false, message: 'Mật khẩu phải chứa ít nhất một chữ số (0-9).' };
  }
  if (!hasSpecial) {
    return { isValid: false, message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*...).' };
  }
  return { isValid: true };
}

/**
 * Add minutes to local datetime string (YYYY-MM-DDTHH:mm) without UTC timezone drift
 */
export function addMinutesToLocalDatetime(datetimeStr: string, minutesToAdd: number): string {
  try {
    const [datePart, timePart] = datetimeStr.split('T');
    if (!datePart || !timePart) return datetimeStr;
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);
    const date = new Date(y, m - 1, d, hh, mm);
    date.setMinutes(date.getMinutes() + minutesToAdd);

    const resY = date.getFullYear();
    const resM = (date.getMonth() + 1).toString().padStart(2, '0');
    const resD = date.getDate().toString().padStart(2, '0');
    const resH = date.getHours().toString().padStart(2, '0');
    const resMin = date.getMinutes().toString().padStart(2, '0');
    return `${resY}-${resM}-${resD}T${resH}:${resMin}`;
  } catch {
    return datetimeStr;
  }
}

