import * as React from "react";
import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { Welcome } from "../welcome";

/**
 * Welcome behaviour — the greeting block (Ant Design X `Welcome`).
 *
 * Four of Ant's five slots are pure rendering; the two that carry a DECISION are asserted here:
 * a `string` icon beginning with `http` becomes an image, and `extra` sits on the title row.
 */
describe("Welcome", () => {
  it("renders the title as a heading and the description beside it", () => {
    renderWithUi(<Welcome title="こんにちは" description="何をお手伝いしましょうか" />);

    expect(screen.getByRole("heading", { name: "こんにちは" })).toBeInTheDocument();
    expect(screen.getByText("何をお手伝いしましょうか")).toBeInTheDocument();
  });

  it("takes Ant's heading level (Typography.Title level 4) rather than inventing a prop", () => {
    renderWithUi(<Welcome title="こんにちは" />);

    expect(screen.getByRole("heading", { level: 4, name: "こんにちは" })).toBeInTheDocument();
  });

  it("renders an http(s) string icon as a DECORATIVE image, not as text", () => {
    const { container } = renderWithUi(
      <Welcome icon="https://example.test/bot.png" title="こんにちは" />,
    );

    const image = container.querySelector("img");
    expect(image).toHaveAttribute("src", "https://example.test/bot.png");
    // `alt=""` plus the aria-hidden wrapper: the glyph duplicates the title beside it.
    expect(image).toHaveAttribute("alt", "");
    expect(screen.queryByText("https://example.test/bot.png")).not.toBeInTheDocument();
  });

  it("renders a non-URL string icon as the text it is", () => {
    renderWithUi(<Welcome icon="GX" title="こんにちは" />);

    expect(screen.getByText("GX")).toBeInTheDocument();
  });

  it("puts `extra` on the TITLE row, not under the description", () => {
    const { container } = renderWithUi(
      <Welcome
        title="こんにちは"
        description="何をお手伝いしましょうか"
        extra={<button type="button">閉じる</button>}
      />,
    );

    const row = container.querySelector('[data-slot="welcome-title-row"]');
    expect(row).not.toBeNull();
    expect(row?.contains(screen.getByRole("button", { name: "閉じる" }))).toBe(true);
  });

  it("carries the variant as an attribute so the chrome is a token decision, not a class", () => {
    const { container } = renderWithUi(<Welcome title="こんにちは" variant="borderless" />);

    expect(container.querySelector('[data-slot="welcome"]')).toHaveAttribute(
      "data-variant",
      "borderless",
    );
  });

  it("defaults to Ant's `filled`", () => {
    const { container } = renderWithUi(<Welcome title="こんにちは" />);

    expect(container.querySelector('[data-slot="welcome"]')).toHaveAttribute(
      "data-variant",
      "filled",
    );
  });

  it("renders nothing for a slot it was not given", () => {
    const { container } = renderWithUi(<Welcome title="こんにちは" />);

    expect(container.querySelector('[data-slot="welcome-icon"]')).toBeNull();
    expect(container.querySelector('[data-slot="welcome-extra"]')).toBeNull();
  });
});
