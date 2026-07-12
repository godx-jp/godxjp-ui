import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

describe("feedback, query and reveal frame contracts", () => {
  it.each([
    [
      "docs/feedback/alert.tsx",
      [
        "Alert",
        "AlertTitle",
        "AlertContent",
        "AlertDescription",
        "AlertActions",
        "AlertQueryError",
      ],
    ],
    [
      "docs/feedback/skeleton.tsx",
      ["Skeleton", "SkeletonRows", "SkeletonTable", "SkeletonDetail", "SkeletonStat"],
    ],
    [
      "docs/feedback/tooltip.tsx",
      ["TooltipProvider", "Tooltip", "TooltipTrigger", "TooltipContent"],
    ],
    ["docs/query/button-refetch.tsx", ["ButtonRefetch"]],
    ["docs/general/reveal.tsx", ["Reveal"]],
  ])("renders every standalone export in %s", (file, exports) => {
    const source = read(file as string);
    for (const name of exports as string[]) expect(source).toMatch(new RegExp(`<${name}(?:\\s|>)`));
  });

  it("renders the consumer-facing Dialog and AlertDialog composition slots", () => {
    const frame = read("docs/feedback/dialog.tsx");
    for (const name of [
      "Dialog",
      "DialogTrigger",
      "DialogContent",
      "DialogHeader",
      "DialogTitle",
      "DialogDescription",
      "DialogFooter",
    ]) {
      expect(frame).toMatch(new RegExp(`<${name}(?:\\s|>)`));
    }
    const owner = read("src/components/feedback/dialog.tsx");
    for (const contract of [
      "DialogPortal",
      "DialogOverlay",
      "DialogPrimitive.Close",
      "AlertDialogPrimitive.Portal",
      "AlertDialogPrimitive.Overlay",
    ]) {
      expect(owner).toContain(contract);
    }
  });

  it("renders Sheet public slots and verifies owned portal, overlay and close composition", () => {
    const frame = read("docs/feedback/sheet.tsx");
    for (const name of [
      "Sheet",
      "SheetTrigger",
      "SheetContent",
      "SheetHeader",
      "SheetTitle",
      "SheetDescription",
      "SheetBody",
      "SheetFooter",
    ]) {
      expect(frame).toMatch(new RegExp(`<${name}(?:\\s|>)`));
    }
    const owner = read("src/components/feedback/sheet.tsx");
    for (const contract of ["SheetPortal", "SheetOverlay", "DialogPrimitive.Close"])
      expect(owner).toContain(contract);
  });
});
