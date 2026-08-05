/**
 * ErrorSurface — axe coverage for the package-owned 403 / 404 / 500 / 503 surface (gh#221, gh#251).
 *
 * Every status is asserted at 0 violations in the shell it actually ships in — application mode
 * inside a real AppShell + PageContainer, system mode as its own CenteredShell page — plus the
 * metadata-heavy variants (request id · permission · organization · maintenance window + progress)
 * and RTL, so no consumer can inherit an inaccessible exception page from the library.
 */
import { describe, it } from "vitest";
import { Home } from "lucide-react";

import { AppShell } from "../app-shell";
import { ErrorSurface } from "../error-surface";
import { PageContainer } from "../page-container";
import { Sidebar } from "../sidebar";
import { Button } from "../../general/button";
import { Logo } from "../../general/logo";
import { expectNoA11yViolations } from "@/test/a11y";

function ApplicationPage({ status, title }: { status: 403 | 404; title: string }) {
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
        <ErrorSurface
          mode="application"
          status={status}
          title={title}
          description="管理者にレポート閲覧ロールの付与を依頼してください。"
          action={<Button>ダッシュボードへ戻る</Button>}
        />
      </PageContainer>
    </AppShell>
  );
}

describe("ErrorSurface — a11y", () => {
  it("403 inside the preserved application shell has no axe violations", async () => {
    await expectNoA11yViolations(
      <ApplicationPage status={403} title="このページへのアクセス権限がありません" />,
    );
  });

  it("404 inside the preserved application shell has no axe violations", async () => {
    await expectNoA11yViolations(<ApplicationPage status={404} title="ページが見つかりません" />);
  });

  it("403 with permission + organization metadata has no axe violations", async () => {
    await expectNoA11yViolations(
      <AppShell
        sidebar={
          <Sidebar
            activeId="reports"
            sections={[{ items: [{ id: "reports", label: "レポート", icon: Home }] }]}
          />
        }
      >
        <PageContainer title="レポート">
          <ErrorSurface
            mode="application"
            status={403}
            title="このページへのアクセス権限がありません"
            description="管理者にレポート閲覧ロールの付与を依頼してください。"
            permission="reports.view"
            organization="株式会社ゴッドエックス"
            requestId="01J9Z0M7Q2K5S7WQ3T5N8V2H4B"
            action={<Button>ダッシュボードへ戻る</Button>}
          />
        </PageContainer>
      </AppShell>,
    );
  });

  it("500 system surface (with request ID) has no axe violations", async () => {
    await expectNoA11yViolations(
      <ErrorSurface
        mode="system"
        status={500}
        brand={<Logo glyph="G" />}
        title="問題が発生しました"
        description="予期しないエラーが発生しました。担当チームに通知済みです。"
        requestId="01J9Z0M7Q2K5S7WQ3T5N8V2H4B"
        footer={<span>2026 GodX</span>}
        action={<Button>再読み込み</Button>}
      />,
    );
  });

  it("503 system surface (maintenance window + progress meter) has no axe violations", async () => {
    await expectNoA11yViolations(
      <ErrorSurface
        mode="system"
        status={503}
        title="サービスを一時的にご利用いただけません"
        description="計画メンテナンスを実施しています。しばらくしてから再度お試しください。"
        maintenance={{
          start: "2026-08-02T18:00:00Z",
          end: "2026-08-02T20:00:00Z",
          timeZone: "Asia/Tokyo",
          progress: 40,
        }}
        action={<Button>再読み込み</Button>}
      />,
    );
  });

  it("system surface has no axe violations under dir=rtl", async () => {
    await expectNoA11yViolations(
      <div dir="rtl">
        <ErrorSurface
          mode="system"
          status={500}
          title="حدث خطأ ما"
          description="حدث خطأ غير متوقع. تم إبلاغ فريقنا."
          requestId="01J9Z0M7Q2K5S7WQ3T5N8V2H4B"
          action={<Button>إعادة التحميل</Button>}
        />
      </div>,
    );
  });
});
