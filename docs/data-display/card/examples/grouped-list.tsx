import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  Descriptions,
  ListRow,
} from "@godxjp/ui/data-display";
import { Button, Heading, Logo, Text } from "@godxjp/ui/general";
import { AuthAccountSummary, CenteredShell, Flex } from "@godxjp/ui/layout";
import { ChevronRight } from "lucide-react";

/**
 * Inset grouped list — an app-access consent screen built from `Card variant="grouped"`.
 *
 * Three groups, each a header caption · the grouped Card · an optional footer caption: a
 * key/value group (Descriptions), a scope group (ListRow + a mono scope at the trailing edge) and
 * a navigation group (ListRow + a chevron). Inside a grouped card the row hairlines start at the
 * row text and run to the card edge; the captions take `pad={{ inline: 4 }}`, the row inset, so
 * they start on the same axis. No page-local CSS.
 */
const scopes = [
  { title: "基本的なプロフィール情報", scope: "profile" },
  { title: "組織のメンバー一覧を見る", scope: "members.read" },
  { title: "勤務シフトを見る・編集する", scope: "shifts.write" },
];

export default function GroupedListExample() {
  return (
    <CenteredShell variant="auth" brand={<Logo />}>
      <Flex direction="col" gap="lg">
        <Flex direction="col" gap="xs" align="center">
          <Heading level={1}>シフト表 Pro</Heading>
          <Text tone="muted" align="center">
            以下のアプリがあなたのアカウントへのアクセスを求めています。
          </Text>
        </Flex>

        <Card variant="grouped">
          <CardContent flush>
            <Descriptions layout="horizontal" columns={1}>
              <Descriptions.Item label="提供元">株式会社サンプルソフト</Descriptions.Item>
              <Descriptions.Item label="対象の組織">株式会社サンプル</Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        <Flex direction="col" gap="xs">
          <Flex pad={{ inline: 4 }}>
            <Text size="sm" tone="muted">
              許可する権限 · {scopes.length}
            </Text>
          </Flex>
          <Card variant="grouped">
            <CardContent flush>
              <Flex as="ul" marker="none" direction="col" gap="none">
                {scopes.map((item) => (
                  <ListRow
                    key={item.scope}
                    as="li"
                    title={item.title}
                    trailing={
                      <Text mono size="xs" tone="muted">
                        {item.scope}
                      </Text>
                    }
                  />
                ))}
              </Flex>
            </CardContent>
          </Card>
          <Flex pad={{ inline: 4 }}>
            <Text size="sm" tone="muted">
              許可すると、このアプリは上記の権限で組織のデータにアクセスできます。
            </Text>
          </Flex>
        </Flex>

        <Card variant="grouped">
          <CardContent flush>
            <Flex as="ul" marker="none" direction="col" gap="none">
              <ListRow
                as="li"
                leading={
                  <Avatar shape="square" appearance="tinted">
                    <AvatarFallback>規</AvatarFallback>
                  </Avatar>
                }
                title="利用規約"
                description="第 3 版 · 11/30 まで"
                trailing={
                  <>
                    <Badge tone="warning">未対応</Badge>
                    <ChevronRight aria-hidden="true" />
                  </>
                }
              />
              <ListRow
                as="li"
                leading={
                  <Avatar shape="square" appearance="tinted">
                    <AvatarFallback>個</AvatarFallback>
                  </Avatar>
                }
                title="プライバシーポリシー"
                description="2026-10-01 改定"
                trailing={<ChevronRight aria-hidden="true" />}
              />
            </Flex>
          </CardContent>
        </Card>

        <Button fullWidth>許可する</Button>
        <AuthAccountSummary email="yamada@example.com" avatarFallback="山" actionLabel="切替" />
      </Flex>
    </CenteredShell>
  );
}
