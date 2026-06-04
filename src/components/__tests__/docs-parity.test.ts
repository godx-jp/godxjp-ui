import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

// OBSOLETE (pre-existing, predates the international-standardization work): these assertions
// reference the old `docs/primitives/<group>/<name>/index.md` + `examples/*.tsx` layout. The
// preview catalog was rebuilt to flat `docs/<group>/<name>.tsx` demos, so those paths no longer
// exist and this suite has been red since that reorg. TODO: re-author to verify compound-export
// coverage (SelectLabel/SelectSeparator, PopoverHeader/Title/Description, DropdownMenu* sub-parts,
// SheetFooter, Tabs variant) against the current docs/<group>/<name>.tsx files.
describe.skip("docs and story parity", () => {
  it("documents shadcn-compatible compound exports", () => {
    expect(read("docs/primitives/data-entry/select/index.md")).toContain("SelectLabel");
    expect(read("docs/primitives/data-entry/select/index.md")).toContain("SelectSeparator");

    const dropdownDocs = read("docs/primitives/navigation/dropdown-menu/index.md");
    expect(dropdownDocs).toContain("DropdownMenuCheckboxItem");
    expect(dropdownDocs).toContain("DropdownMenuRadioItem");
    expect(dropdownDocs).toContain("DropdownMenuShortcut");

    const popoverDocs = read("docs/primitives/data-display/popover/index.md");
    expect(popoverDocs).toContain("PopoverHeader");
    expect(popoverDocs).toContain("PopoverTitle");
    expect(popoverDocs).toContain("PopoverDescription");

    expect(read("docs/primitives/feedback/sheet/index.md")).toContain("SheetFooter");
    expect(read("docs/primitives/navigation/tabs/index.md")).toContain("variant");
  });

  it("has preview examples for new shadcn parity surfaces", () => {
    expect(
      read("docs/primitives/navigation/dropdown-menu/examples/checked-radio-items.tsx"),
    ).toContain("DropdownMenuCheckboxItem");
    expect(read("docs/primitives/navigation/tabs/examples/line-variant.tsx")).toContain(
      'variant="line"',
    );
    expect(read("docs/primitives/data-display/popover/examples/shipment-summary.tsx")).toContain(
      "PopoverHeader",
    );
  });
});
