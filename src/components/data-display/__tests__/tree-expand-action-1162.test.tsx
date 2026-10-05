import { describe, expect, it } from "vitest";

import { Tree } from "../tree";
import { renderWithUi, screen, userEvent } from "@/test/render";

/** gh#1162 — selecting a folder in a page tree opens it (antd DirectoryTree `expandAction`). */
const data = [
  {
    value: "spec",
    label: "仕様書",
    children: [{ value: "f05", label: "F05.見積", children: [{ value: "p0", label: "00 概要" }] }],
  },
  { value: "leaf", label: "Top page" },
];

describe("Tree expandAction (gh#1162)", () => {
  it('"click": selecting a parent row also opens it, and a second click closes it', async () => {
    const user = userEvent.setup();
    renderWithUi(<Tree treeData={data} expandAction="click" />);
    const spec = screen.getByRole("treeitem", { name: "仕様書" });
    expect(spec).toHaveAttribute("aria-expanded", "false");
    await user.click(screen.getByText("仕様書"));
    expect(spec).toHaveAttribute("aria-expanded", "true");
    expect(spec).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("treeitem", { name: "F05.見積" })).toBeVisible();
    await user.click(screen.getByText("仕様書"));
    expect(spec).toHaveAttribute("aria-expanded", "false");
  });

  it('"doubleClick": a single click only selects; a double click toggles', async () => {
    const user = userEvent.setup();
    renderWithUi(<Tree treeData={data} expandAction="doubleClick" />);
    const spec = screen.getByRole("treeitem", { name: "仕様書" });
    await user.click(screen.getByText("仕様書"));
    expect(spec).toHaveAttribute("aria-expanded", "false");
    await user.dblClick(screen.getByText("仕様書"));
    expect(spec).toHaveAttribute("aria-expanded", "true");
  });

  it("default: a row click selects without expanding (unchanged behaviour)", async () => {
    const user = userEvent.setup();
    renderWithUi(<Tree treeData={data} />);
    await user.click(screen.getByText("仕様書"));
    expect(screen.getByRole("treeitem", { name: "仕様書" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
