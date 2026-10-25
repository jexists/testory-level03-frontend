import { ListSkeleton, Skeleton } from '@/components/ui/state-view';

export default function Loading() {
  return (
    <div className="container-page space-y-6 py-8 sm:py-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <div className="panel overflow-hidden">
        <ListSkeleton rows={5} />
      </div>
    </div>
  );
}
