'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { api } from '@/lib/api';
import { OS_LABEL } from '@/lib/labels';
import type { DeviceModel, DeviceScope, Os } from '@/lib/types';

export interface DeviceRow {
  os: Os;
  scope: DeviceScope;
  deviceModelId: number | null;
}

/** 기획서 R8: 같은 OS 전체와 그 OS 모델을 같이 넣을 수 없고, 같은 조건을 두 번 넣을 수 없다. 최종 판단은 서버가 한다. */
export function deviceIssues(rows: DeviceRow[]): string[] {
  const issues = new Set<string>();
  const allOs = new Set(rows.filter((r) => r.scope === 'ALL').map((r) => r.os));
  const seen = new Set<string>();
  for (const r of rows) {
    if (r.scope === 'MODEL' && allOs.has(r.os)) issues.add(`${OS_LABEL[r.os]} 전체를 허용했으니 ${OS_LABEL[r.os]} 모델은 따로 고를 필요가 없어요.`);
    const key = `${r.os}:${r.scope}:${r.scope === 'MODEL' ? r.deviceModelId : ''}`;
    if (r.scope === 'ALL' || r.deviceModelId !== null) {
      if (seen.has(key)) issues.add('같은 기기 조건을 두 번 넣을 수 없어요.');
      seen.add(key);
    }
  }
  return [...issues];
}

interface Props {
  value: DeviceRow[];
  onChange: (rows: DeviceRow[]) => void;
  error?: string;
}

export function DeviceConditionsEditor({ value, onChange, error }: Props) {
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

  const update = (i: number, patch: Partial<DeviceRow>) => onChange(value.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const hints = deviceIssues(value);

  return (
    <fieldset className="space-y-3" aria-describedby={error ? 'devices-error' : 'devices-hint'}>
      <legend className="text-sm font-semibold text-ink">허용 기기 조건</legend>
      <p id="devices-hint" className="text-xs text-muted">
        신청할 수 있는 기기를 정해요. 여러 줄을 넣을 수 있어요. 조건을 고쳐도 이미 신청한 사람의 신청은 그대로예요.
      </p>

      <ul className="space-y-2">
        {value.map((row, i) => {
          const options = (models ?? []).filter((m) => m.os === row.os);
          return (
            <li key={i} className="grid gap-2 rounded-control border border-line bg-canvas p-3 sm:grid-cols-[8rem_9rem_1fr_auto] sm:items-end">
              <RowField id={`device-${i}-os`} label="OS">
                <Select id={`device-${i}-os`} value={row.os} onChange={(e) => update(i, { os: e.target.value as Os, deviceModelId: null })}>
                  {(Object.keys(OS_LABEL) as Os[]).map((o) => (
                    <option key={o} value={o}>
                      {OS_LABEL[o]}
                    </option>
                  ))}
                </Select>
              </RowField>
              <RowField id={`device-${i}-scope`} label="범위">
                <Select id={`device-${i}-scope`} value={row.scope} onChange={(e) => update(i, { scope: e.target.value as DeviceScope, deviceModelId: null })}>
                  <option value="ALL">OS 전체</option>
                  <option value="MODEL">특정 모델</option>
                </Select>
              </RowField>
              {row.scope === 'MODEL' ? (
                <RowField id={`device-${i}-model`} label="모델">
                  <Select
                    id={`device-${i}-model`}
                    value={row.deviceModelId ?? ''}
                    disabled={!models}
                    onChange={(e) => update(i, { deviceModelId: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value="">{models ? '모델 선택' : loadFailed ? '불러오지 못했어요' : '불러오는 중'}</option>
                    {options.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.modelName}
                      </option>
                    ))}
                  </Select>
                </RowField>
              ) : (
                <p className="hidden pb-2.5 text-sm text-muted sm:block">{OS_LABEL[row.os]} 기기는 모델과 관계없이 모두 신청할 수 있어요.</p>
              )}
              <Button variant="ghost" size="sm" className="justify-self-start sm:mb-1" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label={`기기 조건 ${i + 1}번 줄 삭제하기`}>
                <Trash2 className="size-4" aria-hidden />
                줄 삭제
              </Button>
            </li>
          );
        })}
      </ul>

      {loadFailed && <p className="text-xs font-medium text-danger">모델 목록을 불러오지 못했어요. 새로고침한 뒤 다시 시도해 주세요.</p>}
      {hints.map((h) => (
        <p key={h} className="text-xs font-medium text-improve">
          {h}
        </p>
      ))}
      {error && (
        <p id="devices-error" role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}

      <Button variant="secondary" size="sm" onClick={() => onChange([...value, { os: 'ANDROID', scope: 'ALL', deviceModelId: null }])}>
        <Plus className="size-4" aria-hidden />
        기기 조건 추가
      </Button>
    </fieldset>
  );
}

function RowField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-ink-soft">
        {label}
      </label>
      {children}
    </div>
  );
}
