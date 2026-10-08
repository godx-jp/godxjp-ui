import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { SortableList } from "@godxjp/ui/lab";

/**
 * SortableList (gh#1173) — a desktop editor's widget order (tiles) and a settings list of tabs,
 * reordered by dragging a grip or by the keyboard, every step announced.
 */
export default function Demo() {
  const { t, locale } = useTranslation();
  const list = new Intl.ListFormat(locale, { style: "narrow", type: "unit" });
  const ordinal = new Intl.NumberFormat(locale);
  const widgets = [
    { value: "calendar", label: t("sortableListDocs.calendar") },
    { value: "mail", label: t("sortableListDocs.mail") },
    { value: "tasks", label: t("sortableListDocs.tasks") },
    { value: "notes", label: t("sortableListDocs.notes") },
  ];
  const tabs = [
    { value: "overview", label: t("sortableListDocs.overview") },
    { value: "members", label: t("sortableListDocs.members") },
    { value: "billing", label: t("sortableListDocs.billing"), disabled: true },
    { value: "audit", label: t("sortableListDocs.audit") },
  ];
  const [order, setOrder] = React.useState(widgets.map((w) => w.value));
  return (
    <PageContainer title="SortableList" subtitle={t("sortableListDocs.subtitle")}>
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("sortableListDocs.widgetsTitle")}</CardTitle>
            <CardDescription>{t("sortableListDocs.widgetsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <SortableList
                aria-label={t("sortableListDocs.widgetsTitle")}
                layout="grid"
                items={widgets}
                value={order}
                onValueChange={setOrder}
                renderItem={(item, { index }) => (
                  <Flex direction="col" gap="xs">
                    <Text weight="medium">{item.label}</Text>
                    <Text size="sm" tone="muted">
                      {t("sortableListDocs.slot", { position: ordinal.format(index + 1) })}
                    </Text>
                  </Flex>
                )}
              />
              <Text size="sm" tone="muted">
                {t("sortableListDocs.saved", {
                  order: list.format(
                    order.map((key) => widgets.find((w) => w.value === key)?.label ?? key),
                  ),
                })}
              </Text>
            </Flex>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("sortableListDocs.tabsTitle")}</CardTitle>
            <CardDescription>{t("sortableListDocs.tabsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <SortableList aria-label={t("sortableListDocs.tabsTitle")} items={tabs} />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
