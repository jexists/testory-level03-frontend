const date = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' });
const dateYear = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
const time = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false });

export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatDateYear = (iso: string) => dateYear.format(new Date(iso));
export const formatDateTime = (iso: string) => time.format(new Date(iso));
/** 좁은 자리에 쓰는 짧은 시각: 10/8 17:59 */
export function formatShortDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export const formatPeriod = (startIso: string, endIso: string) => `${formatDate(startIso)} – ${formatDate(endIso)}`;

/** 오늘부터 그 날까지 남은 날 수 (달력 날짜 기준, 지난 날은 음수) */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((day(new Date(iso)) - day(now)) / 86_400_000);
}

/** 오늘 기준 남은 날: D-3, D-day, D+2 (달력 날짜 기준) */
export function dDay(iso: string, now: Date = new Date()): string {
  const diff = daysUntil(iso, now);
  return diff === 0 ? 'D-day' : diff > 0 ? `D-${diff}` : `D+${-diff}`;
}

/** <input type="datetime-local"> 값 ↔ ISO 문자열 */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export const fromLocalInput = (value: string) => new Date(value).toISOString();
