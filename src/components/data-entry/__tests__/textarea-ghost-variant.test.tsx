import { describe, expect, it } from "vitest";

import { renderWithUi } from "@/test/render";
import { Textarea } from "../textarea";

/**
 * A textarea embedded in a surface that already draws the box (a chat composer inside a Card)
 * must not draw a second one. Two nested rounded borders is the tell.
 *
 * This cannot be a token override by the consumer: `.ui-control-multiline` reads
 * `--control-border-width` from `@layer components`, but the default class also carries
 * Tailwind's `border` from `@layer utilities`, which wins whatever the token says. Measured in
 * Chromium — with `--control-border-width: 0px` set on a wrapper, the field still computed
 * `border-width: 1px`. Same structural inertness gh#260 found on Badge's font size, so the
 * variant has to drop the utilities rather than re-point a token.
 */
describe("Textarea ghost variant", () => {
  const classesOf = (ui: React.ReactElement) =>
    renderWithUi(ui).container.querySelector("textarea")!.className;

  it("keeps the standalone chrome by default", () => {
    const cls = classesOf(<Textarea aria-label="Message" />);
    expect(cls).toContain("border");
    expect(cls).toContain("bg-background");
  });

  it("drops border, background and shadow when ghost", () => {
    const cls = classesOf(<Textarea aria-label="Message" variant="ghost" />);
    expect(cls).toContain("border-0");
    expect(cls).toContain("bg-transparent");
    expect(cls).toContain("shadow-none");
    expect(cls).not.toContain("border-input");
  });

  it("hands the focus ring to the surface", () => {
    // The wrapper owns focus via `focus-within`; a ring on both draws two.
    const cls = classesOf(<Textarea aria-label="Message" variant="ghost" />);
    expect(cls).toContain("focus-visible:ring-0");
    expect(cls).not.toContain("focus-visible:ring-[3px]");
  });

  it("releases the standalone min-height so `rows` decides", () => {
    // `.ui-control-multiline` floors a standalone field at ~2.75 rows, which is a whole
    // composer taller than the one-line box a chat surface opens with.
    expect(classesOf(<Textarea aria-label="Message" variant="ghost" />)).toContain("min-h-0");
  });

  it("still clears through the inline ✕", () => {
    // The variant is chrome only — behaviour must not fork.
    const { container } = renderWithUi(
      <Textarea aria-label="Message" variant="ghost" allowClear defaultValue="xin chào" />,
    );
    expect(container.querySelector("textarea")).not.toBeNull();
    expect(container.querySelector("button")).not.toBeNull();
  });
});
