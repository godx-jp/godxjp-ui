import { describe, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Upload } from "../upload";
import { uploadFileKind } from "../upload-file-kind";
import type { UploadFileItem } from "../upload-types";

/**
 * `listType` — the listing axis antd has and this component did not (gh#720).
 *
 * The defect a consumer reported: `variant="dropzone"` could not show a thumbnail even for an
 * item that already carried a `previewUrl`, because the list was hard-wired to
 * `showThumbnails={variant === "picture"}`. The real screen is a drawer listing a `.png` beside a
 * `.json` and a `.txt` — the image wants its thumbnail, the others want a mark for their kind.
 *
 * The first test is the one that protects everything written before this prop existed: the
 * DEFAULT listing per variant must be byte-for-byte what it was.
 */

const item = (partial: Partial<UploadFileItem> & { name: string }): UploadFileItem => ({
  uid: partial.name,
  size: 1024,
  status: "done",
  ...partial,
});

const png = item({ name: "screenshot.png", mimeType: "image/png", previewUrl: "data:image/png," });
const json = item({ name: "result.json", mimeType: "application/json" });
const txt = item({ name: "notes.txt", mimeType: "text/plain" });

const thumbs = (root: HTMLElement) => root.querySelectorAll(".ui-upload-list-thumb");
const glyphs = (root: HTMLElement) => root.querySelectorAll(".ui-upload-list-glyph");

describe("Upload listType — the default keeps every existing call site's rendering", () => {
  it("dropzone and button list names only, with no thumbnail and no glyph", () => {
    for (const variant of ["dropzone", "button"] as const) {
      const { container, unmount } = renderWithUi(
        <Upload variant={variant} value={[png, json]} onValueChange={() => {}} />,
      );
      expect(screen.getByText("screenshot.png")).toBeInTheDocument();
      expect(thumbs(container)).toHaveLength(0);
      expect(glyphs(container)).toHaveLength(0);
      unmount();
    }
  });

  it("variant='picture' still lists the thumbnail it always listed", () => {
    const { container } = renderWithUi(
      <Upload variant="picture" maxCount={3} value={[png]} onValueChange={() => {}} />,
    );
    const thumb = thumbs(container)[0] as HTMLImageElement;
    expect(thumb).toBeInstanceOf(HTMLImageElement);
    expect(thumb.getAttribute("src")).toBe("data:image/png,");
    // Decorative: the file name beside it is the row's name.
    expect(thumb.getAttribute("alt")).toBe("");
  });
});

describe("Upload listType='picture' — thumbnail for an image, glyph for anything else", () => {
  it("a dropzone can now show a thumbnail, which it could not before", () => {
    const { container } = renderWithUi(
      <Upload variant="dropzone" listType="picture" value={[png]} onValueChange={() => {}} />,
    );
    expect(thumbs(container)).toHaveLength(1);
    expect(glyphs(container)).toHaveLength(0);
  });

  it("a non-image row gets the glyph for its kind, and the image row keeps its thumbnail", () => {
    const { container } = renderWithUi(
      <Upload
        variant="dropzone"
        listType="picture"
        value={[png, json, txt]}
        onValueChange={() => {}}
      />,
    );
    expect(thumbs(container)).toHaveLength(1);
    expect([...glyphs(container)].map((node) => node.getAttribute("data-file-kind"))).toEqual([
      "text",
      "text",
    ]);
  });

  it("picks the glyph by file kind — image / pdf / archive / text / generic", () => {
    const { container } = renderWithUi(
      <Upload
        variant="dropzone"
        listType="picture"
        value={[
          item({ name: "no-preview.png", mimeType: "image/png" }),
          item({ name: "invoice.pdf", mimeType: "application/pdf" }),
          item({ name: "bundle.zip", mimeType: "application/zip" }),
          item({ name: "notes.txt", mimeType: "text/plain" }),
          item({ name: "firmware.bin" }),
        ]}
        onValueChange={() => {}}
      />,
    );
    expect([...glyphs(container)].map((node) => node.getAttribute("data-file-kind"))).toEqual([
      "image",
      "pdf",
      "archive",
      "text",
      "file",
    ]);
    // Each kind draws a DIFFERENT mark — a .pdf and a .json on adjacent rows must not be
    // indistinguishable, which is the whole point of the glyph.
    const marks = [...glyphs(container)].map((node) =>
      node.querySelector("svg")?.getAttribute("class"),
    );
    expect(new Set(marks).size).toBe(marks.length);
  });

  it("the glyph is decoration — it adds no accessible name beside the file name", () => {
    const { container } = renderWithUi(
      <Upload variant="dropzone" listType="picture" value={[json]} onValueChange={() => {}} />,
    );
    const row = screen.getByText("result.json").closest("li")!;
    expect(within(row).queryAllByRole("img")).toHaveLength(0);
    const svg = glyphs(container)[0].querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("aria-label")).toBeNull();
    // Drawn through the `Icon` primitive, so its box is a step of the `--icon-size-*` scale and
    // not lucide's own 24px default (which is exactly what `.ui-icon[data-size]` overrides).
    expect(svg).toHaveClass("ui-icon");
    expect(svg.getAttribute("data-slot")).toBe("icon");
    expect(svg.getAttribute("data-size")).toBe("lg");
  });

  it("listType='text' opts a picture variant back out of thumbnails", () => {
    const { container } = renderWithUi(
      <Upload
        variant="picture"
        maxCount={3}
        listType="text"
        value={[png]}
        onValueChange={() => {}}
      />,
    );
    expect(thumbs(container)).toHaveLength(0);
    expect(glyphs(container)).toHaveLength(0);
  });
});

