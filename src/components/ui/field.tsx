import clsx from 'clsx';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';

export const controlClass =
  'block w-full border border-line-strong bg-surface px-3 text-ink placeholder:text-muted transition-colors hover:border-ink-soft focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-sunken aria-[invalid=true]:border-danger aria-[invalid=true]:outline-danger';

export type ControlSize = 'md' | 'lg';

/** 입력·선택 트리거가 함께 쓰는 높이/모서리/글자 크기. 인증 화면처럼 큰 입력은 lg. */
export const controlSize: Record<ControlSize, string> = {
  md: 'h-10 rounded-control text-sm',
  lg: 'h-12 rounded-xl text-base',
};

interface FieldProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** 라벨 + 입력 + 도움말/오류. 오류는 입력과 aria-describedby 로 연결한다. */
export function Field({ id, label, hint, error, children, className }: FieldProps) {
  return (
    <div className={clsx('space-y-2', className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const describedBy = (id: string, error?: string, hint?: ReactNode) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { inputSize?: ControlSize }>(function Input(
  { className, inputSize = 'md', ...rest },
  ref,
) {
  return <input ref={ref} className={clsx(controlClass, controlSize[inputSize], className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={clsx(controlClass, 'min-h-28 rounded-control py-2.5 text-sm leading-relaxed', className)} {...rest} />;
});

/** 비밀번호 입력: 오른쪽 눈 아이콘으로 보기/숨기기를 바꾼다. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & { inputSize?: ControlSize }>(function PasswordInput(
  { className, inputSize = 'md', ...rest },
  ref,
) {
  const [shown, setShown] = useState(false);
  const large = inputSize === 'lg';
  return (
    <div className="relative">
      <input ref={ref} type={shown ? 'text' : 'password'} className={clsx(controlClass, controlSize[inputSize], large ? 'pr-12' : 'pr-11', className)} {...rest} />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? '비밀번호 숨기기' : '비밀번호 보기'}
        aria-pressed={shown}
        className={clsx('absolute inset-y-0 right-0 flex items-center justify-center text-muted hover:text-ink', large ? 'w-12' : 'w-11')}
      >
        {shown ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
});
