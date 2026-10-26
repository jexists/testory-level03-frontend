import { ListSkeleton, Skeleton } from '@/components/ui/state-view';

export default function AdminLoading() {
  return (
    <>
      <Skeleton className="h-8 w-48" />
      <div className="panel">
        <ListSkeleton rows={5} />
      </div>
    </>
  );
}
