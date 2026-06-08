import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Transfer } from "../transfer";

// items WITHOUT descriptions → the `item.description ? … : false` false branch
const DATA = [
  { key: "a", title: "東京商事" },
  { key: "b", title: "大阪物産" },
];

const search = () => screen.queryAllByRole("searchbox")[0] ?? screen.queryAllByRole("textbox")[0];

describe("Transfer — search without descriptions", () => {
  it("filters by title only when items have no description", async () => {
    const user = userEvent.setup();
    renderWithUi(<Transfer dataSource={DATA} targetKeys={[]} showSearch onValueChange={vi.fn()} />);
    await user.type(search(), "大阪");
    expect(screen.getByText("大阪物産")).toBeInTheDocument();
    expect(screen.queryByText("東京商事")).toBeNull();
  });

  it("disabled transfer dims the search field", () => {
    renderWithUi(
      <Transfer dataSource={DATA} targetKeys={[]} showSearch disabled onValueChange={vi.fn()} />,
    );
    // the SearchInput gets the pointer-events-none/opacity class when disabled
    expect(search().closest(".pointer-events-none")).not.toBeNull();
  });
});
