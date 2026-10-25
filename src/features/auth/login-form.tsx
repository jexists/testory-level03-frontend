'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, describedBy } from '@/components/ui/field';
import { Notice } from '@/components/ui/state-view';
import { ApiError, api } from '@/lib/api';
import type { User } from '@/lib/types';
import { AuthShell } from './auth-shell';

const schema = z.object({
  email: z.string().trim().email('이메일 주소를 다시 확인해 주세요. 예: name@example.com'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});
type Values = z.infer<typeof schema>;

/** 같은 사이트 안의 경로만 돌아가기 주소로 쓴다. */
const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setServerError('');
    try {
      const { user } = await api<{ user: User }>('/auth/login', { method: 'POST', body: values });
      router.push(safeNext(params.get('next')) ?? (user.role === 'ADMIN' ? '/admin' : '/'));
      router.refresh();
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : '로그인하지 못했어요. 잠시 뒤 다시 시도해 주세요.');
    }
  }

  return (
    <AuthShell
      title="로그인"
      description="모집글에 신청하고 피드백을 남기려면 로그인해 주세요."
      footer={
        <>
          아직 계정이 없나요?{' '}
          <Link href="/signup" className="font-semibold text-brand underline-offset-4 hover:underline">
            회원가입
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <Notice tone="error">{serverError}</Notice>}
        <Field id="email" label="이메일" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={describedBy('email', errors.email?.message)} {...register('email')} />
        </Field>
        <Field id="password" label="비밀번호" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={describedBy('password', errors.password?.message)}
            {...register('password')}
          />
        </Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          로그인
        </Button>
      </form>
    </AuthShell>
  );
}
