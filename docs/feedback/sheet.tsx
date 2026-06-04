import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { SlidersHorizontal } from "lucide-react";

/**
 * Sheet — side-panel drawer (Radix Dialog). Slides in from an edge. Compose
 * Sheet > SheetTrigger (asChild) > SheetContent(side) > SheetHeader >
 * SheetTitle (a11y required) > body > SheetFooter. Actions go in SheetFooter.
 */
export default function Demo() {
  const [filterOpen, setFilterOpen] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <PageContainer
      title="Sheet"
      subtitle="side-panel drawer — filters, quick-edit, detail peek (NOT a Dialog replacement)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Filter panel (pre-opened, side=right)</CardTitle>
            <CardDescription>
              SheetTrigger asChild wraps a Button. SheetTitle is required for a11y. SheetFooter
              sticks to the panel bottom via mt-auto — never float buttons in the body.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal />
                  絞り込み
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>仕訳フィルター</SheetTitle>
                </SheetHeader>
                <Flex direction="col" gap="md" className="mt-4">
                  <Flex direction="col" gap="xs">
                    <span className="text-sm font-medium">勘定科目</span>
                    <span className="border-border text-muted-foreground rounded-md border px-3 py-2 text-sm">
                      すべて
                    </span>
                  </Flex>
                  <Flex direction="col" gap="xs">
                    <span className="text-sm font-medium">計上期間</span>
                    <span className="border-border text-muted-foreground rounded-md border px-3 py-2 text-sm">
                      2024年4月 〜 2025年3月
                    </span>
                  </Flex>
                  <Flex direction="col" gap="xs">
                    <span className="text-sm font-medium">ステータス</span>
                    <span className="border-border text-muted-foreground rounded-md border px-3 py-2 text-sm">
                      承認済み
                    </span>
                  </Flex>
                </Flex>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setFilterOpen(false)}>
                    リセット
                  </Button>
                  <Button onClick={() => setFilterOpen(false)}>適用</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick-edit drawer (side=right)</CardTitle>
            <CardDescription>
              Open an entity{"'"}s fields without navigating away. Save / Cancel in SheetFooter.
              Close programmatically on submit success.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  取引先を編集
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>取引先編集 — 株式会社サンプル</SheetTitle>
                </SheetHeader>
                <Flex direction="col" gap="md" className="mt-4">
                  <Flex direction="col" gap="xs">
                    <span className="text-sm font-medium">会社名</span>
                    <span className="border-border rounded-md border px-3 py-2 text-sm">
                      株式会社サンプル
                    </span>
                  </Flex>
                  <Flex direction="col" gap="xs">
                    <span className="text-sm font-medium">登録番号</span>
                    <span className="border-border rounded-md border px-3 py-2 text-sm">
                      T1234567890123
                    </span>
                  </Flex>
                </Flex>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setEditOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={() => setEditOpen(false)}>保存</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
