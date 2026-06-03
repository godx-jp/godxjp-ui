import { Skeleton, SkeletonDetail, SkeletonStat, SkeletonTable } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * Skeleton — loading placeholders. Three levels:
 *   Skeleton — custom pulsing block (h + w via className).
 *   SkeletonTable — pre-mount DataTable placeholder (rows, columns props).
 *   SkeletonStat — StatCard/KPI tile placeholder (no props; use in ResponsiveGrid).
 *   SkeletonDetail — single-record detail placeholder (title + metadata rows, no props).
 * Never use a spinner overlay on skeletonable content.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Skeleton"
      subtitle="loading placeholders — Skeleton (custom block) · SkeletonTable (DataTable pre-mount) · SkeletonStat (KPI tile) · SkeletonDetail (record page)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Skeleton — custom pulsing blocks</CardTitle>
            <CardDescription>
              Base primitive. Pass className for h + w. Use when SkeletonTable / SkeletonStat do not
              match the target layout (e.g. a single loading line, a media placeholder, inline
              metadata).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-60" />
              <Flex direction="row" gap="sm" align="center" className="mt-2">
                <Skeleton className="size-10 rounded-full" />
                <Flex direction="col" gap="xs">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </Flex>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SkeletonTable — DataTable pre-mount placeholder</CardTitle>
            <CardDescription>
              Drop-in while deferred prop / query resolves. Match rows to page size and columns to
              column count so the layout does not jump on hydration. Do NOT wrap in Card — it owns
              its own structure.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <SkeletonTable rows={6} columns={6} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SkeletonStat — KPI / StatCard tile placeholder</CardTitle>
            <CardDescription>
              Use inside a ResponsiveGrid — one SkeletonStat per expected StatCard. No props. Do NOT
              wrap in an extra Card (SkeletonStat owns its own bordered box).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={4}>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SkeletonDetail — single-record detail loading state</CardTitle>
            <CardDescription>
              The ready-made detail placeholder (title + metadata rows). Reach for this on a record
              / show page while the record loads — do NOT hand-compose it from base Skeleton blocks.
              No props.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkeletonDetail />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
