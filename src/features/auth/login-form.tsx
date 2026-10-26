'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, PasswordInput, describedBy } from '@/components/ui/field';
import { Notice } from '@/components/ui/state-view';
import { ApiError, api } from '@/lib/api';
import type { User } from '@/lib/types';
import { AuthShell } from './auth-shell';

const schema = z.object({
  email: z.string().trim().email('이메일 주소를 다시 확인해 주세요. 예: name@example.com'),
  password: z.string().min(1, '비밀번호를 입력해 주세요.'),
});
type Values = z.infer<typeof schema>;

/**
 * 로컬 개발(next dev)에서만 보이는 빠른 로그인. 시연 데이터의 계정으로 바로 들어간다.
 * 운영 빌드에서는 NODE_ENV 가 production 으로 바뀌어 이 값과 버튼이 번들에서 빠진다.
 */
const DEV_LOGIN =
  process.env.NODE_ENV === 'development'
    ? {
        password: process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'testory-demo-1234',
        accounts: [
          { label: '관리자로 로그인', email: 'admin@testory.demo' },
          { label: '테스터로 로그인', email: 'tester01@testory.demo' },
        ],
      }
    : null;

/** 같은 사이트 안의 경로만 돌아가기 주소로 쓴다. */
const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') ? next : null);

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [devBusy, setDevBusy] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function devLogin(email: string) {
    if (!DEV_LOGIN) return;
    setDevBusy(email);
    await onSubmit({ email, password: DEV_LOGIN.password });
    setDevBusy('');
  }

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
      footer={
        <>
          아직 계정이 없나요?{' '}
          <Link href="/signup" className="font-semibold text-brand underline-offset-4 hover:underline">
            회원가입
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
            autoComplete="current-password"
            placeholder="비밀번호 입력"
            aria-invalid={!!errors.password}
            aria-describedby={describedBy('password', errors.password?.message)}
            {...register('password')}
          />
        </Field>
        <Button type="submit" size="lg" className="mt-8 w-full" loading={isSubmitting}>
          로그인
        </Button>
      </form>
      {DEV_LOGIN && (
        <div className="mt-6 space-y-2 rounded-control border border-dashed border-line-strong p-3">
          <p className="text-xs text-muted">로컬 개발 전용 · 시연 계정으로 바로 로그인해요.</p>
          <div className="grid grid-cols-2 gap-2">
            {DEV_LOGIN.accounts.map((a) => (
              <Button key={a.email} variant="secondary" size="sm" loading={devBusy === a.email} disabled={!!devBusy || isSubmitting} onClick={() => devLogin(a.email)}>
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </AuthShell>
  );
}
