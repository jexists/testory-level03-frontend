'use client';

import { useEffect, useState } from 'react';
import { Field, Input, describedBy, type ControlSize } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';
import { OS_LABEL } from '@/lib/labels';
import type { DeviceModel, Os, User } from '@/lib/types';

/** 목록에 없는 기기를 고를 때 쓰는 선택값. 저장하지 않고, 직접 입력한 이름만 서버로 보낸다. */
export const OTHER = 'OTHER';

export interface DeviceValue {
  os: Os | typeof OTHER | '';
  osName: string;
  modelId: number | typeof OTHER | '';
  modelName: string;
}

export type DeviceErrors = Partial<Record<keyof DeviceValue, string>>;

export const EMPTY_DEVICE: DeviceValue = { os: '', osName: '', modelId: '', modelName: '' };

/** 저장된 내 기기를 선택값으로 되돌린다. 이름만 있으면 "기타"를 고른 것이다. */
export function deviceFromUser(user: User): DeviceValue {
  const os = user.deviceType ?? (user.deviceOsName ? OTHER : '');
  if (!os || !user.deviceModel) return { ...EMPTY_DEVICE, os, osName: user.deviceOsName ?? '' };
  const typed = user.deviceModel.id === null;
  return {
    os,
    osName: user.deviceOsName ?? '',
    modelId: os === OTHER ? '' : typed ? OTHER : user.deviceModel.id!,
    modelName: typed ? user.deviceModel.modelName : '',
  };
}

/** 가입·마이페이지가 같이 쓰는 검사. 비어 있으면 항목별 문구를 돌려준다. */
export function deviceErrors(v: DeviceValue): DeviceErrors {
  const e: DeviceErrors = {};
  if (!v.os) e.os = '내 기기를 선택해 주세요.';
  if (v.os === OTHER) {
    if (!v.osName.trim()) e.osName = 'OS 이름을 입력해 주세요.';
    else if (v.osName.trim().length > 30) e.osName = 'OS 이름은 30자 이하로 입력해 주세요.';
  }
  const typedModel = v.os === OTHER || v.modelId === OTHER;
  if (v.os && !typedModel && v.modelId === '') e.modelId = '내 기기를 선택해 주세요.';
  if (v.os && typedModel) {
    if (!v.modelName.trim()) e.modelName = '기기 모델명을 입력해 주세요.';
    else if (v.modelName.trim().length > 60) e.modelName = '기기 모델명은 60자 이하로 입력해 주세요.';
  }
  return e;
}

/** API 요청 본문. "기타"를 골랐다면 이름만 보낸다. */
export function deviceToBody(v: DeviceValue) {
  const typedModel = v.os === OTHER || v.modelId === OTHER;
  return {
    deviceType: v.os,
    ...(v.os === OTHER ? { deviceOsName: v.osName.trim() } : {}),
    ...(typedModel ? { deviceModelName: v.modelName.trim() } : { deviceModelId: v.modelId }),
  };
}

interface DevicePickerProps {
  value: DeviceValue;
  onChange: (value: DeviceValue) => void;
  errors?: DeviceErrors;
  osHint?: string;
  idPrefix?: string;
  size?: ControlSize;
}

/** OS 를 고르면 그 OS 의 모델 목록이 열린다. 목록에 없으면 "기타"를 골라 이름을 직접 입력한다. */
export function DevicePicker({ value, onChange, errors = {}, osHint, idPrefix = 'device', size }: DevicePickerProps) {
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

  const { os, modelId } = value;
  const options = (models ?? []).filter((m) => m.os === os);
  const modelErrorText = errors.modelId || (loadFailed ? '모델 목록을 불러오지 못했어요. 새로고침해 주세요.' : undefined);
  const set = (patch: Partial<DeviceValue>) => onChange({ ...value, ...patch });

  const ids = { os: `${idPrefix}-os`, osName: `${idPrefix}-os-name`, model: `${idPrefix}-model`, modelName: `${idPrefix}-model-name` };
  const nameInput = (key: 'osName' | 'modelName', id: string, label: string, placeholder: string, hint?: string) => (
    <Field id={id} label={label} hint={hint} error={errors[key]}>
      <Input
        id={id}
        inputSize={size}
        value={value[key]}
        placeholder={placeholder}
        maxLength={key === 'osName' ? 30 : 60}
        aria-invalid={!!errors[key]}
        aria-describedby={describedBy(id, errors[key], hint)}
        onChange={(e) => set({ [key]: e.target.value })}
      />
    </Field>
  );

  return (
    <div className="space-y-5">
      <Field id={ids.os} label="휴대폰 OS" hint={osHint} error={errors.os}>
        <Select
          id={ids.os}
          value={os}
          aria-invalid={!!errors.os}
          aria-describedby={describedBy(ids.os, errors.os, osHint)}
          size={size}
          placeholder="OS 선택"
          options={[...(Object.keys(OS_LABEL) as Os[]).map((o) => ({ value: o, label: OS_LABEL[o] })), { value: OTHER, label: '기타' }]}
          onValueChange={(v) => onChange({ ...EMPTY_DEVICE, os: v as DeviceValue['os'] })}
        />
      </Field>

      {os === OTHER && (
        <>
          {nameInput('osName', ids.osName, 'OS 이름', '예: HarmonyOS')}
          {nameInput('modelName', ids.modelName, '기기 모델', '예: Mate 60')}
        </>
      )}

      {os && os !== OTHER && (
        <Field id={ids.model} label="기기 모델" error={modelErrorText}>
          <Select
            id={ids.model}
            value={String(modelId)}
            disabled={!models}
            aria-invalid={!!modelErrorText}
            aria-describedby={describedBy(ids.model, modelErrorText)}
            size={size}
            placeholder="모델 선택"
            options={[...options.map((m) => ({ value: String(m.id), label: m.modelName })), { value: OTHER, label: '기타' }]}
            onValueChange={(v) => set({ modelId: v === OTHER ? OTHER : v ? Number(v) : '', modelName: '' })}
          />
        </Field>
      )}

      {os && os !== OTHER && modelId === OTHER && nameInput('modelName', ids.modelName, '모델명', '목록에 없는 모델명을 입력해 주세요')}
    </div>
  );
}
