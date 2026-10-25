import Link from 'next/link';
import { FeedbackTypeBadge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/format';
import type { Feedback } from '@/lib/types';

export function FeedbackItem({ f, recruitment }: { f: Feedback; recruitment?: { id: number; title: string } }) {
  return (
    <li className="space-y-1.5 px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <FeedbackTypeBadge type={f.type} />
        <h3 className="text-base">{f.title}</h3>
      </div>
      <p className="whitespace-pre-wrap text-sm text-ink-soft">{f.content}</p>
      <p className="text-xs text-muted">
        {recruitment && (
          <>
            <Link href={`/recruitments/${recruitment.id}`} className="font-medium text-brand-ink underline-offset-4 hover:underline">
              {recruitment.title}
            </Link>{' '}
            <span aria-hidden>·</span>{' '}
          </>
        )}
        {formatDateTime(f.createdAt)}
      </p>
    </li>
  );
}
