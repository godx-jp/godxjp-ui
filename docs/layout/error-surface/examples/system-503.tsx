import { EmptyState } from "@godxjp/ui/data-display";
import { Button, Logo, Text } from "@godxjp/ui/general";
import { CenteredShell, Flex } from "@godxjp/ui/layout";
import { RotateCcw, Wrench } from "lucide-react";

/**
 * 503 — SYSTEM mode with the optional MAINTENANCE timing slot. Same viewport-centred geometry as
 * 500 (`CenteredShell align="center"`), tone `warning` instead of `destructive` because the outage
 * is planned and finite.
 *
 * The window is formatted with `Intl.DateTimeFormat(...).formatRange()` from ISO-8601 instants and
 * an IANA time zone — never a hand-built string — so ja / en / vi each read natively and the
 * viewer's zone is explicit. Omit the line entirely for an unplanned 503: maintenance timing is an
 * OPTIONAL metadata slot.
 */
export default function Demo() {
  const maintenanceWindow = new Intl.DateTimeFormat("ja", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
    timeZoneName: "short",
  }).formatRange(new Date("2026-08-02T18:00:00Z"), new Date("2026-08-02T20:00:00Z"));

  return (
    <CenteredShell
      align="center"
      width="sm"
      footer={
        <Text size="xs" tone="muted">
          2026 GodX
        </Text>
      }
    >
      <Flex direction="col" align="center" gap="sm">
        <Logo glyph="G" />
        <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
          503
        </Text>
        <EmptyState
          icon={Wrench}
          tone="warning"
          titleLevel={1}
          title="サービスを一時的にご利用いただけません"
          description="計画メンテナンスを実施しています。終了予定時刻を過ぎてから再度お試しください。"
          action={
            <Button>
              <RotateCcw />
              再読み込み
            </Button>
          }
        />
        <Text as="p" size="sm" tone="muted">
          計画メンテナンス: {maintenanceWindow}
        </Text>
      </Flex>
    </CenteredShell>
  );
}
