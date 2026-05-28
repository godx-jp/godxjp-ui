import * as React from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { withRenderLoopGuard } from "./render-loop-guard";
import { AppProvider } from "../app/app-provider";

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider persist={false} defaultLocale="vi" fallbackLocale="en">
      <MemoryRouter>{children}</MemoryRouter>
    </AppProvider>
  );
}

export type RenderWithUiOptions = Omit<RenderOptions, "wrapper"> & {
  loopGuard?: boolean | { maxRenders?: number; label?: string };
};

export function renderWithUi(ui: React.ReactElement, options?: RenderWithUiOptions): RenderResult {
  const { loopGuard = true, ...renderOptions } = options ?? {};
  const guardedUi =
    loopGuard === false ? ui : withRenderLoopGuard(ui, loopGuard === true ? undefined : loopGuard);

  return render(guardedUi, { wrapper: AllProviders, ...renderOptions });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
export { RenderLoopGuard, withRenderLoopGuard } from "./render-loop-guard";
