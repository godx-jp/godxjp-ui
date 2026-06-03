import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex } from "@godxjp/ui/layout";
import { Trash2 } from "lucide-react";

/**
 * Destructive confirmation — the irreversible action uses variant="destructive",
 * the cancel uses variant="outline". Never make a delete the default (primary).
 */
export default function Demo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>仕訳の削除</CardTitle>
        <CardDescription>
          この操作は取り消せません。仕訳 #2024-0312 を完全に削除します。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Flex direction="row" wrap justify="end" gap="sm">
          <Button variant="outline" type="button">
            キャンセル
          </Button>
          <Button variant="destructive">
            <Trash2 />
            削除する
          </Button>
        </Flex>
      </CardContent>
    </Card>
  );
}
