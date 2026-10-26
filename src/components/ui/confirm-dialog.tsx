'use client';

import { useEffect, useId, useRef } from 'react';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 브라우저 기본 <dialog> 를 써서 포커스 가두기·Esc 닫기를 그대로 얻는다. */
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = '취소', danger, loading, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // 한 화면에 모달이 여러 개 있어도 제목 연결이 겹치지 않게 한다.
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-panel border border-line bg-surface p-0 text-ink shadow-overlay backdrop:bg-ink/45"
    >
      <div className="space-y-2 p-6">
        <h2 id={titleId} className="text-lg">
          {title}
        </h2>
        {description && <div className="text-[15px] text-ink-soft">{description}</div>}
      </div>
      <div className="flex justify-end gap-2 border-t border-line bg-canvas px-6 py-3.5">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
