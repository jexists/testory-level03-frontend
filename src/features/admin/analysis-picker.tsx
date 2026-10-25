'use client';

import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/field';

export interface PickerOption {
  id: number;
  label: string;
}

export function AnalysisPicker({ options, value }: { options: PickerOption[]; value?: number }) {
  const router = useRouter();
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <label htmlFor="analysis-recruitment" className="block text-sm font-semibold text-ink">
        모집글
      </label>
      <Select
        id="analysis-recruitment"
        value={value ?? ''}
        onChange={(e) => router.push(e.target.value ? `/admin/analysis?recruitmentId=${e.target.value}` : '/admin/analysis')}
      >
        <option value="">모집글을 골라 주세요</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
