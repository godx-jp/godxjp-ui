import { describe, expect, it } from "vitest";

import { AppShell } from "../app-shell";
import { renderWithUi } from "@/test/render";
import { expectNoA11yViolations } from "@/test/a11y";

describe("AppShell", () => {
  it("renders the sidebar, main and children as labelled landmarks", () => {
    const { getByRole, getByText } = renderWithUi(
      <AppShell sidebar={<nav>ナビ</nav>}>
        <p>本文</p>
      </AppShell>,
    );
    // <aside> = complementary, <main> = main, <header> = banner
    expect(getByRole("complementary")).toBeInTheDocument();
    expect(getByRole("main")).toBeInTheDocument();
    expect(getByRole("banner")).toBeInTheDocument();
    expect(getByText("ナビ")).toBeInTheDocument();
    expect(getByText("本文")).toBeInTheDocument();
  });

  it("composes the default topbar from logo / left / right slots", () => {
    const { getByText } = renderWithUi(
      <AppShell
        sidebar={<nav>n</nav>}
        logo={<span>ロゴ</span>}
        topbarLeft={<span>左</span>}
        topbarRight={<span>右</span>}
      >
        x
      </AppShell>,
    );
    expect(getByText("ロゴ")).toBeInTheDocument();
    expect(getByText("左")).toBeInTheDocument();
    expect(getByText("右")).toBeInTheDocument();
  });

  it("a custom topbar overrides the default rail", () => {
    const { getByText, queryByText } = renderWithUi(
      <AppShell sidebar={<nav>n</nav>} topbar={<div>カスタム</div>} logo={<span>ロゴ</span>}>
        x
      </AppShell>,
    );
    expect(getByText("カスタム")).toBeInTheDocument();
    expect(queryByText("ロゴ")).toBeNull();
  });

  it("renders breadcrumb + footer slots when provided", () => {
    const { getByText, getByRole } = renderWithUi(
      <AppShell sidebar={<nav>n</nav>} breadcrumb={<div>パンくず</div>} footer={<div>フッタ</div>}>
        x
      </AppShell>,
    );
    expect(getByText("パンくず")).toBeInTheDocument();
    expect(getByRole("contentinfo")).toBeInTheDocument();
  });

  it("reflects sidebarCollapsed via a data attribute", () => {
    const { container } = renderWithUi(
      <AppShell sidebar={<nav>n</nav>} sidebarCollapsed>
        x
      </AppShell>,
    );
    expect(container.querySelector(".app-root")).toHaveAttribute("data-collapsed", "true");
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <AppShell sidebar={<nav aria-label="主">ナビ</nav>}>
        <h1>ページ</h1>
      </AppShell>,
    );
  });
});
