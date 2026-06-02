import { Skeleton, SkeletonCard, SkeletonDetail, SkeletonRows, SkeletonTable } from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <>
      <Skeleton className="h-6 w-48" />
      <SkeletonRows rows={3} />
      <SkeletonTable rows={3} columns={3} />
      <SkeletonDetail />
      <SkeletonCard />
    </>
  );
}
