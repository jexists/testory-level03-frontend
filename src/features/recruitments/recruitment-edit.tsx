"use client";
import { AsyncView } from "@/shared/components/ui/state";
import { useAsync } from "@/shared/hooks/use-async";
import { recruitmentsApi } from "./api";
import { RecruitmentForm } from "./recruitment-form";

export function RecruitmentEdit({ id }: { id: string }) {
  const state = useAsync(() => recruitmentsApi.adminDetail(id), [id]);
  return <AsyncView state={state}>{(r) => <RecruitmentForm initial={r} />}</AsyncView>;
}
