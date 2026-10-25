"use client";
import { useState } from "react";
import { FEEDBACK_LABEL } from "@/shared/constants/labels";
import type { FeedbackType } from "@/shared/types/api";
import { cn, fmtDateTime } from "@/shared/utils/format";

/** 긴 피드백은 2줄만 보이고, 눌러서 전체를 펼친다. 유형은 색 칩 대신 글자로만 표시한다. */
export function FeedbackItem({ type, title, content, createdAt, meta }: {
  type: FeedbackType; title: string; content: string; createdAt: string; meta?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-b border-line py-5">
      <p className="text-sm text-sub">
        <span className={cn("font-semibold", type === "BUG" ? "text-danger" : "text-ink")}>{FEEDBACK_LABEL[type]}</span>
        {meta && <> · {meta}</>} · {fmtDateTime(createdAt)}
      </p>
      <p className="mt-1 font-semibold">{title}</p>
      <p className={cn("mt-1 whitespace-pre-line text-ink/80", !open && "line-clamp-2")}>{content}</p>
      {content.length > 70 && (
        <button type="button" onClick={() => setOpen(!open)} className="mt-1 min-h-9 text-sm text-sub hover:text-ink">
          {open ? "접기" : "전체 보기"}
        </button>
      )}
    </li>
  );
}
