// dev-only — CRM root. Renders AppShell + Sidebar + topbar + routed page.

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Building2,
  CheckSquare,
  ContactRound,
  Target,
  TrendingUp,
  Users,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "../../src/components/shell/AppShell";
import { Sidebar, type SidebarItem, type SidebarSection } from "../../src/components/shell/Sidebar";
import { PageContent } from "../../src/components/shell/PageContent";
import { Toaster } from "../../src/components/feedback/toaster";
import { Button } from "../../src/components/general/Button";
import { Select } from "../../src/components/data-entry/Select";
import { Avatar } from "../../src/components/data-display/Avatar";
import { InputSearch } from "../../src/components/data-entry/InputSearch";
import { Tag } from "../../src/components/data-display/Tag";
import { navigate, routes, useRoute } from "./routes";
import { OBJECTS, objectLabel } from "./loadObjects";
import { resetStore, useRecords } from "./store";
import ObjectListPage from "./ObjectListPage";
import RecordDetailPage from "./RecordDetailPage";
import RecordCreatePage from "./RecordCreatePage";
import type { Locale } from "./schemaTypes";

const OBJECT_ICONS: Record<string, LucideIcon> = {
  Account: Building2,
  Contact: ContactRound,
  Lead: Target,
  Opportunity: TrendingUp,
  Activity: CheckSquare,
  User: Users,
};

function ObjectCount({ name }: { name: string }) {
  const records = useRecords(name);
  return <>{records.length}</>;
}

export default function App() {
  const { i18n, t } = useTranslation();
  void t;
  const locale: Locale = (i18n.language === "en" ? "en" : "ja") as Locale;
  const route = useRoute();

  // Default route — `Account`.
  useEffect(() => {
    if (route.kind === "home") {
      navigate(routes.list("Account"));
    }
  }, [route.kind]);

  const activeObject = "object" in route ? route.object : "Account";

  const sections: SidebarSection[] = [
    {
      label: "CRM",
      items: OBJECTS.map<SidebarItem>((obj) => {
        const Icon = OBJECT_ICONS[obj.name] ?? Briefcase;
        return {
          id: obj.name,
          label: objectLabel(obj, locale),
          icon: Icon,
          badge: <ObjectCount name={obj.name} /> as unknown as string,
        };
      }),
    },
  ];

  return (
    <>
      <AppShell
        sidebar={
          <Sidebar
            activeId={activeObject}
            onSelect={(id) => navigate(routes.list(id))}
            sections={sections}
            brand={
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px" }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "var(--primary)",
                    color: "var(--primary-foreground, white)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={16} />
                </span>
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>GodxCRM</span>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    dev-probe
                  </span>
                </span>
              </div>
            }
            footer={
              <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
                <Button
                  variant="ghost"
                  size="small"
                  block
                  onClick={() => {
                    if (window.confirm("Reset all seed data?")) {
                      resetStore();
                    }
                  }}
                >
                  Reset seed data
                </Button>
              </div>
            }
          />
        }
        topbarLeft={
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 320 }}>
            <Tag color="primary">CRM</Tag>
            <InputSearch
              placeholder={locale === "ja" ? "グローバル検索…" : "Global search…"}
              style={{ width: 280 }}
            />
          </div>
        }
        topbarRight={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Select
              value={locale}
              onValueChange={(next: string) => i18n.changeLanguage(next)}
              options={[
                { value: "ja", label: "日本語" },
                { value: "en", label: "English" },
              ]}
              triggerClassName="dev-probe-locale"
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar size="sm" name={locale === "ja" ? "田中 美咲" : "Misaki Tanaka"} />
              <span style={{ fontSize: 13 }}>
                {locale === "ja" ? "田中 美咲" : "Misaki Tanaka"}
              </span>
            </div>
          </div>
        }
      >
        <PageContent>
          <RoutedPage route={route} locale={locale} />
        </PageContent>
      </AppShell>
      <Toaster position="top-right" />
    </>
  );
}

function RoutedPage({ route, locale }: { route: ReturnType<typeof useRoute>; locale: Locale }) {
  if (route.kind === "list" || route.kind === "new") {
    return (
      <>
        <ObjectListPage objectName={route.object} locale={locale} />
        {route.kind === "new" && (
          <RecordCreatePage objectName={route.object} locale={locale} />
        )}
      </>
    );
  }
  if (route.kind === "detail") {
    return (
      <RecordDetailPage
        objectName={route.object}
        id={route.id}
        locale={locale}
      />
    );
  }
  if (route.kind === "edit") {
    return (
      <RecordDetailPage
        objectName={route.object}
        id={route.id}
        locale={locale}
        editMode
      />
    );
  }
  return <div style={{ padding: 24 }}>Loading…</div>;
}
