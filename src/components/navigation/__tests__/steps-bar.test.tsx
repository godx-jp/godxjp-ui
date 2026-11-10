import { describe, expect, it, vi } from "vitest";

import { renderWithUi, screen, userEvent } from "@/test/render";
import { Steps } from "../steps";

const items = [{ title: "コード入力" }, { title: "確認" }, { title: "完了" }];

describe('Steps type="bar"', () => {
  it("renders one segment + title per step, the current one aria-current, statuses in sr-only text", () => {
    const { container } = renderWithUi(<Steps type="bar" value={1} items={items} />);
    const list = container.querySelector("ol")!;
    expect(list).toHaveClass("ui-steps-bar");
    expect(list).toHaveAttribute("data-type", "bar");
    const rows = [...list.querySelectorAll("li")];
    expect(rows.map((li) => li.dataset.status)).toEqual(["finish", "process", "wait"]);
    expect(rows[1]).toHaveAttribute("aria-current", "step");
    expect(rows[0]).not.toHaveAttribute("aria-current");
    for (const li of rows) {
      expect(li.querySelector(".ui-steps-bar-segment")).toHaveAttribute("aria-hidden", "true");
      expect(li.querySelector(".sr-only")?.textContent).toBeTruthy();
      // No marker, no connector, no fold attributes.
      expect(li.querySelector(".ui-steps-marker")).toBeNull();
      expect(li).not.toHaveAttribute("data-connector");
      expect(li).not.toHaveAttribute("data-direction");
    }
    expect(rows.map((li) => li.querySelector(".ui-steps-bar-title")?.textContent)).toEqual([
      "コード入力",
      "確認",
      "完了",
    ]);
    // Informational: no dead buttons.
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("never folds to vertical, even with orientation=vertical", () => {
    const { container } = renderWithUi(
      <Steps type="bar" orientation="vertical" value={0} items={items} />,
    );
    expect(container.querySelector("ol")).not.toHaveAttribute("data-direction");
  });

  it("becomes real buttons with onValueChange, and reports the clicked step", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Steps type="bar" value={2} items={items} onValueChange={onValueChange} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    await user.click(buttons[0]!);
    expect(onValueChange).toHaveBeenCalledWith(0);
  });

  it("paints an error step", () => {
    const { container } = renderWithUi(<Steps type="bar" value={1} status="error" items={items} />);
    expect(container.querySelectorAll("li")[1]).toHaveAttribute("data-status", "error");
  });
});
