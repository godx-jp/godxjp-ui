import * as React from "react";
import { DashboardGrid, type DashboardGridItemProp } from "@godxjp/ui/lab";
import { Button, Text } from "@godxjp/ui/general";
import { CardContent, DataTable } from "@godxjp/ui/data-display";
import { BarChart } from "@godxjp/ui/charts";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";

const initial: DashboardGridItemProp[] = [
  { id: "revenue", x: 0, y: 0, w: 2, h: 2 },
  { id: "orders", x: 2, y: 0, w: 2, h: 2 },
  { id: "trend", x: 0, y: 2, w: 2, h: 4 },
  { id: "channels", x: 2, y: 2, w: 2, h: 4 },
];
const columns = { base: 1, lg: 4 };
export default function Demo() {
  const { t, locale } = useTranslation();
  const [layout, setLayout] = React.useState(initial);
  const [editable, setEditable] = React.useState(false);
  const number = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const money = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "JPY",
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const items = React.useMemo(
    () => [
      {
        id: "revenue",
        label: t("dashboardGridDocs.revenue"),
        content: (
          <CardContent>
            <Flex direction="col" gap="xs">
              <Text size="xl" weight="medium" tabular>
                {money.format(12480000)}
              </Text>
              <Text tone="muted" size="sm">
                {t("dashboardGridDocs.revenueDelta")}
              </Text>
            </Flex>
          </CardContent>
        ),
      },
      {
        id: "orders",
        label: t("dashboardGridDocs.orders"),
        content: (
          <CardContent>
            <Flex direction="col" gap="xs">
              <Text size="xl" weight="medium" tabular>
                {number.format(842)}
              </Text>
              <Text tone="muted" size="sm">
                {t("dashboardGridDocs.ordersDelta")}
              </Text>
            </Flex>
          </CardContent>
        ),
      },
      {
        id: "trend",
        label: t("dashboardGridDocs.trend"),
        content: (
          <CardContent>
            <Flex direction="col" dir="ltr">
              <BarChart
                label={t("dashboardGridDocs.trend")}
                showCaption={false}
                showLegend={false}
                size="sm"
                categoryKey="week"
                data={[2480000, 3120000, 2860000, 4020000].map((revenue, index) => ({
                  week: new Intl.DateTimeFormat(locale, {
                    month: "numeric",
                    day: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(Date.UTC(2026, 9, 1 + index * 7))),
                  revenue,
                }))}
                series={[{ dataKey: "revenue", label: t("dashboardGridDocs.revenue") }]}
                numberFormat={{ notation: "compact" }}
              />
            </Flex>
          </CardContent>
        ),
      },
      {
        id: "channels",
        label: t("dashboardGridDocs.channels"),
        content: (
          <CardContent flush>
            <DataTable
              aria-label={t("dashboardGridDocs.channels")}
              preset="action-collection"
              data={[
                { id: "direct", channel: t("dashboardGridDocs.direct"), orders: 328 },
                { id: "organic", channel: t("dashboardGridDocs.organic"), orders: 246 },
                { id: "referral", channel: t("dashboardGridDocs.referral"), orders: 176 },
                { id: "email", channel: t("dashboardGridDocs.email"), orders: 92 },
              ]}
              columns={[
                { key: "channel", header: t("dashboardGridDocs.channel") },
                {
                  key: "orders",
                  align: "right",
                  header: t("dashboardGridDocs.orders"),
                  render: (row) => number.format(row.orders),
                },
              ]}
            />
          </CardContent>
        ),
      },
    ],
    [t, locale, number, money],
  );
  return (
    <PageContainer
      title={t("dashboardGridDocs.title")}
      subtitle={t("dashboardGridDocs.period")}
      extra={
        <Button
          variant="outline"
          aria-pressed={editable}
          onClick={() => setEditable((value) => !value)}
        >
          {t(editable ? "dashboardGridDocs.done" : "dashboardGridDocs.edit")}
        </Button>
      }
    >
      <Flex direction="col" gap="sm">
        <DashboardGrid
          aria-label={t("dashboardGridDocs.title")}
          items={items}
          layout={layout}
          onLayoutChange={setLayout}
          columns={columns}
          rowHeight={64}
          editable={editable}
        />
        {editable && (
          <Text tone="muted" size="sm">
            {t("dashboardGridDocs.hint")}
          </Text>
        )}
      </Flex>
    </PageContainer>
  );
}
