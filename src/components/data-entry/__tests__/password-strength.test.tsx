import { describe, expect, it } from "vitest";
import { render as rtlRender, renderHook, screen } from "@testing-library/react";
import type * as React from "react";

import { AppProvider } from "../../../app/app-provider";
import type { AppLocale } from "../../../app/types";
import { PasswordStrength, usePasswordStrength } from "../password-strength";

// The strings come from the kit catalogue for the active locale (gh#1191); these cases read English.
const render = (ui: React.ReactElement, locale: AppLocale = "en") =>
  rtlRender(
    <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
      {ui}
    </AppProvider>,
  );

describe("usePasswordStrength", () => {
  it("scores an empty value as 0 with all checks false", () => {
    const { result } = renderHook(() => usePasswordStrength(""));
    expect(result.current.score).toBe(0);
    expect(result.current.checks).toEqual({
      length: false,
      upper: false,
      lower: false,
      number: false,
      symbol: false,
    });
  });

  it("counts each satisfied rule and clamps to 4", () => {
    const { result } = renderHook(() => usePasswordStrength("Abcdef1!"));
    expect(result.current.checks).toMatchObject({
      length: true,
      upper: true,
      lower: true,
      number: true,
      symbol: true,
    });
    expect(result.current.score).toBe(4); // 5 satisfied → clamped to 4
  });

  it("scores a lowercase-only 8-char value as 2 (length + lower)", () => {
    const { result } = renderHook(() => usePasswordStrength("abcdefgh"));
    expect(result.current.score).toBe(2);
  });

  it("dedupes repeated rules and respects a rule subset", () => {
    const { result } = renderHook(() => usePasswordStrength("abcdefgh", ["length", "length"]));
    expect(result.current.score).toBe(1); // only the (deduped) length rule passes
  });
});

