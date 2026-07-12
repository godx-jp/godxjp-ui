import { Card, CardContent, StatCard } from "@godxjp/ui/data-display";
import { Reveal } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * Reveal — the official entrance-motion primitive (staggered fade-up). Reads the DS motion tokens
 * (`--duration-slow`, `--ease-emphasized`, `--reveal-distance`, `--reveal-stagger-step`) and honours
 * `prefers-reduced-motion`, replacing hand-rolled `@keyframes` + `.app-reveal`/`.d1..d6` classes.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const stats = [
    { label: "本日の売上", value: "¥1,240,000" },
    { label: "新規顧客", value: "38" },
    { label: "未処理", value: "12" },
    { label: "承認待ち", value: "5" },
  ];

  return (
    <PageContainer
      title="Reveal"
      subtitle="Staggered fade-up entrance · reads motion tokens · respects prefers-reduced-motion"
    >
      <Flex direction="col" gap="lg">
        <Reveal>
          <Card>
            <CardContent>単一のカードが読み込み時にフェードアップします。</CardContent>
          </Card>
        </Reveal>

        <ResponsiveGrid columns={{ sm: 2, lg: 4 }}>
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={(i + 1) as 1 | 2 | 3 | 4}>
              <StatCard label={stat.label} value={stat.value} />
            </Reveal>
          ))}
        </ResponsiveGrid>
      </Flex>
    </PageContainer>
  );
}
