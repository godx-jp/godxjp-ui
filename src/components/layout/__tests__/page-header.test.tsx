/**
 * PageHeader — the canonical page title band, extracted from PageContainer (gh#255).
 *
 * The consumer blocker in the issue is that `@godxjp/ui@18.6.0` exposed the header GEOMETRY only
 * through PageContainer, so a surface that is not a whole page (a Sheet detail, a MasterDetail
 * pane) had to re-author `.ui-page-header` locally. These tests pin the two halves of the fix:
 *
 *   1. the standalone export renders the real band — every slot, both `layout` values, the pending
 *      state — with the accessibility contract intact, and
 *   2. PageContainer emits the SAME DOM it always did, because it now renders this very component.
 *      The no-drift assertions are the point: an extraction that silently changed the header would
 *      move every existing page in every consumer app.
 */
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { PageHeader } from "../page-header";
import { PageContainer } from "../page-container";

describe("PageHeader — slots", () => {
  it("renders the title as the surface's <h1>", () => {
    renderWithUi(<PageHeader title="請求一覧" />);

    expect(screen.getByRole("heading", { level: 1, name: "請求一覧" })).toBeInTheDocument();
  });

  it("emits NO title-band wrapper when `meta` is omitted, so existing pages keep their DOM", () => {
    const { container } = renderWithUi(<PageHeader title="請求一覧" />);

    expect(container.querySelector(".ui-page-title-band")).toBeNull();
    expect(container.querySelector(".ui-page-header-meta")).toBeNull();
  });

  it("puts `meta` in its own band beside the <h1>, NOT inside the accessible name", () => {
    renderWithUi(<PageHeader title="請求書 #4021" meta={<span>期限超過</span>} />);

    // The heading names the record; the status is a sibling. If `meta` were folded into the title
    // the accessible name would become "請求書 #4021 期限超過" and change on every status flip.
    expect(screen.getByRole("heading", { level: 1, name: "請求書 #4021" })).toBeInTheDocument();
    expect(screen.getByText("期限超過")).toBeInTheDocument();
  });

  it("renders subtitle and extra when passed, and omits their boxes when not", () => {
    const { container, unmount } = renderWithUi(
      <PageHeader title="メンバー" subtitle="組織に所属するユーザー" extra={<span>招待</span>} />,
    );

    expect(screen.getByText("組織に所属するユーザー")).toBeInTheDocument();
    expect(container.querySelector(".ui-page-header-extra")).not.toBeNull();
    unmount();

    const bare = renderWithUi(<PageHeader title="メンバー" />);
    expect(bare.container.querySelector(".ui-page-subtitle")).toBeNull();
    expect(bare.container.querySelector(".ui-page-header-extra")).toBeNull();
  });
});

