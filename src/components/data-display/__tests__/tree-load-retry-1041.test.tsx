/**
 * gh#1041 — a REJECTED `loadData` must be retryable (rc-tree `onNodeLoad` / `onNodeExpand`).
 *
 * The old ledger recorded a node before its promise settled and never cleared it, so one failed
 * request left the branch unloadable for the life of the tree. rc-tree: on reject the key leaves
 * the loading set, is NOT marked loaded, an uncontrolled branch folds back shut, and the next
 * expand calls `loadData` again — giving up after 10 failures.
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";

import { Tree } from "../tree";
import type { TreeNodeProp } from "../tree";
import { createLazyLoadLedger, MAX_LAZY_LOAD_RETRIES } from "../../../lib/tree";

const ROOT: TreeNodeProp[] = [{ value: "suite", label: "Suite", isLeaf: false }];
const row = () => screen.getByRole("treeitem", { name: "Suite" });
const switcher = () => row().querySelector<HTMLElement>(".ui-tree-switcher")!;

describe("Tree — a rejected loadData can be retried (gh#1041)", () => {
  it("clears busy, folds the branch shut, and asks again on the next expand", async () => {
    const user = userEvent.setup();
    let attempt = 0;
    const loadData = vi.fn();

    function Host() {
      const [data, setData] = React.useState(ROOT);
      return (
        <Tree
          aria-label="Suites"
          treeData={data}
          loadData={async (node) => {
            loadData(node.value);
            attempt += 1;
            if (attempt === 1) throw new Error("network");
            setData([{ ...node, children: [{ value: "section", label: "Section" }] }]);
          }}
        />
      );
    }

    render(<Host />);
    await user.click(switcher());
    expect(loadData).toHaveBeenCalledTimes(1);

    // Rejected: no longer busy, not open (so the next click is an EXPAND, as in rc-tree).
    await waitFor(() => expect(row()).not.toHaveAttribute("aria-busy"));
    expect(row()).toHaveAttribute("aria-expanded", "false");

    await user.click(switcher());
    expect(loadData, "the retry must reach loadData").toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("treeitem", { name: "Section" })).toBeInTheDocument();

    // Resolved now — and a resolved node is never asked again.
    await user.click(switcher());
    await user.click(switcher());
    expect(loadData).toHaveBeenCalledTimes(2);
  });

  it("keyboard: → after a failure asks again", async () => {
    const user = userEvent.setup();
    const loadData = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue(undefined);
    render(<Tree aria-label="Suites" treeData={ROOT} loadData={loadData} />);
    row().focus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(row()).toHaveAttribute("aria-expanded", "false"));
    await user.keyboard("{ArrowRight}");
    expect(loadData).toHaveBeenCalledTimes(2);
  });

  it("controlled expansion: re-opening the branch through expandedValues asks again", async () => {
    const loadData = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue(undefined);
    const { rerender } = render(
      <Tree aria-label="Suites" treeData={ROOT} loadData={loadData} expandedValues={["suite"]} />,
    );
    expect(loadData).toHaveBeenCalledTimes(1);
    // A controlled branch is the consumer's to close (rc-tree never forces it shut).
    await waitFor(() => expect(row()).not.toHaveAttribute("aria-busy"));
    expect(row()).toHaveAttribute("aria-expanded", "true");

    rerender(<Tree aria-label="Suites" treeData={ROOT} loadData={loadData} expandedValues={[]} />);
    rerender(
      <Tree aria-label="Suites" treeData={ROOT} loadData={loadData} expandedValues={["suite"]} />,
    );
    expect(loadData).toHaveBeenCalledTimes(2);
  });

  it("a synchronous throw counts as a rejection", async () => {
    const user = userEvent.setup();
    const loadData = vi.fn().mockImplementationOnce(() => {
      throw new Error("sync");
    });
    render(<Tree aria-label="Suites" treeData={ROOT} loadData={loadData} />);
    await user.click(switcher());
    await waitFor(() => expect(row()).toHaveAttribute("aria-expanded", "false"));
    await user.click(switcher());
    expect(loadData).toHaveBeenCalledTimes(2);
  });
});

describe("createLazyLoadLedger — rc-tree's loaded / loading / retry bookkeeping", () => {
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

  it("dedupes in-flight, never repeats a resolved key, and gives up after the retry cap", async () => {
    const ledger = createLazyLoadLedger();
    const load = vi.fn(() => Promise.reject(new Error("down")));

    expect(ledger.run("k", load)).toBe(true);
    expect(ledger.run("k", load), "in flight").toBe(false);
    await settle();

    for (let attempt = 2; attempt <= MAX_LAZY_LOAD_RETRIES; attempt += 1) {
      expect(ledger.run("k", load), `attempt ${attempt}`).toBe(true);
      await settle();
    }
    expect(load).toHaveBeenCalledTimes(MAX_LAZY_LOAD_RETRIES);
    expect(ledger.run("k", load), "past the cap").toBe(false);

    const ok = vi.fn(() => Promise.resolve());
    expect(ledger.run("j", ok)).toBe(true);
    await settle();
    expect(ledger.run("j", ok)).toBe(false);
  });
});
