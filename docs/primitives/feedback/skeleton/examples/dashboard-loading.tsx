import { SkeletonCard, SkeletonTable } from "@godxjp/ui/feedback";

export default function Demo() {
  return (
    <div className="grid max-w-4xl gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={4} columns={5} />
    </div>
  );
}
