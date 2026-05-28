import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithUi, screen } from "@/test/render";
import { Toaster } from "../sonner";
import { toast, useToast } from "../use-toast";

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

describe("toast adapter", () => {
  beforeEach(() => {
    sonnerMock.mockClear();
    sonnerMock.success.mockClear();
    sonnerMock.error.mockClear();
  });

  it("maps legacy success variant to sonner.success", () => {
    toast({ title: "Đã lưu manifest", variant: "success" });
    expect(sonnerMock.success).toHaveBeenCalledWith("Đã lưu manifest", expect.any(Object));
  });

  it("maps legacy destructive variant to sonner.error", () => {
    toast({ title: "Lỗi xuất kho", variant: "destructive" });
    expect(sonnerMock.error).toHaveBeenCalledWith("Lỗi xuất kho", expect.any(Object));
  });

  it("useToast exposes legacy toast helper", () => {
    const { toast: legacy } = useToast();
    legacy({ title: "Ping", variant: "default" });
    expect(sonnerMock).toHaveBeenCalledWith("Ping", expect.any(Object));
  });
});
