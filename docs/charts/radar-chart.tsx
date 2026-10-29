import { RadarChart } from "@godxjp/ui/charts/radar-chart";
import { Card, CardContent } from "@godxjp/ui/data-display";
import { PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";
/** Static API states: all sizes/axis counts, incomplete, zero, out-of-domain, hidden caption and footer. */
export default function RadarChartExample() {
  const { t } = useTranslation();
  const data = Array.from({ length: 6 }, (_, i) => ({ axis: String(i + 1), value: (i % 3) + 1 }));
  return (
    <PageContainer>
      <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md">
        {(["xs", "sm", "md", "lg"] as const).map((size, i) => (
          <Card key={size}>
            <CardContent>
              <RadarChart
                data={data.slice(0, i + 3)}
                categoryKey="axis"
                valueKey="value"
                valueMax={3}
                valueTicks={[1, 2, 3]}
                size={size}
                label={t("radarDemo.title")}
              />
            </CardContent>
          </Card>
        ))}
        <RadarChart
          data={[...data.slice(0, 5), { axis: "6", value: null }]}
          categoryKey="axis"
          valueKey="value"
          valueMax={3}
          label={t("radarDemo.title")}
        />
        <RadarChart
          data={data.map((d) => ({ ...d, value: 0 }))}
          categoryKey="axis"
          valueKey="value"
          valueMax={3}
          label={t("radarDemo.title")}
          showCaption={false}
          description={t("radarDemo.title")}
          footer={t("radarDemo.title")}
        />
        <RadarChart
          data={data}
          categoryKey="axis"
          valueKey="value"
          valueMax={2}
          label={t("radarDemo.title")}
        />
      </ResponsiveGrid>
    </PageContainer>
  );
}
