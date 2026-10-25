"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/button";
import { Field, TextArea, TextInput } from "@/shared/components/ui/field";
import { Segmented } from "@/shared/components/ui/tabs";
import { useToast } from "@/shared/components/ui/toast";
import { FEEDBACK_LABEL } from "@/shared/constants/labels";
import type { FeedbackType } from "@/shared/types/api";
import { feedbacksApi } from "./api";

export function FeedbackForm({ recruitmentId, onSaved }: { recruitmentId: number; onSaved: () => void }) {
  const toast = useToast();
  const [type, setType] = useState<FeedbackType | "">("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await feedbacksApi.write(recruitmentId, { type, title, content });
      setType(""); setTitle(""); setContent("");
      toast("피드백을 남겼어요");
      onSaved();
    } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Segmented label="피드백 유형" value={type} onChange={setType}
        options={(Object.keys(FEEDBACK_LABEL) as FeedbackType[]).map((v) => ({ value: v, label: FEEDBACK_LABEL[v] }))} />
      <Field label="제목"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} /></Field>
      <Field label="내용"><TextArea value={content} onChange={(e) => setContent(e.target.value)} placeholder="어떤 상황에서 어떤 점이 불편했는지 알려 주세요." /></Field>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? "남기는 중이에요" : "피드백 남기기"}</Button>
    </form>
  );
}
