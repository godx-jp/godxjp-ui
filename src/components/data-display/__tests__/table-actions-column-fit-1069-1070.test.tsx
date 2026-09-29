import { act, render } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Button } from "../../general/button";
import { Table, TableBody, TableCell, TableRow } from "../table";

/**
 * gh#1069 — `useActionsColumnFit` re-measured every actions cell (forced layout) on ANY DOM change
 * inside the table, because its MutationObserver watched the whole scroll box with `subtree`.
 * It now listens to row add/remove only and coalesces every re-measure into one animation frame.
 *
 * gh#1070 — `TableCell priority="actions"` wrapped its children in `span.ui-table-actions-content`
 * on every table; only `preset="action-collection"` measures it, so every other table keeps the
 * pre-31.10.0 markup (`td > button`).
 *
 * jsdom has no layout and no ResizeObserver: a no-op ResizeObserver lets the hook run, a manual
 * `requestAnimationFrame` queue makes "one frame" explicit, and a measure is counted by the
 * `getComputedStyle` read it does on each actions cell.
 */

let frames: FrameRequestCallback[] = [];
let measuredCells = 0;

function flushFrame() {
  const queued = frames;
  frames = [];
  act(() => queued.forEach((callback) => callback(0)));
}

/** Lets the MutationObserver deliver its records (a microtask). */
async function settleMutations() {
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  frames = [];
  measuredCells = 0;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  const realGetComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
    if (element instanceof HTMLElement && element.dataset.priority === "actions") {
      measuredCells += 1;
    }
    return realGetComputedStyle(element, pseudo);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function Queue({
  rows,
  note = "SMTP timeout",
  preset = "action-collection",
}: {
  rows: string[];
  note?: string;
  preset?: "default" | "action-collection";
}) {
  return (
    <Table preset={preset}>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row}>
            <TableCell priority="primary">{row}</TableCell>
            <TableCell>
              {/* Keyed so a new note swaps the element (a childList mutation), as a badge does. */}
              <span key={note}>{note}</span>
            </TableCell>
            <TableCell priority="actions">
              <Button variant="outline" size="sm">
                Retry
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

describe("gh#1069 — the actions column re-measures on row add/remove only, once per frame", () => {
  it("a content change inside a non-actions cell does not re-measure", async () => {
    const { rerender } = render(<Queue rows={["a", "b"]} />);
    flushFrame();
    measuredCells = 0;

    rerender(<Queue rows={["a", "b"]} note="Connection reset by peer" />);
    await settleMutations();
    flushFrame();

    expect(measuredCells).toBe(0);
  });

  it("adding a row re-measures once, after one frame", async () => {
    const { rerender } = render(<Queue rows={["a", "b"]} />);
    flushFrame();
    measuredCells = 0;

    rerender(<Queue rows={["a", "b", "c"]} />);
    await settleMutations();
    expect(measuredCells).toBe(0);

    flushFrame();
    // One measure reads each of the three actions cells once.
    expect(measuredCells).toBe(3);
  });

  it("replacing the tbody is still seen", async () => {
    const { container } = render(<Queue rows={["a"]} />);
    flushFrame();
    measuredCells = 0;

    const table = container.querySelector("table")!;
    const fresh = table.querySelector("tbody")!.cloneNode(true);
    act(() => {
      table.replaceChild(fresh, table.querySelector("tbody")!);
    });
    await settleMutations();
    flushFrame();
    expect(measuredCells).toBe(1);
    measuredCells = 0;

    // The new tbody is observed too.
    act(() => {
      (fresh as HTMLElement).append((fresh as HTMLElement).firstElementChild!.cloneNode(true));
    });
    await settleMutations();
    flushFrame();
    expect(measuredCells).toBe(2);
  });

  it("several changes in one frame measure once", async () => {
    const { rerender } = render(<Queue rows={["a"]} />);
    flushFrame();
    measuredCells = 0;

    rerender(<Queue rows={["a", "b"]} />);
    await settleMutations();
    rerender(<Queue rows={["a", "b", "c"]} />);
    await settleMutations();
    rerender(<Queue rows={["b", "c"]} />);
    await settleMutations();
    expect(frames).toHaveLength(1);

    flushFrame();
    expect(measuredCells).toBe(2);
  });

  it("a pending frame is cancelled on unmount", async () => {
    const { rerender, unmount } = render(<Queue rows={["a"]} />);
    flushFrame();
    rerender(<Queue rows={["a", "b"]} />);
    await settleMutations();
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});

describe("gh#1070 — the actions-content box exists only in preset=action-collection", () => {
  it("default preset: the actions cell's first child is the button itself", () => {
    const { container } = render(<Queue rows={["a"]} preset="default" />);
    const cell = container.querySelector('td[data-priority="actions"]')!;
    expect(cell.firstElementChild?.tagName).toBe("BUTTON");
    expect(container.querySelector(".ui-table-actions-content")).toBeNull();
  });

  it("action-collection: the children are wrapped in the measured box", () => {
    const { container } = render(<Queue rows={["a"]} />);
    const cell = container.querySelector('td[data-priority="actions"]')!;
    expect(cell.firstElementChild?.className).toBe("ui-table-actions-content");
    expect(cell.firstElementChild?.firstElementChild?.tagName).toBe("BUTTON");
  });

  it("a TableCell outside any Table keeps the plain markup", () => {
    const { container } = render(
      <table>
        <tbody>
          <tr>
            <TableCell priority="actions">
              <Button size="sm">Retry</Button>
            </TableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(container.querySelector("td")!.firstElementChild?.tagName).toBe("BUTTON");
  });
});
