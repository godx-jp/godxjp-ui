import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Transfer } from "../transfer";

const DATA = [
  { key: "a", title: "東京商事", description: "Tokyo HQ" },
  { key: "b", title: "大阪物産", description: "Osaka branch" },
  { key: "c", title: "京都製作所", description: "Kyoto plant" },
];

describe("Transfer — panel search", () => {
  it("filters the source list by title and by description", async () => {
    const user = userEvent.setup();
    renderWithUi(<Transfer dataSource={DATA} targetKeys={[]} showSearch onValueChange={vi.fn()} />);
    // the left (source) panel's search box is the first searchable field
    const search = screen.queryAllByRole("searchbox")[0] ?? screen.queryAllByRole("textbox")[0];

    // title match
    await user.type(search, "京都");
    expect(screen.getByText("京都製作所")).toBeInTheDocument();
    expect(screen.queryByText("東京商事")).toBeNull();

    // description match (case-insensitive)
    await user.clear(search);
    await user.type(search, "osaka");
    expect(screen.getByText("大阪物産")).toBeInTheDocument();
    expect(screen.queryByText("京都製作所")).toBeNull();
  });
});
