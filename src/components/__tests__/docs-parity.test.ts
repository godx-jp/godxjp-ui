import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

// Re-authored 2026-06: the old suite read a `docs/primitives/<group>/<name>/index.md` + `examples/`
// layout that no longer exists (the preview catalog was rebuilt to flat docs/<group>/<name>.tsx).
// We now verify the actual guarantee — that the shadcn-compatible COMPOUND sub-components remain
// part of the public surface — by asserting they are exported from their group barrels. This is
// less brittle than coupling to specific doc prose and catches an accidental compound-export drop.
describe("shadcn-compatible compound exports", () => {
  it("exposes Select compound parts", () => {
    const src = read("src/components/data-entry/index.ts");
    expect(src).toContain("SelectLabel");
    expect(src).toContain("SelectSeparator");
  });

  it("exposes DropdownMenu compound parts", () => {
    const src = read("src/components/navigation/index.ts");
    expect(src).toContain("DropdownMenuCheckboxItem");
    expect(src).toContain("DropdownMenuRadioItem");
    expect(src).toContain("DropdownMenuShortcut");
  });

  it("exposes Popover compound parts", () => {
    const src = read("src/components/data-display/index.ts");
    expect(src).toContain("PopoverHeader");
    expect(src).toContain("PopoverTitle");
    expect(src).toContain("PopoverDescription");
  });

  it("exposes Sheet compound parts", () => {
    expect(read("src/components/feedback/index.ts")).toContain("SheetFooter");
  });

  it("Tabs exposes a variant prop", () => {
    expect(read("src/components/navigation/tabs.tsx")).toContain("variant");
  });
});
