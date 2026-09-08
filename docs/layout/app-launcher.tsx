import { useState } from "react";
import { BarChart3, LifeBuoy, MessagesSquare, Receipt, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  AppLauncher,
  type AppLauncherLabels,
  Flex,
  PageContainer,
  ResponsiveGrid,
  Topbar,
} from "@godxjp/ui/layout";

const apps = [
  { id: "console", name: "Console", href: "/console", icon: <BarChart3 />, current: true },
  { id: "billing", name: "Billing", href: "/billing", icon: <Receipt /> },
  { id: "people", name: "People", href: "/people", icon: <Users /> },
  { id: "chat", name: "Chat", href: "/chat", icon: <MessagesSquare /> },
];

const groups = [
  {
    label: "More from Acme",
    apps: [
      {
        id: "support",
        name: "Support",
        href: "https://support.example.test",
        icon: <LifeBuoy />,
        // An external destination renders a plain anchor and bypasses `linkComponent` — a
        // client-side router link to another origin is a router asked to route somewhere it
        // does not own.
        external: true,
      },
    ],
  },
];

const labels: AppLauncherLabels = {
  trigger: "Acme のアプリ",
  title: "アプリを切り替える",
  empty: "利用できるアプリがありません。",
  loading: "アプリを読み込み中",
  retry: "再試行",
  externalHint: "（新しいタブで開きます）",
};

/**
 * AppLauncher — the nine-dot platform app grid.
 *
 * WHERE IT SITS AMONG THINGS THAT LOOK LIKE IT:
 *
 * - `ServiceLauncherCard` (data-display) is also a launcher tile, but a PAGE-SIZED one — status,
 *   hostname, plan, an action button, a reason it is locked — for a service-catalogue page where
 *   choosing is a considered act. This tile is bar-sized: mark plus name, the whole tile one link,
 *   because changing app is a reflex. A grid of `ServiceLauncherCard`s inside a popover is the
 *   wrong component, not a smaller version of this one.
 * - `AppShell navRail` says the SAME platform scope as a docked column. Pick ONE. The launcher for
 *   a platform with MANY apps where switching is occasional (the Google Workspace shape); the rail
 *   for a single product where switching workspace is constant enough to deserve permanent screen
 *   width (the Slack shape). Shipping both puts one scope in two places.
 */
export default function Demo() {
  const [error, setError] = useState<string | undefined>("アプリ一覧を取得できませんでした。");

  return (
    <PageContainer title="AppLauncher" subtitle="topbar のセル · popover/sheet · グループ · 状態">
      <ResponsiveGrid columns={{ sm: 1, lg: 2 }}>
        <Card>
          <CardHeader>
            <CardTitle level={2}>バーの中のセル</CardTitle>
            <CardDescription>
              trigger は `TopbarItem` なので、高さはバーそのもの（`align-self: stretch`）。 `Button
              variant=&quot;ghost&quot;` を置くと、背の高い帯の中に浮いた丸薬になります。 panel は
              `responsive=&quot;auto&quot;` で、共有トークン
              `--sheet-responsive-breakpoint-width`（48rem）を境に popover と bottom sheet
              が入れ替わります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Topbar
                start={<Text weight="medium">Acme Console</Text>}
                end={<AppLauncher apps={apps} groups={groups} labels={labels} />}
              />
              <Text size="sm" tone="muted">
                current のアプリだけが `aria-current=&quot;page&quot;` を持ちます。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>列数と非同期状態</CardTitle>
            <CardDescription>
              既定は3列（Google と同じ形）。`columns` は1インスタンスの上書きです。 loading と error
              は grid の代わりに同じ所有 surface へ表示されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Topbar
                start={<Text weight="medium">4 列</Text>}
                end={
                  <AppLauncher
                    apps={apps}
                    groups={groups}
                    labels={labels}
                    columns={4}
                    responsive="popover"
                  />
                }
              />
              <Topbar
                start={<Text weight="medium">loading</Text>}
                end={<AppLauncher apps={apps} labels={labels} loading responsive="popover" />}
              />
              <Topbar
                start={<Text weight="medium">empty</Text>}
                end={<AppLauncher apps={[]} labels={labels} responsive="sheet" />}
              />
              <Topbar
                start={<Text weight="medium">error</Text>}
                end={
                  <AppLauncher
                    apps={apps}
                    labels={labels}
                    error={error}
                    onRetry={() => setError(undefined)}
                    responsive="popover"
                  />
                }
              />
              {!error ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError("再試行に失敗しました。")}
                >
                  エラーを復元
                </Button>
              ) : null}
            </Flex>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </PageContainer>
  );
}
