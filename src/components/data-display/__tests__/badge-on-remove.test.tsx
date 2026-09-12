import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";

import { Badge } from "../badge";

describe("Badge onRemove (antd Tag closable)", () => {
  it("does not render a remove button without onRemove", () => {
    renderWithUi(<Badge tone="info">審査中</Badge>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("finds the × by role/name quoting the chip label and fires onRemove once", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderWithUi(
      <Badge variant="outline" onRemove={onRemove}>
        期限: 今週
      </Badge>,
    );

    const remove = screen.getByRole("button", { name: /期限: 今週/ });
    await user.click(remove);

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("names each removable chip from its own label", async () => {
    const user = userEvent.setup();
    const onA = vi.fn();
    const onB = vi.fn();
    renderWithUi(
      <>
        <Badge variant="outline" onRemove={onA}>
          種別: 在留
        </Badge>
        <Badge variant="outline" onRemove={onB}>
          担当: わたし
        </Badge>
      </>,
    );

    await user.click(screen.getByRole("button", { name: /種別: 在留/ }));
    await user.click(screen.getByRole("button", { name: /担当: わたし/ }));

    expect(onA).toHaveBeenCalledTimes(1);
    expect(onB).toHaveBeenCalledTimes(1);
  });
});
