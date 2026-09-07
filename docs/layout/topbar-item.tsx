import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { AppShell, Flex, PageContainer, Sidebar, Topbar, TopbarItem } from "@godxjp/ui/layout";
import type { SidebarSectionProp } from "@godxjp/ui/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@godxjp/ui/navigation";
import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
} from "lucide-react";

/**
 * TopbarItem — one interactive cell of a Topbar slot, shaped like part of the bar: full bar
 * height, the bar's own hover surface, and the focus mark hosted INSIDE the cell. The second bar
 * below shows the same triggers built from `Button` instead, which is the floating-pill read this
 * component exists to replace.
 */
const SECTIONS: SidebarSectionProp[] = [
  {
    label: "会計",
    items: [
      { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
      { id: "journal", label: "仕訳", icon: FileText },
    ],
  },
  { label: "管理", items: [{ id: "users", label: "ユーザー", icon: Users }] },
];

export default function Demo() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AppShell
      sidebarCollapsed={collapsed}
      sidebar={<Sidebar activeId="dashboard" sections={SECTIONS} />}
      topbar={
        <Topbar
          start={
            <TopbarItem
              aria-label={collapsed ? "サイドバーを開く" : "サイドバーを閉じる"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((open) => !open)}
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" />
              ) : (
                <PanelLeftClose aria-hidden="true" />
              )}
            </TopbarItem>
          }
          end={
            <>
              <TopbarItem aria-label="お知らせ">
                <Bell aria-hidden="true" />
              </TopbarItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TopbarItem aria-label="アカウント">
                    <Avatar>
                      <AvatarFallback>SD</AvatarFallback>
                    </Avatar>
                  </TopbarItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>佐藤 大輔</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings aria-hidden="true" />
                    設定
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut aria-hidden="true" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />
      }
    >
      <PageContainer title="TopbarItem" subtitle="バーの一部として読める、バーの高さのセル">
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle level={2}>上のバーがこのコンポーネントです</CardTitle>
              <CardDescription>
                セルの高さは自分では決めません。AppShell のグリッド行、単体で使うときは
                --topbar-height、粗いポインタのときはその上書き。どれであっても、セルはバーの
                高さまで伸びます。ホバー面もバー自身の面です。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Text size="sm" tone="muted">
                DropdownMenuTrigger には `asChild` で渡します。メニューが開いている間は
                [data-state=&quot;open&quot;] でセルが点いたままになります。
              </Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>Button を入れた場合（比較）</CardTitle>
              <CardDescription>
                同じスロットに Button を置くと、背の高いバーの中に --control-height
                の丸いピルが浮きます。バーの一部ではなく、バーに落ちてきた部品に見えます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Topbar
                start={
                  <Button variant="ghost" size="sm" aria-label="サイドバーを閉じる">
                    <PanelLeftClose aria-hidden="true" />
                  </Button>
                }
                end={
                  <>
                    <Button variant="ghost" size="sm" aria-label="お知らせ">
                      <Bell aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="sm" aria-label="アカウント">
                      <Avatar>
                        <AvatarFallback>SD</AvatarFallback>
                      </Avatar>
                    </Button>
                  </>
                }
              />
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppShell>
  );
}
