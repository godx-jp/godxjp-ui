import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Text } from "../typography";

/**
 * antd `copyable` — `CopyConfig` in antd 6.6.3 (`es/typography/Base/index.d.ts`), driven by
 * `hooks/useCopyClick.js` and rendered by `Base/CopyBtn.js`.
 */
afterEach(() => {
  vi.restoreAllMocks();
});

describe("Text — copyable", () => {
  it("copies the rendered text and confirms, without being told what to copy", async () => {
    const user = userEvent.setup();
    render(<Text copyable>RC-204881</Text>);
    const button = screen.getByRole("button", { name: "Sao chép" });
    expect(button).not.toHaveAttribute("data-copied");

    await user.click(button);

    expect(await navigator.clipboard.readText()).toBe("RC-204881");
    // The confirmed state is BOTH a paint hook and a new accessible name, so a screen-reader user
    // learns the copy succeeded rather than only a sighted one.
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Đã sao chép" })).toHaveAttribute(
        "data-copied",
        "",
      );
    });
  });

  it("prefers `copyable.text` over the rendered children", async () => {
    const user = userEvent.setup();
    render(<Text copyable={{ text: "gxp_live_8Fh2kQ" }}>••••••••</Text>);
    await user.click(screen.getByRole("button"));
    expect(await navigator.clipboard.readText()).toBe("gxp_live_8Fh2kQ");
  });

  it("awaits an async `copyable.text`, so the value can be fetched on demand", async () => {
    const user = userEvent.setup();
    render(<Text copyable={{ text: async () => Promise.resolve("遅れて届いた値") }}>秘密</Text>);
    await user.click(screen.getByRole("button"));
    expect(await navigator.clipboard.readText()).toBe("遅れて届いた値");
  });

  it("fires onCopy only AFTER the write resolves", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<Text copyable={{ onCopy }}>値</Text>);
    expect(onCopy).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledTimes(1);
    });
  });

  it("never claims a copy the clipboard refused", async () => {
    // The deliberate divergence from antd's `_util/copy`, written down in the component: antd keeps
    // a deprecated `document.execCommand` fallback that reports success from a synchronous flag a
    // permission prompt can leave stale. Here a refusal leaves every piece of state untouched.
    const user = userEvent.setup();
    const onCopy = vi.fn();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("NotAllowedError"));

    render(<Text copyable={{ onCopy }}>値</Text>);
    const button = screen.getByRole("button");
    await user.click(button);

    expect(onCopy).not.toHaveBeenCalled();
    expect(button).not.toHaveAttribute("data-copied");
    expect(screen.getByRole("button", { name: "Sao chép" })).toBeInTheDocument();
  });

  it("takes antd's two-element `tooltips` array as the two accessible names", async () => {
    const user = userEvent.setup();
    render(<Text copyable={{ tooltips: ["キーをコピー", "コピーしました"] }}>値</Text>);
    expect(screen.getByRole("button", { name: "キーをコピー" })).toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "コピーしました" })).toBeInTheDocument();
    });
  });

  it("still names the button when `tooltips` is false — the tooltip goes, the name stays", () => {
    // antd suppresses the tooltip here. Dropping the accessible name with it would leave a keyboard
    // or screen-reader user with an unlabelled icon button (WCAG 4.1.2).
    render(<Text copyable={{ tooltips: false }}>値</Text>);
    expect(screen.getByRole("button", { name: "Sao chép" })).toBeInTheDocument();
  });

  it("renders a caller's own icons for the two states", async () => {
    const user = userEvent.setup();
    render(<Text copyable={{ icon: [<span key="i">写</span>, <span key="d">済</span>] }}>値</Text>);
    expect(screen.getByText("写")).toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("済")).toBeInTheDocument();
    });
  });

  it("writes an HTML flavour alongside the plain one when format is text/html", async () => {
    const user = userEvent.setup();
    const write = vi.fn().mockResolvedValue(undefined);
    // jsdom ships neither ClipboardItem nor navigator.clipboard.write; both are stubbed so the
    // BRANCH can be measured rather than assumed.
    vi.stubGlobal(
      "ClipboardItem",
      class {
        constructor(public items: Record<string, Blob>) {}
      },
    );
    Object.defineProperty(navigator.clipboard, "write", { value: write, configurable: true });

    render(<Text copyable={{ format: "text/html" }}>{"<b>太字</b>"}</Text>);
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(write).toHaveBeenCalledTimes(1);
    });
    const [[[item]]] = write.mock.calls as [[[{ items: Record<string, Blob> }]]];
    expect(Object.keys(item.items).sort()).toEqual(["text/html", "text/plain"]);
    vi.unstubAllGlobals();
  });

  it("puts the cluster before the text when actions.placement is start", () => {
    const { container } = render(
      <Text copyable actions={{ placement: "start" }}>
        値
      </Text>,
    );
    const run = container.querySelector('[data-slot="text"]');
    expect(run?.firstElementChild).toHaveAttribute("data-slot", "typography-actions");
    expect(run?.firstElementChild).toHaveAttribute("data-placement", "start");
  });

  it("renders nothing extra when copyable is absent or false", () => {
    const { container, rerender } = render(<Text>値</Text>);
    expect(container.querySelector("button")).toBeNull();
    rerender(<Text copyable={false}>値</Text>);
    expect(container.querySelector("button")).toBeNull();
  });
});
