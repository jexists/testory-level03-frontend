export type SearchParams = Record<string, string | string[] | undefined>;

export const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** 값이 있는 것만 골라 ?a=1&b=2 형태로 만든다 */
export function toQuery(params: Record<string, string | number | null | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** 양의 정수로 읽고, 아니면 undefined */
export function toPositiveInt(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}
