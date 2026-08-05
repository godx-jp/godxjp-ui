import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CredentialReveal,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@godxjp/ui/feedback";

const API_KEY = "gxp_live_8Fh2kQ9wR7nZ1xV4bT6mL0cD3pS5yJ";
const CLIENT_SECRET = "cs_9aE2rT4uY6iO8pA1sD3fG5hJ7kL9zX";

/**
 * CredentialReveal — the one-time secret pattern (device credential / API key / service-account
 * secret). Masked by default, a show/hide toggle, a copy button that confirms the copy, an optional
 * download, and an acknowledge action to pair with a Dialog. Composed only from real @godxjp/ui.
 */
export default function Demo() {
  const [open, setOpen] = React.useState(false);

  return (
    <PageContainer
      title="CredentialReveal"
      subtitle="一度だけ表示するシークレット · マスク解除 + コピー + 期限警告"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Dialog に組み込む（推奨）</CardTitle>
            <CardDescription>
              APIキー発行直後の一度きり表示。onAcknowledge で「保存しました」を押すまで閉じません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setOpen(true)}>APIキーを発行</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>APIキーを発行しました</DialogTitle>
                  <DialogDescription>
                    このキーはこの画面でのみ表示されます。安全な場所に保管してください。
                  </DialogDescription>
                </DialogHeader>
                <CredentialReveal
                  label="APIキー"
                  secret={API_KEY}
                  downloadable
                  onAcknowledge={() => setOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>インライン（マスク解除 + コピー）</CardTitle>
            <CardDescription>
              既定はマスク表示。目のトグルで表示、コピーボタンは成功を aria-live で通知します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CredentialReveal label="クライアントシークレット" secret={CLIENT_SECRET} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ダウンロード付き</CardTitle>
            <CardDescription>
              downloadable でファイル保存を提供。復旧コードやブートストラップ資格情報向け。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CredentialReveal
              label="リカバリーコード"
              secret="8QF2-K9WR-7NZ1-XV4B-T6ML"
              downloadable
              downloadFileName="recovery-code.txt"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Tone</CardTitle>
            <CardDescription>
              警告帯の severity は tone。warning（既定）は保管を促す通常の一度きり表示、destructive
              は失効・再発行が必要な重大な扱い、info は運用上の補足に使います。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <CredentialReveal
                label="サービスアカウント鍵"
                secret="svc_3pS5yJ8Fh2kQ9wR7nZ1xV4bT"
                tone="warning"
              />
              <CredentialReveal
                label="デバイス資格情報"
                secret="dev_7h2K9wR7nZ1xV4bT6mL0cD"
                tone="destructive"
              />
              <CredentialReveal
                label="Webhook 署名シークレット"
                secret="whsec_1xV4bT6mL0cD3pS5yJ8Fh2kQ"
                tone="info"
                warning="このシークレットは Webhook 署名の検証にのみ使用します。"
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Size</CardTitle>
            <CardDescription>
              size は資格情報行の高さと操作ボタンの寸法を決めます。xs / sm
              は明細行や設定表の中に、md （既定）は単独のカードに、lg
              は発行直後のダイアログで使います。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <CredentialReveal label="xs" secret="key_xs_9wR7nZ1xV4bT6mL0cD" size="xs" />
              <CredentialReveal label="sm" secret="key_sm_9wR7nZ1xV4bT6mL0cD" size="sm" />
              <CredentialReveal label="md（既定）" secret="key_md_9wR7nZ1xV4bT6mL0cD" size="md" />
              <CredentialReveal label="lg" secret="key_lg_9wR7nZ1xV4bT6mL0cD" size="lg" />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
