import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import { AlertDialog } from "../dialog";

/**
 * gh#1284 — in Vietnamese the preset's default cancel was 「Hủy」, the same word an app uses for the
 * destructive action it guards (「Huỷ」 phiếu): two buttons, one word, told apart by colour alone.
 * The preset now has its own cancel word (vi 「Quay lại」), and a development warning fires when
 * confirm and cancel are the same word once tone marks are ignored.
 */
afterEach(() => vi.restoreAllMocks());

describe("AlertDialog cancel label (gh#1284)", () => {
  it("vi: the default cancel is 「Quay lại」, distinct from a 「Huỷ」 confirm", () => {
    renderWithUi(
      <AlertDialog
        open
        onOpenChange={() => {}}
        title="Huỷ phiếu?"
        confirmLabel="Huỷ"
        variant="destructive"
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Quay lại" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hủy" })).toBeNull();
  });

  it("an explicit cancelLabel still wins", () => {
    renderWithUi(
      <AlertDialog
        open
        onOpenChange={() => {}}
        title="t"
        cancelLabel="Giữ lại"
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Giữ lại" })).toBeInTheDocument();
  });

  it("warns when confirm and cancel differ only in tone-mark placement (Huỷ / Hủy)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithUi(
      <AlertDialog
        open
        onOpenChange={() => {}}
        title="t"
        confirmLabel="Huỷ"
        cancelLabel="Hủy"
        onConfirm={() => {}}
      />,
    );
    expect(warn.mock.calls.some(([m]) => String(m).includes("gh#1284"))).toBe(true);
  });

  it("does not warn for distinct words", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithUi(
      <AlertDialog
        open
        onOpenChange={() => {}}
        title="t"
        confirmLabel="Huỷ"
        onConfirm={() => {}}
      />,
    );
    expect(warn.mock.calls.some(([m]) => String(m).includes("gh#1284"))).toBe(false);
  });
});
