const date = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' });
const dateYear = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
const time = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false });

export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatDateYear = (iso: string) => dateYear.format(new Date(iso));
export const formatDateTime = (iso: string) => time.format(new Date(iso));
export const formatPeriod = (startIso: string, endIso: string) => `${formatDate(startIso)} – ${formatDate(endIso)}`;

/** 오늘 기준 남은 날: D-3, D-day, D+2 (달력 날짜 기준) */
export function dDay(iso: string, now: Date = new Date()): string {
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((day(new Date(iso)) - day(now)) / 86_400_000);
  return diff === 0 ? 'D-day' : diff > 0 ? `D-${diff}` : `D+${-diff}`;
}

/** <input type="datetime-local"> 값 ↔ ISO 문자열 */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export const fromLocalInput = (value: string) => new Date(value).toISOString();
