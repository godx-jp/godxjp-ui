import { describe, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import { renderWithUi, screen, userEvent } from "@/test/render";

import { Pagination } from "../pagination";

const nav = () => screen.getByRole("navigation");

describe("Pagination — total + size changer", () => {
  it("renders a string total summary when showTotal is set", () => {
    const { container } = renderWithUi(<Pagination value={1} total={95} pageSize={10} showTotal />);
    expect(container.querySelector(".ui-pagination-total")?.textContent).toMatch(/95/);
  });

  it("renders a custom range via a showTotal render function", () => {
    renderWithUi(
      <Pagination
        value={2}
        total={95}
        pageSize={10}
        showTotal={(total, [from, to]) => `${from}-${to} / ${total}`}
      />,
    );
    expect(screen.getByText("11-20 / 95")).toBeInTheDocument();
  });

  it("changing the page size resets to page 1 with the new size", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Pagination
        value={3}
        total={100}
        pageSize={10}
        showSizeChanger
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /20/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(1, 20);
  });
});

describe("Pagination — prev/next navigation", () => {
  it("next and prev step the page", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(<Pagination value={3} total={100} pageSize={10} onValueChange={onValueChange} />);
    const buttons = within(nav()).getAllByRole("button");
    await user.click(buttons[buttons.length - 1]); // next
    expect(onValueChange).toHaveBeenLastCalledWith(4, 10);
    await user.click(buttons[0]); // prev
    expect(onValueChange).toHaveBeenLastCalledWith(2, 10);
  });

  it("prev is disabled on the first page", () => {
    renderWithUi(<Pagination value={1} total={100} pageSize={10} />);
    expect(within(nav()).getAllByRole("button")[0]).toBeDisabled();
  });

  it("marks the current page with aria-current=page", () => {
    renderWithUi(<Pagination value={3} total={100} pageSize={10} />);
    const current = nav().querySelector('[aria-current="page"]')!;
    expect(current).toHaveTextContent("3");
  });

  it("collapses long ranges with an ellipsis", () => {
    renderWithUi(<Pagination value={10} total={300} pageSize={10} />);
    expect(nav().querySelector('[role="presentation"]')).not.toBeNull();
  });
});

describe("Pagination — simple + disabled", () => {
  it("simple mode steps via prev/next and clamps", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Pagination simple value={2} total={50} pageSize={10} onValueChange={onValueChange} />,
    );
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
    const [prev, next] = within(nav()).getAllByRole("button");
    await user.click(next);
    expect(onValueChange).toHaveBeenLastCalledWith(3, 10);
    await user.click(prev);
    expect(onValueChange).toHaveBeenLastCalledWith(1, 10);
  });

  it("disabled blocks every navigation", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithUi(
      <Pagination value={2} total={100} pageSize={10} disabled onValueChange={onValueChange} />,
    );
    const buttons = within(nav()).getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
