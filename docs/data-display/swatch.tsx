import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ListRow,
  Swatch,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

const BRAND = {
  name: "株式会社山田製作所",
  primary: "#0071bd",
  secondary: "#c0392f",
};

const CATEGORIES = [
  { name: "定例会議", color: "#7c3aed" },
  { name: "出張", color: "#0f9d58" },
  { name: "締切", color: "#c0392f" },
  { name: "予備", color: "#ffffff" },
];

/**
 * Swatch — a read-only sample of ONE colour a person chose.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Swatch" subtitle="利用者が選んだ色を、そのまま見せる読み取り専用の見本">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>ブランドカラー</CardTitle>
            <CardDescription>
              組織が登録した色は tone ではなく値です。見本に名前を渡すと、見える文字を増やさずに
              読み上げられます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Flex align="center" gap="sm">
                <Swatch color={BRAND.primary} aria-label={`プライマリカラー: ${BRAND.primary}`} />
                <Text weight="medium">{BRAND.name}</Text>
                <Text tone="muted" mono size="xs">
                  {BRAND.primary}
                </Text>
              </Flex>
              <Flex align="center" gap="sm">
                <Swatch
                  color={BRAND.secondary}
                  aria-label={`セカンダリカラー: ${BRAND.secondary}`}
                />
                <Text weight="medium">{BRAND.name}</Text>
                <Text tone="muted" mono size="xs">
                  {BRAND.secondary}
                </Text>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>一覧の先頭マークとして</CardTitle>
            <CardDescription>
              行のラベルが色の意味を言っているので、見本は aria-hidden
              のままにします。同じことを二度読み上げないためです。最後の「予備」は白で、
              白いカードの上でも見本の輪郭が残ることを示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="none">
              {CATEGORIES.map((category) => (
                <ListRow
                  key={category.name}
                  leading={<Swatch color={category.color} />}
                  title={category.name}
                  description={category.color}
                />
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>色の形式は問いません</CardTitle>
            <CardDescription>
              hex でも rgb() でも oklch() でも、CSS の色として有効ならそのまま塗ります。
              値はスタイルシートには入らず、要素の上にだけ乗ります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex align="center" gap="md" wrap>
              <Swatch color="#7c3aed" aria-label="hex: #7c3aed" />
              <Swatch color="rgb(15 157 88)" aria-label="rgb: rgb(15 157 88)" />
              <Swatch color="oklch(0.72 0.15 45)" aria-label="oklch: oklch(0.72 0.15 45)" />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
