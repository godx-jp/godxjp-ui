import { useState } from "react";
import { Button, Logo, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import {
  AppShell,
  Flex,
  PageContainer,
  Sidebar,
  type SidebarSectionProp,
  Topbar,
} from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";
import { BarChart3, CircleHelp, FileText, LayoutDashboard } from "lucide-react";

/**
 * PageErrorBoundary — AppShell wraps every page in one by default (gh#1494). Press "Break this
 * page": the page throws while rendering, its area becomes an application ErrorSurface, and the
 * sidebar and topbar stay, so the user can go elsewhere. Choosing a sidebar row (a navigation)
 * draws that page normally — the boundary resets when the URL changes.
 *
 * The page header also shows the `help` slot: the Help control sits at the header row's inline
 * end, after the actions, on every page.
 */
function ReportPage({ broken }: { broken: boolean }) {
  const { t } = useTranslation();
  if (broken) throw new Error("demo: the report row renderer received null");
  return <Text>{t("pageErrorBoundaryDocs.body")}</Text>;
}

export default function Demo() {
  const { t } = useTranslation();
  const [broken, setBroken] = useState(false);
  const [activeId, setActiveId] = useState("reports");
  const sections: SidebarSectionProp[] = [
    {
      label: t("pageErrorBoundaryDocs.section"),
      items: [
        {
          id: "dashboard",
          label: t("pageErrorBoundaryDocs.dashboard"),
          icon: LayoutDashboard,
          href: "#dashboard",
        },
        {
          id: "reports",
          label: t("pageErrorBoundaryDocs.reports"),
          icon: BarChart3,
          href: "#reports",
        },
        {
          id: "documents",
          label: t("pageErrorBoundaryDocs.documents"),
          icon: FileText,
          href: "#documents",
        },
      ],
    },
  ];
  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId={activeId}
          sections={sections}
          onSelect={(id) => {
            setActiveId(id);
            setBroken(false);
          }}
        />
      }
      topbar={
        <Topbar
          start={<Logo glyph="G" />}
          end={
            <Flex align="center" gap="sm">
              <AppSettingPicker kind="locale" />
            </Flex>
          }
        />
      }
    >
      <PageContainer
        title={t("pageErrorBoundaryDocs.title")}
        extra={
          <Button variant="destructive" onClick={() => setBroken(true)}>
            {t("pageErrorBoundaryDocs.break")}
          </Button>
        }
        help={
          <Button variant="ghost">
            <CircleHelp aria-hidden="true" />
            {t("pageErrorBoundaryDocs.help")}
          </Button>
        }
      >
        <ReportPage broken={broken} />
      </PageContainer>
    </AppShell>
  );
}
