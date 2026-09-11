import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Pagination } from "../pagination";

/** Ant Design 6.6.2 parity, read off `antd/es/pagination/Pagination.d.ts` + rc-pagination. */
const BASE = { total: 95, pageSize: 10, value: 3 } as const;

/** Drive the ONE media query `responsive` reads, without touching any other stub. */
function setViewportMatches(matches: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Pagination — antd `showQuickJumper`", () => {
  it("is off by default", () => {
    render(<Pagination {...BASE} onValueChange={vi.fn()} />);
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });

  it("names and focuses the jump field through its visible FormField label", async () => {
    const user = userEvent.setup();
    const { container } = render(<Pagination {...BASE} showQuickJumper onValueChange={vi.fn()} />);
    const field = screen.getByRole("spinbutton");
    const label = container.querySelector('[data-slot="pagination-jumper"] [data-slot="label"]')!;
    expect(field).toHaveAttribute("aria-labelledby", label.id);
    expect(field).toHaveAccessibleName(label.textContent!);
    await user.click(label);
    expect(field).toHaveFocus();
  });

  it("commits on Enter and reports the typed page", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Pagination {...BASE} showQuickJumper onValueChange={onValueChange} />);

    await user.type(screen.getByRole("spinbutton"), "7{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(7, 10);
  });

  it("clamps a page past the end into the last real page", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Pagination {...BASE} showQuickJumper onValueChange={onValueChange} />);

    await user.type(screen.getByRole("spinbutton"), "99{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(10, 10); // ceil(95 / 10)
  });

  it("ignores a commit that is not a number, instead of jumping to NaN", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Pagination {...BASE} showQuickJumper onValueChange={onValueChange} />);

    await user.type(screen.getByRole("spinbutton"), "{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders the optional `goButton` and commits through it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Pagination {...BASE} showQuickJumper={{ goButton: "Go" }} onValueChange={onValueChange} />,
    );

    await user.type(screen.getByRole("spinbutton"), "5");
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onValueChange).toHaveBeenLastCalledWith(5, 10);
  });
});

describe("Pagination — antd `size` / `align`", () => {
  it("defaults to the md tier aligned at the inline end (the table-footer position)", () => {
    render(<Pagination {...BASE} onValueChange={vi.fn()} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("data-size", "md");
    expect(nav).toHaveAttribute("data-align", "end");
  });

  it("records the small tier and a centred bar", () => {
    render(<Pagination {...BASE} size="sm" align="center" onValueChange={vi.fn()} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("data-size", "sm");
    expect(nav).toHaveAttribute("data-align", "center");
  });

  it("carries the tier onto the compact form too", () => {
    render(<Pagination {...BASE} simple size="sm" onValueChange={vi.fn()} />);
    expect(screen.getByRole("navigation")).toHaveAttribute("data-size", "sm");
  });
});

describe("Pagination — antd `responsive`", () => {
  it("keeps the full pager on a wide viewport", () => {
    setViewportMatches(false);
    render(<Pagination {...BASE} onValueChange={vi.fn()} />);
    expect(screen.getByRole("navigation")).not.toHaveAttribute("data-simple");
    expect(screen.getByRole("button", { name: /3/ })).toBeInTheDocument();
  });

  it("collapses to the compact form on a narrow one, instead of scrolling a too-wide strip", () => {
    setViewportMatches(true);
    const { container } = render(<Pagination {...BASE} onValueChange={vi.fn()} />);
    expect(screen.getByRole("navigation")).toHaveAttribute("data-simple", "true");
    expect(container.querySelector(".ui-pagination-count")).toHaveTextContent("3 / 10");
  });

  it("`responsive={false}` pins the full pager at every width", () => {
    setViewportMatches(true);
    render(<Pagination {...BASE} responsive={false} onValueChange={vi.fn()} />);
    expect(screen.getByRole("navigation")).not.toHaveAttribute("data-simple");
  });
});
