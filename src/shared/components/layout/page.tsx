import type { ReactNode } from "react";
import { cn } from "@/shared/utils/format";

export function PageShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <main className={cn("mx-auto w-full px-5 pb-32 pt-8 md:pb-24 md:pt-12", wide ? "max-w-[1040px]" : "max-w-[680px]")}>{children}</main>;
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-bold leading-tight md:text-[30px]">{title}</h1>
        {sub && <p className="mt-2 text-sub">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
