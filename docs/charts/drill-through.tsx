import { useState } from "react";
import { BarChart } from "@godxjp/ui/charts/bar-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";

/** Dashboard state belongs here; the chart only reports the selected original datum. */
export default function Demo() {
  const { t, locale } = useTranslation();
  const [store, setStore] = useState<string | null>(null);
  const money = new Intl.NumberFormat(locale, { style: "currency", currency: "JPY" });
  const stores = ["east", "central", "west"];
  const data = stores.map((id, index) => ({
    id,
    store: t(`chartDrillDocs.${id}`),
    sales: [42000, 35000, 28000][index]!,
  }));
  const orders = data.flatMap((datum, index) => [
    // Two orders per store that add up to the bar, split unevenly so the rows read as real orders.
    { id: `${index}-1`, storeId: datum.id, store: datum.store, sales: datum.sales * 0.6 },
    { id: `${index}-2`, storeId: datum.id, store: datum.store, sales: datum.sales * 0.4 },
  ]);
  const columns: ColumnDef<(typeof orders)[number]>[] = [
    { key: "store", header: t("chartDrillDocs.store") },
    {
      key: "sales",
      align: "right",
      header: t("chartDrillDocs.sales"),
      render: (row) => (
        <Text tabular dir="auto">
          {money.format(row.sales)}
        </Text>
      ),
    },
  ];
  return (
    <PageContainer title={t("chartDrillDocs.title")}>
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("chartDrillDocs.chart")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Text tone="muted">{t("chartDrillDocs.hint")}</Text>
            <BarChart
              id="store-sales"
              label={t("chartDrillDocs.chart")}
              showCaption={false}
              data={data}
              categoryKey="store"
              series={[{ dataKey: "sales", label: t("chartDrillDocs.sales") }]}
              numberFormat={{ style: "currency", currency: "JPY" }}
              showLegend={false}
              onDatumSelect={(datum) => setStore(String(datum.id))}
            />
          </CardContent>
        </Card>
        <Flex align="center" gap="md" wrap>
          <Text role="status">
            {t("chartDrillDocs.filter", {
              store: data.find((datum) => datum.id === store)?.store ?? t("chartDrillDocs.all"),
            })}
          </Text>
          <Button variant="outline" disabled={store === null} onClick={() => setStore(null)}>
            {t("chartDrillDocs.reset")}
          </Button>
        </Flex>
        <Card>
          <CardContent flush>
            <DataTable
              scroll={{ x: "100%" }}
              columns={columns}
              data={orders.filter((order) => store === null || order.storeId === store)}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
