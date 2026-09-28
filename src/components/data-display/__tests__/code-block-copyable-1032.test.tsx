import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";

import { CodeBlock } from "../code-block";

/**
 * gh#1032 — `CodeBlock` had no way to copy its content, so every consumer hand-rolled a copy
 * Button. `copyable` is antd `Typography`'s prop, same name and semantics, on the same machinery.
 * (Tests run in the library's default `vi` locale.)
 */
afterEach(() => {
  vi.restoreAllMocks();
});

const snippet = 'curl -X POST https://api.example.com/v1/issues -d \'{"title":"Total"}\'';

describe("CodeBlock — copyable (gh#1032)", () => {
  it("renders no copy button when `copyable` is absent (or false)", () => {
    const { container, rerender } = render(<CodeBlock>{snippet}</CodeBlock>);
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.firstElementChild?.tagName).toBe("PRE");
    rerender(<CodeBlock copyable={false}>{snippet}</CodeBlock>);
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("[data-copyable]")).toBeNull();
  });

  it("copies the block's text content, confirms, and announces it politely", async () => {
    const user = userEvent.setup();
    const write = vi.spyOn(navigator.clipboard, "writeText");
    render(<CodeBlock copyable>{snippet}</CodeBlock>);

    const button = screen.getByRole("button", { name: "Sao chép mã" });
    const status = document.querySelector('[data-slot="code-block-status"]')!;
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("");

    await user.click(button);

    expect(write).toHaveBeenCalledWith(snippet);
    expect(await navigator.clipboard.readText()).toBe(snippet);
    await waitFor(() => {
      expect(status).toHaveTextContent("Đã sao chép mã vào bộ nhớ tạm");
    });
    expect(screen.getByRole("button", { name: "Đã sao chép" })).toHaveAttribute(
      "data-state",
      "copied",
    );
  });

  it("copies the CODE of highlighter spans, not an empty string", async () => {
    const user = userEvent.setup();
    render(
      <CodeBlock copyable language="ts">
        <span data-code-token="keyword">const</span> <span data-code-token="constant">a</span> = 1;
      </CodeBlock>,
    );
    await user.click(screen.getByRole("button"));
    expect(await navigator.clipboard.readText()).toBe("const a = 1;");
  });

  it("prefers `copyable.text` and fires `onCopy` after the write", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(
      <CodeBlock copyable={{ text: "npm i @godxjp/ui", onCopy }}>$ npm i @godxjp/ui</CodeBlock>,
    );
    await user.click(screen.getByRole("button"));
    expect(await navigator.clipboard.readText()).toBe("npm i @godxjp/ui");
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("never claims a copy the clipboard refused", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("NotAllowedError"));
    render(<CodeBlock copyable={{ onCopy }}>{snippet}</CodeBlock>);
    await user.click(screen.getByRole("button"));
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "idle");
    expect(document.querySelector('[data-slot="code-block-status"]')).toHaveTextContent("");
  });

  it("takes antd's `tooltips` pair as the two accessible names", async () => {
    const user = userEvent.setup();
    render(<CodeBlock copyable={{ tooltips: ["Copy command", "Done"] }}>{snippet}</CodeBlock>);
    await user.click(screen.getByRole("button", { name: "Copy command" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument());
  });

  it("is reachable and operable from the keyboard", async () => {
    const user = userEvent.setup();
    render(<CodeBlock copyable>{snippet}</CodeBlock>);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(await navigator.clipboard.readText()).toBe(snippet);
  });

  it("keeps the ref and the consumer's props on the `pre`", () => {
    const ref = { current: null as HTMLPreElement | null };
    render(
      <CodeBlock copyable ref={ref} aria-label="Command" className="x">
        {snippet}
      </CodeBlock>,
    );
    expect(ref.current?.tagName).toBe("PRE");
    expect(ref.current).toHaveAttribute("aria-label", "Command");
    expect(ref.current).toHaveClass("ui-code-block", "x");
  });
});

/* ── Geometry — jsdom does not lay out, so this is Chromium. ─────────────────────────────────── */
const REPO = process.cwd();
const css = [
  "src/tokens/foundation.css",
  "src/tokens/derived.css",
  "src/tokens/axes.css",
  "src/tokens/components/control.css",
  "src/tokens/components/data-display.css",
  "src/styles/base.css",
  "src/styles/control.css",
  "src/styles/data-display-layout.css",
]
  .map((p) => readFileSync(join(REPO, p), "utf8"))
  .join("\n");

describe("CodeBlock copyable geometry (Chromium, gh#1032)", () => {
  it("sits in the block's inline-end corner, inside its box, clear of every line (LTR + RTL)", async () => {
    const long = "x".repeat(400);
    const markup = renderToStaticMarkup(
      <>
        <div id="ltr">
          <CodeBlock copyable>{long}</CodeBlock>
        </div>
        <div id="rtl" dir="rtl">
          <CodeBlock copyable>{long}</CodeBlock>
        </div>
      </>,
    );
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 480, height: 800 } });
      await page.setContent(
        `<!doctype html><html><head><style>${css}</style></head><body>${markup}</body></html>`,
      );
      const result = await page.evaluate(() =>
        ["ltr", "rtl"].map((id) => {
          const root = document.getElementById(id)!;
          const pre = root.querySelector("pre")!.getBoundingClientRect();
          const btn = root.querySelector("button")!.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(root.querySelector("code")!);
          const lines = [...range.getClientRects()];
          const overlaps = lines.filter(
            (l) =>
              l.left < btn.right && l.right > btn.left && l.top < btn.bottom && l.bottom > btn.top,
          ).length;
          return {
            inside:
              btn.left >= pre.left &&
              btn.right <= pre.right &&
              btn.top >= pre.top &&
              btn.bottom <= pre.bottom,
            // inline-end corner: the button's end edge is nearer the block's end edge than its start.
            endGap: id === "ltr" ? pre.right - btn.right : btn.left - pre.left,
            startGap: id === "ltr" ? btn.left - pre.left : pre.right - btn.right,
            topGap: btn.top - pre.top,
            width: btn.width,
            lines: lines.length,
            overlaps,
          };
        }),
      );
      for (const r of result) {
        expect(r.width).toBeGreaterThan(0);
        expect(r.inside).toBe(true);
        expect(r.endGap).toBeLessThan(r.startGap);
        expect(r.topGap).toBeLessThan(16);
        expect(r.lines).toBeGreaterThan(1);
        expect(r.overlaps).toBe(0);
      }
    } finally {
      await browser.close();
    }
  });
});
