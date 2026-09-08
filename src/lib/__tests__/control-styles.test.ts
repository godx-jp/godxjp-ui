import { describe, expect, it } from "vitest";
import {
  controlIconClass,
  controlIconSmClass,
  controlMultilineClass,
  controlSurfaceTriggerClass,
  controlTriggerClass,
  tableCellPaddingClass,
  tableHeadHeightClass,
  tableRowHeightClass,
  toneDestructiveClass,
  toneInfoClass,
  toneNeutralClass,
  toneSuccessClass,
  toneWarningClass,
} from "../control-styles";

describe("control-styles (token wiring)", () => {
  describe("form controls", () => {
    it("controlMultilineClass uses ui-control-multiline", () => {
      expect(controlMultilineClass).toContain("ui-control-multiline");
      expect(controlMultilineClass).toContain("border-input");
    });

    it("controlTriggerClass uses ui-control flex layout", () => {
      expect(controlTriggerClass).toContain("ui-control");
      expect(controlTriggerClass).toContain("flex");
      expect(controlTriggerClass).toContain("items-center");
      expect(controlTriggerClass).not.toMatch(/\bh-9\b/);
      // The historical surface pair stays on THIS export — every non-select consumer still reads
      // its border and fill from the utilities layer.
      expect(controlTriggerClass).toContain("border-input");
      expect(controlTriggerClass).toContain("bg-background");
    });

    it("controlSurfaceTriggerClass withholds the surface utilities and wears ui-control-surface", () => {
      // The point of the export: `@layer utilities` beats `@layer components`, so a trigger that
      // carries `border-input` / `bg-background` can never be recoloured by the antd
      // `variant` × `status` rules in control.css (the gh#366 / gh#375 trap). It must therefore
      // state neither, and must carry the class those rules key on.
      expect(controlSurfaceTriggerClass).toContain("ui-control-surface");
      expect(controlSurfaceTriggerClass).not.toMatch(/\bborder-input\b/);
      expect(controlSurfaceTriggerClass).not.toMatch(/\bbg-background\b/);
      // Everything else about the trigger is unchanged.
      expect(controlSurfaceTriggerClass).toContain("ui-control-trigger");
      expect(controlSurfaceTriggerClass).toContain("rounded-[var(--control-radius)]");
    });
  });

  describe("density-aware sizing", () => {
    it("icon classes reference --control-height", () => {
      expect(controlIconClass).toContain("var(--control-height)");
      expect(controlIconSmClass).toContain("var(--control-height)");
    });

    it("table classes reference density row/cell tokens", () => {
      expect(tableRowHeightClass).toContain("var(--table-row-height)");
      expect(tableHeadHeightClass).toContain("var(--table-row-height)");
      expect(tableCellPaddingClass).toContain("var(--table-cell-padding-y)");
    });
  });

  describe("semantic tone classes (no raw palette)", () => {
    const tones = {
      success: toneSuccessClass,
      warning: toneWarningClass,
      info: toneInfoClass,
      destructive: toneDestructiveClass,
      neutral: toneNeutralClass,
    };

    it.each(Object.entries(tones))("tone %s avoids raw Tailwind palette", (_name, cls) => {
      expect(cls).not.toMatch(/green-|blue-|amber-|red-|slate-/);
      expect(cls.length).toBeGreaterThan(10);
    });

    it("success tone uses success token", () => {
      expect(toneSuccessClass).toContain("success");
    });

    it("info tone uses info token", () => {
      expect(toneInfoClass).toContain("info");
    });

    it("warning tone uses warning token", () => {
      expect(toneWarningClass).toContain("warning");
    });
  });
});

it("clamps only SelectValue, preserving compound custom trigger content", () => {
  expect(controlTriggerClass).toContain("[&>[data-slot=select-value]]:line-clamp-1");
  expect(controlTriggerClass).not.toContain("[&>span]:line-clamp-1");
});
