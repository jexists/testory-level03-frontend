"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/core/auth/auth-provider";
import { Button } from "@/shared/components/ui/button";
import { Field, TextInput } from "@/shared/components/ui/field";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const u = await login(email, password);
      router.replace(next && next.startsWith("/") ? next : u.role === "ADMIN" ? "/admin" : "/");
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field label="이메일"><TextInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></Field>
      <Field label="비밀번호"><TextInput type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" block disabled={busy}>{busy ? "로그인하는 중이에요" : "로그인하기"}</Button>
      <p className="text-center text-sub">처음이세요? <Link href="/signup" className="font-semibold text-brand">가입하기</Link></p>
    </form>
  );
}
