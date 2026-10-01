import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MessageSquare } from "lucide-react";

import { AppProvider } from "../../../app/app-provider";
import { Timeline } from "../timeline";

/**
 * gh#1092 — an activity log is not a process. `status: "log"` draws the neutral dot and hairline
 * rail `pending` draws, and says NOTHING about status: no "Upcoming:" for a thing that already
 * happened, no "Completed:" either (antd's gray items carry no prefix).
 */
describe("Timeline status=log (gh#1092)", () => {
  const renderLog = (locale: "en" | "ja") =>
    render(
      <AppProvider persist={false} defaultLocale={locale} fallbackLocale="en">
        <Timeline
          density="compact"
          items={[
            { title: "Aki ruled a decision point", time: "08:12", status: "log" },
            { title: "Aki commented", status: "log", icon: MessageSquare },
          ]}
        />
      </AppProvider>,
    );

  it("adds no status prefix in any locale", () => {
    for (const locale of ["en", "ja"] as const) {
      const { container, unmount } = renderLog(locale);
      expect(container.querySelectorAll(".ui-timeline-title .sr-only")).toHaveLength(0);
      const first = screen.getByText("Aki ruled a decision point").closest("li")!;
      expect(first.textContent).toBe("Aki ruled a decision point08:12");
      unmount();
    }
  });

  it("is not current and leaves the rail neutral", () => {
    const { container } = renderLog("en");
    const items = container.querySelectorAll("li");
    items.forEach((item) => {
      expect(item).toHaveAttribute("data-status", "log");
      expect(item).not.toHaveAttribute("aria-current");
    });
    const line = container.querySelector(".ui-timeline-line")!;
    expect(line).not.toHaveAttribute("data-completed");
  });

  it("draws a plain pip unless the item brings its own glyph", () => {
    const { container } = renderLog("en");
    const [first, second] = container.querySelectorAll(".ui-timeline-dot");
    expect(first.querySelector(".ui-timeline-pip")).not.toBeNull();
    expect(second.querySelector("svg")).not.toBeNull();
  });

  it("paints the log dot with the neutral (pending) rule, not the primary fill", () => {
    const css = readFileSync(resolve(__dirname, "../../../styles/data-display-layout.css"), "utf8");
    expect(css).toMatch(
      /\.ui-timeline-dot\[data-status="pending"\],\s*\.ui-timeline-dot\[data-status="log"\]\s*\{\s*border-color: hsl\(var\(--border\)\);/,
    );
  });
});
