import { useState } from "react";
import { AlertDialog } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * AlertDialog · canonical destructive-confirm modal. NOT a free-form Dialog.
 * Flat prop API: title (required), description, confirmLabel, cancelLabel,
 * variant="destructive", confirmPhrase for high-friction ops, onConfirm async,
 * pending while work is running.
 */
export default function Demo() {
  const [deleteOpen, setDeleteOpen] = useState(true);
  const [voidOpen, setVoidOpen] = useState(false);
  const [phraseOpen, setPhraseOpen] = useState(false);

  return (
    <PageContainer
      title="AlertDialog"
      subtitle="destructive confirm modal · delete, void, archive, irreversible actions"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Destructive delete (pre-opened)</CardTitle>
            <CardDescription>
              Flat prop API: title (required) + description + confirmLabel + variant. onConfirm may
              be async; the dialog stays open until it resolves. Never use Dialog for destructive
              confirms.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" align="center">
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                請求書を削除
              </Button>
            </Flex>
            <AlertDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              title="請求書 #INV-2024-0188 を削除しますか？"
              description="この操作は元に戻せません。関連する仕訳データもすべて削除されます。"
              confirmLabel="削除する"
              cancelLabel="キャンセル"
              variant="destructive"
              onConfirm={async () => {
                await new Promise<void>((r) => setTimeout(r, 800));
                setDeleteOpen(false);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Void / cancel action</CardTitle>
            <CardDescription>
              Same pattern for voiding an invoice or cancelling a batch job: destructive variant
              with a clear confirmLabel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => setVoidOpen(true)}>
              請求書を取消
            </Button>
            <AlertDialog
              open={voidOpen}
              onOpenChange={setVoidOpen}
              title="請求書 #INV-2024-0099 を取り消しますか？"
              description="取消後は再発行が必要になります。"
              confirmLabel="取消する"
              cancelLabel="戻る"
              variant="destructive"
              onConfirm={() => setVoidOpen(false)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High-friction: confirmPhrase</CardTitle>
            <CardDescription>
              Pass confirmPhrase to require the user to type a specific string before the confirm
              button activates. Use for truly irreversible bulk operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={() => setPhraseOpen(true)}>
              全データを削除
            </Button>
            <AlertDialog
              open={phraseOpen}
              onOpenChange={setPhraseOpen}
              title="すべてのデータを完全に削除しますか？"
              description={'確認のため下のボックスに "DELETE" と入力してください。'}
              confirmLabel="完全に削除する"
              cancelLabel="キャンセル"
              variant="destructive"
              confirmPhrase="DELETE"
              onConfirm={() => setPhraseOpen(false)}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
