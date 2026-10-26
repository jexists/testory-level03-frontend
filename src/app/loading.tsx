import { ListSkeleton, Skeleton } from '@/components/ui/state-view';

export default function Loading() {
  return (
    <div className="container-page space-y-6 py-8 sm:py-10">
      <Skeleton className="h-8 w-40" />
      <div className="panel overflow-hidden">
        <ListSkeleton rows={5} />
      </div>
    </div>
  );
}
