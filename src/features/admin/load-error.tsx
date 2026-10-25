import { ErrorState } from '@/components/ui/state-view';
import { errorMessage } from '@/lib/api';
import { RetryButton } from './retry-button';

/** 서버에서 데이터를 못 불러왔을 때 패널 안에 보여 준다. */
export function LoadError({ error, title }: { error: unknown; title?: string }) {
  return (
    <div className="panel">
      <ErrorState title={title} description={errorMessage(error)} action={<RetryButton />} />
    </div>
  );
}
