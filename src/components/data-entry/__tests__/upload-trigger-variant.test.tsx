import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { Upload } from "../upload";

/**
 * `triggerSize` already lets a toolbar shrink the trigger to a 32px square. `triggerVariant`
 * is the other half: inside a chat composer the attach control sits in a row of borderless
 * icon buttons, and a bordered square reads as the odd one out. Default stays `outline`, which
 * is right for a standalone form field — no existing consumer changes.
 */
describe("Upload trigger variant", () => {
  const trigger = (ui: React.ReactElement) =>
    renderWithUi(ui).container.querySelector('button[type="button"]')!;

  it("keeps the outline trigger by default", () => {
    expect(trigger(<Upload variant="button" />).getAttribute("data-variant")).toBe("outline");
  });

  it("forwards the requested variant to the trigger", () => {
    const el = trigger(<Upload variant="button" triggerVariant="ghost" />);
    expect(el.getAttribute("data-variant")).toBe("ghost");
  });

  it("composes with triggerSize", () => {
    // The composer asks for both: ghost weight AND a 32px square.
    const el = trigger(<Upload variant="button" triggerVariant="ghost" triggerSize="icon-sm" />);
    expect(el.getAttribute("data-variant")).toBe("ghost");
    expect(el.getAttribute("data-size")).toBe("icon-sm");
  });
});
