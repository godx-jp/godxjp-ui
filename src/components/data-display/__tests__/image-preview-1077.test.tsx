import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { Image, ImagePreviewGroup } from "../image";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider defaultLocale="en" persist={false}>
    {children}
  </AppProvider>
);
const renderEn = (ui: React.ReactElement) => render(ui, { wrapper });

/**
 * gh#1077 — antd `Image` + `Image.PreviewGroup`. Behaviour only (jsdom); the geometry, the focus
 * trap under real Tab and the full-viewport box are in `image-preview-browser-1077.test.tsx`.
 */

const dialog = () => screen.getByRole("dialog", { name: "Image preview" });
const previewImg = () =>
  dialog().querySelector<HTMLImageElement>('[data-slot="image-preview-img"]')!;
const counter = () => dialog().querySelector('[data-slot="image-preview-counter"]')?.textContent;

function Article() {
  // Pictures at different depths, as a Markdown renderer's `img` override puts them.
  return (
    <ImagePreviewGroup>
      <p>
        Before <Image src="/a.png" alt="Old screen" />
      </p>
      <section>
        <div>
          <Image src="/b.png" alt="New screen" />
        </div>
      </section>
      <Image src="/c.png" alt="Detail" />
      <Image src="/skip.png" alt="Logo" preview={false} />
    </ImagePreviewGroup>
  );
}

