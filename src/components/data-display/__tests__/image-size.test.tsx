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

/**
 * Image sizing: antd `width` / `height` size the frame, `size` puts it on the Thumbnail scale,
 * `fit` crops or letterboxes, `caption` holds text to the picture's width. Geometry is measured
 * in Chromium (`image-preview-browser-1077.test.tsx`).
 */
describe("Image size / width / height / fit / caption", () => {
  it("size marks the frame and crops the picture by default", () => {
    renderEn(<Image src="/a.png" alt="Shot" size="md" />);
    const frame = screen.getByRole("button", { name: "Preview: Shot" });
    expect(frame).toHaveAttribute("data-size", "md");
    expect(frame).toHaveAttribute("data-sized", "");
    expect(frame.querySelector("img")).toHaveAttribute("data-fit", "cover");
  });

  it("width / height become the frame's size (px for numbers) and stay on the img", () => {
    renderEn(<Image src="/a.png" alt="Shot" width={120} height="5rem" preview={false} />);
    const img = screen.getByRole("img", { name: "Shot" });
    const frame = img.parentElement!;
    expect(frame.style.getPropertyValue("--image-inline-size")).toBe("120px");
    expect(frame.style.getPropertyValue("--image-block-size")).toBe("5rem");
    expect(img).toHaveAttribute("width", "120");
    expect(img).toHaveAttribute("data-fit", "cover");
  });

  it("width alone keeps the picture's ratio: no fit, no size", () => {
    renderEn(<Image src="/a.png" alt="Shot" width={320} />);
    const img = screen.getByRole("img", { name: "Shot" });
    expect(img).not.toHaveAttribute("data-fit");
    expect(img.parentElement).not.toHaveAttribute("data-size");
  });

  it("fit=contain overrides the crop", () => {
    renderEn(<Image src="/a.png" alt="Shot" size="sm" fit="contain" />);
    expect(screen.getByRole("img", { name: "Shot" })).toHaveAttribute("data-fit", "contain");
  });

  it("an unsized Image is unchanged", () => {
    renderEn(<Image src="/a.png" alt="Shot" />);
    const frame = screen.getByRole("button", { name: "Preview: Shot" });
    expect(frame).not.toHaveAttribute("data-sized");
    expect(frame.closest("figure")).toBeNull();
  });

  it("caption renders a figure sized like the picture, with a figcaption", () => {
    renderEn(<Image src="/a.png" alt="Shot" size="md" caption="shot.png" />);
    const figure = screen.getByRole("figure");
    expect(figure).toHaveAttribute("data-size", "md");
    expect(figure.querySelector("figcaption")).toHaveTextContent("shot.png");
    expect(figure).toContainElement(screen.getByRole("button", { name: "Preview: Shot" }));
  });
});
