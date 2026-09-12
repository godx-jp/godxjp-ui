import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";
import { Copy } from "lucide-react";

import { Actions } from "../actions";

describe("Actions", () => {
  it("fires onItemClick for a plain action", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    renderWithUi(
      <Actions
        items={[
          {
            key: "copy",
            label: "Copy reply",
            icon: <Copy aria-hidden="true" />,
            onItemClick,
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy reply" }));
    expect(onItemClick).toHaveBeenCalled();
  });

  it("toggles Actions.Feedback like state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithUi(
      <Actions items={[<Actions.Feedback key="feedback" onChange={onChange} />]} />,
    );

    await user.click(screen.getByRole("button", { name: "Thích" }));
    expect(onChange).toHaveBeenCalledWith("like");
  });

  it("copies text through Actions.Copy", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(writeText);

    renderWithUi(<Actions items={[<Actions.Copy key="copy" text="hello" />]} />);
    await user.click(screen.getByRole("button", { name: "Sao chép" }));
    expect(writeText).toHaveBeenCalledWith("hello");
  });
});
