import { describe, it } from "vitest";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../sheet";
import { Button } from "../../general/button";
import { expectNoA11yViolations } from "@/test/a11y";

describe("Sheet a11y", () => {
  it("has no axe violations (open sheet with title + description + body)", async () => {
    await expectNoA11yViolations(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>注文 #1024</SheetTitle>
            <SheetDescription>配送情報を表示します。</SheetDescription>
          </SheetHeader>
          <SheetBody>本文の内容</SheetBody>
          <SheetFooter>
            <Button type="button">保存</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>,
    );
  });

  it("has no axe violations (Ant-style header props)", async () => {
    await expectNoA11yViolations(
      <Sheet defaultOpen>
        <SheetContent width={420}>
          <SheetHeader
            tone="info"
            title="詳細検索"
            subtitle="条件を組み合わせます"
            extra={<span>3 条件</span>}
          />
        </SheetContent>
      </Sheet>,
    );
  });
});
