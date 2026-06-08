import { describe, expect, it } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";

import { PasswordStrength, usePasswordStrength } from "../password-strength";

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
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Password strength 1/4");
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
});
