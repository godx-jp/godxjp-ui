import { renderToString } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../../../app/app-provider";
import { Image } from "../image";

afterEach(() => vi.restoreAllMocks());
describe("image requests completed before the ref attaches", () => {
  it("shows fallback and removes preview for an already broken request", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(0);
    render(
      <AppProvider persist={false} defaultLocale="en">
        <Image src="/broken.png" fallback="/fallback.svg" alt="Artwork" />
      </AppProvider>,
    );
    expect(screen.getByRole("img", { name: "Artwork" })).toHaveAttribute("src", "/fallback.svg");
    expect(screen.queryByRole("button", { name: "Preview: Artwork" })).not.toBeInTheDocument();
  });
  it("keeps the loaded artwork and preview for an already successful request", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(600);
    render(
      <AppProvider persist={false} defaultLocale="en">
        <Image src="/loaded.png" fallback="/fallback.svg" alt="Artwork" />
      </AppProvider>,
    );
    expect(
      screen.getByRole("button", { name: "Preview: Artwork" }).querySelector("img"),
    ).toHaveAttribute("src", "/loaded.png");
  });
});

it("leaves SSR pictures uncovered before hydration (gh#1472)", () => {
  const html = renderToString(
    <Image
      src="/eager.png"
      alt="Artwork"
      preview={false}
      loading="eager"
      placeholder={<span>Loading</span>}
    />,
  );
  expect(html).not.toContain('data-slot="image-placeholder"');
});

it("shows pending placeholder after mount, then removes it on load", () => {
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(false);
  const view = render(
    <Image src="/pending.png" alt="Pending" placeholder="Loading" preview={false} />,
  );
  expect(view.container.querySelector('[data-slot="image-placeholder"]')).not.toBeNull();
  fireEvent.load(screen.getByRole("img", { name: "Pending" }));
  expect(view.container.querySelector('[data-slot="image-placeholder"]')).toBeNull();
});
