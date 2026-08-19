import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Badge } from "../../data-display/badge";
import { PageContainer } from "../page-container";
import type { PageContainerProp, PageContainerProps } from "../page-container";
import { expectNoA11yViolations } from "@/test/a11y";

/**
 * Canonical page-header contract (godxjp-ui#255): PageContainer's embedded header IS
 * the DXS PageHeader. The `status` slot is the status/meta band beside the title —
 * token-owned geometry (--page-header-status-gap), wrapping under the title on
 * compact viewports, never a consumer-laid badge row.
 */
describe("PageContainer status band", () => {
  it("renders the status band on the title line, inside the heading", () => {
    const { container } = renderWithUi(
      <PageContainer
        title="組織プロファイル"
        subtitle="契約と環境"
        status={<Badge tone="success">有効</Badge>}
      >
        body
      </PageContainer>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("組織プロファイル");

    const titleRow = container.querySelector(".ui-page-header-title-row");
    expect(titleRow).not.toBeNull();
    // The band and the <h1> share ONE row element — that is what puts the badge on
    // the title line without consumer CSS.
    expect(titleRow).toContainElement(heading);
    const status = container.querySelector(".ui-page-header-status");
    expect(status).not.toBeNull();
    expect(status).toHaveTextContent("有効");
    expect(titleRow).toContainElement(status as HTMLElement);
    // The band is meta content, never a second heading.
    expect(status?.closest("h1")).toBeNull();
  });

  it("keeps the exact historical heading DOM when status is omitted", () => {
    const { container } = renderWithUi(<PageContainer title="設定">body</PageContainer>);
    expect(container.querySelector(".ui-page-header-title-row")).toBeNull();
    expect(container.querySelector(".ui-page-header-status")).toBeNull();
    // <h1> stays a DIRECT child of the heading block, as before gh#255.
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.parentElement).toHaveClass("ui-page-header-heading");
  });

  it("pins the public declaration contract (status is part of PageContainerProps)", () => {
    const props: PageContainerProps = {
      title: "タイトル",
      subtitle: "サブタイトル",
      status: <Badge tone="info">本番環境</Badge>,
      extra: null,
      breadcrumb: [{ label: "ホーム", to: "/" }, { label: "タイトル" }],
    };
    const alias: PageContainerProp = props;
    expect(alias).toBe(props);
  });

  it("has no axe violations with a status band + breadcrumb + actions", async () => {
    await expectNoA11yViolations(
      <PageContainer
        title="株式会社ファムジアの組織プロファイル"
        subtitle="契約状態と環境"
        status={
          <>
            <Badge tone="success">有効</Badge>
            <Badge tone="info">本番環境</Badge>
          </>
        }
        breadcrumb={[{ label: "ホーム", to: "/" }, { label: "組織プロファイル" }]}
      >
        body
      </PageContainer>,
    );
  });
});

/**
 * `headerLoading` (gh#255, ported from the dev-line standalone PageHeader): the title band
 * skeletonises while the page record resolves, but the `<h1>` never leaves the document and
 * never becomes an empty heading — the heading outline a screen-reader user navigates by
 * survives the load. Breadcrumbs and `extra` come from the route, so they stay live.
 */
describe("PageContainer headerLoading", () => {
  it("skeletonises the title band, keeps an accessibly-named <h1>, and marks the header busy", () => {
    const { container } = renderWithUi(
      <PageContainer
        title="組織プロファイル"
        subtitle="契約と環境"
        headerLoading
        extra={<button type="button">再読み込み</button>}
      >
        body
      </PageContainer>,
    );
    const header = container.querySelector("header.ui-page-header");
    expect(header).toHaveAttribute("aria-busy", "true");

    // The <h1> stays in the tree, wears the skeleton skin, and keeps an sr-only accessible name.
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toContain("ui-skeleton-block");
    expect(heading.className).toContain("ui-page-title-placeholder");
    expect(heading).toHaveAccessibleName();

    // The subtitle placeholder is decorative only — the heading already announces the pending state.
    const subtitlePlaceholder = container.querySelector(".ui-page-subtitle-placeholder");
    expect(subtitlePlaceholder).toHaveAttribute("aria-hidden", "true");

    // Route-owned regions are NOT skeletonised.
    expect(screen.getByRole("button", { name: "再読み込み" })).toBeInTheDocument();
  });

  it("settled header carries no ARIA state and renders the real title again", () => {
    const { container } = renderWithUi(
      <PageContainer title="組織プロファイル" subtitle="契約と環境">
        body
      </PageContainer>,
    );
    expect(container.querySelector("header.ui-page-header")).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("組織プロファイル");
    expect(container.querySelector(".ui-page-title-placeholder")).toBeNull();
  });

  it("has no axe violations while pending", async () => {
    await expectNoA11yViolations(
      <PageContainer title="組織プロファイル" headerLoading>
        body
      </PageContainer>,
    );
  });
});
