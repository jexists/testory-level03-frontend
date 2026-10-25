import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/utils/format";

const control = "w-full rounded-control border border-line bg-white px-4 text-[16px] text-ink placeholder:text-faint focus:border-brand focus:outline-none";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-sub">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-sm text-faint">{hint}</span>}
      {error && <span role="alert" className="mt-1.5 block text-sm text-danger">{error}</span>}
    </label>
  );
}

export function TextInput({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-12", className)} {...p} />;
}
export function TextArea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-32 py-3 leading-relaxed", className)} {...p} />;
}
export function Select({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, "h-12 appearance-none bg-[length:16px] pr-10", className)} {...p} />;
}
