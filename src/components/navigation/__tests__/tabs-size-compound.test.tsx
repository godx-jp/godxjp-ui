import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Tabs, TabsList, TabsTrigger } from "../tabs";

/**
 * `size` has to reach the COMPOUND form.
 *
 * The tier used to be computed inside `Tabs` and handed only to the triggers the `items` renderer
 * builds. A navigation strip has to be written as `<TabsList><TabsTrigger>` — and there the prop
 * did nothing: a consumer measured `data-size="sm"` on the root while the trigger still painted
 * `--tabs-trigger-padding-x-md` (godx-jp/id#518).
 *
 * Asserted through the token NAME rather than a pixel: the class carries the tier's own variable,
 * and jsdom resolves no custom properties. `check:no-tailwind-class-assertions` allows this one —
 * the token reference IS the contract here, not a styling shortcut.
 */
describe("Tabs size — compound form", () => {
  const strip = (size?: "sm" | "md" | "lg") =>
    renderWithUi(
      <Tabs aria-label="View" defaultValue="a" variant="line" size={size}>
        <TabsList variant="line">
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

  it.each(["sm", "lg"] as const)("puts the %s tier on a compound trigger", (size) => {
    strip(size);

    expect(screen.getByRole("tab", { name: "A" }).className).toContain(
      `--tabs-trigger-padding-x-${size}`,
    );
  });

  it("defaults to md, like the items form", () => {
    strip();

    expect(screen.getByRole("tab", { name: "A" }).className).toContain(
      "--tabs-trigger-padding-x-md",
    );
  });
});
