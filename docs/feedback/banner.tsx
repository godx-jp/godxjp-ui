import { useState } from "react";
import { Alert } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Alert variant="banner" · full-bleed page/shell attention strip — the Alert
 * primitive with the structural axis fixed to variant="banner". Persistent,
 * page/shell-scoped, at most one per surface. tone owns colour + icon +
 * live-region politeness; onDismiss renders the built-in dismiss (last in focus
 * order); actions wrap onto their own full-width line below the 640px step so a
 * 390px viewport wraps instead of clipping.
 */
export default function Demo() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <PageContainer
      title="Alert · banner"
      subtitle="tone × actions × dismiss · full-bleed attention strip (the inline-card presentation is Alert)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Canonical shell notices · every tone</CardTitle>
            <CardDescription>
              The strip runs edge-to-edge with square corners and a single tone-coloured hairline on
              the block-end edge. Geometry is owned by the --banner-* tokens, never consumer CSS.
              destructive and warning announce assertively (role=alert); the rest politely
              (role=status).
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Flex direction="col" gap="md">
              <Alert variant="banner" tone="warning">
                <Alert.Content>
                  <Alert.Title>お支払いが確認できていません</Alert.Title>
                  <Alert.Description>
                    サービスの停止を避けるため、お支払い方法を更新してください。
                  </Alert.Description>
                </Alert.Content>
                <Alert.Actions>
                  <Button size="sm" variant="outline">
                    お支払い方法を更新
                  </Button>
                </Alert.Actions>
              </Alert>
              <Alert variant="banner" tone="info">
                <Alert.Content>
                  <Alert.Title>サポートセッションが進行中です</Alert.Title>
                  <Alert.Description>
                    担当者（田中）がお客様の組織を閲覧しています。
                  </Alert.Description>
                </Alert.Content>
                <Alert.Actions>
                  <Button size="sm" variant="outline">
                    セッションを終了
                  </Button>
                </Alert.Actions>
              </Alert>
              <Alert variant="banner" tone="destructive">
                <Alert.Title>一部のサービスで障害が発生しています</Alert.Title>
                <Alert.Description>復旧状況はステータスページをご確認ください。</Alert.Description>
              </Alert>
              <Alert variant="banner" tone="success">
                <Alert.Title>お支払いを確認しました</Alert.Title>
                <Alert.Description>すべての機能が再び利用可能になりました。</Alert.Description>
              </Alert>
              <Alert variant="banner" tone="neutral">
                <Alert.Title>8月24日 02:00〜04:00 に定期メンテナンスを行います</Alert.Title>
                <Alert.Description>作業中は一部の操作が制限されます。</Alert.Description>
              </Alert>
              <Alert variant="banner" tone="muted">
                <Alert.Title>この組織はアーカイブ済みです</Alert.Title>
                <Alert.Description>閲覧のみ可能で、変更はできません。</Alert.Description>
              </Alert>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Dismissible · built-in control, focus order</CardTitle>
            <CardDescription>
              onDismiss renders the localized dismiss button pinned top/inline-end and LAST in DOM
              order: keyboard focus reaches content, then actions, then dismiss. Never hand-roll an
              × inside Alert.Actions.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            {dismissed ? (
              <Alert variant="banner" tone="default" icon={false}>
                <Alert.Content>
                  <Alert.Title>通知を閉じました</Alert.Title>
                  <Alert.Description>このデモでは再表示できます。</Alert.Description>
                </Alert.Content>
                <Alert.Actions>
                  <Button size="sm" variant="outline" onClick={() => setDismissed(false)}>
                    通知を再表示
                  </Button>
                </Alert.Actions>
              </Alert>
            ) : (
              <Alert variant="banner" tone="neutral" onDismiss={() => setDismissed(true)}>
                <Alert.Title>新しい管理コンソールをお試しいただけます</Alert.Title>
                <Alert.Description>設定画面からいつでも元の表示に戻せます。</Alert.Description>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Long JA / EN / VI copy · 390px wrapping</CardTitle>
            <CardDescription>
              The text column wraps inside min-width 0 and actions drop onto their own full-width
              wrapping line below the 640px step. Narrow this frame to 390px: nothing clips, nothing
              overflows horizontally.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Flex direction="col" gap="md">
              <Alert variant="banner" tone="warning">
                <Alert.Content>
                  <Alert.Title>
                    ご契約中のプランのお支払い期限が過ぎています。未払いの状態が続く場合、組織内のすべてのサービスが自動的に停止されます
                  </Alert.Title>
                  <Alert.Description>
                    請求書番号 INV-2026-08-0042
                    のお支払いが確認できていません。お支払い方法の更新、または経理担当者への再送をお願いします。
                  </Alert.Description>
                </Alert.Content>
                <Alert.Actions>
                  <Button size="sm" variant="outline">
                    請求書を再送
                  </Button>
                  <Button size="sm">お支払い方法を更新</Button>
                </Alert.Actions>
              </Alert>
              <Alert variant="banner" tone="info">
                <Alert.Content>
                  <Alert.Title>
                    A scheduled maintenance window will interrupt single sign-on for all connected
                    services this weekend
                  </Alert.Title>
                  <Alert.Description>
                    Between Saturday 22:00 and Sunday 02:00 (JST), sign-in and token refresh will be
                    unavailable. Active sessions continue to work.
                  </Alert.Description>
                </Alert.Content>
                <Alert.Actions>
                  <Button size="sm" variant="outline">
                    View status page
                  </Button>
                </Alert.Actions>
              </Alert>
              <Alert variant="banner" tone="destructive">
                <Alert.Content>
                  <Alert.Title>
                    Phiên hỗ trợ từ xa đang hoạt động. Nhân viên hỗ trợ hiện có thể xem toàn bộ dữ
                    liệu tổ chức của bạn cho đến khi phiên kết thúc
                  </Alert.Title>
                  <Alert.Description>
                    Nếu bạn không yêu cầu phiên hỗ trợ này, hãy kết thúc ngay và đổi mật khẩu quản
                    trị của tổ chức.
                  </Alert.Description>
                </Alert.Content>
                <Alert.Actions>
                  <Button size="sm" variant="outline">
                    Kết thúc phiên
                  </Button>
                </Alert.Actions>
              </Alert>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
