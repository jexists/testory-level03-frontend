import { redirect } from 'next/navigation';

/** 내 피드백은 내 신청 목록에 합쳐졌다. 예전 주소로 들어오면 그쪽으로 보낸다. */
export default function MyFeedbacksPage() {
  redirect('/me/applications');
}
