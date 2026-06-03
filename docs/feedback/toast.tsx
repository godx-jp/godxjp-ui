import { Toaster } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { toast } from "sonner";

/**
 * Toast (Toaster + sonner) — transient ephemeral feedback. Mount ONE <Toaster>
 * at app root. Fire via `import { toast } from "sonner"` — NOT from
 * @godxjp/ui. Never import a toast helper from @godxjp/ui/feedback.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Toast"
      subtitle="Toaster (mount once at root) + toast() from sonner — fire-and-forget ephemeral feedback"
    >
      {/* Mount Toaster once — in a real app this lives in the root layout */}
      <Toaster richColors />

      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Toast variants</CardTitle>
            <CardDescription>
              Import toast from sonner (not @godxjp/ui). success / error / warning / info for the
              four semantic variants. Toasts auto-dismiss — use Alert for persistent messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap gap="md">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("仕訳を保存しました")}
              >
                success
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.error("保存に失敗しました — 再度お試しください")}
              >
                error
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.warning("セッションの有効期限が近づいています")}
              >
                warning
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("エクスポートを開始しました")}
              >
                info
              </Button>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soft destructive with undo action</CardTitle>
            <CardDescription>
              After a delete, surface an undo action via the toast action option. The user can
              recover without a confirmation modal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                toast("請求書 #INV-2024-0042 を削除しました", {
                  action: {
                    label: "元に戻す",
                    onClick: () => toast.info("削除を取り消しました"),
                  },
                })
              }
            >
              請求書を削除
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promise toast (loading → success/error)</CardTitle>
            <CardDescription>
              toast.promise() tracks an async operation automatically — shows a loading state then
              resolves to success or error. Ideal for background exports or bulk imports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                toast.promise(new Promise<void>((r) => setTimeout(r, 2000)), {
                  loading: "CSV をエクスポート中...",
                  success: "エクスポートが完了しました",
                  error: "エクスポートに失敗しました",
                })
              }
            >
              CSV エクスポート
            </Button>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
