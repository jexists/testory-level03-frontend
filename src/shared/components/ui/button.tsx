import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/shared/utils/format";

type Variant = "primary" | "secondary" | "text" | "danger";

const base = "inline-flex items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const variants: Record<Variant, string> = {
  primary: "h-12 px-6 rounded-control bg-brand text-white hover:bg-brand-press active:bg-brand-press",
  secondary: "h-12 px-6 rounded-control bg-wash text-ink hover:bg-line",
  text: "min-h-11 px-1 text-brand hover:text-brand-press",
  danger: "min-h-11 px-1 text-danger hover:opacity-70",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; block?: boolean }

export function Button({ variant = "primary", block, className, type = "button", ...rest }: Props) {
  return <button type={type} className={cn(base, variants[variant], block && "w-full", className)} {...rest} />;
}

export function ButtonLink({ variant = "primary", block, className, ...rest }: ComponentProps<typeof Link> & { variant?: Variant; block?: boolean }) {
  return <Link className={cn(base, variants[variant], block && "w-full", className)} {...rest} />;
}
