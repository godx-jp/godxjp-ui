import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  TreeList,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * TreeList — a flat array rendered as an indented hierarchy; depth is data-driven
 * (never nest DOM). active highlights a row; badge surfaces a secondary label.
 * Composed only from real @godxjp/ui components.
 */
const accounts = [
  { id: "1000", title: "資産", depth: 0 },
  { id: "1100", title: "流動資産", depth: 1 },
  {
    id: "1110",
    title: "現金及び預金",
    description: "普通・当座・小口",
    depth: 2,
    badge: "3 口座",
    active: true,
  },
  { id: "1120", title: "売掛金", depth: 2 },
  { id: "2000", title: "負債", depth: 0 },
  { id: "2100", title: "流動負債", depth: 1 },
  { id: "2110", title: "買掛金", depth: 2 },
];

export default function Demo() {
  return (
    <PageContainer
      title="TreeList"
      subtitle="Hierarchical list — depth lives in the data, not the DOM"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>勘定科目ツリー</CardTitle>
            <CardDescription>
              Pre-filter server-side; each item still carries its depth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreeList items={accounts} />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
