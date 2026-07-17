import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button, Logo, Text } from "@godxjp/ui/general";
import { CenteredShell, Flex, ResponsiveGrid, Topbar } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * CenteredShell — authenticated, no-sidebar, centred-column page shell (hosted-ID "My Page",
 * account / self-service, standalone settings). A padded topbar with real actions reusing AppShell's
 * chrome WITHOUT a sidebar, a width-tiered centred column that is top-aligned + scrolls, and an
 * optional footer. Composed only from real @godxjp/ui components — zero custom CSS, no hand-rolled
 * bar. Fills the gap between AppShell (needs a sidebar) and AuthShell (unauthenticated narrow card).
 */
export default function Demo() {
  const services = [
    { id: "kintai", name: "勤怠", desc: "打刻・勤務表" },
    { id: "chat", name: "チャット", desc: "社内メッセージ" },
    { id: "books", name: "会計", desc: "請求・支払" },
  ];

  return (
    <CenteredShell
      width="md"
      topbar={
        <Topbar
          start={
            <Flex align="center" gap="sm">
              <Logo glyph="G" />
              <Text weight="medium">GodX ID</Text>
            </Flex>
          }
          end={
            <Flex align="center" gap="sm">
              <AppSettingPicker kind="locale" />
              <Button variant="ghost" size="sm">
                <Avatar className="size-6">
                  <AvatarFallback>田</AvatarFallback>
                </Avatar>
                田中 太郎
              </Button>
            </Flex>
          }
        />
      }
      footer={
        <Text size="xs" tone="muted">
          2026 GodX · プライバシー · 利用規約
        </Text>
      }
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={1}>マイページ</CardTitle>
            <CardDescription>アカウントとサービスの概要。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="xs">
              <Text weight="medium">田中 太郎</Text>
              <Text size="sm" tone="muted">
                tanaka@example.com · 組織: GodX 株式会社
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>サービス</CardTitle>
            <CardDescription>利用中のアプリを開きます。</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
              {services.map((s) => (
                <Card key={s.id}>
                  <CardContent>
                    <Flex direction="col" gap="xs">
                      <Text weight="medium">{s.name}</Text>
                      <Text size="sm" tone="muted">
                        {s.desc}
                      </Text>
                      <Button variant="outline" size="sm">
                        開く
                      </Button>
                    </Flex>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </Flex>
    </CenteredShell>
  );
}
