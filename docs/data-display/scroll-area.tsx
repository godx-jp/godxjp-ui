import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ScrollArea,
  ScrollBar,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * ScrollArea — custom scrollbar container. ALWAYS set an explicit height/max-height
 * (vertical) or width (horizontal) on the wrapper or the scrollbar never appears.
 * `type` controls when the bar is visible; `ScrollBar orientation="horizontal"`
 * adds a horizontal bar. Composed only from real @godxjp/ui components.
 */
const entries = Array.from(
  { length: 18 },
  (_, i) => `仕訳 #2024-${String(312 - i).padStart(4, "0")}`,
);

const shortEntries = entries.slice(0, 3);

const columns = [
  "勘定科目",
  "借方",
  "貸方",
  "摘要",
  "部門",
  "プロジェクト",
  "取引先",
  "登録者",
  "承認者",
];

export default function Demo() {
  return (
    <PageContainer
      title="ScrollArea"
      subtitle="Custom scrollbar container · needs an explicit height"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>固定高さのリスト（縦スクロール）</CardTitle>
            <CardDescription>
              ラッパーに h-56 を指定すると、その高さがスクロール領域のビューポートになります。
            </CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>type=&quot;always&quot;（バーを常時表示）</CardTitle>
            <CardDescription>
              既定の hover はホバー時のみバーを表示します。always は内容が溢れる限りバーを常に表示します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea
              type="always"
              className="border-border h-56 w-full rounded-md border"
            >
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

        <Card>
          <CardHeader>
            <CardTitle>横スクロール（ScrollBar orientation=&quot;horizontal&quot;）</CardTitle>
            <CardDescription>
              横方向のバーは明示的に ScrollBar を子要素として配置します。中身は幅を指定して溢れさせます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="border-border w-full rounded-md border">
              <Flex gap="lg" className="w-max p-3">
                {columns.map((c) => (
                  <div
                    key={c}
                    className="text-sm whitespace-nowrap tabular-nums"
                  >
                    {c}
                  </div>
                ))}
              </Flex>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>内容が収まる場合（バー非表示）</CardTitle>
            <CardDescription>
              中身が高さに収まるときはスクロールバーは表示されません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea
              type="always"
              className="border-border h-56 w-full rounded-md border"
            >
              <Flex direction="col" gap="xs" className="p-3">
                {shortEntries.map((e) => (
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