describe("Image (gh#1077)", () => {
  it("opens on click, closes on Escape and gives focus back to the thumbnail", async () => {
    const user = userEvent.setup();
    renderEn(<Image src="/shot.png" alt="Checkout" />);
    const trigger = screen.getByRole("button", { name: "Preview: Checkout" });
    await user.click(trigger);
    expect(previewImg().getAttribute("src")).toBe("/shot.png");
    expect(previewImg().alt).toBe("Checkout");
    // A lone picture has no paging and no counter.
    expect(screen.queryByRole("button", { name: "Next image" })).toBeNull();
    expect(counter()).toBeUndefined();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("opens from the keyboard", async () => {
    const user = userEvent.setup();
    renderEn(<Image src="/shot.png" alt="Checkout" />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(dialog()).toBeTruthy();
  });

  it("zooms, rotates, flips and resets through the tool buttons", async () => {
    const user = userEvent.setup();
    renderEn(<Image src="/shot.png" alt="Checkout" />);
    await user.click(screen.getByRole("button", { name: "Preview: Checkout" }));
    const tool = (name: string) => within(dialog()).getByRole("button", { name });

    // At the minimum scale (1) zoom-out is off, as in antd.
    expect((tool("Zoom out") as HTMLButtonElement).disabled).toBe(true);
    await user.click(tool("Zoom in"));
    expect(previewImg().style.transform).toContain("scale3d(1.5, 1.5, 1)");
    await user.click(tool("Zoom out"));
    expect(previewImg().style.transform).toContain("scale3d(1, 1, 1)");

    await user.click(tool("Rotate right"));
    expect(previewImg().style.transform).toContain("rotate(90deg)");
    await user.click(tool("Rotate left"));
    await user.click(tool("Rotate left"));
    expect(previewImg().style.transform).toContain("rotate(-90deg)");

    await user.click(tool("Flip horizontally"));
    expect(previewImg().style.transform).toContain("scale3d(-1, 1, 1)");
    await user.click(tool("Flip vertically"));
    expect(previewImg().style.transform).toContain("scale3d(-1, -1, 1)");

    await user.click(tool("Reset"));
    expect(previewImg().style.transform).toBe(
      "translate3d(0px, 0px, 0) scale3d(1, 1, 1) rotate(0deg)",
    );
  });

  it("zooms with the wheel and toggles zoom on double-click", async () => {
    const user = userEvent.setup();
    renderEn(<Image src="/shot.png" alt="Checkout" />);
    await user.click(screen.getByRole("button", { name: "Preview: Checkout" }));
    fireEvent.wheel(previewImg(), { deltaY: -100 });
    expect(previewImg().style.transform).toContain("scale3d(1.5, 1.5, 1)");
    fireEvent.doubleClick(previewImg());
    expect(previewImg().style.transform).toContain("scale3d(1, 1, 1)");
    fireEvent.doubleClick(previewImg());
    expect(previewImg().style.transform).toContain("scale3d(1.5, 1.5, 1)");
  });

  it("preview={false} renders a plain picture that opens nothing", () => {
    renderEn(<Image src="/logo.png" alt="Logo" preview={false} />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("img", { name: "Logo" })).toBeTruthy();
  });

  it("shows `fallback` when the picture fails, and a failed picture does not preview (antd)", () => {
    renderEn(<Image src="/broken.png" alt="Chart" fallback="/fallback.png" />);
    fireEvent.error(screen.getByRole("img", { name: "Chart" }));
    expect(screen.getByRole("img", { name: "Chart" }).getAttribute("src")).toBe("/fallback.png");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("keeps the fallback once IT loads — never flips back to the broken src (gh#1082)", () => {
    // The fallback's own `load` used to mark the picture "loaded", which put the broken `src`
    // back, which failed again: an endless error/load loop (23,062 requests in 15s in Chromium,
    // the nightly geometry sweep's networkidle timeout).
    const onError = vi.fn();
    renderEn(<Image src="/broken.png" alt="Chart" fallback="/fallback.png" onError={onError} />);
    const img = () => screen.getByRole("img", { name: "Chart" });
    fireEvent.error(img());
    fireEvent.load(img());
    expect(img().getAttribute("src")).toBe("/fallback.png");
    fireEvent.load(img());
    expect(img().getAttribute("src")).toBe("/fallback.png");
    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("a new src after a failure starts over — it is tried, not stuck on the fallback", () => {
    const { rerender } = renderEn(<Image src="/broken.png" alt="Chart" fallback="/fallback.png" />);
    fireEvent.error(screen.getByRole("img", { name: "Chart" }));
    fireEvent.load(screen.getByRole("img", { name: "Chart" }));
    rerender(<Image src="/fixed.png" alt="Chart" fallback="/fallback.png" />);
    expect(screen.getByRole("img", { name: "Chart" }).getAttribute("src")).toBe("/fixed.png");
  });

  it("paints the placeholder until the picture loads", () => {
    const { container } = renderEn(<Image src="/slow.png" alt="Slow" placeholder />);
    expect(container.querySelector('[data-slot="image-placeholder"]')).not.toBeNull();
    fireEvent.load(screen.getByRole("img", { name: "Slow" }));
    expect(container.querySelector('[data-slot="image-placeholder"]')).toBeNull();
  });

  it("controlled preview.visible reports (visible, prevVisible)", async () => {
    const user = userEvent.setup();
    const onVisibleChange = vi.fn();
    const { rerender } = renderEn(
      <Image src="/shot.png" alt="Checkout" preview={{ visible: false, onVisibleChange }} />,
    );
    await user.click(screen.getByRole("button", { name: "Preview: Checkout" }));
    expect(onVisibleChange).toHaveBeenLastCalledWith(true, false);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(<Image src="/shot.png" alt="Checkout" preview={{ visible: true, onVisibleChange }} />);
    expect(dialog()).toBeTruthy();
  });

  it("preview.src shows a different file in the preview", async () => {
    const user = userEvent.setup();
    renderEn(<Image src="/small.png" alt="Map" preview={{ src: "/large.png" }} />);
    await user.click(screen.getByRole("button", { name: "Preview: Map" }));
    expect(previewImg().getAttribute("src")).toBe("/large.png");
  });
});

describe("ImagePreviewGroup (gh#1077)", () => {
  it("pages every picture under it in document order, with a counter and ←/→", async () => {
    const user = userEvent.setup();
    renderEn(<Article />);
    await user.click(screen.getByRole("button", { name: "Preview: New screen" }));
    expect(previewImg().getAttribute("src")).toBe("/b.png");
    // `preview={false}` left the group: three pictures, not four.
    expect(counter()).toBe("2 / 3");

    await user.keyboard("{ArrowRight}");
    expect(previewImg().getAttribute("src")).toBe("/c.png");
    expect(counter()).toBe("3 / 3");
    expect(
      (within(dialog()).getByRole("button", { name: "Next image" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    // No wrap at the end (antd).
    await user.keyboard("{ArrowRight}");
    expect(counter()).toBe("3 / 3");

    await user.click(within(dialog()).getByRole("button", { name: "Previous image" }));
    await user.click(within(dialog()).getByRole("button", { name: "Previous image" }));
    expect(previewImg().getAttribute("src")).toBe("/a.png");
    expect(counter()).toBe("1 / 3");
    await user.keyboard("{ArrowLeft}");
    expect(counter()).toBe("1 / 3");
  });

  it("a new picture starts un-zoomed", async () => {
    const user = userEvent.setup();
    renderEn(<Article />);
    await user.click(screen.getByRole("button", { name: "Preview: Old screen" }));
    await user.click(within(dialog()).getByRole("button", { name: "Zoom in" }));
    expect(previewImg().style.transform).toContain("scale3d(1.5, 1.5, 1)");
    await user.keyboard("{ArrowRight}");
    expect(previewImg().style.transform).toContain("scale3d(1, 1, 1)");
  });

  it("←/→ follow the reading direction in RTL", async () => {
    const user = userEvent.setup();
    renderEn(
      <div dir="rtl">
        <Article />
      </div>,
    );
    await user.click(screen.getByRole("button", { name: "Preview: Old screen" }));
    // The preview is portalled out of the `dir` wrapper; the document direction decides.
    document.documentElement.setAttribute("dir", "rtl");
    try {
      await user.keyboard("{ArrowLeft}");
      expect(counter()).toBe("2 / 3");
    } finally {
      document.documentElement.removeAttribute("dir");
    }
  });

  it("`items` replaces the rendered list and a child opens at its own src", async () => {
    const user = userEvent.setup();
    renderEn(
      <ImagePreviewGroup items={["/x.png", { src: "/b.png", alt: "B" }, "/z.png"]}>
        <Image src="/b.png" alt="Thumb" />
      </ImagePreviewGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Preview: Thumb" }));
    expect(counter()).toBe("2 / 3");
    expect(previewImg().alt).toBe("B");
  });

  it("controlled preview.current / onChange and visible / onVisibleChange (antd order)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onVisibleChange = vi.fn();
    function Controlled() {
      const [current, setCurrent] = React.useState(1);
      const [visible, setVisible] = React.useState(true);
      return (
        <ImagePreviewGroup
          items={["/1.png", "/2.png", "/3.png"]}
          preview={{
            current,
            visible,
            onChange: (next, prev) => {
              onChange(next, prev);
              setCurrent(next);
            },
            onVisibleChange: (next, prev) => {
              onVisibleChange(next, prev);
              setVisible(next);
            },
          }}
        />
      );
    }
    renderEn(<Controlled />);
    expect(previewImg().getAttribute("src")).toBe("/2.png");
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(2, 1);
    expect(previewImg().getAttribute("src")).toBe("/3.png");
    await user.click(within(dialog()).getByRole("button", { name: "Close preview" }));
    expect(onVisibleChange).toHaveBeenLastCalledWith(false, true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("uses the group's fallback for a preview picture that fails", async () => {
    const user = userEvent.setup();
    renderEn(
      <ImagePreviewGroup fallback="/fallback.png" items={["/gone.png"]}>
        <Image src="/gone.png" alt="Gone" />
      </ImagePreviewGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Preview: Gone" }));
    act(() => {
      fireEvent.error(previewImg());
    });
    expect(previewImg().getAttribute("src")).toBe("/fallback.png");
  });

  it("preview={false} on the group turns every picture plain", () => {
    renderEn(
      <ImagePreviewGroup preview={false}>
        <Image src="/a.png" alt="A" />
        <Image src="/b.png" alt="B" />
      </ImagePreviewGroup>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("is also reachable as Image.PreviewGroup", () => {
    expect(Image.PreviewGroup).toBe(ImagePreviewGroup);
  });
});
