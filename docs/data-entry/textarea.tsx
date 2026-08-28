import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Textarea } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Textarea — styled wrapper around the native textarea. Pair with FormField for
 * a labelled field. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Textarea"
      subtitle="Multi-line text · pair with FormField for label / helper"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>States</CardTitle>
            <CardDescription>Placeholder, filled, and disabled.</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Textarea aria-label="プレースホルダー状態" placeholder="摘要を入力..." />
              <Textarea aria-label="入力済み状態" defaultValue={"4月分 受注\nINV-2024-0312"} />
              <Textarea aria-label="無効状態" disabled defaultValue="無効 (disabled)" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Embedded in a surface · variant="ghost"</CardTitle>
            <CardDescription>
              The Card already draws the box, so the field must not draw a second one. Focus moves
              to the surface via focus-within.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Card className="focus-within:ring-ring/50 overflow-hidden focus-within:ring-2">
                <CardContent flush>
                  <Textarea
                    variant="ghost"
                    className="resize-none"
                    rows={2}
                    aria-label="サーフェス内のテキストエリア"
                    placeholder="メッセージを入力..."
                  />
                  <Flex direction="row" justify="end" className="px-2 pb-2">
                    <Button size="sm">送信</Button>
                  </Flex>
                </CardContent>
              </Card>
              <Textarea
                variant="default"
                rows={2}
                aria-label="単独のテキストエリア"
                defaultValue='variant="default" — 単独のフィールドは自分で枠を描く'
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>In FormField</CardTitle>
            <CardDescription>Labelled with a helper hint.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="memo" label="摘要" helper="仕訳に表示される説明文です">
              <Textarea id="memo" placeholder="例: 4月分 受注 INV-2024-0312" />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
