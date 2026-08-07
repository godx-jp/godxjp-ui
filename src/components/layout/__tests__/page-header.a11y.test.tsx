/**
 * PageHeader — axe coverage for the standalone title band (gh#255).
 *
 * The pending state is the branch worth guarding: a header that swaps its title for a decorative
 * placeholder loses its accessible name, and an <h1> with no name is an `empty-heading` violation —
 * a page that drops its only level-1 heading mid-load also breaks the outline screen-reader users
 * navigate by. Both are asserted at 0 violations here, alongside the settled band and the
 * two-headers-on-one-view case the `breadcrumbLabel` override exists for.
 */
import { describe, it } from "vitest";

import { PageHeader } from "../page-header";
import { expectNoA11yViolations } from "@/test/a11y";

describe("PageHeader — accessibility", () => {
  it("has no violations with every slot filled", async () => {
    await expectNoA11yViolations(
      <PageHeader
        title="請求書 #4021"
        subtitle="株式会社ゴドー — 2026年7月分"
        meta={<span>期限超過</span>}
        extra={<button type="button">再送信</button>}
        breadcrumb={[
          { label: "ホーム", to: "/" },
          { label: "会計", to: "/accounting" },
          { label: "請求書 #4021" },
        ]}
      />,
    );
  });

  it("has no violations while pending — the <h1> keeps an accessible name", async () => {
    await expectNoA11yViolations(
      <PageHeader
        title="請求書 #4021"
        subtitle="株式会社ゴドー"
        meta={<span>期限超過</span>}
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "請求書 #4021" }]}
        loading
      />,
    );
  });

  it("has no violations in the bare title-only case", async () => {
    await expectNoA11yViolations(<PageHeader title="請求一覧" />);
  });

  it("stays landmark-unique when two headers with breadcrumbs share one view", async () => {
    // Both bands are wrapped in sectioning content, which is how a real consumer mounts them (a
    // Sheet body, a MasterDetail <section>, a tab panel): `<header>` only computes to `banner`
    // OUTSIDE sectioning content, so this is what keeps two title bands off a duplicate-banner
    // violation. The distinct `breadcrumbLabel`s keep the two nav landmarks unique.
    await expectNoA11yViolations(
      <div>
        <section aria-label="請求">
          <PageHeader
            title="請求一覧"
            breadcrumb={[{ label: "ホーム", to: "/" }, { label: "請求一覧" }]}
            breadcrumbLabel="請求のパンくず"
          />
        </section>
        <section aria-label="メンバー">
          <PageHeader
            title="メンバー"
            breadcrumb={[{ label: "ホーム", to: "/" }, { label: "メンバー" }]}
            breadcrumbLabel="メンバーのパンくず"
          />
        </section>
      </div>,
    );
  });
});
