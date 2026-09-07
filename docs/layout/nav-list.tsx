import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { MasterDetail, NavList, PageContainer } from "@godxjp/ui/layout";
import { Bell, Palette, ShieldCheck, User } from "lucide-react";

const items = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell, badge: "3" },
  { id: "security", label: "Security", icon: ShieldCheck },
];

/**
 * NavList — vertical route navigation for inside a page. Same rows as the Sidebar rail, in a
 * `<nav>` landmark instead of the shell grid, so the settings-nav shape stops being hand-rolled
 * out of Buttons.
 */
export default function Demo() {
  return (
    <PageContainer title="NavList" subtitle="ページ内のルート遷移ナビゲーション">
      <Card>
        <CardHeader>
          <CardTitle level={2}>Master と組み合わせる</CardTitle>
          <CardDescription>
            選択中の行だけが aria-current=&quot;page&quot; を持ち、ラベルはアイコン列に揃います。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MasterDetail
            masterLabel="Settings"
            railWidth="compact"
            master={<NavList label="Settings" items={items} activeId="appearance" />}
          >
            <Card>
              <CardHeader>
                <CardTitle level={3}>Appearance</CardTitle>
                <CardDescription>
                  詳細ペインは選択された行が決めます。ナビゲーション自体は折りたたみ状態を持ちません。
                </CardDescription>
              </CardHeader>
            </Card>
          </MasterDetail>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle level={2}>長いラベルと content stress</CardTitle>
          <CardDescription>行は縮み、ラベルだけが切り詰められます。</CardDescription>
        </CardHeader>
        <CardContent>
          <NavList
            label="Long labels"
            activeId="long"
            items={[
              { id: "long", label: "組織全体の通知とメール配信の既定値", icon: Bell },
              { id: "short", label: "Security", icon: ShieldCheck },
            ]}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
