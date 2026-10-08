import { TextEncoder as NodeTextEncoder } from "node:util";

import { chromium, type Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { compileRealCss } from "./compile-real-css";

/**
 * gh#1208 — a searchable Select inside an open Sheet (and Dialog) opened and closed within ~5ms:
 * focus bounced between the search input and the trigger, so a typed query never searched.
 * Production: GoDX ID's OAuth-client picker in the Admin catalog's edit Sheet.
 */
const ROOT = process.cwd();
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Form, FormField, Input, Select } from "./src/components/data-entry";
import { Button } from "./src/components/general";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./src/components/navigation";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle, Dialog, DialogContent, DialogHeader, DialogTitle } from "./src/components/feedback";
const options = Array.from({ length: 30 }, (_, i) => ({ value: "c" + i, label: "Client " + i }));
// GoDX ID's real screen (platform-ef, 31.31.5): the Sheet is opened from a row's DropdownMenu
// "Edit" item, and the picker is a controlled \`value=""\` async Select labelled by a FormField far
// enough down the Sheet body that clicking it scrolls the body first.
function MenuOpenedSheet() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Target instance actions">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpen(true)}>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" responsive="auto">
          <SheetHeader><SheetTitle>Edit</SheetTitle></SheetHeader>
          {/* The picker sits below a dozen fields, so reaching it scrolls the Sheet's body. */}
          <SheetBody><Form onSubmit={(e) => e.preventDefault()}>
          {Array.from({ length: 12 }, (_, i) => (
            <FormField key={i} id={"f" + i} label={"Field " + i}><Input id={"f" + i} defaultValue={"v" + i} /></FormField>
          ))}
          <FormField id="instance-workload-callers-picker" label="OAuth client">
            <Select
              id="instance-workload-callers-picker"
              value={value}
              placeholder="Pick a client"
              searchPlaceholder="Search clients"
              emptyMessage="No clients"
              loadOptions={async ({ query }) => ({
                options: query.trim() === "" ? [] : options.filter((o) => o.label.includes(query.trim())),
              })}
              onValueChange={() => setValue("")}
            />
          </FormField>
          </Form></SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}
function App() {
  const params = new URLSearchParams(location.search);
  const [value, setValue] = React.useState<string | undefined>(undefined);
  // GoDX ID's real call site (platform-ef, 31.31.5): the async path, controlled, with an id.
  const picker =
    params.get("kind") === "async" ? (
      <Select
        id="instance-workload-callers-picker"
        aria-label="OAuth client"
        value={value}
        onValueChange={setValue}
        placeholder="Pick a client"
        searchPlaceholder="Search clients"
        emptyMessage="No clients"
        loadOptions={async ({ query }) => ({
          options: options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
        })}
      />
    ) : (
      <Select showSearch aria-label="OAuth client" options={options} />
    );
  return (
    <AppProvider defaultLocale="en" persist={false}>
      {params.get("in") === "menu-sheet" ? (
        <MenuOpenedSheet />
      ) : params.get("in") === "dialog" ? (
        <Dialog open><DialogContent><DialogHeader><DialogTitle>Edit</DialogTitle></DialogHeader>{picker}</DialogContent></Dialog>
      ) : (
        <Sheet open><SheetContent><SheetHeader><SheetTitle>Edit</SheetTitle></SheetHeader>{picker}</SheetContent></Sheet>
      )}
    </AppProvider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
`;

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
  const tokens = [...new Set(js.match(/[\w:./[\]()%#!=-]+/g) ?? [])].join(" ");
  css = await compileRealCss(`<div class="${tokens.replaceAll('"', "")}"></div>`);
  browser = await chromium.launch({ headless: true });
}, 180_000);

afterAll(async () => {
  await browser?.close();
});

describe("searchable Select inside an overlay (Chromium, gh#1208)", { timeout: 40_000 }, () => {
  for (const [host, kind] of [
    ["sheet", "static"],
    ["dialog", "static"],
    ["sheet", "async"],
    ["dialog", "async"],
    ["menu-sheet", "async"],
  ] as const) {
    it(`${kind} options: stays open in a ${host}, keeps focus in its search, and filters what is typed`, async () => {
      const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
      await page.goto(`about:blank?in=${host}&kind=${kind}`);
      await page.setContent(
        `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
      );
      // setContent keeps about:blank's query, so read it back the same way the app does.
      if (host === "menu-sheet") {
        await page.getByRole("button", { name: "Target instance actions" }).click();
        await page.getByRole("menuitem", { name: "Edit" }).click();
      }
      const trigger = page.getByRole("combobox", { name: "OAuth client" });
      await trigger.waitFor();
      if (host === "menu-sheet") {
        // The scroll-into-view and the click land in one frame, so the body's \`scroll\` event
        // arrives AFTER the panel opened. That stale event closed it (6 of 6 runs on 31.31.5).
        expect(
          await page
            .locator(".ui-sheet-body-space")
            .evaluate((el) => el.scrollHeight > el.clientHeight),
        ).toBe(true);
      }
      // Record every focus landing from the moment of the click: the defect is focus BOUNCING back
      // to the trigger after the search took it. On a light page the panel's own effect refocuses
      // the search 2ms later and it looks fine; on a real page that bounce closed the panel.
      await page.evaluate(() => {
        const w = window as unknown as { __focus: string[] };
        w.__focus = [];
        document.addEventListener(
          "focusin",
          (e) => {
            const el = e.target as HTMLElement;
            w.__focus.push(
              el.classList.contains("ui-search-select-search-input")
                ? "search"
                : el.getAttribute("role") === "combobox"
                  ? "trigger"
                  : el.tagName.toLowerCase(),
            );
          },
          true,
        );
      });
      await trigger.click();
      const search = page.locator(".ui-search-select-search-input");
      await search.waitFor();
      await page.waitForTimeout(300);
      expect(await search.isVisible()).toBe(true);
      expect(await search.evaluate((el) => el === document.activeElement)).toBe(true);
      const landings = await page.evaluate(
        () => (window as unknown as { __focus: string[] }).__focus,
      );
      // Once the search has focus, focus never goes back to the trigger.
      expect(landings.slice(landings.indexOf("search"))).not.toContain("trigger");
      await page.keyboard.type("Client 2");
      // The static list is filtered after the search debounce, so wait for the result, not a fixed time.
      await expect
        .poll(async () => {
          const options = await page.getByRole("option").allTextContents();
          return options.length > 0 && options.every((o) => o.includes("Client 2"));
        })
        .toBe(true);
      // Still open with focus in the search: the panel did not close while typing.
      expect(await search.isVisible()).toBe(true);
      expect(await search.evaluate((el) => el === document.activeElement)).toBe(true);
      await page.close();
    });
  }

  it("still closes when the Sheet body really scrolls after the panel opened", async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await page.goto("about:blank?in=menu-sheet&kind=async");
    await page.setContent(
      `<!doctype html><html lang="en"><head><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`,
    );
    await page.getByRole("button", { name: "Target instance actions" }).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    const trigger = page.getByRole("combobox", { name: "OAuth client" });
    await trigger.click();
    await page.locator(".ui-search-select-search-input").waitFor();
    await page.waitForTimeout(200);
    expect(await trigger.getAttribute("aria-expanded")).toBe("true");
    await page.locator(".ui-sheet-body-space").evaluate((el) => {
      el.scrollTop -= 40;
    });
    await expect.poll(() => trigger.getAttribute("aria-expanded")).toBe("false");
    await page.close();
  });
});