describe("Upload listType — the row's behaviour is untouched", () => {
  it("remove still names the file and still drops it from the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Upload
        variant="dropzone"
        listType="picture"
        value={[json]}
        removable
        onValueChange={onValueChange}
      />,
    );
    const row = screen.getByText("result.json").closest("li")!;
    const remove = within(row).getByRole("button", { name: /result\.json/ });
    await user.click(remove);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("the glyph takes no focus stop — Tab still lands on the row's own controls", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Upload
        variant="dropzone"
        listType="picture"
        value={[json]}
        removable
        onValueChange={() => {}}
      />,
    );
    const row = screen.getByText("result.json").closest("li")!;
    const remove = within(row).getByRole("button", { name: /result\.json/ });
    remove.focus();
    expect(document.activeElement).toBe(remove);
    await user.tab({ shift: true });
    // The stop before the remove button is the dropzone, never the glyph.
    expect(document.activeElement).toHaveClass("ui-upload-dropzone");
  });
});

describe("Upload placeholder marks — on the icon scale, not on a control height (gh#720)", () => {
  /**
   * Both empty-state marks were sized with `controlIconClass` (`--control-height`, 32px): a
   * CONTROL height inside a media placeholder, off the nine-step icon scale entirely, and the
   * avatar and the picture-card tile are the SAME 96px box drawing two different marks (32 vs 24).
   * They now read a token each, so a theme can retune them and the two 96px boxes agree.
   */
  it("the avatar's camera reads --upload-avatar-icon-size", () => {
    const { container } = renderWithUi(<Upload variant="avatar" />);
    const mark = container.querySelector(".ui-upload-avatar-placeholder svg")!;
    expect(mark).toHaveClass("ui-upload-avatar-icon");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
  });

  it("the picture empty state reads --upload-picture-icon-size", () => {
    const { container } = renderWithUi(<Upload variant="picture" />);
    const mark = container.querySelector(".ui-upload-picture-empty svg")!;
    expect(mark).toHaveClass("ui-upload-picture-empty-icon");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("uploadFileKind", () => {
  it("reads the MIME type first and the extension second", () => {
    expect(uploadFileKind({ name: "a.bin", mimeType: "image/webp" })).toBe("image");
    expect(uploadFileKind({ name: "a.bin", mimeType: "text/csv" })).toBe("text");
    expect(uploadFileKind({ name: "report.pdf" })).toBe("pdf");
    expect(uploadFileKind({ name: "logs.tar.gz" })).toBe("archive");
    expect(uploadFileKind({ name: "RESULT.JSON" })).toBe("text");
    expect(uploadFileKind({ name: "firmware" })).toBe("file");
    expect(uploadFileKind({ name: ".gitignore" })).toBe("file");
  });
});
