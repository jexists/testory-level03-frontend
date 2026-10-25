import { cn } from "@/shared/utils/format";

interface Option<T extends string> { value: T; label: string }

/** 텍스트 탭: 선택된 것만 진하게. 필터·정렬·버전 선택에 공통으로 쓴다. */
export function TextTabs<T extends string>({ options, value, onChange, label }: {
  options: Option<T>[]; value: T; onChange: (v: T) => void; label: string;
}) {
  return (
    <div role="group" aria-label={label} className="-mx-1 flex flex-wrap gap-x-1 text-[15px]">
      {options.map((o) => (
        <button
          key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}
          className={cn("min-h-11 px-3 transition-colors", o.value === value ? "font-semibold text-ink" : "text-sub hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** 폼 안에서 쓰는 선택 컨트롤(세그먼트): 선택된 칸만 흰 바탕으로 올라온다. */
export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: Option<T>[]; value: T | ""; onChange: (v: T) => void; label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col rounded-control bg-wash p-1">
      {options.map((o) => (
        <button
          key={o.value} type="button" role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)}
          className={cn("min-h-11 rounded-[9px] px-3 text-[15px] transition-colors",
            o.value === value ? "bg-white font-semibold text-ink" : "text-sub")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
