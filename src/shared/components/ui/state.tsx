import type { ReactNode } from "react";
import { Button } from "./button";

export function Loading({ text = "불러오는 중이에요" }: { text?: string }) {
  return <p role="status" className="py-16 text-center text-sub">{text}</p>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="py-16 text-center">
      <p className="text-ink">{message}</p>
      {onRetry && <Button variant="text" onClick={onRetry} className="mt-2">다시 불러오기</Button>}
    </div>
  );
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="py-16 text-center">
      <p className="text-sub">{title}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** 데이터 화면의 공통 분기: 로딩 → 오류 → 본문 */
export function AsyncView<T>({ state, children }: {
  state: { data: T | null; error: string | null; loading: boolean; reload: () => void };
  children: (data: T) => ReactNode;
}) {
  if (state.loading && !state.data) return <Loading />;
  if (state.error && !state.data) return <ErrorState message={state.error} onRetry={state.reload} />;
  if (!state.data) return null;
  return <>{children(state.data)}</>;
}
