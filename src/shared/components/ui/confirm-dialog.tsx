"use client";
import { useEffect, useRef } from "react";
import { Button } from "./button";

export function ConfirmDialog({ open, title, body, confirmLabel, danger, busy, onConfirm, onCancel }: {
  open: boolean; title: string; body?: string; confirmLabel: string; danger?: boolean; busy?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref} onCancel={(e) => { e.preventDefault(); onCancel(); }}
      className="m-auto w-[min(92vw,380px)] rounded-[20px] p-6 backdrop:bg-black/40"
    >
      <h2 className="text-lg font-bold">{title}</h2>
      {body && <p className="mt-2 text-sub">{body}</p>}
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onCancel}>닫기</Button>
        <Button onClick={onConfirm} disabled={busy} className={danger ? "bg-danger hover:bg-danger active:bg-danger" : ""}>{confirmLabel}</Button>
      </div>
    </dialog>
  );
}
