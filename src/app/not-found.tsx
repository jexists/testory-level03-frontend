import { LinkButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/state-view';

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <div className="panel">
        <EmptyState
          title="찾을 수 없는 모집글이에요"
          description="주소가 바뀌었거나 삭제된 글일 수 있어요. 모집글 목록에서 다시 찾아 주세요."
          action={<LinkButton href="/">모집글 목록으로</LinkButton>}
        />
      </div>
    </div>
  );
}
