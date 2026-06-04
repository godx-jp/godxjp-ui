import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Progress — horizontal 0–100 bar with an optional label and a semantic tone.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Progress" subtitle="0–100 bar — optional label + semantic tone">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Tones</CardTitle>
            <CardDescription>
              Tone carries meaning — success / info / warning / destructive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Progress value={72} tone="success" label="処理スループット" />
              <Progress value={48} tone="info" label="目標達成率" />
              <Progress value={28} tone="warning" label="SLA 超過リスク" />
              <Progress value={88} tone="destructive" label="ディスク使用量" />
              <Progress value={60} label="（tone 指定なし）" />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
