'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function RetryButton() {
  const router = useRouter();
  return (
    <Button variant="secondary" size="sm" onClick={() => router.refresh()}>
      다시 불러오기
    </Button>
  );
}
