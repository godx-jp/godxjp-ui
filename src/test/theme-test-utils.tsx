import * as React from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../app/app-provider";
import type { AppProviderProp } from "../props/components/app.prop";
import {
  DENSITY_CLASS,
  themeGlobalsToCssVars,
  type FontSizeGlobal,
  type PrimaryColorGlobal,
} from "./theme-globals";
import { densityClass } from "../lib/variants";
import type { PageDensityProp } from "../props/vocabulary/layout.prop";

export type ThemeTestOptions = {
  density?: PageDensityProp;
  fontSize?: FontSizeGlobal;
  primaryColor?: PrimaryColorGlobal;
  app?: Partial<AppProviderProp>;
};

type RenderWithThemeOptions = Omit<RenderOptions, "wrapper"> &
  ThemeTestOptions & {
    initialEntries?: string[];
  };

/** Renders UI under density + brand tokens — mirrors preview theme globals. */
export function ThemeTestRoot({
  children,
  density = "default",
  fontSize = "default",
  primaryColor = "brand",
  app,
}: React.PropsWithChildren<ThemeTestOptions>) {
  const style = themeGlobalsToCssVars({ density, fontSize, primaryColor }) as React.CSSProperties;
  return (
    <div className={densityClass[density]} style={style}>
      <AppProvider persist={false} defaultLocale="vi" fallbackLocale="en" {...app}>
        <MemoryRouter>{children}</MemoryRouter>
      </AppProvider>
    </div>
  );
}

export function renderWithTheme(
  ui: React.ReactElement,
  options?: RenderWithThemeOptions,
): RenderResult {
  const {
    density = "default",
    fontSize = "default",
    primaryColor = "brand",
    app,
    ...renderOptions
  } = options ?? {};

  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeTestRoot density={density} fontSize={fontSize} primaryColor={primaryColor} app={app}>
        {children}
      </ThemeTestRoot>
    ),
    ...renderOptions,
  });
}

export { DENSITY_CLASS, densityClass };
