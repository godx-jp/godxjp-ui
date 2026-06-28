import { StatCard } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { CheckCircle2, Package, Ship, TrendingUp, Wallet } from "lucide-react";

/**
 * StatCard — KPI tile. It IS already a bordered Card, so it renders DIRECTLY in
 * ResponsiveGrid — never wrapped in Card/CardContent (double border). Section
 * titles are headings, not Cards. delta is sign-aware (+green / -red; inverse
 * flips it). Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="StatCard"
      subtitle="KPI tiles · label · value · delta · hint, in a ResponsiveGrid"
    >
      <Flex direction="col" gap="lg">
        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            KPI row (stacked)
          </Text>
          <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
            <StatCard label="月次売上" value="¥8,200,000" delta="+12%" hint="先月比" />
            <StatCard label="請求件数" value="312" delta="+4%" />
            <StatCard label="売掛金残高" value="¥1,284,500" hint="未回収 18件" />
            <StatCard label="回収率" value="96.8%" delta="+1.2%" />
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            icon medallion (decorative · tinted via --stat-card-icon-* tokens)
          </Text>
          <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
            <StatCard icon={Package} label="処理中の注文" value="4" delta="+2" />
            <StatCard icon={Ship} label="輸送中" value="2" hint="日本 → ベトナム" />
            <StatCard icon={CheckCircle2} label="今月の配達" value="11" delta="+18%" />
            <StatCard icon={Wallet} label="ウォレット残高" value="¥185,000" />
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            Delta tone · sign-aware (inverse flips it)
          </Text>
          <ResponsiveGrid columns={{ sm: 2, md: 3 }}>
            <StatCard label="新規取引先" value="24" delta="+6" />
            <StatCard label="遅延請求書" value="7" delta="-3" />
            <StatCard
              label="平均処理コスト"
              value="¥1,180"
              delta="-15%"
              inverse
              hint="低いほど良い"
            />
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            Inline layout (narrow panels)
          </Text>
          <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
            <StatCard layout="inline" label="契約金額" value="¥4,800,000" />
            <StatCard layout="inline" label="消費税" value="¥480,000" hint="10%" />
          </ResponsiveGrid>
        </Flex>

        <Flex direction="col" gap="sm">
          <Text as="div" weight="medium">
            align=&quot;end&quot; · size=&quot;md&quot; · icon label · neutral delta
          </Text>
          <ResponsiveGrid columns={{ sm: 2, md: 4 }}>
            <StatCard align="end" label="当期利益" value="¥3,120,000" delta="+8%" hint="右寄せ" />
            <StatCard
              size="md"
              label="年間売上"
              value="¥98,400,000"
              delta="+11%"
              hint="ゆとりある密度"
            />
            <StatCard
              label={
                <>
                  <TrendingUp aria-hidden />
                  成長率
                </>
              }
              value="14.2%"
              delta="+2.1%"
            />
            <StatCard label="客単価" value="¥6,400" delta="0%" hint="横ばい" />
          </ResponsiveGrid>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
