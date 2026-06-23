import { describe, it } from "vitest";

import {
  AlertDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Dialog a11y", () => {
  it("has no axe violations (open dialog with title + description)", async () => {
    await expectNoA11yViolations(
      <Dialog open onOpenChange={() => undefined}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>マニフェストを確定</DialogTitle>
            <DialogDescription>12 件の貨物を確定します。元に戻せません。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost">
              キャンセル
            </Button>
            <Button type="button">確定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
  });

  it("has no axe violations (AlertDialog confirm preset)", async () => {
    await expectNoA11yViolations(
      <AlertDialog
        open
        onOpenChange={() => undefined}
        title="マニフェストを確定しますか?"
        description="47 件がロックされます。"
        onConfirm={() => undefined}
      />,
    );
  });

  it("has no axe violations (AlertDialog type-to-confirm)", async () => {
    await expectNoA11yViolations(
      <AlertDialog
        open
        onOpenChange={() => undefined}
        title="完全に削除しますか?"
        confirmPhrase="DELETE"
        onConfirm={() => undefined}
      />,
    );
  });
});
