import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderWithUi, screen, userEvent } from "@/test/render";

import {
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogRoot,
  Dialog,
  DialogAction,
  DialogCancel,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../dialog";
import { Button } from "../../general/button";
import { FormField } from "../../data-entry/form-field";
import { Textarea } from "../../data-entry/textarea";

/*
 * gh#567 — `Dialog` và `AlertDialog` là hai họ tách rời với 12 cặp trùng tên và 0 phần riêng của
 * AlertDialog. Bản vá cho `Dialog` một prop `variant` quyết định CÙNG LÚC: vai trò ARIA, có đóng
 * khi click ra ngoài hay không, và nhấn mạnh của nút chính.
 *
 * Mọi phép kiểm ở đây bám VAI TRÒ, NHÃN và `data-*` — không bám class Tailwind
 * (`check:no-tailwind-class-assertions`). `getByRole("alertdialog")` là thứ consumer trong issue
 * đang bám vào, nên nó xuất hiện ở cả nhánh mới lẫn nhánh cũ.
 */

/**
 * ĐÚNG ca người báo cần: một xác nhận NGUY HIỂM có Ô NHẬP BẮT BUỘC (lý do kết thúc hợp tác, sẽ
 * vào nhật ký) mà VẪN giữ `role="alertdialog"`.
 *
 * Trước bản vá phải chọn một trong hai: `Dialog` có form nhưng mất vai trò, `AlertDialog` có vai
 * trò nhưng bộ phận của nó dựng cho mẫu hai-nút-không-form. Sau bản vá là một prop.
 */
function TerminatePartnership({
  onOpenChange = () => {},
  onConfirm = () => {},
}: {
  onOpenChange?: (open: boolean) => void;
  onConfirm?: (reason: string) => void;
}) {
  const [reason, setReason] = React.useState("");
  const reasonId = React.useId();

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent variant="destructive">
        <DialogHeader title="提携を終了しますか？" subtitle="この操作は元に戻せません。" />
        <FormField id={reasonId} label="終了理由" required>
          <Textarea
            id={reasonId}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
            }}
          />
        </FormField>
        <DialogFooter>
          <DialogCancel asChild>
            <Button variant="ghost">キャンセル</Button>
          </DialogCancel>
          <DialogAction
            disabled={reason.trim().length === 0}
            onClick={() => {
              onConfirm(reason);
            }}
          >
            終了する
          </DialogAction>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function overlay(): HTMLElement {
  const node = document.querySelector('[data-slot="dialog-overlay"]');
  if (!node) throw new Error("overlay not rendered");
  return node as HTMLElement;
}

/** RAC đóng overlay từ `useInteractOutside`: nó so cặp pointerdown → pointerup trên cùng một mốc. */
function pressOutside(): void {
  const target = overlay();
  fireEvent.pointerDown(target, { button: 0, pointerId: 1, detail: 1 });
  fireEvent.mouseDown(target, { button: 0, detail: 1 });
  fireEvent.pointerUp(target, { button: 0, pointerId: 1, detail: 1 });
  fireEvent.mouseUp(target, { button: 0, detail: 1 });
  fireEvent.click(target, { button: 0, detail: 1 });
}

