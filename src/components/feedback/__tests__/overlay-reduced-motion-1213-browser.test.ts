import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "../../data-entry/__tests__/compile-real-css";

/**
 * gh#1213 — every overlay that enters with `data-[state=open]:animate-in` stops MOVING under
 * `prefers-reduced-motion: reduce` (Chromium, real stylesheet). DropdownMenu, Tooltip and HoverCard
 * were missing from the unlayered guard in `dialog-layout.css`, so their content still zoomed and
 * slid: measured `enter` 150ms animating `transform`, `filter`, `opacity` on the menu.
 * Popover is included as the control that was already guarded.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./src/components/navigation";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./src/components/feedback";
import { HoverCard, HoverCardTrigger, HoverCardContent, Popover, PopoverTrigger, PopoverContent } from "./src/components/data-display";
import { Button } from "./src/components/general";
function App() {
  const kind = new URLSearchParams(location.search).get("kind");
  const [open, setOpen] = React.useState(false);
  const toggle = <button id="toggle" onClick={() => setOpen(true)}>open</button>;
  const trigger = <Button>Trigger</Button>;
  return (
    <AppProvider defaultLocale="en" persist={false}>
      <TooltipProvider>
        {toggle}
        {kind === "dropdown-menu" ? (
          <DropdownMenu open={open} onOpenChange={setOpen}><DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Item</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        ) : kind === "tooltip" ? (
          <Tooltip open={open} onOpenChange={setOpen}><TooltipTrigger asChild>{trigger}</TooltipTrigger><TooltipContent>Tip</TooltipContent></Tooltip>
        ) : kind === "hover-card" ? (
          <HoverCard open={open} onOpenChange={setOpen}><HoverCardTrigger asChild>{trigger}</HoverCardTrigger><HoverCardContent>Card</HoverCardContent></HoverCard>
        ) : (
          <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild>{trigger}</PopoverTrigger><PopoverContent>Panel</PopoverContent></Popover>
        )}
      </TooltipProvider>
    </AppProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
`;

const MOVEMENT = /transform|translate|scale|rotate/;

let css = "";
let js = "";
let browser: Browser;

beforeAll(async () => {
  const realm = { encoder: globalThis.TextEncoder, bytes: globalThis.Uint8Array };
  globalThis.TextEncoder = NodeTextEncoder as unknown as typeof TextEncoder;
  globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor;
  try {
    const { build } = await import("esbuild");
    const out = await build({
      stdin: { contents: ENTRY, loader: "tsx", resolveDir: ROOT, sourcefile: "entry.tsx" },
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
      absWorkingDir: ROOT,
    });
    js = out.outputFiles![0]!.text;
  } finally {
    globalThis.TextEncoder = realm.encoder;
    globalThis.Uint8Array = realm.bytes;
  }
  // `=` included: `data-[state=open]:animate-in` is one class, and without it the variant never compiles.
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

/** The animations running on the overlay's content right after it opens. */
async function openAndRead(kind: string, reducedMotion: "reduce" | "no-preference") {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  await page.emulateMedia({ reducedMotion });
  await page.goto(`about:blank?kind=${kind}`);
  await page.setContent(
    `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
  );
  await page.locator("#toggle").click();
  const content = page.locator(`[data-slot="${kind}-content"]`);
  await content.waitFor();
  const running = await content.evaluate((el) =>
    el.getAnimations({ subtree: true }).map((a) => ({
      name: (a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty,
      duration: Number(a.effect?.getComputedTiming().duration ?? 0),
      props:
        (a.effect as KeyframeEffect | null)?.getKeyframes().flatMap((k) => Object.keys(k)) ?? [],
    })),
  );
  await page.close();
  return running;
}

describe(
  "overlays stop moving under prefers-reduced-motion (Chromium, gh#1213)",
  { timeout: 30_000 },
  () => {
    for (const kind of ["dropdown-menu", "tooltip", "hover-card", "popover"]) {
      it(`${kind}: animates on open normally, and nothing moves under reduce`, async () => {
        const normal = await openAndRead(kind, "no-preference");
        // Precondition: the overlay really does animate when motion is allowed, so the reduce
        // assertion below is not passing on an overlay that never moved at all.
        expect(
          normal.some((a) => a.props.some((p) => MOVEMENT.test(p))),
          JSON.stringify(normal),
        ).toBe(true);
        const reduced = await openAndRead(kind, "reduce");
        const moving = reduced.filter(
          (a) => a.duration > 1 && a.props.some((p) => MOVEMENT.test(p)),
        );
        expect(moving, JSON.stringify(reduced)).toEqual([]);
      });
    }
  },
);
