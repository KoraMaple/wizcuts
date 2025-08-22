export const E164_PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;
export const PRICE_REGEX = /^\d+(?:\.\d{1,2})?$/;

export interface ValidationError {
  field: string;
  message: string;
}

export function validatePhone(phone: string): ValidationError | null {
  const p = phone.trim();
  if (!p) return { field: 'customerPhone', message: 'Phone is required' };
  if (!E164_PHONE_REGEX.test(p)) {
    return {
      field: 'customerPhone',
      message: 'Enter a valid phone number (E.164), e.g. +15551234567',
    };
  }
  return null;
}

export type BookingDraftLike = {
  serviceName: string;
  barberId: number;
  barberName: string;
  date: string; // YYYY-MM-DD
  slotStart: string; // ISO
  durationMinutes: number;
  price: string;
};

export function validateBookingDraft(
  draft: BookingDraftLike
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!draft.serviceName?.trim())
    errors.push({ field: 'serviceName', message: 'Service is required' });
  if (!draft.barberId || draft.barberId < 1)
    errors.push({ field: 'barberId', message: 'Barber is required' });
  if (!draft.barberName?.trim())
    errors.push({ field: 'barberName', message: 'Barber is required' });
  if (!draft.date?.trim())
    errors.push({ field: 'date', message: 'Date is required' });
  if (!draft.slotStart?.trim() || Number.isNaN(Date.parse(draft.slotStart))) {
    errors.push({ field: 'slotStart', message: 'Invalid appointment time' });
  }
  if (!draft.durationMinutes || draft.durationMinutes < 1) {
    errors.push({ field: 'durationMinutes', message: 'Invalid duration' });
  }
  const price = String(draft.price).trim();
  if (!price)
    errors.push({ field: 'totalPrice', message: 'Price is required' });
  else if (!PRICE_REGEX.test(price)) {
    errors.push({ field: 'totalPrice', message: 'Invalid price format' });
  }
  return errors;
}
