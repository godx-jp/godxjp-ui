import { describe, expect, it } from "vitest";

import { AppShell } from "../app-shell";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
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

  it("owns a mobile nav drawer trigger with an accessible name (defaults to the sidebar node)", () => {
    renderWithUi(
      <AppShell sidebar={<nav aria-label="主">サイドナビ</nav>}>
        <p>本文</p>
      </AppShell>,
    );
    // AppShell renders its own hamburger — the mobile nav is never merely hidden (gh#165).
    const trigger = screen.getByRole("button", { name: "Mở menu điều hướng" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass("hidden", "max-[900px]:inline-flex");
  });

  it("opens a focus-trapped drawer and returns focus to the trigger on close", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell
        sidebar={<nav aria-label="主">サイドナビ</nav>}
        mobileNav={<nav aria-label="モバイル">ドロワーナビ</nav>}
      >
        <p>本文</p>
      </AppShell>,
    );
    const trigger = screen.getByRole("button", { name: "Mở menu điều hướng" });
    await user.click(trigger);
    // Drawer is a dialog (Sheet) with the localized title, containing the mobile nav.
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("ドロワーナビ")).toBeInTheDocument();
    // Esc closes and focus returns to the trigger (Radix Dialog focus management).
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("keeps the mobile drawer navigation expanded when the docked sidebar is collapsed", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <AppShell sidebar={<nav aria-label="Main">Dashboard settings</nav>} sidebarCollapsed>
        <p>Content</p>
      </AppShell>,
    );

    await user.click(screen.getByRole("button", { name: "Mở menu điều hướng" }));

    expect(await screen.findByRole("dialog")).toHaveTextContent("Dashboard settings");
  });

  it("mobileNav={null} opts out — no drawer trigger is rendered", () => {
    renderWithUi(
      <AppShell sidebar={<nav aria-label="主">n</nav>} mobileNav={null}>
        x
      </AppShell>,
    );
    expect(screen.queryByRole("button", { name: "Mở menu điều hướng" })).toBeNull();
  });

  it("has no axe violations", async () => {
    await expectNoA11yViolations(
      <AppShell sidebar={<nav aria-label="主">ナビ</nav>}>
        <h1>ページ</h1>
      </AppShell>,
    );
  });
});
