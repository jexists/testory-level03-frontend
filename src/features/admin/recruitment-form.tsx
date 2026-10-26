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
const DAY = 86_400_000;
/** 피드백 마감일 기본값: 테스트 종료일 + 3일 */
const FEEDBACK_GRACE_DAYS = 3;
const plusGrace = (local: string) => toLocalInput(new Date(new Date(local).getTime() + FEEDBACK_GRACE_DAYS * DAY).toISOString());

const schema = z
  .object({
    title: z.string().trim().min(1, '제목을 입력해 주세요.').max(100, '제목은 100자 이하로 써 주세요.'),
    description: z.string().trim().min(1, '설명을 입력해 주세요.').max(5000, '설명은 5000자 이하로 써 주세요.'),
    kind: z.enum(['APP_FULL', 'FEATURE'], { message: '모집 종류를 골라 주세요.' }),
    capacity: z.number({ message: CAPACITY_MSG }).int(CAPACITY_MSG).min(1, CAPACITY_MSG).max(50, CAPACITY_MSG),
    startAt: z.string().min(1, '모집 마감일을 입력해 주세요.'),
    endAt: z.string().min(1, '테스트 종료일을 입력해 주세요.'),
    feedbackDueAt: z.string().min(1, '피드백 마감일을 입력해 주세요.'),
    /** 켜면 OS·모델과 관계없이 모든 기기를 받는다 (기기 조건 없이 저장) */
    anyDevice: z.boolean(),
    devices: z.array(z.object({ os: z.enum(['ANDROID', 'IOS']), scope: z.enum(['ALL', 'MODEL']), deviceModelId: z.number().nullable() })),
  })
  .superRefine((v, ctx) => {
    if (v.startAt && v.endAt && !(new Date(v.endAt).getTime() > new Date(v.startAt).getTime())) {
      ctx.addIssue({ code: 'custom', path: ['endAt'], message: '테스트 종료일은 모집 마감일보다 늦어야 해요.' });
    }
    if (v.endAt && v.feedbackDueAt && new Date(v.feedbackDueAt).getTime() < new Date(v.endAt).getTime()) {
      ctx.addIssue({ code: 'custom', path: ['feedbackDueAt'], message: '피드백 마감일은 종료일보다 늦어야 해요.' });
    }
    if (v.anyDevice) return;
    if (v.devices.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['devices'], message: DEVICE_MIN_MSG });
    } else if (v.devices.some((d) => d.scope === 'MODEL' && d.deviceModelId === null)) {
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
  // 관리자가 피드백 마감일을 직접 고치기 전까지는 종료일 + 3일로 따라 바꾼다.
  const [autoDue, setAutoDue] = useState(
    !recruitment || new Date(recruitment.feedbackDueAt).getTime() - new Date(recruitment.endAt).getTime() === FEEDBACK_GRACE_DAYS * DAY,
  );

  const {
    register,
    control,
    setValue,
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
          feedbackDueAt: toLocalInput(recruitment.feedbackDueAt),
          anyDevice: recruitment.devices.length === 0,
          devices: recruitment.devices.map((d) => ({ os: d.os, scope: d.scope, deviceModelId: d.deviceModelId })),
        }
      : { title: '', description: '', kind: 'APP_FULL', capacity: 15, startAt: '', endAt: '', feedbackDueAt: '', anyDevice: false, devices: [{ os: 'ANDROID', scope: 'ALL', deviceModelId: null }] },
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
      feedbackDueAt: fromLocalInput(v.feedbackDueAt),
      devices: v.anyDevice ? [] : v.devices.map((d) => ({ os: d.os, scope: d.scope, deviceModelId: d.scope === 'MODEL' ? d.deviceModelId : null })),
    };
    try {
      const saved = recruitment
        ? await api<Recruitment>(`/admin/recruitments/${recruitment.id}`, { method: 'PATCH', body })
        : await api<Recruitment>('/admin/recruitments', { method: 'POST', body });
      toast(editing ? '저장했어요.' : '등록했어요.');
      router.push(`/admin/recruitments/${saved.id}`);
      router.refresh();
    } catch (e) {
      // 서버가 최종 판단한다. 입력한 내용은 그대로 두고 이유만 위쪽에 보여 준다.
      setServerError(errorMessage(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const kinds = Object.keys(KIND_LABEL) as RecruitmentKind[];
  // 참여자가 있으면 줄일 수 없다는 제약이라 늘 보이게 두고, 기본 범위 안내는 툴팁으로 둔다.
  const capacityHint = recruitment && recruitment.participants > 0 ? `현재 ${recruitment.participants}명이 참여 중이라 정원은 ${recruitment.participants}명보다 줄일 수 없어요.` : undefined;

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

      <Field id="capacity" label="정원 (명)" info="1명 이상 50명 이하로 정해요." hint={capacityHint} error={errors.capacity?.message} className="max-w-xs">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Field id="startAt" label="모집 마감일" info="이날 테스트가 시작돼요. 정원이 다 차면 바로 시작해요." error={errors.startAt?.message}>
          <Input id="startAt" type="datetime-local" aria-invalid={!!errors.startAt} aria-describedby={describedBy('startAt', errors.startAt?.message)} {...register('startAt')} />
        </Field>
        <Field id="endAt" label="테스트 종료일" error={errors.endAt?.message}>
          <Input
            id="endAt"
            type="datetime-local"
            aria-invalid={!!errors.endAt}
            aria-describedby={describedBy('endAt', errors.endAt?.message)}
            {...register('endAt', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (autoDue && e.target.value) setValue('feedbackDueAt', plusGrace(e.target.value));
              },
            })}
          />
        </Field>
        <Field id="feedbackDueAt" label="피드백 마감일" info="기본은 종료일 3일 뒤예요. 이 시각까지 피드백을 받아요." error={errors.feedbackDueAt?.message}>
          <Input
            id="feedbackDueAt"
            type="datetime-local"
            aria-invalid={!!errors.feedbackDueAt}
            aria-describedby={describedBy('feedbackDueAt', errors.feedbackDueAt?.message)}
            {...register('feedbackDueAt', {
              onChange: () => setAutoDue(false),
            })}
          />
        </Field>
      </div>

      <Controller
        control={control}
        name="devices"
        render={({ field }) => (
          <Controller
            control={control}
            name="anyDevice"
            render={({ field: any }) => (
              <DeviceConditionsEditor
                value={field.value as DeviceRow[]}
                onChange={field.onChange}
                anyDevice={any.value}
                onAnyDeviceChange={any.onChange}
                error={errors.devices?.message ?? errors.devices?.root?.message}
              />
            )}
          />
        )}
      />

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-5">
        <LinkButton href={recruitment ? `/admin/recruitments/${recruitment.id}` : '/admin'} variant="secondary">
          취소
        </LinkButton>
        <Button type="submit" loading={isSubmitting}>
          {editing ? '저장하기' : '등록하기'}
        </Button>
      </div>
    </form>
  );
}
