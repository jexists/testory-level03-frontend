'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, describedBy } from '@/components/ui/field';
import { Notice } from '@/components/ui/state-view';
import { useToast } from '@/components/ui/toast';
import { ApiError, api } from '@/lib/api';
import { detectOs } from '@/lib/device';
import type { Os, User } from '@/lib/types';
import { AuthShell } from './auth-shell';
import { DevicePicker } from './device-picker';

const schema = z.object({
  email: z.string().trim().email('이메일 주소를 다시 확인해 주세요. 예: name@example.com'),
  password: z.string().min(8, '비밀번호는 8자 이상으로 만들어 주세요.'),
  nickname: z.string().trim().min(1, '닉네임을 입력해 주세요.').max(30, '닉네임은 30자 이하로 만들어 주세요.'),
  deviceType: z.enum(['ANDROID', 'IOS'], { message: '내 기기를 선택해 주세요.' }),
  deviceModelId: z.number({ message: '내 기기를 선택해 주세요.' }),
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
  } = useForm<Values>({ resolver: zodResolver(schema) });

  // 브라우저가 알려 주는 정보로 OS 를 미리 골라 둔다. 감지가 안 되면 사용자가 직접 고른다.
  useEffect(() => {
    if (detected) setValue('deviceType', detected);
  }, [detected, setValue]);

  async function onSubmit(values: Values) {
    setServerError('');
    try {
      await api<{ user: User }>('/auth/signup', { method: 'POST', body: values });
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
      description="테스터로 가입해요. 내 기기 정보로 신청할 수 있는 모집글이 정해져요."
      footer={
        <>
          이미 계정이 있나요?{' '}
          <Link href="/login" className="font-semibold text-brand underline-offset-4 hover:underline">
            로그인
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <Notice tone="error">{serverError}</Notice>}
        <Field id="email" label="이메일" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={describedBy('email', errors.email?.message)} {...register('email')} />
        </Field>
        <Field id="password" label="비밀번호" hint="8자 이상" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={describedBy('password', errors.password?.message, '8자 이상')}
            {...register('password')}
          />
        </Field>
        <Field id="nickname" label="닉네임" error={errors.nickname?.message}>
          <Input id="nickname" autoComplete="nickname" aria-invalid={!!errors.nickname} aria-describedby={describedBy('nickname', errors.nickname?.message)} {...register('nickname')} />
        </Field>

        <fieldset className="space-y-2 border-t border-line pt-4">
          <legend className="sr-only">내 기기</legend>
          <p className="text-sm font-semibold">내 기기</p>
          <Controller
            control={control}
            name="deviceType"
            render={({ field: osField }) => (
              <Controller
                control={control}
                name="deviceModelId"
                render={({ field: modelField }) => (
                  <DevicePicker
                    os={(osField.value as Os | undefined) ?? ''}
                    modelId={(modelField.value as number | undefined) ?? ''}
                    onChange={({ os, modelId }) => {
                      osField.onChange(os || undefined);
                      modelField.onChange(modelId === '' ? undefined : modelId);
                    }}
                    osError={errors.deviceType?.message}
                    modelError={errors.deviceModelId?.message}
                  />
                )}
              />
            )}
          />
          <p className="text-xs text-muted">
            {detected ? '이 브라우저로 확인한 OS를 먼저 골라 두었어요. 다르면 바꿔 주세요. ' : 'OS를 알아내지 못했어요. 직접 골라 주세요. '}
            기기는 가입 뒤 마이페이지에서만 바꿀 수 있어요.
          </p>
        </fieldset>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          가입하기
        </Button>
      </form>
    </AuthShell>
  );
}
