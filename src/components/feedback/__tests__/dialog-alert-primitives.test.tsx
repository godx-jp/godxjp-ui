import { describe, expect, it, vi } from "vitest";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../dialog";

function Confirm(props: {
  onOpenChange?: (o: boolean) => void;
  tone?: "default" | "warning";
  useChildren?: boolean;
}) {
  return (
    <AlertDialogPrimitive.Root open onOpenChange={props.onOpenChange ?? (() => {})}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay />
        <AlertDialogContent showCloseButton>
          {props.useChildren ? (
            <AlertDialogHeader>
              <AlertDialogTitle>カスタム</AlertDialogTitle>
            </AlertDialogHeader>
          ) : (
            <AlertDialogHeader
              title="削除しますか？"
              subtitle="この操作は元に戻せません"
              extra={<span>ヘルプ</span>}
              tone={props.tone}
            />
          )}
          <AlertDialogFooter>
            <AlertDialogAction>続行</AlertDialogAction>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

describe("AlertDialog primitives (composed via Radix Root)", () => {
  it("renders the prop-driven header, action and cancel", () => {
    renderWithUi(<Confirm />);
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("削除しますか？")).toBeInTheDocument();
    expect(within(dialog).getByText("この操作は元に戻せません")).toBeInTheDocument();
    expect(within(dialog).getByText("ヘルプ")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "続行" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("applies the tone band on the header", () => {
    renderWithUi(<Confirm tone="warning" />);
    expect(screen.getByText("削除しますか？").closest("[data-tone]")).toHaveAttribute(
      "data-tone",
      "warning",
    );
  });

  it("renders explicit header children instead of the prop row", () => {
    renderWithUi(<Confirm useChildren />);
    expect(screen.getByText("カスタム")).toBeInTheDocument();
  });

  it("the cancel button dismisses the dialog", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<Confirm onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("the action button dismisses the dialog", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithUi(<Confirm onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole("button", { name: "続行" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
