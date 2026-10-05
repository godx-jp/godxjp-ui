import { describe, expect, it } from "vitest";

import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Image } from "../image";
import { Prose } from "../prose";

/**
 * gh#1150 — `Prose imagePreview` opens the body's images in the kit preview, on whatever HTML the
 * body holds (a Markdown renderer's output included): no `img` override, no Image component.
 */
function Body({ imagePreview = true }: { imagePreview?: boolean }) {
  return (
    <Prose imagePreview={imagePreview}>
      <p>
        <img src="https://example.com/a.png" alt="Diagram A" />
      </p>
      <p>
        <a href="/elsewhere">
          <img src="https://example.com/linked.png" alt="Linked" />
        </a>
      </p>
      <table>
        <tbody>
          <tr>
            <td>
              <img src="https://example.com/b.png" alt="" />
            </td>
          </tr>
        </tbody>
      </table>
      <Image src="https://example.com/kit.png" alt="Kit" />
    </Prose>
  );
}

describe("Prose imagePreview (gh#1150)", () => {
  it("makes each body image a named control that opens a dialog — except a link's and a kit Image", () => {
    renderWithUi(<Body />);
    const a = screen.getByRole("button", { name: /Diagram A/ });
    expect(a.tagName).toBe("IMG");
    expect(a).toHaveAttribute("tabindex", "0");
    expect(a).toHaveAttribute("aria-haspopup", "dialog");
    // An image with no alt still gets a name.
    const unnamed = document.querySelector<HTMLImageElement>('img[src$="b.png"]')!;
    expect(unnamed).toHaveAttribute("role", "button");
    expect(unnamed.getAttribute("aria-label")).toBeTruthy();
    // The link keeps its image; the kit Image keeps its own button.
    expect(document.querySelector('img[src$="linked.png"]')).not.toHaveAttribute("role");
    expect(document.querySelector('img[src$="kit.png"]')).not.toHaveAttribute("data-prose-preview");
  });

  it("opens at the clicked image and pages through the body's images in document order", async () => {
    const user = userEvent.setup();
    renderWithUi(<Body />);
    await user.click(document.querySelector<HTMLImageElement>('img[src$="b.png"]')!);
    const dialog = await screen.findByRole("dialog");
    // Two previewable images: the link's and the kit Image's are not in this gallery.
    expect(dialog.querySelector("img")).toHaveAttribute("src", "https://example.com/b.png");
    await user.click(
      dialog.querySelector<HTMLButtonElement>('[data-slot="image-preview-previous"]')!,
    );
    await waitFor(() =>
      expect(dialog.querySelector("img")).toHaveAttribute("src", "https://example.com/a.png"),
    );
  });

  it("opens from the keyboard and returns focus to the image on close", async () => {
    const user = userEvent.setup();
    renderWithUi(<Body />);
    const a = screen.getByRole("button", { name: /Diagram A/ });
    a.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.activeElement).toBe(a);
  });

  it("changes nothing without the prop", () => {
    renderWithUi(<Body imagePreview={false} />);
    expect(document.querySelector("[data-prose-preview]")).toBeNull();
    expect(document.querySelector('img[src$="a.png"]')).not.toHaveAttribute("role");
  });

  /* gh#1152 — an embed: a previewing Prose inside another. The innermost owns its images, and one
   * click opens exactly one dialog, paging only through that body's images. */
  it("lets the innermost Prose own its images when one is nested in another", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <Prose imagePreview>
        <img src="https://example.com/outer-1.png" alt="Outer 1" />
        <Prose imagePreview>
          <img src="https://example.com/inner-1.png" alt="Inner 1" />
          <img src="https://example.com/inner-2.png" alt="Inner 2" />
        </Prose>
        <img src="https://example.com/outer-2.png" alt="Outer 2" />
      </Prose>,
    );
    await user.click(screen.getByRole("button", { name: /Inner 2/ }));
    await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(1));
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector("img")).toHaveAttribute("src", "https://example.com/inner-2.png");
    // Inner gallery only: Inner 2 is its last picture, so "next" is disabled.
    expect(dialog.querySelector('[data-slot="image-preview-next"]')).toBeDisabled();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    // And the outer body pages through its own two, skipping the embed's.
    await user.click(screen.getByRole("button", { name: /Outer 1/ }));
    await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(1));
    await user.click(
      screen
        .getByRole("dialog")
        .querySelector<HTMLButtonElement>('[data-slot="image-preview-next"]')!,
    );
    await waitFor(() =>
      expect(screen.getByRole("dialog").querySelector("img")).toHaveAttribute(
        "src",
        "https://example.com/outer-2.png",
      ),
    );
  });
});
