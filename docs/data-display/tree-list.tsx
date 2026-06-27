import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  TreeList,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { FolderTree } from "lucide-react";

/**
 * TreeList — a flat array rendered as an indented hierarchy; depth is data-driven
 * (never nest DOM). active highlights a row (aria-current); badge surfaces a
 * secondary label. Indentation is defined for depth 0-2, so flatten deeper
 * branches before rendering. Composed only from real @godxjp/ui components.
 */
const accounts = [
  { id: "1000", title: "資産", depth: 0, badge: "親科目" },
  { id: "1100", title: "流動資産", depth: 1, description: "1年以内に現金化" },
  {
    id: "1110",
    title: "現金及び預金",
    description: "普通・当座・小口",
    depth: 2,
    badge: "3 口座",
    active: true,
  },
  {
    id: "1120",
    title: "売掛金",
    description: "得意先への未回収債権",
    depth: 2,
    badge: (
      <Badge variant="outline" tone="warning">
        要確認
      </Badge>
    ),
  },
  { id: "2000", title: "負債", depth: 0, badge: "親科目" },
  { id: "2100", title: "流動負債", depth: 1, description: "1年以内に支払" },
  { id: "2110", title: "買掛金", depth: 2, badge: "12 件" },
];

// Independent data: active is allowed on any depth, including a top-level parent.
const departments = [
  { id: "d0", title: "本社", depth: 0, active: true, badge: "選択中" },
  { id: "d1", title: "営業部", depth: 1, description: "首都圏・関西" },
  { id: "d2", title: "開発部", depth: 1, description: "プロダクト・基盤" },
];

export default function Demo() {
  return (
    <PageContainer
      title="TreeList"
      subtitle="Hierarchical list · depth lives in the data, not the DOM"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>勘定科目ツリー</CardTitle>
            <CardDescription>
              Pre-filter server-side; each item still carries its depth (0-2).
              An active leaf carries aria-current; badges accept a string or a
              nested Badge node.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreeList items={accounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>組織ツリー（親を選択中）</CardTitle>
            <CardDescription>
              active is data-driven and works at any depth. Here the depth-0
              parent is the current row.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreeList items={departments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>空の状態</CardTitle>
            <CardDescription>
              An empty items={"{[]}"} array renders an empty list. Pair it with
              an EmptyState placeholder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TreeList items={[]} />
            <EmptyState
              icon={FolderTree}
              title="科目がありません"
              description="フィルター条件に一致する勘定科目が見つかりませんでした。"
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
