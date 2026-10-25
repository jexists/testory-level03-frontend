const date = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' });
const dateYear = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
const time = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false });

export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatDateYear = (iso: string) => dateYear.format(new Date(iso));
export const formatDateTime = (iso: string) => time.format(new Date(iso));
export const formatPeriod = (startIso: string, endIso: string) => `${formatDate(startIso)} – ${formatDate(endIso)}`;

/** <input type="datetime-local"> 값 ↔ ISO 문자열 */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export const fromLocalInput = (value: string) => new Date(value).toISOString();
