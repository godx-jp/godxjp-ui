import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Timeline } from "../timeline";

/**
 * `Timeline density` — the item spacing was a hard-coded `--space-stack-md` on both the body's
 * block-end padding and the item's column gap, with no token and no prop, so an issue history
 * could not be tightened (found in godx-task). Now one token, `--timeline-item-gap`, drives both,
 * and `density="compact"` retunes it to `--space-stack-sm` on the root.
 */
const layout = readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");

function ruleBody(selector: string): string {
  const start = layout.indexOf(`${selector} {`);
  expect(start, `rule ${selector}`).toBeGreaterThan(-1);
  return layout.slice(start, layout.indexOf("}", start));
}

const ITEMS = [{ title: "作成" }, { title: "更新" }];

describe("Timeline density", () => {
  it("stamps data-density on the root, default when omitted", () => {
    const { container, rerender } = render(<Timeline items={ITEMS} />);
    expect(container.querySelector(".ui-timeline")).toHaveAttribute("data-density", "default");
    rerender(<Timeline items={ITEMS} density="compact" />);
    expect(container.querySelector(".ui-timeline")).toHaveAttribute("data-density", "compact");
  });

  it("drives the item gap and the rail gap from --timeline-item-gap (default --space-stack-md)", () => {
    expect(ruleBody(".ui-timeline-body")).toContain(
      "padding-bottom: var(--timeline-item-gap, var(--space-stack-md))",
    );
    expect(ruleBody(".ui-timeline-item")).toContain(
      "column-gap: var(--timeline-item-gap, var(--space-stack-md))",
    );
  });

  it("compact retunes the token to --space-stack-sm", () => {
    expect(ruleBody('.ui-timeline[data-density="compact"]')).toContain(
      "--timeline-item-gap: var(--timeline-item-gap-compact, var(--space-stack-sm))",
    );
  });
});