describe("PasswordStrength", () => {
  it("renders a weak/destructive meter for a trivial value", () => {
    const { container } = render(<PasswordStrength value="a" />);
    expect(screen.getByText("Weak")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Password strength 1 of 4");
    expect(container.querySelector('[data-tone="destructive"]')).not.toBeNull();
  });

  it("renders a fair/warning meter", () => {
    const { container } = render(<PasswordStrength value="abcdefgh" />);
    expect(screen.getByText("Fair")).toBeInTheDocument();
    expect(container.querySelector('[data-tone="warning"]')).not.toBeNull();
  });

  it("renders a strong/success meter with custom labels", () => {
    const { container } = render(
      <PasswordStrength value="Abcdef1!" labels={{ weak: "弱", fair: "中", strong: "強" }} />,
    );
    expect(screen.getByText("強")).toBeInTheDocument();
    expect(container.querySelector('[data-tone="success"]')).not.toBeNull();
  });

  it("lists every rule with passed/failed state and human labels", () => {
    render(<PasswordStrength value="abcdefgh" />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(screen.getByText("8+ characters").closest("li")).toHaveAttribute("data-state", "passed");
    expect(screen.getByText("Contains uppercase letter").closest("li")).toHaveAttribute(
      "data-state",
      "failed",
    );
    expect(screen.getByText("Contains lowercase letter")).toBeInTheDocument();
    expect(screen.getByText("Contains number")).toBeInTheDocument();
    expect(screen.getByText("Contains symbol")).toBeInTheDocument();
  });

  it("hides the checklist when showChecklist is false", () => {
    render(<PasswordStrength value="abcdefgh" showChecklist={false} />);
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("speaks the active locale with no labels passed (gh#1191)", () => {
    render(<PasswordStrength value="abcdefgh" />, "ja");
    expect(screen.getByText("普通")).toBeInTheDocument();
    expect(screen.getByText("8 文字以上").closest("li")).toHaveAttribute("data-state", "passed");
    expect(screen.getByText("大文字を含む")).toBeInTheDocument();
    expect(screen.getAllByText("達成:", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText("パスワードの強度: 普通")).toBeInTheDocument();
    expect(screen.queryByText(/password strength/i)).toBeNull();
    expect(screen.queryByText("8+ characters")).toBeNull();
  });

  it("takes every string from labels when the app supplies its own copy (gh#1191)", () => {
    render(
      <PasswordStrength
        value="abcdefgh"
        labels={{
          fair: "ふつう",
          rules: { length: "8文字以上にしてください", upper: "英大文字" },
          passed: "OK：",
          failed: "NG：",
          announcement: (strength) => `強度は${strength}です`,
        }}
      />,
    );
    expect(screen.getByText("ふつう")).toBeInTheDocument();
    expect(screen.getByText("8文字以上にしてください")).toBeInTheDocument();
    expect(screen.getByText("英大文字")).toBeInTheDocument();
    // A rule with no override keeps the catalogue text.
    expect(screen.getByText("Contains lowercase letter")).toBeInTheDocument();
    expect(screen.getAllByText("OK：").length).toBeGreaterThan(0);
    expect(screen.getAllByText("NG：").length).toBeGreaterThan(0);
    expect(screen.getByText("強度はふつうです")).toBeInTheDocument();
  });

  it("follows a server's minimum length in the check, the score and the text (gh#1193)", () => {
    // A 10-character password the server (min 12) rejects must not read as met.
    render(<PasswordStrength value="abcdefghij" minLength={12} />, "ja");
    const rule = screen.getByText("12 文字以上").closest("li");
    expect(rule).toHaveAttribute("data-state", "failed");
    expect(screen.queryByText("8 文字以上")).toBeNull();
  });

  it("keeps 8 as the default threshold", () => {
    render(<PasswordStrength value="abcdefgh" />);
    expect(screen.getByText("8+ characters").closest("li")).toHaveAttribute("data-state", "passed");
  });
});

describe("PasswordStrength empty state (gh#1247)", () => {
  it("is neutral while nothing is typed: no lit segment, no tone, no verdict", () => {
    const { container } = render(<PasswordStrength value="" />);
    expect(container.querySelectorAll('[data-state="filled"]')).toHaveLength(0);
    expect(container.querySelector("[data-tone]")).toBeNull();
    expect(screen.getByText("Enter a password")).toBeInTheDocument();
    expect(screen.queryByText("Weak")).toBeNull();
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live).toHaveTextContent("");
    for (const item of screen.getAllByRole("listitem")) {
      expect(item).toHaveAttribute("data-state", "pending");
    }
  });

  it("treats whitespace-only as empty", () => {
    const { container } = render(<PasswordStrength value="   " />);
    expect(container.querySelectorAll('[data-state="filled"]')).toHaveLength(0);
    expect(screen.getByText("Enter a password")).toBeInTheDocument();
  });

  it("reads the empty line in the active locale and from labels.empty", () => {
    const { unmount } = render(<PasswordStrength value="" />, "ja");
    expect(screen.getByText("パスワードを入力")).toBeInTheDocument();
    unmount();
    render(<PasswordStrength value="" labels={{ empty: "未入力" }} />);
    expect(screen.getByText("未入力")).toBeInTheDocument();
  });

  // The meter lights `score + 1` of five segments once there is input, so "a" (score 1) lights two
  // destructive segments and a passing password (score 4) lights all five.
  it("scores from the first character: destructive at once, all five for a strong one", () => {
    const { container, rerender } = render(<PasswordStrength value="" />);
    const wrap = (value: string) => (
      <AppProvider persist={false} defaultLocale="en" fallbackLocale="en">
        <PasswordStrength value={value} />
      </AppProvider>
    );
    rerender(wrap("a"));
    const filled = container.querySelectorAll('[data-state="filled"]');
    expect(filled).toHaveLength(2);
    for (const segment of filled) expect(segment).toHaveAttribute("data-tone", "destructive");
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Password strength: Weak",
    );
    rerender(wrap("Abcdef1!"));
    expect(container.querySelectorAll('[data-state="filled"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-tone="success"]')).toHaveLength(5);
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });
});

describe("usePasswordStrength minLength (gh#1193)", () => {
  it("scores the length rule against minLength", () => {
    expect(
      renderHook(() => usePasswordStrength("abcdefghij", ["length"], 12)).result.current.checks
        .length,
    ).toBe(false);
    expect(
      renderHook(() => usePasswordStrength("abcdefghijkl", ["length"], 12)).result.current.score,
    ).toBe(1);
  });
});
