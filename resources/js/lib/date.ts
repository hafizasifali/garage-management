import { format, parseISO, isValid } from 'date-fns';

export function toPickerDate(value?: string | null) {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export function toBackendDate(date: Date | null) {
  return date ? format(date, 'yyyy-MM-dd') : null;
}

/* ✅ NEW: display format */
export function toDisplayDate(value?: string | null) {
  if (!value) return '-';

  const d = parseISO(value);
  return isValid(d) ? format(d, 'dd-MMM-yyyy') : '-';
}