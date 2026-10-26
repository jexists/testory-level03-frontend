'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, PasswordInput, describedBy } from '@/components/ui/field';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { ApiError, api } from '@/lib/api';
import { detectOs } from '@/lib/device';
import type { Os, User } from '@/lib/types';
import { AuthShell } from './auth-shell';
import { DevicePicker, EMPTY_DEVICE, deviceErrors, deviceToBody, type DeviceValue } from './device-picker';

const schema = z.object({
  email: z.string().trim().email('이메일 주소를 다시 확인해 주세요. 예: name@example.com'),
  password: z.string().min(8, '비밀번호는 8자 이상으로 만들어 주세요.'),
  nickname: z.string().trim().min(1, '닉네임을 입력해 주세요.').max(30, '닉네임은 30자 이하로 만들어 주세요.'),
  device: z.custom<DeviceValue>().superRefine((v, ctx) => {
    for (const [path, message] of Object.entries(deviceErrors(v))) ctx.addIssue({ code: 'custom', path: [path], message });
  }),
});
type Values = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState('');
  // 서버에서는 알 수 없으므로 null, 브라우저에서는 사용자 에이전트로 OS 를 확인한다.
  const detected = useSyncExternalStore<Os | null>(
    () => () => {},
    () => detectOs(),
    () => null,
  );
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { device: EMPTY_DEVICE } });

  // 브라우저가 알려 주는 정보로 OS 를 미리 골라 둔다. 감지가 안 되면 사용자가 직접 고른다.
  useEffect(() => {
    if (detected && !getValues('device').os) setValue('device', { ...EMPTY_DEVICE, os: detected });
  }, [detected, getValues, setValue]);

  async function onSubmit(values: Values) {
    setServerError('');
    try {
      const { device, ...account } = values;
      await api<{ user: User }>('/auth/signup', { method: 'POST', body: { ...account, ...deviceToBody(device) } });
      toast('가입이 끝났어요. 환영해요!');
      router.push('/');
      router.refresh();
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : '가입하지 못했어요. 잠시 뒤 다시 시도해 주세요.');
    }
  }

  return (
    <AuthShell
      title="회원가입"
      footer={
        <>
          이미 계정이 있나요?{' '}
          <Link href="/login" className="font-semibold text-brand underline-offset-4 hover:underline">
            로그인
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError && <Notice tone="error">{serverError}</Notice>}
        <Field id="email" label="이메일" error={errors.email?.message}>
          <Input inputSize="lg" id="email" type="email" autoComplete="email" placeholder="name@example.com" aria-invalid={!!errors.email} aria-describedby={describedBy('email', errors.email?.message)} {...register('email')} />
        </Field>
        <Field id="password" label="비밀번호" error={errors.password?.message}>
          <PasswordInput
            inputSize="lg"
            id="password"
            autoComplete="new-password"
            placeholder="8자 이상"
            aria-invalid={!!errors.password}
            aria-describedby={describedBy('password', errors.password?.message)}
            {...register('password')}
          />
        </Field>
        <Field id="nickname" label="닉네임" error={errors.nickname?.message}>
          <Input inputSize="lg" id="nickname" autoComplete="nickname" placeholder="사용할 이름" aria-invalid={!!errors.nickname} aria-describedby={describedBy('nickname', errors.nickname?.message)} {...register('nickname')} />
        </Field>

        <fieldset className="space-y-5">
          <legend className="sr-only">내 기기</legend>
          <Controller
            control={control}
            name="device"
            render={({ field }) => (
              <DevicePicker
                size="lg"
                value={field.value}
                onChange={field.onChange}
                errors={{
                  os: errors.device?.os?.message,
                  osName: errors.device?.osName?.message,
                  modelId: errors.device?.modelId?.message,
                  modelName: errors.device?.modelName?.message,
                }}
                osHint={detected && field.value.os === detected ? '접속한 기기 기준으로 골라 뒀어요' : undefined}
              />
            )}
          />
        </fieldset>

        <Button type="submit" size="lg" className="mt-8 w-full" loading={isSubmitting}>
          가입하기
        </Button>
      </form>
    </AuthShell>
  );
}
