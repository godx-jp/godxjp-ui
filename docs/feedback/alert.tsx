import { Alert, AlertActions, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Alert · inline persistent banner for page-scoped feedback (errors, warnings,
 * success, info). NOT for transient toasts. Compose AlertTitle +
 * AlertDescription inside; add AlertActions for CTA buttons. Pass onDismiss to
 * show the built-in × button.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Alert"
      subtitle="variant × dismiss × actions · persistent inline banner (never use for transient feedback)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Variants / tones</CardTitle>
            <CardDescription>
              default (info), warning, destructive, success · each sets icon and colour scheme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Alert variant="default">
                <AlertTitle>勘定科目マスタを更新しました</AlertTitle>
                <AlertDescription>変更内容は次回の仕訳入力から反映されます。</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTitle>3 件の打刻漏れがあります</AlertTitle>
                <AlertDescription>本日中に確認してください。</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertTitle>請求書の保存に失敗しました</AlertTitle>
                <AlertDescription>
                  サーバーエラーが発生しました。内容を確認のうえ再度お試しください。
                </AlertDescription>
              </Alert>
              <Alert variant="success">
                <AlertTitle>インポートが完了しました</AlertTitle>
                <AlertDescription>1,240 件の仕訳を取り込みました。</AlertDescription>
              </Alert>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AlertTitle + AlertDescription + AlertActions</CardTitle>
            <CardDescription>
              Wrap text in AlertTitle / AlertDescription; put CTA Buttons in AlertActions (renders
              in the action slot). Never place raw buttons as top-level Alert children.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="warning">
              <AlertTitle>MF 連携トークンの有効期限が近づいています</AlertTitle>
              <AlertDescription>
                7 日以内にトークンが失効します。今すぐ再連携してください。
              </AlertDescription>
              <AlertActions>
                <Button size="sm">再連携する</Button>
              </AlertActions>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dismissible banner</CardTitle>
            <CardDescription>
              Pass onDismiss: the component renders an accessible × button automatically. Never
              hand-roll your own dismiss button.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert
              variant="destructive"
              onDismiss={() => {
                /* set session flag */
              }}
            >
              <AlertTitle>請求が未払いです</AlertTitle>
              <AlertDescription>
                期日を過ぎた請求書が 2 件あります。早急にご確認ください。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
