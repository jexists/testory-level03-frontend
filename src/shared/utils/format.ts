const md = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" });
const mdt = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

export const fmtDate = (iso: string) => md.format(new Date(iso));
export const fmtDateTime = (iso: string) => mdt.format(new Date(iso));
export const fmtRange = (a: string, b: string) => `${fmtDate(a)} ~ ${fmtDate(b)}`;

/** <input type="datetime-local"> 값 ↔ ISO */
export const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : "");

export const cn = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");
