import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * ScrollArea — custom scrollbar container. ALWAYS set an explicit height/max-height
 * on the wrapper or the scrollbar never appears. Composed only from real
 * @godxjp/ui components.
 */
const entries = Array.from(
  { length: 18 },
  (_, i) => `仕訳 #2024-${String(312 - i).padStart(4, "0")}`,
);

export default function Demo() {
  return (
    <PageContainer
      title="ScrollArea"
      subtitle="Custom scrollbar container — needs an explicit height"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>固定高さのリスト</CardTitle>
            <CardDescription>The h-56 below gives the scroll area its viewport.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="border-border h-56 w-full rounded-md border">
              <Flex direction="col" gap="xs" className="p-3">
                {entries.map((e) => (
                  <div key={e} className="text-sm tabular-nums">
                    {e}
                  </div>
                ))}
              </Flex>
            </ScrollArea>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
