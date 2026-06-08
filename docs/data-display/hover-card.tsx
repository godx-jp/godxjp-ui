import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * HoverCard — a rich popover shown on hover/focus of a trigger (sighted-pointer
 * affordance; not a replacement for Tooltip). Composed only from real
 * @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="HoverCard"
      subtitle="Rich preview on hover/focus — entity peek, user card, positioning & delay"
    >
      <Flex direction="col" gap="lg">
        {/* Entity peek — hover (or focus) the link to reveal the card */}
        <Card>
          <CardHeader>
            <CardTitle>取引先プレビュー</CardTitle>
            <CardDescription>
              リンクをホバーまたはフォーカスすると、ページを離れずに取引先を確認できます。トリガーは
              フォーカス可能なリンクなので、キーボード操作でも開きます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">株式会社ベトヤ</Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <Flex direction="row" gap="md" align="center">
                  <Avatar>
                    <AvatarFallback>VB</AvatarFallback>
                  </Avatar>
                  <Flex direction="col" gap="xs">
                    <Text weight="medium">株式会社ベトヤ</Text>
                    <Text size="xs" tone="muted">
                      取引先 · BTY-0012 · 売掛 ¥482,000
                    </Text>
                  </Flex>
                </Flex>
              </HoverCardContent>
            </HoverCard>
          </CardContent>
        </Card>

        {/* User card — the second pattern promised by the subtitle */}
        <Card>
          <CardHeader>
            <CardTitle>ユーザーカード</CardTitle>
            <CardDescription>
              担当者名にホバーすると、連絡先と所属を含むユーザーカードを表示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">田中 美咲</Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <Flex direction="row" gap="md" align="center">
                  <Avatar>
                    <AvatarImage src="/avatars/tanaka.png" alt="田中 美咲" />
                    <AvatarFallback>田</AvatarFallback>
                  </Avatar>
                  <Flex direction="col" gap="xs">
                    <Text weight="medium">田中 美咲</Text>
                    <Text size="xs" tone="muted">
                      営業部 · 主任
                    </Text>
                    <Text size="xs" tone="muted">
                      misaki.tanaka@example.co.jp
                    </Text>
                  </Flex>
                </Flex>
              </HoverCardContent>
            </HoverCard>
          </CardContent>
        </Card>

        {/* Positioning — every `side` value, plus `align` and `sideOffset` */}
        <Card>
          <CardHeader>
            <CardTitle>配置（side · align · sideOffset）</CardTitle>
            <CardDescription>
              ポップオーバーを開く向きは side（top / right / bottom / left）、トリガーに沿った
              位置は align、トリガーとの距離は sideOffset で制御します。各リンクをホバーすると
              その向きで表示されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4 }}>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">side=top</Button>
                </HoverCardTrigger>
                <HoverCardContent side="top">
                  <Text>上に表示（align=center）</Text>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">side=right</Button>
                </HoverCardTrigger>
                <HoverCardContent side="right" align="start">
                  <Text>右に表示（align=start）</Text>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">side=bottom</Button>
                </HoverCardTrigger>
                <HoverCardContent side="bottom" align="end">
                  <Text>下に表示（align=end）</Text>
                </HoverCardContent>
              </HoverCard>

              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">side=left</Button>
                </HoverCardTrigger>
                <HoverCardContent side="left" sideOffset={12}>
                  <Text>左に表示（sideOffset=12）</Text>
                </HoverCardContent>
              </HoverCard>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Delay — openDelay / closeDelay tune the hover affordance */}
        <Card>
          <CardHeader>
            <CardTitle>開閉ディレイ（openDelay · closeDelay）</CardTitle>
            <CardDescription>
              openDelay はホバーから表示までの待ち時間、closeDelay は離れてから閉じるまでの
              猶予です。長い openDelay で誤爆を防ぎ、長い closeDelay でポップオーバー内へ
              ポインタを移動しやすくします。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="lg" wrap>
              <HoverCard openDelay={700} closeDelay={150}>
                <HoverCardTrigger asChild>
                  <Button variant="link">ゆっくり開く（openDelay=700）</Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <Text>待ってから表示。意図しないホバーで開きません。</Text>
                </HoverCardContent>
              </HoverCard>

              <HoverCard openDelay={0} closeDelay={600}>
                <HoverCardTrigger asChild>
                  <Button variant="link">すぐ開き、遅く閉じる（closeDelay=600）</Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <Text>即座に表示し、離れても少し残るのでカード内に移動できます。</Text>
                </HoverCardContent>
              </HoverCard>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
