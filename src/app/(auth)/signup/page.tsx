import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignupForm } from '@/features/auth/signup-form';
import { getCurrentUser } from '@/lib/server-api';

export const metadata: Metadata = { title: '회원가입' };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect('/');
  return <SignupForm />;
}
