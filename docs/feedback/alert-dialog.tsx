import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@godxjp/ui/feedback";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/** Every branch of AlertDialogHeader's `tone`, in the order the vocabulary declares them. */
const headerTones = [
  "default",
  "success",
  "warning",
  "destructive",
  "info",
  "muted",
  "neutral",
] as const;

/**
 * AlertDialog · canonical destructive-confirm modal. NOT a free-form Dialog.
 * Flat prop API: title (required), description, confirmLabel, cancelLabel,
 * variant="destructive", confirmPhrase for high-friction ops, onConfirm async,
 * pending while work is running.
 *
 * AlertDialogRoot is the compound counterpart: same role="alertdialog" semantics,
 * bespoke content. Mirrors DialogRoot, which the flat `Dialog` export wraps.
 */
export default function Demo() {
  const [deleteOpen, setDeleteOpen] = useState(true);
  const [closeOpen, setCloseOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [phraseOpen, setPhraseOpen] = useState(false);
  const [toneOpen, setToneOpen] = useState(false);
  const [headerTone, setHeaderTone] = useState<(typeof headerTones)[number]>("default");

  return (
    <PageContainer
      title="AlertDialog"
      subtitle="destructive confirm modal · delete, void, archive, irreversible actions"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Destructive delete (pre-opened)</CardTitle>
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
            <CardTitle level={2}>Neutral confirm (the other variant branch)</CardTitle>
            <CardDescription>
              variant has two branches. default is the branch for a consequential but reversible
              step: the header band stays neutral and the confirm button keeps the primary style, so
              the dialog reads as a checkpoint rather than a warning. Reach for destructive only
              when the action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" onClick={() => setCloseOpen(true)}>
              月次締めを確定
            </Button>
            <AlertDialog
              open={closeOpen}
              onOpenChange={setCloseOpen}
              title="2026年7月度の月次締めを確定しますか？"
              description="確定後は仕訳の編集が制限されます。管理者はいつでも締めを解除できます。"
              confirmLabel="確定する"
              cancelLabel="あとで"
              variant="default"
              onConfirm={() => setCloseOpen(false)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Void / cancel action</CardTitle>
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
            <CardTitle level={2}>High-friction: confirmPhrase</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle level={2}>Compound composition (AlertDialogRoot)</CardTitle>
            <CardDescription>
              AlertDialogRoot is the compound counterpart of the flat preset above, and the mirror
              of DialogRoot. It supplies the alertdialog context that AlertDialogTitle,
              AlertDialogDescription, AlertDialogAction and AlertDialogCancel read, so a bespoke
              confirmation composes from the public API alone. Structure: AlertDialogRoot &gt;
              AlertDialogTrigger + AlertDialogPortal &gt; AlertDialogOverlay + AlertDialogContent
              &gt; AlertDialogHeader &gt; AlertDialogTitle. Focus trap, focus restoration and the
              modal role=alertdialog semantics stay Radix-owned. Reach for the flat AlertDialog
              first; use the Root only when the confirm body needs content the preset does not
              cover.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialogRoot>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  支払を確定
                </Button>
              </AlertDialogTrigger>
              <AlertDialogPortal>
                <AlertDialogOverlay />
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>2026年7月分の支払を確定しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      確定すると振込データが生成され、取消には管理者の承認が必要になります。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Text size="sm" tone="muted">
                    対象 48 件・合計 12,480,000 円。確定後も明細の閲覧はできます。
                  </Text>
                  <AlertDialogFooter>
                    <AlertDialogCancel>戻る</AlertDialogCancel>
                    <AlertDialogAction>確定する</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogPortal>
            </AlertDialogRoot>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>AlertDialogHeader tone band (every branch)</CardTitle>
            <CardDescription>
              AlertDialogHeader takes the same prop-driven form as DialogHeader: title, subtitle and
              an extra slot, plus tone. tone tints only the header band and leaves the text at the
              foreground colour, so a confirmation never turns into a loud solid fill. default
              paints no band at all; muted and neutral deliberately share the same quiet band. This
              branch matrix only became reachable from the public API once AlertDialogRoot shipped.
              Pick a branch to open the same alertdialog with that header.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" gap="sm" wrap>
                {headerTones.map((tone) => (
                  <Button
                    key={tone}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setHeaderTone(tone);
                      setToneOpen(true);
                    }}
                  >
                    {tone}
                  </Button>
                ))}
              </Flex>
              <AlertDialogRoot open={toneOpen} onOpenChange={setToneOpen}>
                <AlertDialogPortal>
                  <AlertDialogOverlay />
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader
                      tone={headerTone}
                      title="取込結果を確認してください"
                      subtitle={`見出し帯は tone="${headerTone}" で描画しています。`}
                      extra={<Badge tone={headerTone}>{headerTone}</Badge>}
                    />
                    <Text size="sm">
                      帯の色だけが tone
                      に追従し、見出しと本文の文字色は変わりません。取込済みの仕訳は 132 件、保留は
                      4 件です。
                    </Text>
                    <AlertDialogFooter>
                      <AlertDialogCancel>閉じる</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogPortal>
              </AlertDialogRoot>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
