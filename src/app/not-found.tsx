import { PageShell } from "@/shared/components/layout/page";
import { ButtonLink } from "@/shared/components/ui/button";

export default function NotFound() {
  return (
    <PageShell>
      <div className="py-16 text-center">
        <p className="text-lg font-semibold">찾을 수 없는 페이지예요.</p>
        <p className="mt-1 text-sub">주소가 맞는지 확인해 주세요.</p>
        <ButtonLink href="/" variant="secondary" className="mt-6">처음으로</ButtonLink>
      </div>
    </PageShell>
  );
}
