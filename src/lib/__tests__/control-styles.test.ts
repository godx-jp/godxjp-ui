import { describe, expect, it } from "vitest";
import {
  controlFieldClass,
  controlIconClass,
  controlIconSmClass,
  controlMultilineClass,
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
    it("controlFieldClass uses ui-control + ring token", () => {
      expect(controlFieldClass).toContain("ui-control");
      expect(controlFieldClass).toContain("border-input");
      expect(controlFieldClass).toContain("focus-visible:ring-ring");
    });

    it("controlMultilineClass uses ui-control-multiline", () => {
      expect(controlMultilineClass).toContain("ui-control-multiline");
      expect(controlMultilineClass).toContain("border-input");
    });

    it("controlTriggerClass uses ui-control flex layout", () => {
      expect(controlTriggerClass).toContain("ui-control");
      expect(controlTriggerClass).toContain("flex");
      expect(controlTriggerClass).toContain("items-center");
      expect(controlTriggerClass).not.toMatch(/\bh-9\b/);
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
