import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { AppProvider } from "../app-provider";
import { applyThemeAxes } from "../theme-axes";

function html() {
  return document.documentElement;
}

afterEach(() => {
  for (const k of ["theme", "brand", "density", "fontSize"]) delete html().dataset[k];
  html().style.removeProperty("--scaling");
});

describe("applyThemeAxes", () => {
  it("writes data-* attributes for set axes", () => {
    applyThemeAxes(html(), { theme: "dark", density: "compact", fontSize: "sm" });
    expect(html().dataset.theme).toBe("dark");
    expect(html().dataset.density).toBe("compact");
    expect(html().dataset.fontSize).toBe("sm"); // camelCase → data-font-size
  });

  it("sets data-brand for a preset and removes it for null (opt-out)", () => {
    applyThemeAxes(html(), { brand: "crm" });
    expect(html().dataset.brand).toBe("crm");
    applyThemeAxes(html(), { brand: null });
    expect(html().dataset.brand).toBeUndefined();
  });

  it("leaves untouched the axes not passed", () => {
    html().dataset.theme = "dark";
    applyThemeAxes(html(), { density: "comfortable" });
    expect(html().dataset.theme).toBe("dark");
    expect(html().dataset.density).toBe("comfortable");
  });

  it("sets inline --scaling for a number and removes it for null (defer to density)", () => {
    applyThemeAxes(html(), { scaling: 0.95 });
    expect(html().style.getPropertyValue("--scaling")).toBe("0.95");
    applyThemeAxes(html(), { scaling: null });
    expect(html().style.getPropertyValue("--scaling")).toBe("");
  });
});

describe("AppProvider theme axes", () => {
  it("applies the axis props onto <html> (brand opt-out → no data-brand)", () => {
    render(
      <AppProvider persist={false} density="compact" fontSize="sm" theme="dark">
        <div />
      </AppProvider>,
    );
    expect(html().dataset.density).toBe("compact");
    expect(html().dataset.fontSize).toBe("sm");
    expect(html().dataset.theme).toBe("dark");
    expect(html().dataset.brand).toBeUndefined();
  });

  it("emits data-brand when a brand preset is given", () => {
    render(
      <AppProvider persist={false} brand="logistics">
        <div />
      </AppProvider>,
    );
    expect(html().dataset.brand).toBe("logistics");
  });
});
