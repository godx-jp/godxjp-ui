import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FeatureList,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

const STARTER = [
  { state: "included", label: "ユーザー 10 名まで" },
  { state: "included", label: "監査ログ", description: "直近 30 日分を保持します。" },
  {
    state: "limited",
    label: "API 呼び出し",
    description: "月 10,000 回を超えると 429 を返します。",
  },
  { state: "excluded", label: "SAML / OIDC シングルサインオン" },
  { state: "excluded", label: "監査ログのエクスポート" },
] as const;

const ENTERPRISE = [
  { state: "included", label: "ユーザー数 無制限" },
  { state: "included", label: "監査ログ", description: "保持期間は契約単位で設定します。" },
  { state: "included", label: "API 呼び出し", description: "レート上限は個別に調整します。" },
  {
    state: "included",
    label: "SAML / OIDC シングルサインオン",
    description: "SAML 2.0 と OIDC の両方に対応。",
  },
  { state: "included", label: "監査ログのエクスポート" },
] as const;

/**
 * FeatureList — 先頭の状態グリフ（含む／含まない／制限あり）を持つ「文」のリスト。
 *
 * ListRow は 1 行のエンティティ行（区切り線・末尾アクション）、Timeline は順序のあるイベント
 * レール、Descriptions は用語／値のグリッド。どれも「折り返す説明文つきの状態リスト」ではない。
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="FeatureList"
      subtitle="状態グリフつきの文のリスト · グリフは最初の行に揃う"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>三つの状態</CardTitle>
            <CardDescription>
              included（✓）· limited（−）· excluded（✗）。色は意味を運ぶ唯一の手段ではありません ——
              形が違い、読み上げ用の語も添えられます（WCAG 1.4.1）。excluded を赤で塗らないのは、
              「含まれない」は失敗ではなく事実だからです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList items={[...STARTER]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>折り返しても、グリフは最初の行に揃う</CardTitle>
            <CardDescription>
              グリフの枠は 1 行分（1lh）の高さで、その中央にグリフが置かれます。だから 3 行に
              折り返すラベルでも、揃う先は箱の上端ではなく最初の行です。呼び出し側に数値は
              ありません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList
              items={[
                {
                  state: "included",
                  label:
                    "組織をまたぐ権限の委譲（部門管理者が自部門の範囲内でだけロールを付け替えられる設定を含みます）",
                  description:
                    "委譲の範囲は組織ツリーのノード単位で決まり、親を超える付与はできません。監査ログには委譲元と委譲先の両方が記録されます。",
                },
                { state: "limited", label: "短いラベル" },
              ]}
            />
          </CardContent>
        </Card>

        <ResponsiveGrid columns={{ base: 1, md: 2 }}>
          <Card>
            <CardHeader>
              <CardTitle level={2}>Starter</CardTitle>
              <CardDescription>小さなチームのための最小構成。</CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureList items={[...STARTER]} />
            </CardContent>
            <CardFooter>
              <Button variant="outline">Starter を選ぶ</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>Enterprise</CardTitle>
              <CardDescription>監査と SSO を必要とする組織向け。</CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureList items={[...ENTERPRISE]} />
            </CardContent>
            <CardFooter>
              <Button>Enterprise を選ぶ</Button>
            </CardFooter>
          </Card>
        </ResponsiveGrid>

        <Card>
          <CardHeader>
            <CardTitle level={2}>数量はラベルに組み立てる</CardTitle>
            <CardDescription>
              「· 10,000 req/mo」のような数量に専用の prop はありません。Text を label に入れる
              書き方がすでに合法で audit も通るため、prop を足すと docs/WHAT-BELONGS-HERE.md の問い
              1（consumer に手がないか）に落ちます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList
              items={[
                {
                  state: "limited",
                  label: (
                    <>
                      API 呼び出し{" "}
                      <Text tone="muted" tabular>
                        10,000 req/mo
                      </Text>
                    </>
                  ),
                },
                {
                  state: "included",
                  label: (
                    <>
                      ストレージ{" "}
                      <Text tone="muted" tabular>
                        250 GB
                      </Text>
                    </>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
