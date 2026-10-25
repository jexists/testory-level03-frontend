"use client";
import Link from "next/link";
import { useAuth } from "@/core/auth/auth-provider";
import { ApplyBar } from "@/features/applications/apply-bar";
import { FeedbackForm } from "@/features/feedbacks/feedback-form";
import { FeedbackItem } from "@/features/feedbacks/feedback-item";
import { ErrorState, Loading } from "@/shared/components/ui/state";
import { ButtonLink } from "@/shared/components/ui/button";
import { useAsync } from "@/shared/hooks/use-async";
import { fmtRange } from "@/shared/utils/format";
import { recruitmentsApi } from "./api";
import { devicesText, statusText } from "./recruitment-status";

export function RecruitmentDetailView({ id }: { id: string }) {
  const { user, ready } = useAuth();
  // 로그인 상태가 정해진 뒤에 불러와서 "내 신청 상태"가 맞게 나오게 한다.
  const state = useAsync(() => (ready ? recruitmentsApi.detail(id) : new Promise<never>(() => {})), [id, ready, user?.id]);

  if (state.error && !state.data) {
    return state.error.includes("찾을 수 없는") ? (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold">{state.error}</p>
        <p className="mt-1 text-sub">삭제되었거나 주소가 맞지 않아요.</p>
        <ButtonLink href="/" variant="secondary" className="mt-6">모집글 목록으로</ButtonLink>
      </div>
    ) : <ErrorState message={state.error} onRetry={state.reload} />;
  }
  if (!state.data) return <Loading />;
  const r = state.data;
  const joined = Boolean(r.myApplication);

  return (
    <>
      <p className="text-sm text-sub">{statusText(r)}{r.kind === "APP_FULL" ? " · 앱 전체 테스트" : " · 기능 테스트"}</p>
      <h1 className="mt-1 text-[28px] font-bold leading-tight md:text-[34px]">{r.title}</h1>

      <div className="mt-8 flex items-baseline gap-2">
        <span className="tabular text-[56px] font-bold leading-none">{r.remaining}</span>
        <span className="text-lg text-sub">자리 남음</span>
        <span className="tabular ml-auto text-sub">{r.participantCount} / {r.capacity}명</span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-wash" aria-hidden>
        <div className="h-1 rounded-full bg-brand" style={{ width: `${Math.min(100, (r.participantCount / r.capacity) * 100)}%` }} />
      </div>

      <dl className="mt-8 space-y-4">
        <div><dt className="text-sm text-sub">테스트 기간</dt><dd className="font-semibold">{fmtRange(r.startAt, r.endAt)}</dd><dd className="text-sm text-sub">시작 전까지만 신청하고 취소할 수 있어요.</dd></div>
        <div><dt className="text-sm text-sub">참여할 수 있는 기기</dt><dd className="font-semibold">{devicesText(r)}</dd></div>
      </dl>

      <p className="mt-8 whitespace-pre-line leading-relaxed">{r.description || "설명이 아직 없어요."}</p>

      <div className="mt-10 pb-2"><ApplyBar r={r} onChanged={state.reload} /></div>

      <section className="mt-14" aria-labelledby="fb">
        <h2 id="fb" className="text-xl font-bold">피드백</h2>
        {!user ? (
          <p className="mt-3 text-sub">참여 중인 테스터만 피드백을 남길 수 있어요. <Link className="font-semibold text-brand" href={`/login?next=/recruitments/${r.id}`}>로그인하기</Link></p>
        ) : joined ? (
          <>
            <div className="mt-5"><FeedbackForm recruitmentId={r.id} onSaved={state.reload} /></div>
            <h3 className="mt-10 font-semibold">내가 남긴 피드백</h3>
            {r.myFeedbacks.length ? (
              <ul className="mt-2 border-t border-line">
                {r.myFeedbacks.map((f) => <FeedbackItem key={f.id} {...f} />)}
              </ul>
            ) : <p className="mt-2 text-sub">아직 남긴 피드백이 없어요.</p>}
          </>
        ) : (
          <p className="mt-3 text-sub">참여 중인 모집글에만 쓸 수 있어요. 신청하면 피드백을 남길 수 있어요.</p>
        )}
      </section>
    </>
  );
}
