import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { SlidersHorizontal } from "lucide-react";

/**
 * Drawer — bottom-sheet (vaul). Draggable, slides up from screen edge. DISTINCT
 * from Sheet (side panel). Compose Drawer > DrawerTrigger > DrawerContent >
 * DrawerHeader > DrawerTitle (a11y required) > body > DrawerFooter.
 */
export default function Demo() {
  const [filterOpen, setFilterOpen] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageContainer
      title="Drawer"
      subtitle="bottom-sheet (vaul) — mobile/touch action sheet, filter panel, quick-create form"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Mobile filter bottom sheet (pre-opened)</CardTitle>
            <CardDescription>
              Drawer slides up from the bottom edge — not a side panel (that{"'"}s Sheet). Use for
              mobile/touch surfaces. shouldScaleBackground=true gives the iOS-style scale effect.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Drawer open={filterOpen} onOpenChange={setFilterOpen} shouldScaleBackground>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal />
                  絞り込み
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>経費フィルター</DrawerTitle>
                </DrawerHeader>
                <Flex direction="col" gap="md" className="px-4 py-2">
                  <Flex direction="col" gap="xs">
                    <span className="text-sm font-medium">費目</span>
                    <span className="border-border text-muted-foreground rounded-md border px-3 py-2 text-sm">
                      すべて
                    </span>
                  </Flex>
                  <Flex direction="col" gap="xs">
                    <span className="text-sm font-medium">申請日</span>
                    <span className="border-border text-muted-foreground rounded-md border px-3 py-2 text-sm">
                      2024年4月 〜 2025年3月
                    </span>
                  </Flex>
                </Flex>
                <DrawerFooter>
                  <Button onClick={() => setFilterOpen(false)}>適用</Button>
                  <Button variant="outline" onClick={() => setFilterOpen(false)}>
                    リセット
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick-create form (bottom sheet)</CardTitle>
            <CardDescription>
              Touch-friendly form for creating records on mobile. DrawerFooter holds primary and
              cancel actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Drawer open={createOpen} onOpenChange={setCreateOpen}>
              <DrawerTrigger asChild>
                <Button size="sm">経費を申請</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>経費申請</DrawerTitle>
                </DrawerHeader>
                <Flex direction="col" gap="md" className="px-4 py-2">
                  <Flex direction="col" gap="xs">
                    <span className="text-sm font-medium">費目</span>
                    <span className="border-border text-muted-foreground rounded-md border px-3 py-2 text-sm">
                      交通費
                    </span>
                  </Flex>
                  <Flex direction="col" gap="xs">
                    <span className="text-sm font-medium">金額</span>
                    <span className="border-border rounded-md border px-3 py-2 text-sm">
                      ¥ 2,400
                    </span>
                  </Flex>
                </Flex>
                <DrawerFooter>
                  <Button onClick={() => setCreateOpen(false)}>申請する</Button>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    キャンセル
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
