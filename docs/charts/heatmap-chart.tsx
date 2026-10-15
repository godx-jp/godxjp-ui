import { Clock, JapaneseYen, Receipt, Store } from "lucide-react";
import { HeatmapChart } from "@godxjp/ui/charts/heatmap-chart";
import type { HeatmapCategory, HeatmapDatum } from "@godxjp/ui/charts/heatmap-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatCard,
} from "@godxjp/ui/data-display";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * HeatmapChart — a restaurant HQ dashboard: revenue and orders by weekday × hour across the chain.
 *
 * Everything below is composed from real @godxjp/ui primitives. Weekday and hour labels come from
 * Intl with the active locale, so switching the app locale relabels the axes; money is formatted
 * by `numberFormat` (ISO 4217 JPY). The data is deterministic so every render is identical.
 */

/** Monday 2024-01-01 (UTC) — the anchor for seven weekday labels from Intl.DateTimeFormat. */
const MONDAY = Date.UTC(2024, 0, 1);
const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** Hourly shape of a casual dining chain: lunch and dinner peaks, a quiet afternoon. */
const HOUR_WEIGHT = [
  0.35, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0.25, 0.9, 1, 0.7, 0.25, 0, 0.3, 0.6, 0.95, 1, 0.85, 0.6,
  0.5, 0.45,
];
/** Weekday factor: the weekend carries the week. */
const DAY_WEIGHT = [0.7, 0.72, 0.78, 0.82, 1.05, 1.25, 1.1];

/** Open 10:00 → 03:00. Hours 3..9 are CLOSED — no data, which is not the same as a zero. */
const isClosed = (hour: number) => hour >= 3 && hour < 10;

function revenue(): HeatmapDatum[] {
  return WEEKDAY_KEYS.flatMap((row, day) =>
    HOURS.filter((hour) => !isClosed(hour)).map((hour) => ({
      row,
      column: hour,
      // 15:00 on weekdays is open but empty — a real zero. Values round to ¥100.
      value: Math.round((HOUR_WEIGHT[hour]! * DAY_WEIGHT[day]! * 412000) / 100) * 100,
    })),
  );
}

function orders(): HeatmapDatum[] {
  return revenue().map((cell) => ({ ...cell, value: Math.round((cell.value ?? 0) / 2350) }));
}

/** A store that opened on Thursday: the earlier days have no data at all. */
function newStore(): HeatmapDatum[] {
  return revenue()
    .filter((cell) => !["mon", "tue", "wed"].includes(String(cell.row)))
    .map((cell) => ({ ...cell, value: Math.round(((cell.value ?? 0) * 0.18) / 100) * 100 }));
}

const jpy = { style: "currency", currency: "JPY" } as const;
const jpyCompact = { style: "currency", currency: "JPY", notation: "compact" } as const;

export default function Demo() {
  const { t, locale } = useTranslation();
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const hourNumber = new Intl.NumberFormat(locale);
  const rows: HeatmapCategory[] = WEEKDAY_KEYS.map((key, day) => ({
    key,
    label: weekday.format(new Date(MONDAY + day * 86_400_000)),
  }));
  const columns: HeatmapCategory[] = HOURS.map((hour) => ({
    key: hour,
    label: hourNumber.format(hour),
  }));
  const weekRevenue = revenue().reduce((sum, cell) => sum + (cell.value ?? 0), 0);
  const weekOrders = orders().reduce((sum, cell) => sum + (cell.value ?? 0), 0);
  const money = new Intl.NumberFormat(locale, jpyCompact);
  const count = new Intl.NumberFormat(locale);
  const peakHour = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(MONDAY + 19 * 3_600_000));

  return (
    <PageContainer title={t("heatmapChartDocs.title")} subtitle={t("heatmapChartDocs.subtitle")}>
      <Flex direction="col" gap="lg">
        <ResponsiveGrid columns={4}>
          <StatCard
            label={t("heatmapChartDocs.weekRevenue")}
            value={money.format(weekRevenue)}
            delta="+6.2%"
            icon={JapaneseYen}
          />
          <StatCard
            label={t("heatmapChartDocs.weekOrders")}
            value={count.format(weekOrders)}
            delta="+3.8%"
            icon={Receipt}
          />
          <StatCard
            label={t("heatmapChartDocs.peakSlot")}
            value={`${rows[5]!.label} ${peakHour}`}
            icon={Clock}
          />
          <StatCard label={t("heatmapChartDocs.stores")} value={count.format(42)} icon={Store} />
        </ResponsiveGrid>

        {/* ── 1. Revenue, money format, top 3 emphasized, closed hours = no data ────────── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("heatmapChartDocs.revenueTitle")}</CardTitle>
            <CardDescription>{t("heatmapChartDocs.revenueHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapChart
              id="heatmap-revenue"
              label={t("heatmapChartDocs.revenueTitle")}
              showCaption={false}
              description={t("heatmapChartDocs.revenueHint")}
              rows={rows}
              columns={columns}
              data={revenue()}
              numberFormat={jpy}
              topN={3}
            />
          </CardContent>
        </Card>

        <ResponsiveGrid columns={2}>
          {/* ── 2. Orders — a count, compact cells ───────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>{t("heatmapChartDocs.ordersTitle")}</CardTitle>
              <CardDescription>{t("heatmapChartDocs.ordersHint")}</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatmapChart
                label={t("heatmapChartDocs.ordersTitle")}
                showCaption={false}
                rows={rows}
                columns={columns}
                data={orders()}
                size="xs"
              />
            </CardContent>
          </Card>

          {/* ── 3. A new store — whole days with no data ─────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle level={2}>{t("heatmapChartDocs.newStoreTitle")}</CardTitle>
              <CardDescription>{t("heatmapChartDocs.newStoreHint")}</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatmapChart
                label={t("heatmapChartDocs.newStoreTitle")}
                showCaption={false}
                rows={rows}
                columns={columns}
                data={newStore()}
                numberFormat={jpyCompact}
                topN={1}
                size="xs"
              />
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* ── 4. size — the xs|sm|md|lg CELL tiers, on the dinner window ────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("heatmapChartDocs.sizesTitle")}</CardTitle>
            <CardDescription>{t("heatmapChartDocs.sizesHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={2}>
              {(["xs", "sm", "md", "lg"] as const).map((size) => (
                <HeatmapChart
                  key={size}
                  label={`size="${size}"`}
                  rows={rows.slice(4)}
                  columns={columns.slice(17, 23)}
                  data={revenue()}
                  numberFormat={jpyCompact}
                  size={size}
                  showLegend={size === "lg"}
                />
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* ── 5. Empty state ───────────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("heatmapChartDocs.emptyTitle")}</CardTitle>
            <CardDescription>{t("heatmapChartDocs.emptyHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <HeatmapChart
              label={t("heatmapChartDocs.emptyTitle")}
              showCaption={false}
              rows={rows}
              columns={columns}
              data={[]}
              emptyMessage={t("heatmapChartDocs.emptyMessage")}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
