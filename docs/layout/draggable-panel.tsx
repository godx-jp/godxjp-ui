import { useState } from "react";
import { DraggablePanel, Flex, PageContainer } from "@godxjp/ui/layout";
import type { DraggablePanelPositionProp } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Descriptions,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";

/**
 * DraggablePanel · a floating surface the person using it can MOVE.
 *
 * The case it exists for: an assistant docked to a corner covers the thing the
 * person is asking about. Drag it by the title-bar handle, or focus the handle
 * and use the arrow keys. The position is REPORTED to the page below, never
 * stored by the library.
 */
export default function Demo() {
  const [position, setPosition] = useState<DraggablePanelPositionProp>({ x: 0, y: 0 });
  const [open, setOpen] = useState(true);
  const [pinned, setPinned] = useState(false);

  return (
    <PageContainer
      title="DraggablePanel"
      subtitle="floating movable surface · handle drag, arrow-key nudge, viewport-bounded"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Reported position</CardTitle>
            <CardDescription>
              Drag the panel by its handle, or focus the handle and press an arrow key. Hold Shift
              for the larger step. Every frame and every nudge reports the clamped offset through
              onPositionChange; the page below decides whether to remember it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Descriptions
                items={[
                  { label: "x", value: String(Math.round(position.x)) },
                  { label: "y", value: String(Math.round(position.y)) },
                ]}
              />
              <Flex gap="sm" wrap>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPosition({ x: 0, y: 0 });
                  }}
                >
                  角に戻す
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPinned((value) => !value);
                  }}
                >
                  {pinned ? "移動を許可" : "その場に固定"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  パネルを開く
                </Button>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>What it is not</CardTitle>
            <CardDescription>
              ResizablePanel resizes panes WITHIN a layout, Sheet is pinned to an edge, and Popover
              is anchored to its trigger. None of them can be repositioned by the viewer, which is
              what a floating assistant needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text size="sm" tone="muted">
              The panel is a labelled region, not a dialog: it interrupts nothing, traps no focus
              and dims no page, so the work behind it stays usable while it is open.
            </Text>
          </CardContent>
        </Card>
      </Flex>

      {open ? (
        <DraggablePanel
          title="アシスタント"
          placement="bottom-end"
          width="sm"
          disabled={pinned}
          position={position}
          onPositionChange={setPosition}
          onClose={() => {
            setOpen(false);
          }}
          extra={<Badge tone="info">β</Badge>}
        >
          <Flex direction="col" gap="sm">
            <Text size="sm">
              この請求書の消費税区分について質問できます。テキストは選択できます。掴むのはタイトルバーのハンドルだけです。
            </Text>
            <Text size="xs" tone="muted">
              キーボード: ハンドルにフォーカスして矢印キー · Shift で大きく移動
            </Text>
          </Flex>
        </DraggablePanel>
      ) : null}
    </PageContainer>
  );
}