describe("gh#567 — the reporter's case: a destructive confirm WITH a required field", () => {
  it("keeps role=alertdialog while carrying a required free-text reason", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithUi(<TerminatePartnership onConfirm={onConfirm} />);

    // Vai trò — thứ `messages.spec.js` của consumer bám vào.
    const dialog = screen.getByRole("alertdialog", { name: "提携を終了しますか？" });
    expect(dialog).toHaveAttribute("aria-describedby");

    // Ô nhập nằm TRONG alertdialog, và nó bắt buộc.
    const reason = screen.getByLabelText(/終了理由/);
    expect(dialog).toContainElement(reason);
    expect(reason).toHaveAttribute("aria-required", "true");

    // Nút chính khoá cho tới khi có lý do.
    const confirm = screen.getByRole("button", { name: "終了する" });
    expect(confirm).toBeDisabled();

    await user.type(reason, "契約違反");
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith("契約違反");
  });

  it("does not close on an outside click, so a half-typed reason survives a stray click", () => {
    const onOpenChange = vi.fn();
    renderWithUi(<TerminatePartnership onOpenChange={onOpenChange} />);

    pressOutside();

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("gh#567 — `variant` decides the three things that always travel together", () => {
  it("default is unchanged: role=dialog, and an outside click dismisses", () => {
    const onOpenChange = vi.fn();
    renderWithUi(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader title="請求書を編集" />
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "請求書を編集" })).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).toBeNull();

    pressOutside();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("carries the primary action's emphasis — antd's okType, read off the same one prop", () => {
    const { rerender } = renderWithUi(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent variant="destructive">
          <DialogHeader title="削除" />
          <DialogFooter>
            <DialogAction>続行</DialogAction>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const destructive = screen.getByRole("button", { name: "続行" });
    expect(destructive).toHaveAttribute("data-variant", "destructive");
    /*
     * `data-variant` alone does NOT hold this contract: dropping the variant from `buttonVariants`
     * leaves the attribute intact while the button goes back to painting the primary fill —
     * measured, the mutation passed all 11 cases. `ui-button--destructive` is the design system's
     * OWN semantic class (the one `styles/control.css` colours from), not a Tailwind utility, so
     * asserting it is allowed by `check:no-tailwind-class-assertions` and it is what actually
     * fails when the emphasis is lost.
     */
    expect(destructive).toHaveClass("ui-button--destructive");

    rerender(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader title="削除" />
          <DialogFooter>
            <DialogAction>続行</DialogAction>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const plain = screen.getByRole("button", { name: "続行" });
    expect(plain).toHaveAttribute("data-variant", "default");
    expect(plain).not.toHaveClass("ui-button--destructive");
    expect(plain).toHaveClass("ui-button--default");
  });

  it("is inherited from the root, so one prop covers the whole tree", () => {
    renderWithUi(
      <Dialog open onOpenChange={() => {}} variant="destructive">
        <DialogContent>
          <DialogHeader title="組織を削除" />
          <DialogFooter>
            <DialogAction>削除</DialogAction>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("alertdialog", { name: "組織を削除" })).toBeInTheDocument();
    const confirm = screen.getByRole("button", { name: "削除" });
    expect(confirm).toHaveAttribute("data-variant", "destructive");
    expect(confirm).toHaveClass("ui-button--destructive");
  });

  it("lets the surface override the root — the nearer prop wins", () => {
    renderWithUi(
      <Dialog open onOpenChange={() => {}} variant="destructive">
        <DialogContent variant="default">
          <DialogHeader title="下書きを保存" />
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "下書きを保存" })).toBeInTheDocument();
  });

  it("Escape still closes a destructive dialog — the measured behaviour of the AlertDialog family", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<TerminatePartnership onOpenChange={onOpenChange} />);

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("hides the corner ✕ by default under destructive, and shows it back on request", () => {
    const { rerender } = renderWithUi(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent variant="destructive">
          <DialogHeader title="削除" />
        </DialogContent>
      </Dialog>,
    );
    expect(document.querySelector('[data-slot="dialog-close"]')).toBeNull();

    rerender(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent variant="destructive" showCloseButton>
          <DialogHeader title="削除" />
        </DialogContent>
      </Dialog>,
    );
    expect(document.querySelector('[data-slot="dialog-close"]')).not.toBeNull();
  });

  it("publishes the resolved level on the surface, so CSS and tests read one attribute", () => {
    renderWithUi(
      <Dialog open onOpenChange={() => {}} variant="destructive">
        <DialogContent>
          <DialogHeader title="削除" />
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-variant", "destructive");
  });
});

describe("gh#567 — the 12 AlertDialog* exports keep working, byte for byte", () => {
  it("AlertDialogContent still renders role=alertdialog and still ignores an outside click", () => {
    const onOpenChange = vi.fn();
    renderWithUi(
      <AlertDialogRoot open onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <DialogHeader title="支払を取り消しますか？" />
          <AlertDialogFooter>
            <AlertDialogAction>続行</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>,
    );

    expect(screen.getByRole("alertdialog", { name: "支払を取り消しますか？" })).toBeInTheDocument();
    pressOutside();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps the OLD family's default action emphasis — the new prop is opt-in, not a retint", () => {
    renderWithUi(
      <AlertDialogRoot open onOpenChange={() => {}}>
        <AlertDialogContent>
          <DialogHeader title="支払を取り消しますか？" />
          <AlertDialogFooter>
            <AlertDialogAction>続行</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>,
    );
    const action = screen.getByRole("button", { name: "続行" });
    expect(action).toHaveAttribute("data-variant", "default");
    expect(action).not.toHaveClass("ui-button--destructive");
  });
});
