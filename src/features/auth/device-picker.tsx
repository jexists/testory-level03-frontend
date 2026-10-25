'use client';

import { useEffect, useState } from 'react';
import { Field, Select, describedBy } from '@/components/ui/field';
import { api } from '@/lib/api';
import { OS_LABEL } from '@/lib/labels';
import type { DeviceModel, Os } from '@/lib/types';

interface DevicePickerProps {
  os: Os | '';
  modelId: number | '';
  onChange: (value: { os: Os | ''; modelId: number | '' }) => void;
  osError?: string;
  modelError?: string;
  idPrefix?: string;
}

/** OS 를 고르면 그 OS 의 모델 목록이 열리고, 모델은 목록에서만 고른다. */
export function DevicePicker({ os, modelId, onChange, osError, modelError, idPrefix = 'device' }: DevicePickerProps) {
  const [models, setModels] = useState<DeviceModel[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    api<DeviceModel[]>('/device-models')
      .then((m) => alive && setModels(m))
      .catch(() => alive && setLoadFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const options = (models ?? []).filter((m) => m.os === os);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id={`${idPrefix}-os`} label="내 기기의 OS" error={osError}>
        <Select
          id={`${idPrefix}-os`}
          value={os}
          aria-invalid={!!osError}
          aria-describedby={describedBy(`${idPrefix}-os`, osError)}
          onChange={(e) => onChange({ os: e.target.value as Os | '', modelId: '' })}
        >
          <option value="">OS 선택</option>
          {(Object.keys(OS_LABEL) as Os[]).map((o) => (
            <option key={o} value={o}>
              {OS_LABEL[o]}
            </option>
          ))}
        </Select>
      </Field>
      <Field id={`${idPrefix}-model`} label="기기 모델" error={modelError || (loadFailed ? '모델 목록을 불러오지 못했어요. 새로고침해 주세요.' : undefined)}>
        <Select
          id={`${idPrefix}-model`}
          value={modelId}
          disabled={!os || !models}
          aria-invalid={!!modelError}
          aria-describedby={describedBy(`${idPrefix}-model`, modelError)}
          onChange={(e) => onChange({ os, modelId: e.target.value ? Number(e.target.value) : '' })}
        >
          <option value="">{os ? '모델 선택' : '먼저 OS를 골라 주세요'}</option>
          {options.map((m) => (
            <option key={m.id} value={m.id}>
              {m.modelName}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
