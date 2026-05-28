import { describe, expect, it, vi } from "vitest";
import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { SearchInput } from "../search-input";

describe("SearchInput", () => {
  it("debounces onSearch callback", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onSearch = vi.fn();
    renderWithUi(<SearchInput onSearch={onSearch} debounce={200} label="Search" />);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await user.type(screen.getByRole("searchbox"), "hello");

    expect(onSearch).not.toHaveBeenCalledWith("hello");
    await vi.advanceTimersByTimeAsync(200);
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith("hello");
    });
    vi.useRealTimers();
  });

  it("shows clear button when value present and clears on click", async () => {
    const user = userEvent.setup();
    renderWithUi(
      <SearchInput onSearch={() => undefined} debounce={9999} label="Search" defaultValue="x" />,
    );

    expect(screen.getAllByRole("button", { name: "Xóa tìm kiếm" })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Xóa tìm kiếm" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
});
