import { afterEach, describe, expect, it, vi } from "vitest";

import { act, renderWithUi, screen } from "@/test/render";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

// gh#708: a Select with `defaultOpen` inside a Popover opened while the Popover was still sliding
// in, and react-aria positions a listbox only when it opens (then on resize / viewport scroll) —
// so the listbox stayed where the trigger STARTED, drawn over the settled trigger. The Select now
// holds its default open until the ancestors' running animations finish. The geometry itself
// (listbox top vs trigger bottom, first option hit-testable) is measured in Chromium by
// scripts/kanban-select-visual.mjs; jsdom has no layout, so these cases pin the timing contract.

function Picker({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <div data-testid="host">
      <Select aria-label="Workspace" defaultOpen defaultValue="x" onOpenChange={onOpenChange}>
        <SelectTrigger aria-label="Workspace">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">Workspace X</SelectItem>
          <SelectItem value="y">Workspace Y</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// jsdom ships no `getAnimations`; each case installs the ancestor animations it needs.
const proto = HTMLElement.prototype as unknown as { getAnimations?: () => Animation[] };
const original = proto.getAnimations;

afterEach(() => {
  proto.getAnimations = original;
});

describe("Select defaultOpen waits for the trigger to stop moving (gh#708)", () => {
  it("with nothing animating it is open on the first render, without calling onOpenChange", () => {
    const onOpenChange = vi.fn();
    renderWithUi(<Picker onOpenChange={onOpenChange} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("opens only once a running ancestor animation has finished", async () => {
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const sliding = {
      playState: "running",
      finished,
      effect: { getComputedTiming: () => ({ endTime: 150 }) },
    } as unknown as Animation;
    proto.getAnimations = function (this: HTMLElement) {
      return this.dataset.testid === "host" ? [sliding] : [];
    };

    renderWithUi(<Picker />);
    expect(screen.queryByRole("listbox")).toBeNull();

    await act(async () => {
      finish();
      await finished;
    });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("does not wait on an infinite animation (a pulse would otherwise never let it open)", () => {
    proto.getAnimations = function (this: HTMLElement) {
      if (this.dataset.testid !== "host") return [];
      return [
        {
          playState: "running",
          finished: new Promise(() => {}),
          effect: { getComputedTiming: () => ({ endTime: Infinity }) },
        } as unknown as Animation,
      ];
    };
    renderWithUi(<Picker />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("a controlled `open` is never deferred", () => {
    proto.getAnimations = function (this: HTMLElement) {
      if (this.dataset.testid !== "host") return [];
      return [
        {
          playState: "running",
          finished: new Promise(() => {}),
          effect: { getComputedTiming: () => ({ endTime: 150 }) },
        } as unknown as Animation,
      ];
    };
    renderWithUi(
      <div data-testid="host">
        <Select aria-label="Workspace" open defaultValue="x">
          <SelectTrigger aria-label="Workspace">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="x">Workspace X</SelectItem>
          </SelectContent>
        </Select>
      </div>,
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
