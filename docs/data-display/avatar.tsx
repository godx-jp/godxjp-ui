import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Avatar — identity image with a readable fallback (users, teams, entities).
 * Always compose AvatarImage + AvatarFallback so broken/missing images degrade
 * gracefully. Size via className. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Avatar" subtitle="Identity image with a readable fallback">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Image + fallback</CardTitle>
            <CardDescription>
              Compose AvatarImage with AvatarFallback: a loaded photo shows the image, an avatar
              with no image shows initials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/godxjp-a/96/96" alt="担当者" />
                <AvatarFallback>NA</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/godxjp-b/96/96" alt="担当者" />
                <AvatarFallback>TK</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>VB</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>経理</AvatarFallback>
              </Avatar>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Fallback on a broken image</CardTitle>
            <CardDescription>
              When the src fails to load, AvatarImage swaps in the AvatarFallback automatically,
              never a blank circle. delayMs holds the fallback back briefly so it does not flash
              before a slow image arrives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Avatar>
                <AvatarImage src="/__missing-avatar.png" alt="退職済みの担当者" />
                <AvatarFallback>YM</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="/__missing-avatar.png" alt="未設定の担当者" />
                <AvatarFallback delayMs={600}>HS</AvatarFallback>
              </Avatar>
            </Flex>
          </CardContent>
        </Card>

        {/* shape="square" — the entity-header organization / service mark (gh#249) */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>エンティティヘッダー · shape=&quot;square&quot;</CardTitle>
            <CardDescription>
              組織・サービスのマークは shape=&quot;square&quot; (角丸スクエア +
              ブランド面)、人物は既定の shape=&quot;circle&quot;。 半径・サイズ・配色はすべて
              --avatar-square-* トークン所有なので、サービス側は className を上書きせずテーマ 1
              か所で調整できる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" align="center" gap="md">
                <Avatar shape="square">
                  <AvatarFallback>山</AvatarFallback>
                </Avatar>
                <Flex direction="col">
                  <Text weight="medium">株式会社山田商事</Text>
                  <Text size="xs" tone="muted">
                    組織 · 取引先コード 100482
                  </Text>
                </Flex>
              </Flex>
              <Flex direction="row" wrap align="center" gap="md">
                <Avatar shape="square">
                  <AvatarImage src="https://picsum.photos/seed/godxjp-org/96/96" alt="組織ロゴ" />
                  <AvatarFallback>山</AvatarFallback>
                </Avatar>
                <Avatar shape="square">
                  <AvatarFallback>経理</AvatarFallback>
                </Avatar>
                <Avatar shape="square" className="size-12">
                  <AvatarFallback>DX</AvatarFallback>
                </Avatar>
                <Avatar shape="circle">
                  <AvatarFallback>田</AvatarFallback>
                </Avatar>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Sizes</CardTitle>
            <CardDescription>
              Default is var(--control-height); override with a size-* utility (size-8 / size-10 /
              size-12).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Avatar className="size-8">
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <Avatar className="size-10">
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
              <Avatar className="size-12">
                <AvatarFallback>L</AvatarFallback>
              </Avatar>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
