import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Thumbnail } from "../thumbnail";

const css = () => readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
const tokens = () =>
  readFileSync(join(process.cwd(), "src/tokens/components/data-display.css"), "utf8");
const rule = (selector: string) =>
  css().match(
    new RegExp(`${selector.replace(/[.[\]"^$*+?()|{}\\]/g, "\\$&")}\\s*\\{[^}]*\\}`),
  )?.[0] ?? "";

describe("Thumbnail", () => {
  it("renders an image with the alt it was given", () => {
    renderWithUi(<Thumbnail src="/shot.png" alt="申請画面のスクリーンショット" />);

    const img = screen.getByRole("img", { name: "申請画面のスクリーンショット" });
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "/shot.png");
  });

  /** `alt=""` is a decision the author makes; the image then leaves the a11y tree entirely. */
  it("accepts an empty alt for a decorative picture", () => {
    const { container } = renderWithUi(<Thumbnail src="/shot.png" alt="" />);

    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("defaults to the md step and reports the step it is drawing", () => {
    const { container, rerender } = renderWithUi(<Thumbnail src="/a.png" alt="a" />);
    expect(container.querySelector("img")).toHaveAttribute("data-size", "md");

    rerender(<Thumbnail src="/a.png" alt="a" size="lg" />);
    expect(container.querySelector("img")).toHaveAttribute("data-size", "lg");
  });

  /**
   * The documented way to stop a row of intrinsic-width frames reflowing as the bytes land: the
   * native attributes have to reach the element.
   */
  it("passes the native img attributes through", () => {
    const { container } = renderWithUi(
      <Thumbnail src="/a.png" alt="a" width={1280} height={800} loading="lazy" />,
    );
    const img = container.querySelector("img");

    expect(img).toHaveAttribute("width", "1280");
    expect(img).toHaveAttribute("height", "800");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  /**
   * THE REASON THIS COMPONENT EXISTS (gh#530): a FIXED height with an INTRINSIC width. AspectRatio
   * pins `width: 100%` and a ratio, which is the one shape a row of mixed-ratio screenshots cannot
   * take.
   */
  it("fixes the block size and leaves the inline size intrinsic", () => {
    const base = rule(".ui-thumbnail");

    expect(base).toMatch(/inline-size:\s*auto/);
    expect(base).toMatch(/block-size:\s*var\(--thumbnail-block-size\)/);
    expect(base).not.toMatch(/aspect-ratio/);
    // Clamped at the container so one panorama cannot scroll the page sideways.
    expect(base).toMatch(/max-inline-size:\s*100%/);
    expect(base).toMatch(/object-fit:\s*contain/);
    expect(rule('.ui-thumbnail[data-size="sm"]')).toMatch(
      /block-size:\s*var\(--thumbnail-block-size-sm\)/,
    );
    expect(rule('.ui-thumbnail[data-size="lg"]')).toMatch(
      /block-size:\s*var\(--thumbnail-block-size-lg\)/,
    );
  });

  /** The frame is ON the image — no wrapper, so nothing can pad it away from the picture. */
  it("draws the hairline frame on the image itself, from tokens", () => {
    const base = rule(".ui-thumbnail");

    expect(base).toMatch(
      /border:\s*var\(--thumbnail-border-width\)\s+solid\s+hsl\(var\(--border\)\)/,
    );
    expect(base).toMatch(/border-radius:\s*var\(--thumbnail-radius\)/);
    expect(tokens()).toMatch(/--thumbnail-border-width:\s*var\(--stroke-hairline\)/);
    expect(tokens()).toMatch(/--thumbnail-radius:\s*var\(--radius\)/);
  });

  it("declares all three height steps in the token tier", () => {
    for (const token of [
      "--thumbnail-block-size-sm",
      "--thumbnail-block-size",
      "--thumbnail-block-size-lg",
    ]) {
      expect(tokens()).toMatch(new RegExp(`${token}:\\s*[\\d.]+rem`));
    }
  });
});
