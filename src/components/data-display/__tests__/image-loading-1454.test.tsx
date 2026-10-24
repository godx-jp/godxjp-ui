import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { Image } from "../image";

const renderEn = (ui: React.ReactElement) =>
  render(
    <AppProvider defaultLocale="en" persist={false}>
      {ui}
    </AppProvider>,
  );

/** gh#1454: lazy by default; the LCP picture (fetchPriority="high") loads eagerly. */
describe("Image loading / decoding defaults", () => {
  it("is lazy and decodes asynchronously by default", () => {
    renderEn(<Image src="/a.png" alt="Shot" preview={false} />);
    const img = screen.getByRole("img", { name: "Shot" });
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).not.toHaveAttribute("fetchpriority");
  });

  it("fetchPriority=high defaults loading to eager and keeps decoding async", () => {
    renderEn(<Image src="/a.png" alt="Shot" preview={false} fetchPriority="high" />);
    const img = screen.getByRole("img", { name: "Shot" });
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("explicit loading / decoding win", () => {
    renderEn(<Image src="/a.png" alt="Shot" preview={false} loading="eager" decoding="sync" fetchPriority="low" />);
    const img = screen.getByRole("img", { name: "Shot" });
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("decoding", "sync");
    expect(img).toHaveAttribute("fetchpriority", "low");
  });

  it("applies inside a preview frame too", () => {
    renderEn(<Image src="/a.png" alt="Shot" />);
    const img = screen.getByRole("button", { name: "Preview: Shot" }).querySelector("img");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
  });
});
