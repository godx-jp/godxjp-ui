import { Card, CardContent } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex } from "@godxjp/ui/layout";
import { Copy, Download, Pencil, Plus, Trash2 } from "lucide-react";

/**
 * List-page toolbar — a primary action + secondary outline, then ghost icon-only
 * buttons for per-row/utility actions. Icon-only buttons use the square icon-* sizes.
 */
export default function Demo() {
  return (
    <Card>
      <CardContent>
        <Flex direction="row" wrap align="center" justify="between" gap="md">
          <div className="text-sm font-medium">請求書 一覧</div>
          <Flex direction="row" wrap align="center" gap="sm">
            <Button variant="outline" size="sm">
              <Download />
              エクスポート
            </Button>
            <Button size="sm">
              <Plus />
              新規請求書
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="編集">
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="複製">
              <Copy />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="削除">
              <Trash2 />
            </Button>
          </Flex>
        </Flex>
      </CardContent>
    </Card>
  );
}
