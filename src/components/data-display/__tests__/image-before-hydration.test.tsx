import { render, screen } from "@testing-library/react";
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
