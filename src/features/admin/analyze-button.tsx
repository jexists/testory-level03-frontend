'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';

/** AI 분석 탭으로 옮겨 가서 새 분석을 시작한다. 진행 상황과 결과는 그 탭에서 흘러나오듯 보여 준다. */
export function AnalyzeButton({ recruitmentId, disabled }: { recruitmentId: number; disabled?: boolean }) {
  const router = useRouter();
  const [moving, startMoving] = useTransition();

  return (
    <Button
      onClick={() => startMoving(() => router.push(`/admin/recruitments/${recruitmentId}/analysis?run=1`))}
      loading={moving}
      disabled={disabled}
    >
      {!moving && <Sparkles className="size-4" aria-hidden />}
      AI 분석 실행
    </Button>
  );
}
