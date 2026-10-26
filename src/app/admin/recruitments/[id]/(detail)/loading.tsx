import { ListSkeleton } from '@/components/ui/state-view';

/** 신청자 · 피드백 · AI 분석 탭 내용이 올 때까지 보여 주는 자리. 위쪽 요약과 탭은 그대로 둔다. */
export default function RecruitmentDetailTabLoading() {
  return (
    <div className="panel">
      <ListSkeleton rows={5} />
    </div>
  );
}
