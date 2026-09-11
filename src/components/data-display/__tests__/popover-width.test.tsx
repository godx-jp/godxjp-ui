import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";

import { Popover, PopoverContent, PopoverTrigger } from "../popover";

/**
 * `width` is the counterpart `flush` never had.
 *
 * `flush` exists because zeroing the panel's padding from `className` is a per-call-site constant
 * no service theme can retune — the catalog's own Popover bullet says so in as many words. The
 * INLINE MEASURE had exactly the same problem and no prop: a panel is `--popover-width` (18rem),
 * and anything with a width of its own — a two-month `Calendar` is the case that surfaced it — was
 * clipped by it unless the call site wrote `className="w-auto"`. The library's internal
 * `.ui-control-panel-flush` has always set BOTH knobs; this is the public half.
 *
 * Both assertions read the declaration out of the stylesheet as well as the element, because jsdom
 * paints nothing: an inline custom property that no rule consumes would look identical here.
 */
const panelCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/dialog-layout.css"),
  "utf8",
);

function panel(props: { width?: "panel" | "auto" | "trigger" }) {
  renderWithUi(
    <Popover defaultOpen>
      <PopoverTrigger>open</PopoverTrigger>
      <PopoverContent {...props}>body</PopoverContent>
    </Popover>,
  );
  // Portalled — the panel is not inside the render container.
  return document.querySelector('[data-slot="popover-content"]') as HTMLElement;
}

describe("PopoverContent width", () => {
  it("reads the same token the panel's own width declaration reads", () => {
    expect(panelCss).toContain("width: var(--popover-surface-inline-size, var(--popover-width));");
  });

  it("lets the content decide with width=auto", () => {
    const content = panel({ width: "auto" });
    expect(content).toHaveAttribute("data-width", "auto");
    expect(content.style.getPropertyValue("--popover-surface-inline-size")).toBe("auto");
  });

  it("matches the anchor with width=trigger", () => {
    const content = panel({ width: "trigger" });
    expect(content).toHaveAttribute("data-width", "trigger");
    expect(content.style.getPropertyValue("--popover-surface-inline-size")).toBe(
      "var(--trigger-width)",
    );
  });

  /** Quiet default (rule #44): `panel` is the behaviour every existing popover already has. */
  it("emits neither the attribute nor the override for the default measure", () => {
    for (const props of [{}, { width: "panel" as const }]) {
      const content = panel(props);
      expect(content).not.toHaveAttribute("data-width");
      expect(content.style.getPropertyValue("--popover-surface-inline-size")).toBe("");
    }
  });
});
