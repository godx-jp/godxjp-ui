import { describe, expect, it } from "vitest";
import {
  DENSITY_CLASS,
  DENSITY_GLOBALS,
  FONT_SIZE_GLOBALS,
  PRIMARY_COLOR_GLOBALS,
  PRIMARY_COLOR_VARS,
  themeGlobalsToClassName,
  themeGlobalsToCssVars,
} from "./theme-globals";

describe("themeGlobalsToCssVars", () => {
  describe("primaryColor presets", () => {
    it.each(PRIMARY_COLOR_GLOBALS)(
      "preset %s defines primary, ring, accent, foreground",
      (preset) => {
        const vars = PRIMARY_COLOR_VARS[preset];
        expect(vars["--primary"]).toMatch(/^\d+ \d+% \d+%$/);
        expect(vars["--ring"]).toMatch(/^\d+ \d+% \d+%$/);
        expect(vars["--accent"]).toMatch(/^\d+ \d+% \d+%$/);
        expect(vars["--accent-foreground"]).toMatch(/^\d+ \d+% \d+%$/);
        expect(vars["--primary-foreground"]).toBe("0 0% 100%");
      },
    );

    it("maps partner orange to Tailwind hsl aliases", () => {
      expect(themeGlobalsToCssVars({ primaryColor: "partner" })).toMatchObject({
        "--primary": "24 95% 53%",
        "--accent": "24 95% 95%",
        "--color-primary": "hsl(24 95% 53%)",
        "--color-ring": "hsl(24 95% 53%)",
        "--color-accent": "hsl(24 95% 95%)",
        "--color-accent-foreground": "hsl(24 95% 28%)",
      });
    });

    it("defaults to GodX navy when primaryColor omitted", () => {
      const vars = themeGlobalsToCssVars({});
      expect(vars["--color-primary"]).toBe("hsl(211 73% 15%)");
      expect(vars["--color-ring"]).toBe("hsl(24 99% 46%)");
      expect(vars["--accent"]).toBe("24 99% 95%");
    });
  });

  describe("fontSize scale", () => {
    it.each(FONT_SIZE_GLOBALS)("fontSize=%s produces stable output", (fontSize) => {
      const vars = themeGlobalsToCssVars({ fontSize });
      expect(vars).toBeTypeOf("object");
    });

    it("scales typography for sm and lg", () => {
      expect(themeGlobalsToCssVars({ fontSize: "sm" })["--font-size-sm"]).toBe("0.8125rem");
      expect(themeGlobalsToCssVars({ fontSize: "lg" })["--font-size-sm"]).toBe("0.9375rem");
    });

    it("default fontSize does not override --font-size-sm", () => {
      expect(themeGlobalsToCssVars({ fontSize: "default" })).not.toHaveProperty("--font-size-sm");
    });
  });

  it("merges fontSize + primaryColor in one object", () => {
    const vars = themeGlobalsToCssVars({ fontSize: "lg", primaryColor: "crm" });
    expect(vars["--font-size-base"]).toBe("1.0625rem");
    expect(vars["--primary"]).toBe("262 83% 58%");
    expect(vars["--color-primary"]).toBe("hsl(262 83% 58%)");
  });
});

describe("themeGlobalsToClassName", () => {
  it.each(DENSITY_GLOBALS)("density %s maps to ui-density-* class", (density) => {
    expect(themeGlobalsToClassName({ density })).toBe(DENSITY_CLASS[density]);
  });

  it("defaults density to ui-density-default", () => {
    expect(themeGlobalsToClassName({})).toBe(DENSITY_CLASS.default);
  });
});
