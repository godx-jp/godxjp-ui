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
});
