import {
  Alert,
  AlertActions,
  AlertContent,
  AlertDescription,
  AlertQueryError,
  AlertTitle,
} from "@godxjp/ui/feedback";
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
      subtitle="tone × variant × dismiss × actions · persistent inline banner (never use for transient feedback)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Every tone branch · variant</CardTitle>
            <CardDescription>
              All seven tone branches, in order: default, success, warning, destructive, info,
              muted, neutral. Tone sets the icon, the surface and the live-region politeness
              (destructive and warning announce assertively; the rest are polite). default, muted
              and neutral deliberately share the quiet neutral surface, so the caller names intent
              without adding colour. variant is the structural axis and currently has a single
              branch, default, spelled out on the first banner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Alert variant="default" tone="default">
                <AlertTitle>勘定科目マスタを更新しました</AlertTitle>
                <AlertDescription>変更内容は次回の仕訳入力から反映されます。</AlertDescription>
              </Alert>
              <Alert tone="success">
                <AlertTitle>インポートが完了しました</AlertTitle>
                <AlertDescription>1,240 件の仕訳を取り込みました。</AlertDescription>
              </Alert>
              <Alert tone="warning">
                <AlertTitle>3 件の打刻漏れがあります</AlertTitle>
                <AlertDescription>本日中に確認してください。</AlertDescription>
              </Alert>
              <Alert tone="destructive">
                <AlertTitle>請求書の保存に失敗しました</AlertTitle>
                <AlertDescription>
                  サーバーエラーが発生しました。内容を確認のうえ再度お試しください。
                </AlertDescription>
              </Alert>
              <Alert tone="info">
                <AlertTitle>電子帳簿保存法の保存要件が変更されます</AlertTitle>
                <AlertDescription>
                  2026年1月以降に受領した証憑が対象です。保存設定をご確認ください。
                </AlertDescription>
              </Alert>
              <Alert tone="muted">
                <AlertTitle>この請求書は下書きです</AlertTitle>
                <AlertDescription>送信するまで取引先には表示されません。</AlertDescription>
              </Alert>
              <Alert tone="neutral">
                <AlertTitle>8月10日 02:00 から 04:00 まで定期メンテナンスを行います</AlertTitle>
                <AlertDescription>作業中は仕訳の保存ができません。</AlertDescription>
              </Alert>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AlertContent + cause-aware query recovery</CardTitle>
            <CardDescription>
              Content groups copy; transient errors expose an explicit retry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Alert tone="default">
                <AlertContent>
                  <AlertTitle>同期状態</AlertTitle>
                  <AlertDescription>最終同期は 2 分前です。</AlertDescription>
                </AlertContent>
              </Alert>
              <AlertQueryError error={new Error("Service unavailable: 503")} onRetry={() => {}} />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>AlertTitle + AlertDescription + AlertActions</CardTitle>
            <CardDescription>
              Wrap text in AlertTitle / AlertDescription; put CTA Buttons in AlertActions (renders
              in the action slot). Never place raw buttons as top-level Alert children.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert tone="warning">
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
            <CardTitle level={2}>Dismissible banner</CardTitle>
            <CardDescription>
              Pass onDismiss: the component renders an accessible × button automatically. Never
              hand-roll your own dismiss button.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert
              tone="destructive"
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
