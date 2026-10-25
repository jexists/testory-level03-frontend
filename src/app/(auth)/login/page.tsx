import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/login-form';
import { getCurrentUser } from '@/lib/server-api';

export const metadata: Metadata = { title: '로그인' };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/');
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
