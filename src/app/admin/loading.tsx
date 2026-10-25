import { ListSkeleton, Skeleton } from '@/components/ui/state-view';

export default function AdminLoading() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="panel">
        <ListSkeleton rows={5} />
      </div>
    </>
  );
}
