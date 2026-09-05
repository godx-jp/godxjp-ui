import { Button } from "@godxjp/ui/general";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { AccountChip, Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * AccountChip — the signed-in user in a PageContainer `extra` slot, a Topbar or a footer row.
 * Avatar, name and one ghost action at the control tier height, level with the controls beside it.
 */
export default function Demo() {
  return (
    <PageContainer
      title="AccountChip"
      subtitle="サインイン中のユーザー（アバター・名前・1 アクション）"
      extra={
        <>
          <Select defaultValue="ja">
            <SelectTrigger width="auto" aria-label="言語">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">履歴</Button>
          <AccountChip
            name="Satoshi"
            email="satoshi@example.com"
            actionLabel="サインアウト"
            onAction={() => {}}
          />
          <Button>送信</Button>
        </>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle level={2}>ヘッダー行の中で</CardTitle>
          <CardDescription>
            上の `extra` スロット: Select（width=&quot;auto&quot;）、Button、AccountChip、Button
            がすべて同じ --control-height に揃います。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction="col" gap="md">
            <AccountChip name="Nguyễn Thị Thu Hà" email="thuha@example.com" />
            <AccountChip
              name="Satoshi"
              avatarSrc="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect width='32' height='32' fill='%23334155'/></svg>"
              actionLabel="Sign out"
              onAction={() => {}}
            />
            <AccountChip
              name="Disabled action"
              actionLabel="Sign out"
              onAction={() => {}}
              disabled
            />
          </Flex>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
