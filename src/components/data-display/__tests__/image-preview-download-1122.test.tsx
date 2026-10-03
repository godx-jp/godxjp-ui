import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { Image, ImagePreviewGroup } from "../image";

/**
 * gh#1122 — a Download action in the preview toolbar. `true` is a native link to the picture on
 * show; a function is a button the host handles (signed URL, blob). Off by default.
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider defaultLocale="en" persist={false}>
    {children}
  </AppProvider>
);
const tools = () => within(screen.getByRole("group", { name: "Image tools" }));

async function open(name: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: `Preview: ${name}` }));
  return user;
}

describe("Image preview — download (gh#1122)", () => {
  it("is absent by default", async () => {
    render(<Image src="/a.png" alt="Chart" />, { wrapper });
    await open("Chart");
    expect(tools().queryByRole("link", { name: "Download" })).toBeNull();
    expect(tools().queryByRole("button", { name: "Download" })).toBeNull();
  });

  it("download: a link to the picture on show (the preview src)", async () => {
    render(<Image src="/thumb.png" alt="Chart" preview={{ src: "/full.png", download: true }} />, {
      wrapper,
    });
    await open("Chart");
    const link = tools().getByRole("link", { name: "Download" });
    expect(link).toHaveAttribute("href", "/full.png");
    expect(link).toHaveAttribute("download");
  });

  it("download(fn): the host gets the picture on show, with its index in a group", async () => {
    const onDownload = vi.fn();
    render(
      <ImagePreviewGroup preview={{ download: onDownload }}>
        <Image src="/one.png" alt="One" />
        <Image src="/two.png" alt="Two" />
      </ImagePreviewGroup>,
      { wrapper },
    );
    const user = await open("Two");
    await user.click(tools().getByRole("button", { name: "Download" }));
    expect(onDownload).toHaveBeenCalledWith({ src: "/two.png", index: 1 });
  });
});
