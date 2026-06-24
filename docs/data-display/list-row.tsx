import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ListRow,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { KeyRound, Laptop, Link2, Smartphone } from "lucide-react";

/**
 * ListRow — the single-line entity-row surface for SHORT lists inside a Card. Replaces the
 * hand-rolled `flex items-center justify-between border-b py-3` repeated across account pages.
 * Drop rows into a flush CardContent: they stack with a quiet divider and the Card border closes
 * the list. Border / radius / padding are tokenized (`--list-row-*`).
 */
export default function Demo() {
  return (
    <PageContainer
      title="ListRow"
      subtitle="leading · title/description · trailing action — short entity lists inside a Card"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>アクティブなセッション Active sessions</CardTitle>
            <CardDescription>
              Rows live in a flush CardContent and draw their own dividers. Trailing holds the row
              action — a status Badge or a destructive Button.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              leading={<Smartphone aria-hidden="true" className="size-4" />}
              title="iPhone 15 · Tokyo"
              description="最終アクセス 2分前 · 153.240.x.x"
              trailing={<Badge status="active" />}
            />
            <ListRow
              leading={<Laptop aria-hidden="true" className="size-4" />}
              title="MacBook Pro · Osaka"
              description="最終アクセス 3日前 · 126.18.x.x"
              trailing={
                <Button size="xs" variant="outline">
                  ログアウト Sign out
                </Button>
              }
            />
            <ListRow
              leading={<Laptop aria-hidden="true" className="size-4" />}
              title="Windows · Nagoya"
              description="最終アクセス 先月 · 49.98.x.x"
              trailing={
                <Button size="xs" variant="outline">
                  ログアウト Sign out
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>連携アカウント Linked accounts</CardTitle>
            <CardDescription>
              Leading takes an icon or Avatar; trailing takes any action control. `as="li"` when the
              rows are a semantic list.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              as="li"
              leading={<Link2 aria-hidden="true" className="size-4" />}
              title="GitHub"
              description="taro@example.com として接続済み"
              trailing={
                <Button size="xs" variant="ghost">
                  解除 Disconnect
                </Button>
              }
            />
            <ListRow
              as="li"
              leading={<KeyRound aria-hidden="true" className="size-4" />}
              title="Passkey · iCloud Keychain"
              description="2026年3月12日に追加"
              trailing={<Badge tone="neutral">未使用</Badge>}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
