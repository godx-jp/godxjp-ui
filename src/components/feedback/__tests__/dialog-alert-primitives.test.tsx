import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, within } from "@/test/render";

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../dialog";
import { Button } from "../../general/button";

function Confirm(props: {
  onOpenChange?: (o: boolean) => void;
  tone?: "default" | "warning";
  useChildren?: boolean;
}) {
  return (
    <AlertDialogRoot open onOpenChange={props.onOpenChange ?? (() => {})}>
      <AlertDialogPortal>
        <AlertDialogOverlay />
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
      </AlertDialogPortal>
    </AlertDialogRoot>
  );
}

/** Trigger-driven, fully uncontrolled — the composition a consumer copies from the docs frame. */
function TriggeredConfirm({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <AlertDialogRoot defaultOpen={defaultOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          支払を確定
        </Button>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>支払を確定しますか？</AlertDialogTitle>
            <AlertDialogDescription>取消には管理者の承認が必要です。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>戻る</AlertDialogCancel>
            <AlertDialogAction>確定する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  );
}

describe("AlertDialogRoot (compound composition from the public surface)", () => {
  it("opens from AlertDialogTrigger with alertdialog semantics", async () => {
    const user = userEvent.setup();
    renderWithUi(<TriggeredConfirm />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "支払を確定" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
    expect(within(dialog).getByText("支払を確定しますか？")).toBeInTheDocument();
  });

  it("restores focus to the trigger after cancel", async () => {
    const user = userEvent.setup();
    renderWithUi(<TriggeredConfirm />);
    const trigger = screen.getByRole("button", { name: "支払を確定" });

    await user.click(trigger);
    await screen.findByRole("alertdialog");
    await user.click(screen.getByRole("button", { name: "戻る" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("honours both defaultOpen branches for an uncontrolled alertdialog", async () => {
    const user = userEvent.setup();
    const open = renderWithUi(<TriggeredConfirm defaultOpen />);
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "戻る" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    open.unmount();

    renderWithUi(<TriggeredConfirm defaultOpen={false} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("closes on Escape and restores focus", async () => {
    const user = userEvent.setup();
    renderWithUi(<TriggeredConfirm />);
    const trigger = screen.getByRole("button", { name: "支払を確定" });

    await user.click(trigger);
    await screen.findByRole("alertdialog");
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe("AlertDialog primitives (composed via AlertDialogRoot)", () => {
  it("renders the prop-driven header, action and cancel", () => {
    renderWithUi(<Confirm />);
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("削除しますか？")).toBeInTheDocument();
    expect(within(dialog).getByText("この操作は元に戻せません")).toBeInTheDocument();
    expect(within(dialog).getByText("ヘルプ")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "続行" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Đóng" })).toBeInTheDocument();
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
