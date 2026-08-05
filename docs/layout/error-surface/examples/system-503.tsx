import { Button, Logo, Text } from "@godxjp/ui/general";
import { ErrorSurface } from "@godxjp/ui/layout";
import { RotateCcw } from "lucide-react";

/**
 * 503 — `mode="system"` with the optional MAINTENANCE slot. Same viewport-centred geometry as 500;
 * the tone defaults to `warning` rather than `destructive` because the outage is planned and finite.
 *
 * `maintenance` is TIMING DATA, not a string you format. Pass ISO-8601 instants plus an IANA zone
 * and the surface runs `Intl.DateTimeFormat(locale, …).formatRange()` (CLDR) for the active locale,
 * so ja / en / vi each read natively and the visible text is paired with a machine-readable
 * `<time dateTime>`. A hand-built `"18:00 - 20:00 JST"` cannot localize and is the anti-pattern this
 * slot exists to remove. Omit `end` for an open-ended outage — a single instant is shown.
 *
 * `progress` (0–100) adds a labelled `Progress` meter, announced as "メンテナンス進捗 40%" via
 * `Intl.NumberFormat` percent style — never colour-only. It is deliberately SERVER-SENT: computing
 * "how far through the window are we" from the client clock makes SSR and hydration disagree, and
 * an exception page must be readable before hydration. Omit it for an outage with no published
 * progress; omit `maintenance` entirely for an unplanned 503.
 */
export default function Demo() {
  return (
    <ErrorSurface
      mode="system"
      status={503}
      brand={<Logo glyph="G" />}
      title="サービスを一時的にご利用いただけません"
      description="計画メンテナンスを実施しています。終了予定時刻を過ぎてから再度お試しください。"
      maintenance={{
        start: "2026-08-02T18:00:00Z",
        end: "2026-08-02T20:00:00Z",
        timeZone: "Asia/Tokyo",
        progress: 40,
      }}
      footer={
        <Text size="xs" tone="muted">
          2026 GodX
        </Text>
      }
      action={
        <Button>
          <RotateCcw />
          再読み込み
        </Button>
      }
    />
  );
}
