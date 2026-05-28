import { SkeletonCard, SkeletonDetail, SkeletonRows, SkeletonTable } from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <>
      <SkeletonRows rows={3} />
      <SkeletonTable rows={3} columns={3} />
      <SkeletonDetail />
      <SkeletonCard />
    </>
  );
}
