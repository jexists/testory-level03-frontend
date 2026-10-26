'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
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
    if (r.scope === 'MODEL' && allOs.has(r.os)) issues.add(`${OS_LABEL[r.os]} 모든 모델을 골랐으니 특정 모델은 따로 넣지 않아도 돼요.`);
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
  /** true 면 조건 줄을 숨기고 모든 기기를 받는다 */
  anyDevice: boolean;
  onAnyDeviceChange: (on: boolean) => void;
  error?: string;
}

const DEFAULT_ROW: DeviceRow = { os: 'ANDROID', scope: 'ALL', deviceModelId: null };
const modeClass =
  'flex h-10 cursor-pointer items-center gap-2 rounded-control border border-line-strong bg-surface px-4 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:checked]:text-brand-ink';

export function DeviceConditionsEditor({ value, onChange, anyDevice, onAnyDeviceChange, error }: Props) {
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
    <fieldset className="space-y-3" aria-describedby={error && !anyDevice ? 'devices-error' : undefined}>
      <legend className="mb-2 text-sm font-semibold text-ink">허용 기기 조건</legend>
      <div className="flex flex-wrap items-center gap-3">
        <label className={modeClass}>
          <input type="radio" name="device-mode" className="accent-brand" checked={anyDevice} onChange={() => onAnyDeviceChange(true)} />
          모든 기기
        </label>
        <label className={modeClass}>
          <input
            type="radio"
            name="device-mode"
            className="accent-brand"
            checked={!anyDevice}
            onChange={() => {
              onAnyDeviceChange(false);
              if (value.length === 0) onChange([DEFAULT_ROW]);
            }}
          />
          선택한 기기만
        </label>
      </div>

      {!anyDevice && (
        <>
          <ul className="space-y-2">
            {value.map((row, i) => {
              const options = (models ?? []).filter((m) => m.os === row.os);
              return (
                <li key={i} className="grid gap-2 rounded-control border border-line bg-canvas p-3 sm:grid-cols-[8rem_9rem_1fr_auto] sm:items-end">
                  <RowField id={`device-${i}-os`} label="OS">
                    <Select
                      id={`device-${i}-os`}
                      value={row.os}
                      options={(Object.keys(OS_LABEL) as Os[]).map((o) => ({ value: o, label: OS_LABEL[o] }))}
                      onValueChange={(v) => update(i, { os: v as Os, deviceModelId: null })}
                    />
                  </RowField>
                  <RowField id={`device-${i}-scope`} label="범위">
                    <Select
                      id={`device-${i}-scope`}
                      value={row.scope}
                      options={[
                        { value: 'ALL', label: '모든 모델' },
                        { value: 'MODEL', label: '특정 모델' },
                      ]}
                      onValueChange={(v) => update(i, { scope: v as DeviceScope, deviceModelId: null })}
                    />
                  </RowField>
                  {row.scope === 'MODEL' ? (
                    <RowField id={`device-${i}-model`} label="모델">
                      <Select
                        id={`device-${i}-model`}
                        value={row.deviceModelId === null ? '' : String(row.deviceModelId)}
                        disabled={!models}
                        placeholder={models ? '모델 선택' : loadFailed ? '불러오지 못했어요' : '불러오는 중'}
                        options={options.map((m) => ({ value: String(m.id), label: m.modelName }))}
                        onValueChange={(v) => update(i, { deviceModelId: v ? Number(v) : null })}
                      />
                    </RowField>
                  ) : (
                    <span aria-hidden className="hidden sm:block" />
                  )}
                  <Button
                    variant="ghost"
                    className="w-10 justify-self-start px-0!"
                    onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                    aria-label={`기기 조건 ${i + 1}번 줄 삭제하기`}
                    title={`기기 조건 ${i + 1}번 줄 삭제하기`}
                  >
                    <Trash2 className="size-4" aria-hidden />
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

          <Button variant="secondary" size="sm" onClick={() => onChange([...value, DEFAULT_ROW])}>
            <Plus className="size-4" aria-hidden />
            기기 조건 추가
          </Button>
        </>
      )}
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
