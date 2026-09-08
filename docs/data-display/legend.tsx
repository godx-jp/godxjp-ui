import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Legend,
  Progress,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

const COMPLIANCE = [
  { name: "株式会社山田製作所", over: 2, near: 3, done: 12 },
  { name: "佐藤食品株式会社", over: 1, near: 2, done: 9 },
  { name: "東海精密工業株式会社", over: 0, near: 3, done: 21 },
];

const STATUS_KEYS = [
  { tone: "destructive", label: "期限超過" },
  { tone: "warning", label: "期限間近" },
  { tone: "success", label: "対応済" },
] as const;

/**
 * Legend — the KEY for a colour-coded surface: which tone means what, in words, once.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Legend" subtitle="tone → 意味 のキー · 凡例">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Progress の breakdown と組む</CardTitle>
            <CardDescription>
              CardAction に置くと、カード見出しと同じ行に凡例が並びます。色の意味をカードで
              一度だけ言い、各行では繰り返しません。
            </CardDescription>
            <CardAction>
              <Legend items={[...STATUS_KEYS]} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gapRaw={11}>
              {COMPLIANCE.map((row) => (
                <Flex key={row.name} align="center" gapRaw={14}>
                  <Flex width={180}>
                    <Text weight="medium" truncate>
                      {row.name}
                    </Text>
                  </Flex>
                  <Flex fill direction="col">
                    <Progress
                      segments={[
                        { value: row.over, tone: "destructive", label: "期限超過" },
                        { value: row.near, tone: "warning", label: "期限間近" },
                        { value: row.done, tone: "success", label: "対応済" },
                      ]}
                      aria-label={row.name}
                    />
                  </Flex>
                  <Flex width={150} justify="end" align="center" gapRaw={12}>
                    <Text tone="destructive" weight="semibold" tabular>
                      {row.over}
                    </Text>
                    <Text tone="warning" weight="semibold" tabular>
                      {row.near}
                    </Text>
                    <Text tone="success" weight="semibold" tabular>
                      {row.done}
                    </Text>
                    <Text tone="muted" tabular>
                      計 {row.over + row.near + row.done}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Tones</CardTitle>
            <CardDescription>
              vocabulary の 7 tone すべてに塗りがあります。色だけで意味を運ばないため label
              は必須です（WCAG 1.4.1）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Legend
              items={[
                { tone: "default", label: "既定（primary）" },
                { tone: "success", label: "成功" },
                { tone: "warning", label: "注意" },
                { tone: "destructive", label: "危険" },
                { tone: "info", label: "情報" },
                { tone: "muted", label: "控えめ" },
                { tone: "neutral", label: "中立" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Named legend</CardTitle>
            <CardDescription>
              aria-label を渡すと、その凡例が「何のキーか」を読み上げます。項目は list /
              listitem として並びます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Legend items={[...STATUS_KEYS]} aria-label="コンプライアンス状況の凡例" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Wrapping</CardTitle>
            <CardDescription>
              狭い幅では折り返します（横スクロールしません）。凡例が視界の外に出ると、色の意味
              そのものが失われるためです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex width={240}>
              <Legend
                items={[
                  { tone: "destructive", label: "期限超過" },
                  { tone: "warning", label: "期限間近" },
                  { tone: "success", label: "対応済" },
                  { tone: "info", label: "確認中" },
                  { tone: "muted", label: "対象外" },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
