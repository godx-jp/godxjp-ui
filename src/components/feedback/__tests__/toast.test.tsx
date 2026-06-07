import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Toaster } from "../sonner";
import { toast } from "../use-toast";

const sonnerMock = vi.hoisted(() => {
  const fn = vi.fn();
  return Object.assign(fn, {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  });
});

vi.mock("sonner", () => ({
  toast: sonnerMock,
  Toaster: ({ className, ...props }: { className?: string; children?: React.ReactNode }) => (
    <div data-testid="sonner-mock" className={className} {...props} />
  ),
}));

describe("Toaster", () => {
  it("renders Sonner container", () => {
    renderWithUi(<Toaster />);
    expect(screen.getByTestId("sonner-mock")).toBeInTheDocument();
  });
});

describe("toast = Sonner native API", () => {
  beforeEach(() => {
    sonnerMock.mockClear();
    sonnerMock.success.mockClear();
    sonnerMock.error.mockClear();
  });

  it("toast('msg') calls Sonner's toast", () => {
    toast("保存しました");
    expect(sonnerMock).toHaveBeenCalledWith("保存しました");
  });

  it("toast.success / toast.error call the Sonner variants", () => {
    toast.success("承認しました");
    expect(sonnerMock.success).toHaveBeenCalledWith("承認しました");
    toast.error("失敗しました");
    expect(sonnerMock.error).toHaveBeenCalledWith("失敗しました");
  });
});
