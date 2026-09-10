import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { MobileShell } from "../mobile-shell";
import { renderWithUi } from "@/test/render";

describe("MobileShell", () => {
  it("renders the scroll region as the main landmark with its children", () => {
    const { getByRole, getByText } = renderWithUi(
      <MobileShell>
        <div>入庫リスト</div>
      </MobileShell>,
    );
    expect(getByRole("main")).toBeInTheDocument();
    expect(getByText("入庫リスト")).toBeInTheDocument();
  });

  it("omits every optional band when its slot is absent", () => {
    const { container, queryByRole } = renderWithUi(
      <MobileShell>
        <div>x</div>
      </MobileShell>,
    );
    expect(queryByRole("banner")).toBeNull();
    expect(queryByRole("navigation")).toBeNull();
    expect(container.querySelector(".ui-mobile-shell-status")).toBeNull();
    expect(container.querySelector(".ui-mobile-shell-actions")).toBeNull();
  });

  it("renders the header as a banner and the tab bar as a navigation landmark", () => {
    const { getByRole, getByText } = renderWithUi(
      <MobileShell header={<h1>Nhập kho</h1>} tabBar={<button type="button">Nhập kho</button>}>
        x
      </MobileShell>,
    );
    expect(getByRole("banner")).toBeInTheDocument();
    expect(getByRole("navigation")).toBeInTheDocument();
    expect(getByText("Nhập kho", { selector: "h1" })).toBeInTheDocument();
  });

  it("keeps the sticky action bar OUT of the scroll region, and before the tab bar in the DOM", () => {
    // The whole point of the `actions` band: the primary verb is always reachable without a
    // `position: sticky` hack, and source order IS the layout, so reading order matches the screen.
    const { container } = renderWithUi(
      <MobileShell actions={<button type="button">Quét / Tìm mã</button>} tabBar={<span>t</span>}>
        <div>list</div>
      </MobileShell>,
    );
    const main = container.querySelector(".ui-mobile-shell-main");
    const actions = container.querySelector(".ui-mobile-shell-actions");
    const tabbar = container.querySelector(".ui-mobile-shell-tabbar");
    expect(main).not.toBeNull();
    expect(actions).not.toBeNull();
    expect(main?.contains(actions ?? null)).toBe(false);
    expect(tabbar).not.toBeNull();
    expect(
      actions!.compareDocumentPosition(tabbar!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("makes the scroll region keyboard-focusable (axe scrollable-region-focusable)", () => {
    const { getByRole } = renderWithUi(
      <MobileShell>
        <div>x</div>
      </MobileShell>,
    );
    expect(getByRole("main")).toHaveAttribute("tabindex", "0");
  });

  it("emits NO data-height for the default viewport contract, and `fill` for a bounded parent", () => {
    // Quiet default (rule #44): a plain <MobileShell> keeps the shell's own 100dvh box, so the
    // `[data-height="fill"]` rule cannot reach it.
    const { container, rerender } = renderWithUi(
      <MobileShell>
        <div>x</div>
      </MobileShell>,
    );
    const root = container.querySelector(".ui-mobile-shell");
    expect(root).not.toBeNull();
    expect(root).not.toHaveAttribute("data-height");

    rerender(
      <MobileShell height="fill">
        <div>x</div>
      </MobileShell>,
    );
    expect(container.querySelector(".ui-mobile-shell")).toHaveAttribute("data-height", "fill");
  });

  /**
   * The inline axis, which `height` had and `width` did not.
   *
   * Measured in Chromium at a 1280px viewport before this prop existed: the shell drew 1232px wide
   * with `max-inline-size: none` — a handheld app with its four tab-bar destinations spread across
   * the whole screen. `height="fill"` already existed for the same situation on the block axis
   * ("a phone view embedded in a wider page"), so this was an asymmetry rather than a decision.
   */
  it("emits NO data-width by default, and `phone` for a capped, centred column", () => {
    const { container, rerender } = renderWithUi(
      <MobileShell>
        <div>x</div>
      </MobileShell>,
    );
    expect(container.querySelector(".ui-mobile-shell")).not.toHaveAttribute("data-width");

    rerender(
      <MobileShell width="phone">
        <div>x</div>
      </MobileShell>,
    );
    expect(container.querySelector(".ui-mobile-shell")).toHaveAttribute("data-width", "phone");
  });

  /**
   * jsdom paints nothing, so the CAP itself is asserted where it is written. The centring belongs
   * with the cap and not at the call site: without it the column pins to the inline start, and
   * `margin-inline` keeps that true in both writing directions.
   */
  it("caps and centres from the token, on logical axes", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/shell-layout.css"), "utf8");
    const start = css.indexOf('.ui-mobile-shell[data-width="phone"] {');
    expect(start, "no rule for width=phone").toBeGreaterThan(-1);
    const rule = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
    expect(rule).toContain("max-inline-size: var(--mobile-shell-max-inline-size)");
    expect(rule).toContain("margin-inline: auto");
    expect(rule).not.toMatch(/margin-(?:left|right)|max-width/);
  });

  it("puts the status band FIRST, above the header, so it owns the top safe-area inset", () => {
    const { container } = renderWithUi(
      <MobileShell statusBar={<span>9:41</span>} header={<h1>Nhập kho</h1>}>
        x
      </MobileShell>,
    );
    const root = container.querySelector(".ui-mobile-shell");
    // Hai băng chrome nằm chung trong một landmark <header>, nếu không axe `region` sẽ đỏ vì
    // băng trạng thái đứng trần. Thứ tự bên trong vẫn là điều test này khẳng định.
    const chrome = root?.firstElementChild;
    expect(chrome?.tagName).toBe("HEADER");
    expect(chrome).toHaveClass("ui-mobile-shell-chrome");
    expect(chrome?.firstElementChild).toHaveClass("ui-mobile-shell-status");
    expect(chrome?.children[1]).toHaveClass("ui-mobile-shell-header");
  });

  it("keeps every band inside a landmark, which is what axe `region` checks", () => {
    const { container } = renderWithUi(
      <MobileShell
        statusBar={<span>9:41</span>}
        header={<h1>Nhập kho</h1>}
        actions={<button type="button">Lưu</button>}
        tabBar={<button type="button">Trang chủ</button>}
      >
        x
      </MobileShell>,
    );
    const root = container.querySelector(".ui-mobile-shell")!;
    for (const band of [...root.children]) {
      expect(["HEADER", "MAIN", "FOOTER", "NAV"], `${band.className} phải là landmark`).toContain(
        band.tagName,
      );
    }
  });

  it("merges a consumer className onto the shell root without dropping its own class", () => {
    const { container } = renderWithUi(
      <MobileShell className="handy-root">
        <div>x</div>
      </MobileShell>,
    );
    const root = container.querySelector(".ui-mobile-shell");
    expect(root).toHaveClass("handy-root");
  });
});
