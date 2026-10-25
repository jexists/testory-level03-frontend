'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';
import { FEEDBACK_TYPE_LABEL, FEEDBACK_TYPES } from '@/lib/labels';
import type { FeedbackType } from '@/lib/types';

const typeHint: Record<FeedbackType, string> = {
  BUG: '의도와 다르게 동작했어요',
  IMPROVEMENT: '이렇게 바뀌면 좋겠어요',
  PRAISE: '이런 점이 좋았어요',
};
const typeStyle: Record<FeedbackType, string> = {
  BUG: 'peer-checked:border-bug peer-checked:bg-bug-tint',
  IMPROVEMENT: 'peer-checked:border-improve peer-checked:bg-improve-tint',
  PRAISE: 'peer-checked:border-praise peer-checked:bg-praise-tint',
};

/** 피드백 유형은 쓰는 사람이 직접 고른다. 고르지 않으면 서버가 저장하지 않는다. */
export function FeedbackForm({ recruitmentId }: { recruitmentId: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [type, setType] = useState<FeedbackType | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!type) return setError('피드백 유형을 골라 주세요.');
    if (!title.trim() || !content.trim()) return setError('제목과 내용을 모두 입력해 주세요.');
    setBusy(true);
    try {
      await api(`/recruitments/${recruitmentId}/feedbacks`, { method: 'POST', body: { type, title, content } });
      toast('피드백을 남겼어요.');
      setType('');
      setTitle('');
      setContent('');
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">유형</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {FEEDBACK_TYPES.map((t) => (
            <label key={t} className="block cursor-pointer">
              <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="peer sr-only" />
              <span
                className={clsx(
                  'block rounded-control border border-line-strong bg-surface px-3 py-2.5 transition-colors hover:border-ink-soft peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand',
                  typeStyle[t],
                )}
              >
                <span className="block text-sm font-semibold">{FEEDBACK_TYPE_LABEL[t]}</span>
                <span className="block text-xs text-muted">{typeHint[t]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field id="fb-title" label="제목">
        <Input id="fb-title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field id="fb-content" label="내용" hint="어떤 화면에서 무엇을 했을 때인지 적어 주면 담당자가 다시 확인하기 쉬워요.">
        <Textarea id="fb-content" value={content} maxLength={2000} onChange={(e) => setContent(e.target.value)} aria-describedby="fb-content-hint" />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={busy}>
          피드백 남기기
        </Button>
      </div>
    </form>
  );
}
