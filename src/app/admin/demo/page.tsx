import { redirect } from 'next/navigation';

/** 시연 데이터 초기화는 사용자 메뉴의 확인 창으로 옮겼다. */
export default function AdminDemoPage() {
  redirect('/admin');
}
