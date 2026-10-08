import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { renderWithUi, screen } from "@/test/render";
import { Image } from "../image";

const css = () => readFileSync(join(process.cwd(), "src/styles/data-display-layout.css"), "utf8");
const tokens = () =>
  readFileSync(join(process.cwd(), "src/tokens/components/data-display.css"), "utf8");
const rule = (selector: string) =>
  css().match(
    new RegExp(`${selector.replace(/[.[\]"^$*+?()|{}\\]/g, "\\$&")}\\s*\\{[^}]*\\}`),
  )?.[0] ?? "";

/**
 * `<Image fit="intrinsic">` — a framed picture at a FIXED HEIGHT and its OWN width, for a wrapping
 * row of screenshots whose ratios differ (gh#530). It was the `Thumbnail` component until v32
 * (#1223); the geometry is measured in Chromium by image-thumbnail-parity-1223-browser.test.ts.
 */
describe('Image fit="intrinsic" (formerly Thumbnail)', () => {
  it("renders the picture with the alt it was given", () => {
    renderWithUi(
      <Image src="/shot.png" alt="申請画面のスクリーンショット" fit="intrinsic" preview={false} />,
    );
    const img = screen.getByRole("img", { name: "申請画面のスクリーンショット" });
    expect(img).toHaveAttribute("src", "/shot.png");
  });

  it("an empty alt leaves the picture out of the a11y tree", () => {
    const { container } = renderWithUi(
      <Image src="/shot.png" alt="" fit="intrinsic" preview={false} />,
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("defaults to the md step and reports the step it is drawing", () => {
    const { container, rerender } = renderWithUi(
      <Image src="/a.png" alt="a" fit="intrinsic" preview={false} />,
    );
    const frame = () => container.querySelector('[data-slot="image"]');
    expect(frame()).toHaveAttribute("data-size", "md");
    expect(frame()).toHaveAttribute("data-fit", "intrinsic");
    rerender(<Image src="/a.png" alt="a" fit="intrinsic" size="lg" preview={false} />);
    expect(frame()).toHaveAttribute("data-size", "lg");
  });

  /**
   * The way to stop a row of intrinsic-width frames reflowing as the bytes land: the file's real
   * pixels reach the `<img>` as attributes and NEVER size the frame (they would make it 1280px).
   */
  it("width/height stay pure img attributes — they never size the frame", () => {
    const { container } = renderWithUi(
      <Image
        src="/a.png"
        alt="a"
        width={1280}
        height={800}
        loading="lazy"
        fit="intrinsic"
        preview={false}
      />,
    );
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("width", "1280");
    expect(img).toHaveAttribute("height", "800");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(container.querySelector('[data-slot="image"]')?.getAttribute("style")).toBeNull();
  });

  it("fixes the block size, leaves the inline size intrinsic, and frames it from tokens", () => {
    const frame = rule('.ui-image[data-fit="intrinsic"]');
    expect(frame).toMatch(/inline-size:\s*auto/);
    expect(frame).not.toMatch(/aspect-ratio/);
    expect(frame).toMatch(
      /border:\s*var\(--thumbnail-border-width, var\(--stroke-hairline\)\)\s+solid\s+hsl\(var\(\s*--border\)\)/,
    );
    expect(frame).toMatch(/border-radius:\s*var\(\s*--thumbnail-radius/);
    const picture = rule('.ui-image[data-fit="intrinsic"] > .ui-image-img');
    expect(picture).toMatch(/max-inline-size:\s*100%/);
    expect(picture).toMatch(/object-fit:\s*contain/);
    expect(tokens()).toMatch(/--thumbnail-border-width:\s*initial/);
    expect(tokens()).toMatch(/--thumbnail-radius:\s*initial;/);
    for (const token of [
      "--thumbnail-block-size-sm",
      "--thumbnail-block-size",
      "--thumbnail-block-size-lg",
    ]) {
      expect(tokens()).toMatch(new RegExp(`${token}:\\s*[\\d.]+rem`));
    }
  });
});
