import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Heading, Text } from "../typography";

describe("Heading / Text — truncate", () => {
  it("Heading sets data-truncate when truncate is on, omits it otherwise", () => {
    const { rerender, container } = render(
      <Heading level={2} truncate>
        長いタイトル
      </Heading>,
    );
    expect(container.querySelector('[data-slot="heading"]')).toHaveAttribute("data-truncate", "");
    rerender(<Heading level={2}>普通</Heading>);
    expect(container.querySelector('[data-slot="heading"]')).not.toHaveAttribute("data-truncate");
  });

  it("Text sets data-truncate when truncate is on", () => {
    render(<Text truncate>長い本文</Text>);
    const text = screen.getByText("長い本文");
    expect(text).toHaveAttribute("data-slot", "text");
    expect(text).toHaveAttribute("data-truncate", "");
  });
});

describe("Text — clamp (issue #261)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const longJa =
    "クラウド会計・請求書発行・経費精算・勤怠管理までを一つの契約で提供する統合バックオフィスサービスです。組織の規模や業種に合わせてプランを選択できます。";

  it("clamp={2} emits data-clamp + the --text-clamp style var, and keeps the full text in the DOM", () => {
    render(
      <Text as="p" size="sm" tone="muted" clamp={2}>
        {longJa}
      </Text>,
    );
    const text = screen.getByText(longJa);
    expect(text.tagName).toBe("P");
    expect(text).toHaveAttribute("data-clamp", "");
    expect(text.style.getPropertyValue("--text-clamp")).toBe("2");
    // Visual-only: nothing about the accessible content changes.
    expect(text).toHaveTextContent(longJa);
  });

  it("omits data-clamp and the style var when clamp is not passed", () => {
    render(<Text>短い本文</Text>);
    const text = screen.getByText("短い本文");
    expect(text).not.toHaveAttribute("data-clamp");
    expect(text.style.getPropertyValue("--text-clamp")).toBe("");
  });

  it("clamp wins over truncate when both are set, and warns in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text truncate clamp={3}>
        {longJa}
      </Text>,
    );
    const text = screen.getByText(longJa);
    expect(text).toHaveAttribute("data-clamp", "");
    expect(text).not.toHaveAttribute("data-truncate");
    expect(text.style.getPropertyValue("--text-clamp")).toBe("3");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("mutually exclusive"));
  });

  it("ignores an invalid clamp (< 1) with a dev warning, leaving truncate intact", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text truncate clamp={0}>
        {longJa}
      </Text>,
    );
    const text = screen.getByText(longJa);
    expect(text).not.toHaveAttribute("data-clamp");
    expect(text).toHaveAttribute("data-truncate", "");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("clamp"));
  });

  it("floors a fractional clamp to a whole line count", () => {
    render(<Text clamp={2.7}>本文</Text>);
    expect(screen.getByText("本文").style.getPropertyValue("--text-clamp")).toBe("2");
  });

  it("merges --text-clamp with a caller-supplied style object", () => {
    render(
      <Text clamp={2} style={{ maxWidth: "16rem" }}>
        本文と余白
      </Text>,
    );
    const text = screen.getByText("本文と余白");
    expect(text.style.getPropertyValue("--text-clamp")).toBe("2");
    expect(text.style.maxWidth).toBe("16rem");
  });
});

describe("Heading — weight", () => {
  it("defaults to medium (preserving the existing heading weight)", () => {
    const { container } = render(<Heading level={1}>タイトル</Heading>);
    expect(container.querySelector('[data-slot="heading"]')).toHaveAttribute(
      "data-weight",
      "medium",
    );
  });

  it("renders a bold heading while staying a semantic <h1> (issue #121)", () => {
    const { container } = render(
      <Heading level={1} weight="bold">
        ブランド
      </Heading>,
    );
    const heading = container.querySelector('[data-slot="heading"]')!;
    expect(heading.tagName).toBe("H1");
    expect(heading).toHaveAttribute("data-weight", "bold");
  });
});
