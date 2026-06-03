import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Timeline,
  type TimelineItem,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Timeline — vertical event list with an icon rail; the current item gets a
 * highlighted glyph. Composed only from real @godxjp/ui components.
 */
const items: TimelineItem[] = [
  { title: "承認待ち", location: "経理 田中", time: "10:24", current: true },
  { title: "仕訳を作成", location: "システム", time: "10:20" },
  { title: "請求書を発行", location: "営業 グエン", time: "09:50" },
  { title: "受注を登録", location: "営業 グエン", time: "09:30" },
];

export default function Demo() {
  return (
    <PageContainer title="Timeline" subtitle="Vertical event list — the current item is highlighted">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>承認フロー</CardTitle>
            <CardDescription>Pass an items array; mark the active step with current: true.</CardDescription>
          </CardHeader>
          <CardContent>
            <Timeline items={items} />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
