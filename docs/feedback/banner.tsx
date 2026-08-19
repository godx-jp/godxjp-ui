import { useState } from "react";
import { Banner } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Banner · full-bleed page/shell attention strip (godxjp-ui#255) — the Alert
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
      title="Banner"
      subtitle="tone × actions × dismiss · full-bleed attention strip (the inline-card presentation is Alert)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Canonical shell notices · every tone</CardTitle>
            <CardDescription>
              The strip runs edge-to-edge with square corners and a single tone-coloured hairline on
              the block-end edge — geometry owned by the --banner-* tokens, never consumer CSS.
              destructive and warning announce assertively (role=alert); the rest politely
              (role=status).
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Flex direction="col" gap="md">
              <Banner tone="warning">
                <Banner.Content>
                  <Banner.Title>お支払いが確認できていません</Banner.Title>
                  <Banner.Description>
                    サービスの停止を避けるため、お支払い方法を更新してください。
                  </Banner.Description>
                </Banner.Content>
                <Banner.Actions>
                  <Button size="sm" variant="outline">
                    お支払い方法を更新
                  </Button>
                </Banner.Actions>
              </Banner>
              <Banner tone="info">
                <Banner.Content>
                  <Banner.Title>サポートセッションが進行中です</Banner.Title>
                  <Banner.Description>
                    担当者（田中）がお客様の組織を閲覧しています。
                  </Banner.Description>
                </Banner.Content>
                <Banner.Actions>
                  <Button size="sm" variant="outline">
                    セッションを終了
                  </Button>
                </Banner.Actions>
              </Banner>
              <Banner tone="destructive">
                <Banner.Title>一部のサービスで障害が発生しています</Banner.Title>
                <Banner.Description>
                  復旧状況はステータスページをご確認ください。
                </Banner.Description>
              </Banner>
              <Banner tone="success">
                <Banner.Title>お支払いを確認しました</Banner.Title>
                <Banner.Description>すべての機能が再び利用可能になりました。</Banner.Description>
              </Banner>
              <Banner tone="neutral">
                <Banner.Title>8月24日 02:00〜04:00 に定期メンテナンスを行います</Banner.Title>
                <Banner.Description>作業中は一部の操作が制限されます。</Banner.Description>
              </Banner>
              <Banner tone="muted">
                <Banner.Title>この組織はアーカイブ済みです</Banner.Title>
                <Banner.Description>閲覧のみ可能で、変更はできません。</Banner.Description>
              </Banner>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Dismissible · built-in control, focus order</CardTitle>
            <CardDescription>
              onDismiss renders the localized dismiss button pinned top/inline-end and LAST in DOM
              order — keyboard focus reaches content, then actions, then dismiss. Never hand-roll an
              × inside Banner.Actions.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            {dismissed ? (
              <Banner tone="default" icon={false}>
                <Banner.Content>
                  <Banner.Title>通知を閉じました</Banner.Title>
                  <Banner.Description>このデモでは再表示できます。</Banner.Description>
                </Banner.Content>
                <Banner.Actions>
                  <Button size="sm" variant="outline" onClick={() => setDismissed(false)}>
                    通知を再表示
                  </Button>
                </Banner.Actions>
              </Banner>
            ) : (
              <Banner tone="neutral" onDismiss={() => setDismissed(true)}>
                <Banner.Title>新しい管理コンソールをお試しいただけます</Banner.Title>
                <Banner.Description>設定画面からいつでも元の表示に戻せます。</Banner.Description>
              </Banner>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Long JA / EN / VI copy · 390px wrapping</CardTitle>
            <CardDescription>
              The text column wraps inside min-width 0 and actions drop onto their own full-width
              wrapping line below the 640px step — narrow this frame to 390px: nothing clips,
              nothing overflows horizontally.
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <Flex direction="col" gap="md">
              <Banner tone="warning">
                <Banner.Content>
                  <Banner.Title>
                    ご契約中のプランのお支払い期限が過ぎています。未払いの状態が続く場合、組織内のすべてのサービスが自動的に停止されます
                  </Banner.Title>
                  <Banner.Description>
                    請求書番号 INV-2026-08-0042
                    のお支払いが確認できていません。お支払い方法の更新、または経理担当者への再送をお願いします。
                  </Banner.Description>
                </Banner.Content>
                <Banner.Actions>
                  <Button size="sm" variant="outline">
                    請求書を再送
                  </Button>
                  <Button size="sm">お支払い方法を更新</Button>
                </Banner.Actions>
              </Banner>
              <Banner tone="info">
                <Banner.Content>
                  <Banner.Title>
                    A scheduled maintenance window will interrupt single sign-on for all connected
                    services this weekend
                  </Banner.Title>
                  <Banner.Description>
                    Between Saturday 22:00 and Sunday 02:00 (JST), sign-in and token refresh will be
                    unavailable. Active sessions continue to work.
                  </Banner.Description>
                </Banner.Content>
                <Banner.Actions>
                  <Button size="sm" variant="outline">
                    View status page
                  </Button>
                </Banner.Actions>
              </Banner>
              <Banner tone="destructive">
                <Banner.Content>
                  <Banner.Title>
                    Phiên hỗ trợ từ xa đang hoạt động — nhân viên hỗ trợ hiện có thể xem toàn bộ dữ
                    liệu tổ chức của bạn cho đến khi phiên kết thúc
                  </Banner.Title>
                  <Banner.Description>
                    Nếu bạn không yêu cầu phiên hỗ trợ này, hãy kết thúc ngay và đổi mật khẩu quản
                    trị của tổ chức.
                  </Banner.Description>
                </Banner.Content>
                <Banner.Actions>
                  <Button size="sm" variant="outline">
                    Kết thúc phiên
                  </Button>
                </Banner.Actions>
              </Banner>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
