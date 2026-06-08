import { describe, expect, it } from "vitest";
import { renderWithUi, screen } from "@/test/render";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";

describe("DialogHeader — prop-driven layout", () => {
  it("renders title, subtitle and extra from props", () => {
    renderWithUi(
      <Dialog open>
        <DialogContent>
          <DialogHeader
            title="削除確認"
            subtitle="この操作は元に戻せません"
            extra={<button type="button">ヘルプ</button>}
          />
          <DialogBody>本文</DialogBody>
          <DialogFooter>
            <button type="button">OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("削除確認")).toBeInTheDocument();
    expect(screen.getByText("この操作は元に戻せません")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ヘルプ" })).toBeInTheDocument();
    expect(screen.getByText("本文")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
  });

  it("applies a tone band via data-tone", () => {
    renderWithUi(
      <Dialog open>
        <DialogContent>
          <DialogHeader title="警告" tone="warning" />
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("警告").closest("[data-tone]")).toHaveAttribute("data-tone", "warning");
  });

  it("defaults the tone to 'default' when none is given", () => {
    renderWithUi(
      <Dialog open>
        <DialogContent>
          <DialogHeader title="通常" />
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("通常").closest("[data-tone]")).toHaveAttribute("data-tone", "default");
  });

  it("renders explicit children instead of the prop row when children are passed", () => {
    renderWithUi(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カスタム見出し</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("カスタム見出し")).toBeInTheDocument();
  });
});
