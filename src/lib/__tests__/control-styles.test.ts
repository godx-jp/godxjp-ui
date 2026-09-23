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
      // gh#880 moved the surface pair off the utilities layer. `border-input` / `bg-background`
      // sit in `@layer utilities`, which outranks `@layer components`, so while a field carried
      // them NO rule this package could write could recolour it — the same trap gh#366/gh#375
      // documented for the select trigger, still live on Input and Textarea. They now wear
      // `.ui-control-outlined-surface`, which reads `--control-surface-background` /
      // `--control-surface-border-color`: tokens that were already published and already reached
      // the select family, and that three quarters of the field family had no route to.
      expect(controlMultilineClass).toContain("ui-control-outlined-surface");
      expect(controlMultilineClass).not.toMatch(/\bborder-input\b/);
    });

    it("controlTriggerClass uses ui-control flex layout", () => {
      expect(controlTriggerClass).toContain("ui-control");
      expect(controlTriggerClass).toContain("flex");
      expect(controlTriggerClass).toContain("items-center");
      expect(controlTriggerClass).not.toMatch(/\bh-9\b/);
      // The surface pair is no longer a pair of UTILITIES (gh#880): see the note on
      // `controlMultilineClass` above. The trigger reads the same published tokens the select
      // family already did, through one shared class.
      expect(controlTriggerClass).toContain("ui-control-outlined-surface");
      expect(controlTriggerClass).not.toMatch(/\bborder-input\b/);
      expect(controlTriggerClass).not.toMatch(/\bbg-background\b/);
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

/*
 * gh#813: `YYYY-MM-DD（年-月-日）` was clipped by 59px in a 101px value box and showed
 * `YYYY-MM-DD（全` — a format string cut through a glyph with nothing saying it had been cut.
 * jsdom lays nothing out, so what this file can hold is the pair of declarations that produce the
 * ellipsis; the pixels were measured in Chromium AND Firefox on
 * `/isolate/navigation-app-setting-picker`.
 */
it("ellipsizes a SelectValue that does not fit, in both engines", () => {
  // Blink paints the ellipsis from `text-overflow` on the clamped box…
  expect(controlTriggerClass).toContain("[&>[data-slot=select-value]]:text-ellipsis");
  // …Gecko ignores `text-overflow` there and paints `-webkit-line-clamp`'s own ellipsis instead,
  // which only engages if the value may break. The trigger's own `whitespace-nowrap` forbids that,
  // so the VALUE opts back out of it. The clamp keeps it to one line either way.
  expect(controlTriggerClass).toContain("[&>[data-slot=select-value]]:whitespace-normal");
  expect(controlTriggerClass).toContain("whitespace-nowrap");
});
