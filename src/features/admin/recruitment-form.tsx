'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, LinkButton } from '@/components/ui/button';
import { Field, Input, Textarea, describedBy } from '@/components/ui/field';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { api, errorMessage } from '@/lib/api';
import { fromLocalInput, toLocalInput } from '@/lib/format';
import { KIND_LABEL } from '@/lib/labels';
import type { Recruitment, RecruitmentKind } from '@/lib/types';
import { DeviceConditionsEditor, deviceIssues, type DeviceRow } from './device-conditions-editor';

const CAPACITY_MSG = '정원은 1명 이상 50명 이하로 정해 주세요.';
const DEVICE_MIN_MSG = '기기 조건을 하나 이상 선택해 주세요.';

const schema = z
  .object({
    title: z.string().trim().min(1, '제목을 입력해 주세요.').max(100, '제목은 100자 이하로 써 주세요.'),
    description: z.string().trim().min(1, '설명을 입력해 주세요.').max(5000, '설명은 5000자 이하로 써 주세요.'),
    kind: z.enum(['APP_FULL', 'FEATURE'], { message: '모집 종류를 골라 주세요.' }),
    capacity: z.number({ message: CAPACITY_MSG }).int(CAPACITY_MSG).min(1, CAPACITY_MSG).max(50, CAPACITY_MSG),
    startAt: z.string().min(1, '시작일을 입력해 주세요.'),
    endAt: z.string().min(1, '종료일을 입력해 주세요.'),
    devices: z
      .array(z.object({ os: z.enum(['ANDROID', 'IOS']), scope: z.enum(['ALL', 'MODEL']), deviceModelId: z.number().nullable() }))
      .min(1, DEVICE_MIN_MSG),
  })
  .superRefine((v, ctx) => {
    if (v.startAt && v.endAt && !(new Date(v.endAt).getTime() > new Date(v.startAt).getTime())) {
      ctx.addIssue({ code: 'custom', path: ['endAt'], message: '종료일은 시작일보다 늦어야 해요.' });
    }
    if (v.devices.some((d) => d.scope === 'MODEL' && d.deviceModelId === null)) {
      ctx.addIssue({ code: 'custom', path: ['devices'], message: '모델 목록에서 골라 주세요.' });
    } else {
      const issue = deviceIssues(v.devices)[0];
      if (issue) ctx.addIssue({ code: 'custom', path: ['devices'], message: issue });
    }
  });
type Values = z.infer<typeof schema>;

interface Props {
  /** 있으면 수정, 없으면 새로 등록 */
  recruitment?: Recruitment;
}

export function RecruitmentForm({ recruitment }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState('');
  const editing = !!recruitment;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: recruitment
      ? {
          title: recruitment.title,
          description: recruitment.description,
          kind: recruitment.kind,
          capacity: recruitment.capacity,
          startAt: toLocalInput(recruitment.startAt),
          endAt: toLocalInput(recruitment.endAt),
          devices: recruitment.devices.map((d) => ({ os: d.os, scope: d.scope, deviceModelId: d.deviceModelId })),
        }
      : { title: '', description: '', kind: 'APP_FULL', capacity: 15, startAt: '', endAt: '', devices: [{ os: 'ANDROID', scope: 'ALL', deviceModelId: null }] },
  });

  async function onSubmit(v: Values) {
    setServerError('');
    const body = {
      title: v.title,
      description: v.description,
      kind: v.kind,
      capacity: v.capacity,
      startAt: fromLocalInput(v.startAt),
      endAt: fromLocalInput(v.endAt),
      devices: v.devices.map((d) => ({ os: d.os, scope: d.scope, deviceModelId: d.scope === 'MODEL' ? d.deviceModelId : null })),
    };
    try {
      if (recruitment) await api(`/admin/recruitments/${recruitment.id}`, { method: 'PATCH', body });
      else await api('/admin/recruitments', { method: 'POST', body });
      toast(editing ? '저장했어요.' : '등록했어요.');
      router.push('/admin/recruitments');
      router.refresh();
    } catch (e) {
      // 서버가 최종 판단한다. 입력한 내용은 그대로 두고 이유만 위쪽에 보여 준다.
      setServerError(errorMessage(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const kinds = Object.keys(KIND_LABEL) as RecruitmentKind[];
  const capacityHint = recruitment && recruitment.participants > 0 ? `현재 ${recruitment.participants}명이 참여 중이라 정원은 ${recruitment.participants}명보다 줄일 수 없어요.` : '1명 이상 50명 이하로 정해요.';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="panel space-y-6 p-5 sm:p-6">
      {serverError && <Notice tone="error">{serverError}</Notice>}

      <Field id="title" label="제목" error={errors.title?.message}>
        <Input id="title" maxLength={100} aria-invalid={!!errors.title} aria-describedby={describedBy('title', errors.title?.message)} {...register('title')} />
      </Field>

      <Field id="description" label="설명" error={errors.description?.message}>
        <Textarea id="description" rows={6} aria-invalid={!!errors.description} aria-describedby={describedBy('description', errors.description?.message)} {...register('description')} />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-ink">종류</legend>
        <div className="flex flex-wrap gap-3">
          {kinds.map((k) => (
            <label key={k} className="flex h-10 cursor-pointer items-center gap-2 rounded-control border border-line-strong bg-surface px-4 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:checked]:text-brand-ink">
              <input type="radio" value={k} className="accent-brand" {...register('kind')} />
              {KIND_LABEL[k]}
            </label>
          ))}
        </div>
        {errors.kind && (
          <p role="alert" className="text-xs font-medium text-danger">
            {errors.kind.message}
          </p>
        )}
      </fieldset>

      <Field id="capacity" label="정원 (명)" hint={capacityHint} error={errors.capacity?.message} className="max-w-xs">
        <Input
          id="capacity"
          type="number"
          inputMode="numeric"
          min={1}
          max={50}
          aria-invalid={!!errors.capacity}
          aria-describedby={describedBy('capacity', errors.capacity?.message, capacityHint)}
          {...register('capacity', { valueAsNumber: true })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="startAt" label="시작일" hint="이 시각 전까지만 테스터가 신청·취소할 수 있어요." error={errors.startAt?.message}>
          <Input id="startAt" type="datetime-local" aria-invalid={!!errors.startAt} aria-describedby={describedBy('startAt', errors.startAt?.message, true)} {...register('startAt')} />
        </Field>
        <Field id="endAt" label="종료일" error={errors.endAt?.message}>
          <Input id="endAt" type="datetime-local" aria-invalid={!!errors.endAt} aria-describedby={describedBy('endAt', errors.endAt?.message)} {...register('endAt')} />
        </Field>
      </div>

      <Controller
        control={control}
        name="devices"
        render={({ field }) => <DeviceConditionsEditor value={field.value as DeviceRow[]} onChange={field.onChange} error={errors.devices?.message ?? errors.devices?.root?.message} />}
      />

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-5">
        <LinkButton href="/admin/recruitments" variant="secondary">
          취소
        </LinkButton>
        <Button type="submit" loading={isSubmitting}>
          {editing ? '저장하기' : '등록하기'}
        </Button>
      </div>
    </form>
  );
}
