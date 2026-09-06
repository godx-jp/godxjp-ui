import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

/**
 * A Command list (or a menu, or a table) inside a popover has to reach the panel
 * edges, and the only route was a zero-padding utility on `className`, which no service theme can
 * retune. `flush` keeps the inset on `--popover-space-inset`: the panel zeroes ITS OWN copy of the
 * token, so a service that retunes the token still owns every padded popover.
 */
const panelCss = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../../styles/dialog-layout.css"),
  "utf8",
);

function panel(flush: boolean) {
  const { container } = renderWithUi(
    <Popover defaultOpen>
      <PopoverTrigger>open</PopoverTrigger>
      <PopoverContent flush={flush}>list</PopoverContent>
    </Popover>,
  );
  // Portalled — the panel is not inside `container`.
  void container;
  return document.querySelector('[data-slot="popover-content"]') as HTMLElement;
}

describe("PopoverContent flush (gh#354 · item 3)", () => {
  it("zeroes the panel inset on the token the padding already reads", () => {
    const content = panel(true);
    expect(content).toHaveAttribute("data-flush", "");
    expect(content.style.getPropertyValue("--popover-space-inset")).toBe("0");
    // The padding declaration itself is untouched — it still reads the token, so the override
    // reaches it and a themed inset keeps working for every non-flush popover.
    expect(panelCss).toContain("padding: var(--popover-space-inset);");
  });

  it("emits neither the attribute nor the override without the prop", () => {
    const content = panel(false);
    expect(content).not.toHaveAttribute("data-flush");
    expect(content.style.getPropertyValue("--popover-space-inset")).toBe("");
  });
});
