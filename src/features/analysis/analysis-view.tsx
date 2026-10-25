"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/core/api/http";
import { recruitmentsApi } from "@/features/recruitments/api";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/field";
import { EmptyState, ErrorState, Loading } from "@/shared/components/ui/state";
import { useToast } from "@/shared/components/ui/toast";
import { useAsync } from "@/shared/hooks/use-async";
import type { Analysis, AnalysisVersion } from "@/shared/types/api";
import { cn, fmtDateTime } from "@/shared/utils/format";
import { analysisApi } from "./api";

function Section({ title, items, strong }: { title: string; items: string[]; strong?: boolean }) {
  return (
    <section className={cn(strong ? "mt-8" : "mt-10")}>
      <h3 className={cn("font-bold", strong ? "text-xl" : "text-lg")}>{title}</h3>
      {items.length === 0 ? <p className="mt-2 text-sub">해당하는 내용이 없어요.</p> : (
        <ul className={cn("mt-2 list-disc space-y-1.5 pl-5", strong ? "font-semibold" : "text-ink/85")}>
          {items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
    </section>
  );
}

export function AnalysisView() {
  const router = useRouter();
  const toast = useToast();
  const rid = useSearchParams().get("recruitment") ?? "";
  const recs = useAsync(() => recruitmentsApi.adminList(false), []);
  const versions = useAsync(() => (rid ? analysisApi.versions(rid) : Promise.resolve([] as AnalysisVersion[])), [rid]);
  const [picked, setPicked] = useState<number | null>(null);
  const [shown, setShown] = useState<Analysis | null>(null);
  const [loadingOne, setLoadingOne] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모집글을 고르면 가장 최근 버전을 자동으로 불러오고, 버전을 누르면 그 버전을 불러온다.
  const latest = versions.data?.[0]?.versionNo ?? null;
  const target = picked ?? latest;
  useEffect(() => { setPicked(null); setShown(null); setError(null); }, [rid]);
  useEffect(() => {
    if (!rid || target === null) { setShown(null); return; }
    let live = true;
    setLoadingOne(true);
    analysisApi.get(rid, target).then((a) => live && setShown(a)).catch((e) => live && setError(e.message)).finally(() => live && setLoadingOne(false));
    return () => { live = false; };
  }, [rid, target]);

  async function run() {
    setRunning(true); setError(null);
    try {
      const a = await analysisApi.run(rid);
      await versions.reload();
      setPicked(a.versionNo); setShown(a);
      toast(`v${a.versionNo}으로 저장했어요`);
    } catch (e) { setError(e instanceof ApiError ? e.message : "AI 분석에 실패했어요. 잠시 뒤 다시 시도해 주세요."); } finally { setRunning(false); }
  }

  return (
    <>
      <div className="flex items-end gap-3">
        <Select value={rid} onChange={(e) => router.replace(e.target.value ? `/admin/analysis?recruitment=${e.target.value}` : "/admin/analysis")} aria-label="모집글" className="min-w-0 flex-1">
          <option value="">모집글을 골라 주세요</option>
          {recs.data?.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
        </Select>
        <Button onClick={run} disabled={!rid || running} className="shrink-0">{running ? "분석하는 중이에요" : "새로 분석하기"}</Button>
      </div>
      {running && <p role="status" className="mt-3 text-sm text-sub">피드백을 종합하고 있어요. 30초 정도 걸릴 수 있어요.</p>}
      {error && <p role="alert" className="mt-3 text-danger">{error}</p>}

      {!rid ? <EmptyState title="모집글을 고르면 가장 최근 분석이 열려요." /> : versions.loading && !versions.data ? <Loading /> : versions.error ? <ErrorState message={versions.error} onRetry={versions.reload} /> : !versions.data?.length ? (
        <EmptyState title="아직 분석한 적이 없어요. 위의 ‘새로 분석하기’를 눌러 보세요." />
      ) : (
        <>
          <div role="group" aria-label="분석 버전" className="-mx-1 mt-6 flex gap-x-1 overflow-x-auto border-b border-line">
            {versions.data.map((v) => (
              <button
                key={v.versionNo} type="button" onClick={() => setPicked(v.versionNo)} aria-pressed={v.versionNo === target}
                className={cn("min-h-11 shrink-0 px-3 text-[15px]", v.versionNo === target ? "border-b-2 border-ink font-semibold" : "text-sub")}
              >
                v{v.versionNo}
              </button>
            ))}
          </div>
          {loadingOne && !shown ? <Loading /> : shown && (
            <>
              <p className="mt-4 text-sm text-sub">v{shown.versionNo} · {fmtDateTime(shown.createdAt)} · 피드백 {shown.feedbackCount}건 기준 · {shown.modelName}</p>
              <Section title="먼저 확인할 것" items={shown.result.priorities} strong />
              <Section title="반복되는 문제" items={shown.result.recurringIssues} />
              <Section title="개선 요청" items={shown.result.improvementRequests} />
              <Section title="긍정 의견" items={shown.result.positiveOpinions} />
              <p className="mt-10 text-sm text-faint">저장된 분석은 고치거나 지울 수 없어요. 새로 분석하면 새 버전이 추가돼요.</p>
            </>
          )}
        </>
      )}
    </>
  );
}
