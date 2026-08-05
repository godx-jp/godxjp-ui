/**
 * ERROR SURFACE — axe coverage for the 403/404/500/503 composition pattern (gh#221).
 *
 * This covers the layer BELOW the shipped `ErrorSurface` component (whose own axe coverage lives in
 * error-surface.a11y.test.tsx): the raw `EmptyState` + `Flex` + `Text` composition that the surface
 * renders internally, and that an app still hand-composes for a status outside the supported four.
 * Every status is asserted at 0 axe violations in the shell it actually ships in, so neither the
 * component nor the hand-composed fallback can teach an inaccessible page.
 */
import { describe, it } from "vitest";
import { Home, ServerCrash, ShieldAlert, SearchX, Wrench } from "lucide-react";

import { AppShell } from "../app-shell";
import { CenteredShell } from "../centered-shell";
import { PageContainer } from "../page-container";
import { Flex } from "../flex";
import { Sidebar } from "../sidebar";
import { EmptyState } from "../../data-display/empty-state";
import { Button } from "../../general/button";
import { Text } from "../../general/typography";
import { expectNoA11yViolations } from "@/test/a11y";

const MAINTENANCE_WINDOW = new Intl.DateTimeFormat("ja", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tokyo",
}).formatRange(new Date("2026-08-02T18:00:00Z"), new Date("2026-08-02T20:00:00Z"));

/** application mode — the error body inside the preserved authenticated shell. */
function ApplicationError({
  status,
  icon,
  tone,
  title,
  description,
}: {
  status: string;
  icon: typeof ShieldAlert;
  tone: "warning" | "muted";
  title: string;
  description: string;
}) {
  return (
    <AppShell
      sidebar={
        <Sidebar
          activeId="reports"
          sections={[{ items: [{ id: "reports", label: "レポート", icon: Home }] }]}
        />
      }
    >
      <PageContainer title="レポート">
        <Flex direction="col" align="center" gap="sm">
          <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
            {status}
          </Text>
          <EmptyState
            icon={icon}
            tone={tone}
            titleLevel={2}
            title={title}
            description={description}
            action={<Button>ダッシュボードへ戻る</Button>}
          />
        </Flex>
      </PageContainer>
    </AppShell>
  );
}

describe("error surface pattern — a11y", () => {
  it("403 inside the preserved application shell has no axe violations", async () => {
    await expectNoA11yViolations(
      <ApplicationError
        status="403"
        icon={ShieldAlert}
        tone="warning"
        title="このページへのアクセス権限がありません"
        description="管理者にレポート閲覧ロールの付与を依頼してください。"
      />,
    );
  });

  it("404 inside the preserved application shell has no axe violations", async () => {
    await expectNoA11yViolations(
      <ApplicationError
        status="404"
        icon={SearchX}
        tone="muted"
        title="ページが見つかりません"
        description="お探しのページは移動または削除された可能性があります。"
      />,
    );
  });

  it("500 system surface (with request ID) has no axe violations", async () => {
    await expectNoA11yViolations(
      <CenteredShell align="center" width="sm">
        <Flex direction="col" align="center" gap="sm">
          <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
            500
          </Text>
          <EmptyState
            icon={ServerCrash}
            tone="destructive"
            titleLevel={1}
            title="問題が発生しました"
            description="予期しないエラーが発生しました。担当チームに通知済みです。"
            action={<Button>再読み込み</Button>}
          />
          <Text as="p" size="xs" tone="muted" mono>
            リクエスト ID: 01J9Z0M7Q2K5S7WQ3T5N8V2H4B
          </Text>
        </Flex>
      </CenteredShell>,
    );
  });

  it("503 system surface (with maintenance window) has no axe violations", async () => {
    await expectNoA11yViolations(
      <CenteredShell align="center" width="sm">
        <Flex direction="col" align="center" gap="sm">
          <Text as="p" size="sm" tone="muted" weight="medium" mono tabular>
            503
          </Text>
          <EmptyState
            icon={Wrench}
            tone="warning"
            titleLevel={1}
            title="サービスを一時的にご利用いただけません"
            description="計画メンテナンスを実施しています。しばらくしてから再度お試しください。"
            action={<Button>再読み込み</Button>}
          />
          <Text as="p" size="sm" tone="muted">
            計画メンテナンス: {MAINTENANCE_WINDOW}
          </Text>
        </Flex>
      </CenteredShell>,
    );
  });
});
