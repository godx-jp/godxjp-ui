import { useState } from "react";
import { X } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, ListRow } from "@godxjp/ui/data-display";
import { SearchInput } from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { AppShell, Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { Tabs } from "@godxjp/ui/navigation";

/**
 * A home with desktops, edited in place. Three pieces from the Platform Home wireframe:
 *
 * - `Tabs onAdd` — the "+" sits right after the last desktop on a `line` strip, the end `extra`
 *   keeps the row's end; it is the next Tab stop after the strip.
 * - `AppShell aside` — the "add" catalogue PUSHES the page instead of covering it; on a phone it
 *   is a full-screen panel, and Esc (or the close button) reports `onAsideOpenChange(false)`.
 * - `Card variant="dashed" accent="primary"` — the area being edited.
 */
export default function Demo() {
  const { t } = useTranslation();
  const [desktops, setDesktops] = useState(["home", "shop"]);
  const [editing, setEditing] = useState(true);
  const label = (id: string) =>
    id === "home"
      ? t("homeEditingDocs.home")
      : id === "shop"
        ? t("homeEditingDocs.shop")
        : t("homeEditingDocs.newDesktop");

  return (
    <AppShell
      topbarLeft={<Text weight="semibold">GoDX</Text>}
      aside={
        <PageContainer
          title={t("homeEditingDocs.add")}
          extra={
            <Button
              variant="ghost"
              size="sm"
              aria-label={t("homeEditingDocs.close")}
              onClick={() => setEditing(false)}
            >
              <X aria-hidden="true" />
            </Button>
          }
        >
          <Flex direction="col" gap="md">
            <SearchInput aria-label={t("homeEditingDocs.search")} />
            <Card>
              <CardContent flush>
                <ul>
                  <ListRow as="li" title={t("homeEditingDocs.myTasks")} />
                  <ListRow as="li" title={t("homeEditingDocs.approvals")} />
                </ul>
              </CardContent>
            </Card>
          </Flex>
        </PageContainer>
      }
      asideOpen={editing}
      onAsideOpenChange={setEditing}
      asideLabel={t("homeEditingDocs.add")}
    >
      <PageContainer title={t("homeEditingDocs.title")}>
        <Flex direction="col" gap="lg">
          <Tabs
            variant="line"
            aria-label={t("homeEditingDocs.desktops")}
            items={desktops.map((id) => ({ value: id, label: label(id) }))}
            defaultValue="home"
            onAdd={() => setDesktops((list) => [...list, `desktop-${list.length + 1}`])}
            addLabel={t("homeEditingDocs.addDesktop")}
            extra={{
              end: (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  {t("homeEditingDocs.edit")}
                </Button>
              ),
            }}
          />
          <Card variant="dashed" accent="primary">
            <CardContent>
              <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle level={2}>{t("homeEditingDocs.todo")}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle level={2}>{t("homeEditingDocs.news")}</CardTitle>
                  </CardHeader>
                </Card>
              </ResponsiveGrid>
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
