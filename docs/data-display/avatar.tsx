import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ListRow,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Building2, KeyRound, ShieldCheck, Sparkles } from "lucide-react";

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

        {/* appearance="tinted" — the capability medallion (gh#12) */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>
              ケイパビリティ メダリオン · appearance=&quot;tinted&quot;
            </CardTitle>
            <CardDescription>
              機能・ケイパビリティのアイコンは、淡いロール地の角丸スクエア（メダリオン）に載せる。
              メダリオンは Avatar + Lucide グリフの合成パターン（docs/COMPOSITION-VS-COMPONENT.md）
              なので、ライブラリが持つべきは「淡色」そのもの · appearance=&quot;tinted&quot;。
              これが無いと消費側は hsl(var(--primary) / 0.1) をページ CSS
              に書き写すか、素のグリフを置くしかなかった。 shape と直交するので、円形メダリオンも
              同じ 1 語で得られる。配色は --avatar-tinted-* トークン所有。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {/* The left-aligned capability card: medallion, title, one line of prose. */}
              <Flex direction="row" align="center" gap="md">
                <Avatar shape="square" appearance="tinted">
                  <AvatarFallback>
                    <ShieldCheck aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
                <Flex direction="col">
                  <Text weight="medium">シングルサインオン</Text>
                  <Text size="xs" tone="muted">
                    1 つの ID で全サービスへ
                  </Text>
                </Flex>
              </Flex>
              <Flex direction="row" wrap align="center" gap="md">
                <Avatar shape="square" appearance="tinted">
                  <AvatarFallback>
                    <KeyRound aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
                <Avatar shape="square" appearance="tinted">
                  <AvatarFallback>
                    <Building2 aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
                <Avatar appearance="tinted">
                  <AvatarFallback>
                    <Sparkles aria-hidden="true" />
                  </AvatarFallback>
                </Avatar>
                {/* Solid entity mark beside it — the two treatments are different jobs. */}
                <Avatar shape="square">
                  <AvatarFallback>山</AvatarFallback>
                </Avatar>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* presence — the realtime reachability dot (gh#309) */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>プレゼンス · presence</CardTitle>
            <CardDescription>
              「今つながるか」はマークの上に出る。presence を渡すとドットとローカライズ済みの
              sr-only テキストが同時に付く（色だけで状態を伝えない · WCAG 1.4.1）。 4
              つの値は色に加えて形でも区別する。online は塗り、away は下半分塗り、busy
              は横棒入り、offline は中空リング。 グレースケールでも、色覚特性があっても、Windows
              ハイコントラストでも 4 状態が判別できる。 直径・食い込み・リング幅・リング色は
              --avatar-presence-* トークン所有（#44 / #45）。 直径はマークに対する比率なので、size-8
              でも size-12 でも組織マークでも同じ 1 つの値で追従する。 presence
              を渡さない＝「プレゼンスという概念が無い」（組織マーク）で、DOM
              には何も出ない。presence=&quot;offline&quot; は「不在だと分かっている」で、別の意味。
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              leading={
                <Avatar presence="online">
                  <AvatarImage src="https://picsum.photos/seed/godxjp-a/96/96" alt="" />
                  <AvatarFallback>田</AvatarFallback>
                </Avatar>
              }
              title="田中 未来"
              description="プロダクト · #general"
            />
            <ListRow
              leading={
                <Avatar presence="busy">
                  <AvatarImage src="https://picsum.photos/seed/godxjp-b/96/96" alt="" />
                  <AvatarFallback>佐</AvatarFallback>
                </Avatar>
              }
              title="佐藤 玲"
              description="デザイン · #general"
            />
            <ListRow
              leading={
                <Avatar presence="away">
                  <AvatarFallback>鈴</AvatarFallback>
                </Avatar>
              }
              title="鈴木 大輔"
              description="エンジニアリング · #general"
            />
            <ListRow
              leading={
                <Avatar presence="offline">
                  <AvatarFallback>山</AvatarFallback>
                </Avatar>
              }
              title="山本 彩"
              description="サポート · #general"
            />
            {/* No presence at all — an organization mark has no reachability to report. */}
            <ListRow
              leading={
                <Avatar shape="square">
                  <AvatarFallback>山</AvatarFallback>
                </Avatar>
              }
              title="株式会社山田商事"
              description="組織 · プレゼンスの概念なし"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>プレゼンス · 4 状態と寸法追従</CardTitle>
            <CardDescription>
              上段は 4 状態を写真の上に重ねたもの。リングが写真から
              ドットを切り離すために幅を稼いでいることが分かる。 中段は同じ
              presence=&quot;online&quot; を size-8 / 既定 / size-12 / 組織マークに載せたもので、
              ドットが px 固定ではなくマーク比で追従することを示す。下段は密度の高い行（36px
              マーク）での見え方。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" wrap align="center" gap="md">
                <Avatar presence="online">
                  <AvatarImage src="https://picsum.photos/seed/godxjp-c/96/96" alt="オンライン" />
                  <AvatarFallback>在</AvatarFallback>
                </Avatar>
                <Avatar presence="away">
                  <AvatarImage src="https://picsum.photos/seed/godxjp-d/96/96" alt="離席中" />
                  <AvatarFallback>離</AvatarFallback>
                </Avatar>
                <Avatar presence="busy">
                  <AvatarImage src="https://picsum.photos/seed/godxjp-e/96/96" alt="取り込み中" />
                  <AvatarFallback>取</AvatarFallback>
                </Avatar>
                <Avatar presence="offline">
                  <AvatarImage src="https://picsum.photos/seed/godxjp-f/96/96" alt="オフライン" />
                  <AvatarFallback>離</AvatarFallback>
                </Avatar>
              </Flex>
              <Flex direction="row" wrap align="center" gap="md">
                <Avatar className="size-8" presence="online">
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <Avatar presence="online">
                  <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <Avatar className="size-12" presence="online">
                  <AvatarFallback>L</AvatarFallback>
                </Avatar>
                <Avatar shape="square" presence="online">
                  <AvatarFallback>山</AvatarFallback>
                </Avatar>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardContent flush>
            <ListRow
              density="compact"
              leading={
                <Avatar className="size-9" presence="busy" presenceLabel="会議中 · 15:00まで">
                  <AvatarFallback>佐</AvatarFallback>
                </Avatar>
              }
              title="佐藤 玲"
              description="presenceLabel でプロダクト側の言い回しに差し替え（表示はされない）"
            />
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
