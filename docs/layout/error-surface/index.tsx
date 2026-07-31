import { Card, CardContent, CardHeader, CardTitle, EmptyState } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";
import { RotateCcw, SearchX, ServerCrash, ShieldAlert, Wrench } from "lucide-react";

/**
 * ERROR SURFACE (403 · 404 · 500 · 503) — a COMPOSITION PATTERN, not a component.
 *
 * The surface fails the Framework-Component Test (docs/COMPOSITION-VS-COMPONENT.md): it owns no
 * behaviour, and it is expressible today from `EmptyState` + `Flex` + `Text` + `Button` placed in
 * the shell the page ALREADY renders. So `@godxjp/ui` ships no `ErrorSurface`; it ships the two
 * shells (`AppShell` for application errors, `CenteredShell align="center"` for system errors) plus
 * the tokens, and this page pins the canonical body.
 *
 * The four canonical bodies below are IDENTICAL in structure — only status, icon, tone and copy
 * change:
 *   status code (compact, mono/tabular) → EmptyState(icon, tone, title, description, action)
 *   → optional metadata line (request ID · maintenance window).
 * EXACTLY ONE recovery action is structural: `EmptyState.action` is a single slot.
 *
 * See the Examples for the two real screens (shell-preserving 403/404, viewport-centred 500/503).
 */
export default function Demo() {
  // ISO-8601 instants + an IANA zone — the maintenance window is formatted by Intl (CLDR), never
  // hand-built, so ja/en/vi each read natively.
  const maintenanceWindow = new Intl.DateTimeFormat("ja", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).formatRange(new Date("2026-08-02T18:00:00Z"), new Date("2026-08-02T20:00:00Z"));

  return (
    <PageContainer
      title="Error surface"
      subtitle="403 / 404 / 500 / 503 · EmptyState + Flex + Text composed inside the page's own shell"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>application モード：403（権限なし）</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" align="center" gap="sm">
              <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
                403
              </Text>
              <EmptyState
                icon={ShieldAlert}
                tone="warning"
                titleLevel={3}
                title="このページへのアクセス権限がありません"
                description="管理者にレポート閲覧ロールの付与を依頼してください。"
                action={<Button>ダッシュボードへ戻る</Button>}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>application モード：404（未検出）</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" align="center" gap="sm">
              <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
                404
              </Text>
              <EmptyState
                icon={SearchX}
                titleLevel={3}
                title="ページが見つかりません"
                description="お探しのページは移動または削除された可能性があります。"
                action={<Button>ダッシュボードへ戻る</Button>}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>system モード：500（リクエスト ID 付き）</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" align="center" gap="sm">
              <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
                500
              </Text>
              <EmptyState
                icon={ServerCrash}
                tone="destructive"
                titleLevel={3}
                title="問題が発生しました"
                description="予期しないエラーが発生しました。担当チームに通知済みです。"
                action={
                  <Button>
                    <RotateCcw />
                    再読み込み
                  </Button>
                }
              />
              {/* 任意のメタデータスロット：サポート照会用の相関 ID。 */}
              <Text as="p" size="xs" tone="muted" mono>
                リクエスト ID: 01J9Z0M7Q2K5S7WQ3T5N8V2H4B
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>system モード：503（メンテナンス時間帯付き）</CardTitle>
          </CardHeader>
          <CardContent>
            <Flex direction="col" align="center" gap="sm">
              <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
                503
              </Text>
              <EmptyState
                icon={Wrench}
                tone="warning"
                titleLevel={3}
                title="サービスを一時的にご利用いただけません"
                description="計画メンテナンスを実施しています。しばらくしてから再度お試しください。"
                action={
                  <Button>
                    <RotateCcw />
                    再読み込み
                  </Button>
                }
              />
              {/* 任意のメタデータスロット：Intl.DateTimeFormat.formatRange + IANA タイムゾーン。 */}
              <Text as="p" size="sm" tone="muted">
                計画メンテナンス: {maintenanceWindow}
              </Text>
            </Flex>
          </CardContent>
        </Card>

        {/* 同じ本文を ja / en / vi で並べ、最長ロケールでも折り返しが崩れないことを示す。
            計測幅は --empty-state-description-max-width（既定 28rem）が所有する。 */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>多言語オーバーフロー：ja / en / vi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ sm: 1, md: 3 }}>
              <EmptyState
                icon={Wrench}
                tone="warning"
                titleLevel={3}
                title="サービスを一時的にご利用いただけません"
                description="計画メンテナンスを実施しています。しばらくしてから再度お試しください。"
                action={<Button variant="outline">再読み込み</Button>}
              />
              <EmptyState
                icon={Wrench}
                tone="warning"
                titleLevel={3}
                title="Service temporarily unavailable"
                description="We are performing scheduled maintenance right now. Please try again in a few minutes."
                action={<Button variant="outline">Reload</Button>}
              />
              <EmptyState
                icon={Wrench}
                tone="warning"
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
