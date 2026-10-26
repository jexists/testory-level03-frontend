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

/** 고른 유형은 그 유형 색의 테두리·배경·글자로 표시한다. */
const typeStyle: Record<FeedbackType, string> = {
  BUG: 'peer-checked:border-bug peer-checked:bg-bug-tint peer-checked:text-bug',
  IMPROVEMENT: 'peer-checked:border-improve peer-checked:bg-improve-tint peer-checked:text-improve',
  PRAISE: 'peer-checked:border-praise peer-checked:bg-praise-tint peer-checked:text-praise',
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
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_TYPES.map((t) => (
            <label key={t} className="relative cursor-pointer has-disabled:cursor-not-allowed">
              <input type="radio" name="type" value={t} checked={type === t} disabled={busy} onChange={() => setType(t)} className="peer sr-only" />
              <span
                className={clsx(
                  'inline-flex h-9 items-center rounded-control border border-line-strong bg-surface px-4 text-sm font-medium text-ink-soft transition-colors peer-checked:font-semibold peer-not-checked:peer-enabled:hover:border-ink-soft peer-not-checked:peer-enabled:hover:bg-sunken peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand peer-disabled:opacity-55',
                  typeStyle[t],
                )}
              >
                {FEEDBACK_TYPE_LABEL[t]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field id="fb-title" label="제목">
        <Input id="fb-title" value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field id="fb-content" label="내용">
        <Textarea
          id="fb-content"
          value={content}
          maxLength={2000}
          placeholder="어떤 화면에서 무엇을 했을 때인지 적어 주면 담당자가 다시 확인하기 쉬워요."
          onChange={(e) => setContent(e.target.value)}
        />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" loading={busy}>
          피드백 남기기
        </Button>
      </div>
    </form>
  );
}
