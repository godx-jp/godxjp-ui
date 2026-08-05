import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ListRow,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
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
      subtitle="leading · title/description · trailing action · short entity lists inside a Card"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>アクティブなセッション Active sessions</CardTitle>
            <CardDescription>
              Rows live in a flush CardContent and draw their own dividers. Trailing holds the row
              action: a status Badge or a destructive Button.
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
            <CardTitle level={2}>連携アカウント Linked accounts</CardTitle>
            <CardDescription>
              Leading takes an icon or Avatar; trailing takes any action control. `as="li"` when the
              rows are a semantic list.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            {/* `as="li"` rows are a SEMANTIC list — axe's `listitem` rule requires the parent to
                actually be a list container (ul/ol/role=list), not just visually stacked divs. */}
            <ul>
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
            </ul>
          </CardContent>
        </Card>

        {/* #224 — a long organization name plus TWO trailing Buttons. The content column shrinks
            to `min(--list-row-body-min-width, 100%)` and the actions wrap onto their own line at
            narrow widths, so the page root never scrolls horizontally at 390px. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>招待 Pending invitations</CardTitle>
            <CardDescription>
              Long titles + two actions: the row wraps instead of widening the page. Retune the
              stack threshold with `--list-row-body-min-width`, the action gap with
              `--list-row-trailing-gap`.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              align="start"
              overflow="wrap"
              leading={
                <Avatar className="size-8">
                  <AvatarFallback>グ</AvatarFallback>
                </Avatar>
              }
              title="グローバル・トランスフォーメーション推進本部 デジタルプラットフォーム統括部"
              description="招待者 山田 太郎 · 2026-07-28"
              trailing={
                <>
                  <Button size="xs" variant="ghost">
                    辞退 Decline
                  </Button>
                  <Button size="xs" variant="outline">
                    参加 Accept
                  </Button>
                </>
              }
            />
            <ListRow
              align="start"
              overflow="wrap"
              leading={
                <Avatar className="size-8">
                  <AvatarFallback>T</AvatarFallback>
                </Avatar>
              }
              title="Trung tâm Điều phối Chuyển đổi số và Quản trị Dữ liệu Doanh nghiệp Toàn cầu"
              description="Người mời nguyễn.van.a@example.com · 2026-07-27"
              trailing={
                <>
                  <Button size="xs" variant="ghost">
                    Từ chối
                  </Button>
                  <Button size="xs" variant="outline">
                    Chấp nhận
                  </Button>
                </>
              }
            />
            <ListRow
              leading={
                <Avatar className="size-8">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              }
              title="Acme Global Transformation Office · Data Platform Division"
              description="Invited by taro@example.com · 2026-07-26"
              trailing={
                <>
                  <Button size="xs" variant="ghost">
                    Decline
                  </Button>
                  <Button size="xs" variant="outline">
                    Accept
                  </Button>
                </>
              }
            />
          </CardContent>
        </Card>

        {/* #246 — `density="compact"` inline-actions geometry. Inside the canonical narrow card
            (358px at a 390px viewport → 326px content column) the 36px Avatar, the shrinkable
            title/description and the two small trailing Buttons stay on ONE line, and the history
            rows keep their status Badge + ISO-8601 date inline with the title. The #224 wrap
            contract is untouched: a cluster that cannot fit still wraps, never widening the page. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>招待 · コンパクト Compact invitations</CardTitle>
            <CardDescription>
              `density=&quot;compact&quot;` lowers the row inset, the column gap and the body
              threshold (`--list-row-compact-*`) so avatar · title · actions read as one line in a
              narrow card, instead of the actions dropping to a second row.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              density="compact"
              leading={
                <Avatar className="size-9">
                  <AvatarFallback>グ</AvatarFallback>
                </Avatar>
              }
              title="グローバル推進本部"
              description="山田 太郎 · 2026-07-28"
              trailing={
                <>
                  <Button size="xs" variant="ghost">
                    辞退
                  </Button>
                  <Button size="xs" variant="outline">
                    参加
                  </Button>
                </>
              }
            />
            <ListRow
              density="compact"
              leading={
                <Avatar className="size-9">
                  <AvatarFallback>T</AvatarFallback>
                </Avatar>
              }
              title="Trung tâm Dữ liệu"
              description="nguyen.van.a@example.com · 2026-07-27"
              trailing={
                <>
                  <Button size="xs" variant="ghost">
                    Từ chối
                  </Button>
                  <Button size="xs" variant="outline">
                    Đồng ý
                  </Button>
                </>
              }
            />
            <ListRow
              density="compact"
              leading={
                <Avatar className="size-9">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              }
              title="Acme Data Platform"
              description="taro@example.com · 2026-07-26"
              trailing={
                <>
                  <Button size="xs" variant="ghost">
                    Decline
                  </Button>
                  <Button size="xs" variant="outline">
                    Accept
                  </Button>
                </>
              }
            />
            {/* Compact does NOT give up the #224 safety net: a title too long for the compact
                threshold still wraps (and the actions drop to their own line if they cannot fit),
                so the page root never scrolls horizontally. */}
            <ListRow
              density="compact"
              align="start"
              overflow="wrap"
              leading={
                <Avatar className="size-9">
                  <AvatarFallback>グ</AvatarFallback>
                </Avatar>
              }
              title="グローバル・トランスフォーメーション推進本部 デジタルプラットフォーム統括部"
              description="Trung tâm Điều phối Chuyển đổi số · 2026-07-25"
              trailing={
                <>
                  <Button size="xs" variant="ghost">
                    辞退 Decline
                  </Button>
                  <Button size="xs" variant="outline">
                    参加 Accept
                  </Button>
                </>
              }
            />
          </CardContent>
        </Card>

        {/* #246 — the compact HISTORY row: no leading slot, status Badge + ISO-8601 date inline. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>履歴 Invitation history</CardTitle>
            <CardDescription>
              A compact row with a status Badge and an ISO-8601 date in `trailing` stays a single
              line at 390px. The metadata never drops under the title.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              density="compact"
              title="グローバル推進本部"
              trailing={
                <>
                  <Badge tone="success">承認済み</Badge>
                  <Text size="xs" tone="muted">
                    2026-07-12
                  </Text>
                </>
              }
            />
            <ListRow
              density="compact"
              title="Trung tâm Dữ liệu"
              trailing={
                <>
                  <Badge tone="neutral">期限切れ</Badge>
                  <Text size="xs" tone="muted">
                    2026-06-30
                  </Text>
                </>
              }
            />
            <ListRow
              density="compact"
              title="Acme Data Platform"
              trailing={
                <>
                  <Badge tone="destructive">辞退</Badge>
                  <Text size="xs" tone="muted">
                    2026-06-18
                  </Text>
                </>
              }
            />
          </CardContent>
        </Card>

        {/* Both density branches on the same content, so the inset difference is readable at rest
            without toggling anything. `default` is what a row renders with density omitted. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>密度の対比 density=default vs compact</CardTitle>
            <CardDescription>
              同じ行を density=&quot;default&quot;（既定 · ゆとりのある行間）と
              density=&quot;compact&quot;（明細向けの詰めた行間）で並べています。切り替えるのは
              inset · 列間 · 本文の折り返し閾値だけで、内容と操作は変わりません。
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              density="default"
              leading={<Laptop aria-hidden="true" className="size-4" />}
              title="MacBook Pro · Osaka"
              description={'density="default" · 最終アクセス 3日前'}
              trailing={<Badge status="active" />}
            />
            <ListRow
              density="compact"
              leading={<Laptop aria-hidden="true" className="size-4" />}
              title="MacBook Pro · Osaka"
              description={'density="compact" · 最終アクセス 3日前'}
              trailing={<Badge status="active" />}
            />
          </CardContent>
        </Card>

        {/* #225 — notification rows. `unread` renders the indicator dot (a SHAPE with localized
            sr-only text, never colour alone) plus the tokenized emphasis surface; read rows keep
            the gutter so every title stays on one optical axis. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>通知 Notifications</CardTitle>
            <CardDescription>
              `unread` = indicator dot + `--list-row-unread-background`; `unread={false}` = the
              neutral `--list-row-read-background`. Zero, one or two inline trailing actions.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              unread
              align="start"
              overflow="wrap"
              title="組織「グローバル・トランスフォーメーション推進本部」への招待が届いています"
              description="2026-07-30 09:12"
              trailing={
                <>
                  <Button size="xs" variant="ghost">
                    既読にする
                  </Button>
                  <Button size="xs" variant="outline">
                    開く
                  </Button>
                </>
              }
            />
            <ListRow
              unread
              align="start"
              overflow="wrap"
              title="Yêu cầu phê duyệt hợp đồng cung cấp dịch vụ vận hành hạ tầng đám mây quý III"
              description="2026-07-29 17:04"
              trailing={
                <Button size="xs" variant="outline">
                  Mở
                </Button>
              }
            />
            <ListRow
              unread={false}
              align="start"
              overflow="wrap"
              title="Your monthly platform usage report for the Data Platform Division is ready"
              description="2026-07-28 08:00"
            />
            <ListRow
              unread={false}
              align="start"
              overflow="wrap"
              title="請求書 INV-2026-0731 が発行されました"
              description="2026-07-27 18:40"
              trailing={<Badge tone="neutral">既読</Badge>}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
