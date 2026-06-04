import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@godxjp/ui/data-display";
import { Checkbox, FormField, Input, Label } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Info, SlidersHorizontal } from "lucide-react";

/**
 * Popover — floating panel anchored to a trigger. Always compose
 * PopoverTrigger + PopoverContent; never a raw div overlay. Composed only from
 * real @godxjp/ui components.
 */
export default function Demo() {
  // Card 1 — controlled filter panel: open/onOpenChange drive the panel, and
  // 適用 closes it. Staged defaultOpen via initial state so the open panel is
  // visible at rest in a static screenshot.
  const [filterOpen, setFilterOpen] = useState(true);

  return (
    <PageContainer title="Popover" subtitle="Floating panel anchored to a trigger — click to open">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Controlled trigger + content</CardTitle>
            <CardDescription>
              Common for compact filter / settings panels off a button. Controlled via
              open / onOpenChange so 適用 closes the panel. Shown open at rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal />
                  絞り込み
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Flex direction="col" gap="md">
                  <FormField id="min" label="最小金額">
                    <Input id="min" type="number" placeholder="0" />
                  </FormField>
                  <Flex direction="row" wrap align="center" gap="xs">
                    <Checkbox id="unpaid" />
                    <Label htmlFor="unpaid">未払いのみ</Label>
                  </Flex>
                  <Button size="sm" onClick={() => setFilterOpen(false)}>
                    適用
                  </Button>
                </Flex>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Header / title / description slots</CardTitle>
            <CardDescription>
              The titled info-panel pattern: PopoverHeader › PopoverTitle + PopoverDescription,
              then body. Shown open at rest via defaultOpen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Popover defaultOpen>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Info />
                  保険料の内訳
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Flex direction="col" gap="md">
                  <PopoverHeader>
                    <PopoverTitle>保険料の内訳</PopoverTitle>
                    <PopoverDescription>
                      健康保険・厚生年金・雇用保険の控除額を表示します。
                    </PopoverDescription>
                  </PopoverHeader>
                  <Flex direction="col" gap="xs">
                    <Flex direction="row" justify="between">
                      <span>健康保険</span>
                      <span>¥12,400</span>
                    </Flex>
                    <Flex direction="row" justify="between">
                      <span>厚生年金</span>
                      <span>¥22,800</span>
                    </Flex>
                  </Flex>
                </Flex>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Placement — side</CardTitle>
            <CardDescription>
              PopoverContent accepts side: top / right / bottom (default) / left, with sideOffset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap gap="sm">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">side=top</Button>
                </PopoverTrigger>
                <PopoverContent side="top">
                  <PopoverDescription>上に開きます。</PopoverDescription>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">side=right</Button>
                </PopoverTrigger>
                <PopoverContent side="right">
                  <PopoverDescription>右に開きます。</PopoverDescription>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">side=bottom</Button>
                </PopoverTrigger>
                <PopoverContent side="bottom">
                  <PopoverDescription>下に開きます（既定）。</PopoverDescription>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">side=left</Button>
                </PopoverTrigger>
                <PopoverContent side="left">
                  <PopoverDescription>左に開きます。</PopoverDescription>
                </PopoverContent>
              </Popover>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alignment — align</CardTitle>
            <CardDescription>
              align: start / center (default) / end positions the panel along the trigger edge.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap gap="sm">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">align=start</Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                  <PopoverDescription>開始端に揃えます。</PopoverDescription>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">align=center</Button>
                </PopoverTrigger>
                <PopoverContent align="center">
                  <PopoverDescription>中央に揃えます（既定）。</PopoverDescription>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">align=end</Button>
                </PopoverTrigger>
                <PopoverContent align="end">
                  <PopoverDescription>終了端に揃えます。</PopoverDescription>
                </PopoverContent>
              </Popover>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modal</CardTitle>
            <CardDescription>
              modal traps focus and blocks outside interaction while open. Shown open at rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Popover modal defaultOpen>
              <PopoverTrigger asChild>
                <Button variant="outline">確認が必要</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Flex direction="col" gap="md">
                  <PopoverHeader>
                    <PopoverTitle>下書きを削除しますか？</PopoverTitle>
                    <PopoverDescription>
                      この操作は取り消せません。
                    </PopoverDescription>
                  </PopoverHeader>
                  <Flex direction="row" justify="end" gap="xs">
                    <Button variant="outline" size="sm">
                      キャンセル
                    </Button>
                    <Button variant="destructive" size="sm">
                      削除
                    </Button>
                  </Flex>
                </Flex>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
