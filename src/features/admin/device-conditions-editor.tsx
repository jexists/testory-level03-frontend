'use client';

import clsx from 'clsx';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';
import { OS_LABEL } from '@/lib/labels';
import type { DeviceModel, DeviceScope, Os } from '@/lib/types';

export interface DeviceRow {
  os: Os;
  scope: DeviceScope;
  deviceModelId: number | null;
  /** "기타"를 골라 직접 입력한 모델명. 목록 모델을 골랐거나 아직 안 골랐으면 null */
  modelName: string | null;
}

/** 모델 선택 목록에서 "모든 모델"과 "기타"를 나타내는 값 */
const ALL = 'ALL';
const OTHER = 'OTHER';

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

/** 기획서 R8: 같은 OS 전체와 그 OS 모델을 같이 넣을 수 없고, 같은 조건을 두 번 넣을 수 없다. 최종 판단은 서버가 한다. */
export function deviceIssues(rows: DeviceRow[]): string[] {
  const issues = new Set<string>();
  const allOs = new Set(rows.filter((r) => r.scope === 'ALL').map((r) => r.os));
  const seen = new Set<string>();
  for (const r of rows) {
    if (r.scope === 'MODEL' && allOs.has(r.os)) issues.add(`${OS_LABEL[r.os]} 모든 모델을 골랐으니 특정 모델은 따로 넣지 않아도 돼요.`);
    const key =
      r.scope === 'ALL' ? `${r.os}:ALL` : r.deviceModelId !== null ? `${r.os}:MODEL:${r.deviceModelId}` : `${r.os}:NAME:${normalizeName(r.modelName ?? '')}`;
    if (r.scope === 'ALL' || r.deviceModelId !== null || r.modelName?.trim()) {
      if (seen.has(key)) issues.add('같은 기기 조건을 두 번 넣을 수 없어요.');
      seen.add(key);
    }
  }
  return [...issues];
}

const allRow = (os: Os): DeviceRow => ({ os, scope: 'ALL', deviceModelId: null, modelName: null });
/** 모델을 아직 고르지 않은 줄 */
const emptyRow = (os: Os): DeviceRow => ({ os, scope: 'MODEL', deviceModelId: null, modelName: null });

/** 그 OS 줄이 하나도 없으면 "모든 모델", 이미 있으면 모델을 고르게 비워 둔다. */
function freshRow(os: Os, others: DeviceRow[]): DeviceRow {
  return others.some((r) => r.os === os) ? emptyRow(os) : allRow(os);
}

/** 줄 → 모델 선택 목록 값 */
function rowValue(row: DeviceRow): string {
  if (row.scope === 'ALL') return ALL;
  if (row.deviceModelId !== null) return String(row.deviceModelId);
  return row.modelName !== null ? OTHER : '';
}

/** 모델 선택 목록 값 → 줄. "기타"로 바꿀 때는 입력해 둔 이름을 살린다. */
function rowFromValue(prev: DeviceRow, v: string): DeviceRow {
  if (v === ALL) return allRow(prev.os);
  if (v === OTHER) return { ...emptyRow(prev.os), modelName: prev.modelName ?? '' };
  return { ...emptyRow(prev.os), deviceModelId: Number(v) };
}

interface Props {
  value: DeviceRow[];
  onChange: (rows: DeviceRow[]) => void;
  /** true 면 조건 줄을 숨기고 모든 기기를 받는다 */
  anyDevice: boolean;
  onAnyDeviceChange: (on: boolean) => void;
  error?: string;
}

const OS_LIST = Object.keys(OS_LABEL) as Os[];
const DEFAULT_ROW = allRow('ANDROID');
const modeClass =
  'flex h-10 cursor-pointer items-center gap-2 rounded-control border border-line-strong bg-surface px-4 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:checked]:text-brand-ink';

/**
 * 한 줄 = OS + 모델. 모델 목록 맨 위는 "모든 모델", 맨 아래는 "기타"(직접 입력)다.
 * 서로 겹치는 조건(같은 OS 전체 + 그 OS 모델, 같은 모델 두 번)은 처음부터 고를 수 없게 막는다.
 */
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

  const update = (i: number, row: DeviceRow) => onChange(value.map((r, idx) => (idx === i ? row : r)));
  const othersOf = (i: number) => value.filter((_, idx) => idx !== i);
  /** 다른 줄이 그 OS 전체를 이미 받고 있으면 그 OS 로는 더 넣을 게 없다. */
  const osTaken = (os: Os, others: DeviceRow[]) => others.some((r) => r.os === os && r.scope === 'ALL');
  const addableOs = OS_LIST.find((os) => !osTaken(os, value));

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
              const others = othersOf(i);
              const sameOs = others.filter((r) => r.os === row.os);
              const allTaken = sameOs.some((r) => r.scope === 'ALL');
              const pickedIds = new Set(sameOs.map((r) => r.deviceModelId).filter((v): v is number => v !== null));
              const selected = rowValue(row);
              const modelOptions = [
                { value: ALL, label: '모든 모델', disabled: sameOs.length > 0 },
                ...(models ?? [])
                  .filter((m) => m.os === row.os && (m.isActive || m.id === row.deviceModelId))
                  .map((m) => ({ value: String(m.id), label: m.modelName, disabled: allTaken || pickedIds.has(m.id) })),
                { value: OTHER, label: '기타 (직접 입력)', disabled: allTaken },
              ];
              const typing = selected === OTHER;
              return (
                <li
                  key={i}
                  className={clsx(
                    'grid gap-2 rounded-control border border-line bg-canvas p-3 sm:items-end',
                    typing ? 'sm:grid-cols-[8rem_14rem_1fr_auto]' : 'sm:grid-cols-[8rem_1fr_auto]',
                  )}
                >
                  <RowField id={`device-${i}-os`} label="OS">
                    <Select
                      id={`device-${i}-os`}
                      value={row.os}
                      options={OS_LIST.map((o) => ({ value: o, label: OS_LABEL[o], disabled: o !== row.os && osTaken(o, others) }))}
                      onValueChange={(v) => v !== row.os && update(i, freshRow(v as Os, others))}
                    />
                  </RowField>
                  <RowField id={`device-${i}-model`} label="모델">
                    <Select
                      id={`device-${i}-model`}
                      value={selected}
                      disabled={!models}
                      placeholder={models ? '모델 선택' : loadFailed ? '불러오지 못했어요' : '불러오는 중'}
                      options={modelOptions}
                      onValueChange={(v) => update(i, rowFromValue(row, v))}
                    />
                  </RowField>
                  {typing && (
                    <RowField id={`device-${i}-model-name`} label="모델명">
                      <Input
                        id={`device-${i}-model-name`}
                        value={row.modelName ?? ''}
                        maxLength={100}
                        placeholder="목록에 없는 모델명을 입력해 주세요"
                        onChange={(e) => update(i, { ...row, modelName: e.target.value })}
                      />
                    </RowField>
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
          {error && (
            <p id="devices-error" role="alert" className="text-xs font-medium text-danger">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={!addableOs}
            title={addableOs ? undefined : '모든 OS 의 모든 모델을 이미 받고 있어요'}
            onClick={() => addableOs && onChange([...value, freshRow(addableOs, value)])}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-control border border-dashed border-line-strong text-sm font-medium text-ink-soft transition-colors enabled:hover:border-brand enabled:hover:bg-brand-tint enabled:hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" aria-hidden />
            기기 조건 추가
          </button>
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