describe("PageHeader — breadcrumb", () => {
  it("marks the leaf with aria-current='page' and leaves it unlinked", () => {
    renderWithUi(
      <PageHeader
        title="請求一覧"
        breadcrumb={[
          { label: "ホーム", to: "/" },
          { label: "会計", to: "/accounting" },
          { label: "請求一覧" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "ホーム" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "会計" })).toBeInTheDocument();
    // The leaf is the current page — a link to where you already are is a dead control.
    expect(screen.queryByRole("link", { name: "請求一覧" })).toBeNull();
    expect(screen.getByText("請求一覧", { selector: "[aria-current='page']" })).toBeInTheDocument();
  });

  it("lets the caller name the nav landmark so two headers on one view stay landmark-unique", () => {
    renderWithUi(
      <PageHeader title="A" breadcrumb={[{ label: "ホーム" }]} breadcrumbLabel="請求のパンくず" />,
    );

    expect(screen.getByRole("navigation", { name: "請求のパンくず" })).toBeInTheDocument();
  });

  it("emits no nav landmark at all for an empty trail", () => {
    renderWithUi(<PageHeader title="A" breadcrumb={[]} />);

    expect(screen.queryByRole("navigation")).toBeNull();
  });
});

describe("PageHeader — layout arrangement", () => {
  it.each(["stack", "responsive-inline"] as const)(
    "exposes layout=%s as the data-layout hook the stylesheet selects on",
    (layout) => {
      const { container } = renderWithUi(<PageHeader title="A" layout={layout} />);

      expect(container.querySelector(".ui-page-header")).toHaveAttribute("data-layout", layout);
    },
  );

  it("defaults to stack — the historical arrangement", () => {
    const { container } = renderWithUi(<PageHeader title="A" />);

    expect(container.querySelector(".ui-page-header")).toHaveAttribute("data-layout", "stack");
  });
});

describe("PageHeader — loading", () => {
  it("keeps a NAMED <h1> in the heading outline while pending", () => {
    renderWithUi(<PageHeader title="請求書 #4021" loading />);

    // An <h1> whose only content is a decorative placeholder box is an EMPTY heading — an axe
    // violation (WCAG 1.3.1). The sr-only status text is what keeps it named.
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAccessibleName();
    expect(heading).toHaveClass("ui-skeleton-block");
    // The unresolved record's title must NOT leak into the placeholder.
    expect(screen.queryByText("請求書 #4021")).toBeNull();
  });

  it("marks the band aria-busy while pending and carries NO aria state at rest", () => {
    const { container, unmount } = renderWithUi(<PageHeader title="A" loading />);
    expect(container.querySelector(".ui-page-header")).toHaveAttribute("aria-busy", "true");
    unmount();

    const settled = renderWithUi(<PageHeader title="A" />);
    expect(settled.container.querySelector(".ui-page-header")).not.toHaveAttribute("aria-busy");
  });

  it("does NOT skeletonise breadcrumbs or extra — they come from the route, not the record", () => {
    renderWithUi(
      <PageHeader
        title="請求書 #4021"
        loading
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "請求書" }]}
        extra={<span>再送信</span>}
      />,
    );

    expect(screen.getByRole("link", { name: "ホーム" })).toBeInTheDocument();
    expect(screen.getByText("再送信")).toBeInTheDocument();
  });

  it("hides the subtitle placeholder from assistive tech (the heading already announced it)", () => {
    const { container } = renderWithUi(<PageHeader title="A" subtitle="B" loading />);

    const placeholder = container.querySelector(".ui-page-subtitle-placeholder");
    expect(placeholder).not.toBeNull();
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
  });
});

describe("PageContainer renders the SAME band — no drift after the extraction", () => {
  it("still emits the historical header DOM for the pre-gh#255 prop set", () => {
    const { container } = renderWithUi(
      <PageContainer
        title="注文一覧"
        subtitle="直近30日間の受注データ"
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "注文一覧" }]}
        extra={<span>新規注文</span>}
      />,
    );

    const header = container.querySelector(".ui-page-header");
    expect(header).not.toBeNull();
    expect(header).toHaveAttribute("data-layout", "stack");
    expect(header?.querySelector(".ui-page-title")?.textContent).toBe("注文一覧");
    expect(header?.querySelector(".ui-page-subtitle")?.textContent).toBe("直近30日間の受注データ");
    expect(header?.querySelector(".ui-breadcrumb")).not.toBeNull();
    expect(header?.querySelector(".ui-page-header-extra")).not.toBeNull();
    // The band wrapper is opt-in; a page that never passes `meta` is byte-identical to before.
    expect(header?.querySelector(".ui-page-title-band")).toBeNull();
  });

  it("forwards headerLayout to the band's data-layout", () => {
    const { container } = renderWithUi(
      <PageContainer title="A" headerLayout="responsive-inline" />,
    );

    expect(container.querySelector(".ui-page-header")).toHaveAttribute(
      "data-layout",
      "responsive-inline",
    );
  });

  it("forwards meta and headerLoading to the band", () => {
    const { container } = renderWithUi(<PageContainer title="A" meta={<span>下書き</span>} />);
    expect(container.querySelector(".ui-page-title-band")).not.toBeNull();
    expect(screen.getByText("下書き")).toBeInTheDocument();

    const pending = renderWithUi(<PageContainer title="B" headerLoading />);
    expect(pending.container.querySelector(".ui-page-header")).toHaveAttribute("aria-busy", "true");
  });
});
