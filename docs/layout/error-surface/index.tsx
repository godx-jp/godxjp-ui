import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Logo } from "@godxjp/ui/general";
import { ErrorSurface, Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { LifeBuoy, RotateCcw } from "lucide-react";

/**
 * ERROR SURFACE (403 · 404 · 500 · 503) — a real, importable component: `ErrorSurface`.
 *
 * `mode` is the SHELL CONTRACT, not a skin:
 *   application (403/404) → the BODY you place inside the AppShell the route already renders
 *   system      (500/503) → owns the page: CenteredShell align="center", package-owned geometry
 *
 * Every card below renders the surface in `application` mode, because a `system` surface is a full
 * `100dvh` page and would swallow this catalogue page — see the Examples for the two real screens.
 *
 * Structure of the surface: status code (compact, mono/tabular, announced as "HTTP status 403")
 * → icon · tone · title · description · EXACTLY ONE action → optional semantic metadata rows
 * (request id · required permission · organization · maintenance window + progress).
 */
export default function Demo() {
  return (
    <PageContainer
      title="Error surface"
      subtitle="ErrorSurface · 403 / 404 / 500 / 503 · mode=application (AppShell body) vs mode=system (owns the page)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>status=403 · 権限なし（permission + organization）</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorSurface
              mode="application"
              status={403}
              titleLevel={3}
              title="このページへのアクセス権限がありません"
              description="管理者にレポート閲覧ロールの付与を依頼してください。"
              permission="reports.view"
              organization="株式会社ゴッドエックス"
              action={<Button>ダッシュボードへ戻る</Button>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>status=404 · 未検出（メタデータなし）</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Every metadata slot omitted ⇒ the whole description list disappears. Metadata is
                optional; the surface never renders an empty row or a dangling label. */}
            <ErrorSurface
              mode="application"
              status={404}
              titleLevel={3}
              title="ページが見つかりません"
              description="お探しのページは移動または削除された可能性があります。"
              action={<Button>ダッシュボードへ戻る</Button>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>status=500 · リクエスト ID 付き</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Shown here in application mode so the card can contain it. In a real 500 page this
                is mode="system" and the surface owns the whole viewport. */}
            <ErrorSurface
              mode="application"
              status={500}
              titleLevel={3}
              title="問題が発生しました"
              description="予期しないエラーが発生しました。担当チームに通知済みです。"
              requestId="01J9Z0M7Q2K5S7WQ3T5N8V2H4B"
              action={
                <Button>
                  <RotateCcw />
                  再読み込み
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>status=503 · メンテナンス時間帯 + 進捗</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ISO-8601 instants + an IANA zone in, Intl.DateTimeFormat.formatRange out. The
                progress meter is server-sent (a client clock would break SSR hydration). */}
            <ErrorSurface
              mode="application"
              status={503}
              titleLevel={3}
              title="サービスを一時的にご利用いただけません"
              description="計画メンテナンスを実施しています。しばらくしてから再度お試しください。"
              maintenance={{
                start: "2026-08-02T18:00:00Z",
                end: "2026-08-02T20:00:00Z",
                timeZone: "Asia/Tokyo",
                progress: 40,
              }}
              action={
                <Button>
                  <RotateCcw />
                  再読み込み
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>icon / tone / brand の上書き</CardTitle>
          </CardHeader>
          <CardContent>
            {/* icon and tone DEFAULT from the status (500 ⇒ ServerCrash + destructive). Override
                them only when the product has a truer glyph for the failure — never to recolour a
                status into a different severity. `brand` is system-mode only and is ignored here. */}
            <ErrorSurface
              mode="application"
              status={500}
              titleLevel={3}
              icon={LifeBuoy}
              tone="warning"
              brand={<Logo glyph="G" />}
              title="復旧作業中です"
              description="サポートチームが対応しています。復旧までしばらくお待ちください。"
              action={<Button variant="outline">ステータスページを見る</Button>}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>tone · セマンティックな重大度の 5 段階</CardTitle>
          </CardHeader>
          <CardContent>
            {/* `tone` DEFAULTS from `status` (403/503 warning · 404 muted · 500 destructive). An
                explicit tone is for the case where the product knows a TRUER severity than the
                status code carries -- a planned window is informational, a resolved incident is a
                success -- never to recolour one severity into another for decoration. All five
                branches are rendered here so the whole axis is readable at rest. */}
            <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
              <ErrorSurface
                mode="application"
                status={404}
                tone="muted"
                titleLevel={3}
                title="ページが見つかりません"
                description="リンクが古い可能性があります。中立な不在であり、障害ではありません。"
                action={<Button variant="outline">ホームへ戻る</Button>}
              />
              <ErrorSurface
                mode="application"
                status={503}
                tone="info"
                titleLevel={3}
                title="計画メンテナンスを実施しています"
                description="事前告知済みの停止です。障害ではないため、警告ではなく情報として提示します。"
                action={<Button variant="outline">ステータスページを見る</Button>}
              />
              <ErrorSurface
                mode="application"
                status={403}
                tone="warning"
                titleLevel={3}
                title="この操作には承認が必要です"
                description="権限を追加すれば同じ画面に戻れます。回復可能な状態です。"
                action={<Button variant="outline">権限を申請する</Button>}
              />
              <ErrorSurface
                mode="application"
                status={500}
                tone="destructive"
                titleLevel={3}
                title="問題が発生しました"
                description="想定外の失敗です。利用者側の操作では回復できません。"
                action={<Button variant="outline">再読み込み</Button>}
              />
              <ErrorSurface
                mode="application"
                status={503}
                tone="success"
                titleLevel={3}
                title="復旧が完了しました"
                description="最終確認を行っています。まもなく通常どおりご利用いただけます。"
                action={<Button variant="outline">再読み込み</Button>}
              />
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* The same surface in ja / en / vi. The library-owned metadata LABELS ("Request ID") follow
            the active app locale; the product copy is whatever the app's own t() returns. The
            description measure is owned by --empty-state-description-max-width (28rem), and the
            surface measure by --error-surface-max-width (32rem), so the longest locale wraps
            instead of breaking the layout. */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>多言語オーバーフロー：ja / en / vi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
              <ErrorSurface
                mode="application"
                status={503}
                titleLevel={3}
                title="サービスを一時的にご利用いただけません"
                description="計画メンテナンスを実施しています。しばらくしてから再度お試しください。"
                action={<Button variant="outline">再読み込み</Button>}
              />
              <ErrorSurface
                mode="application"
                status={503}
                titleLevel={3}
                title="Service temporarily unavailable"
                description="We are performing scheduled maintenance right now. Please try again in a few minutes."
                action={<Button variant="outline">Reload</Button>}
              />
              <ErrorSurface
                mode="application"
                status={503}
                titleLevel={3}
                title="Dịch vụ tạm thời không khả dụng"
                description="Chúng tôi đang bảo trì theo lịch. Vui lòng thử lại sau ít phút nữa."
                action={<Button variant="outline">Tải lại</Button>}
              />
            </ResponsiveGrid>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
