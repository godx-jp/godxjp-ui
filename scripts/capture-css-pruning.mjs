#!/usr/bin/env node
/** Visual comparison of the full and opt-out styles on the same real consumer components. */
import { build } from "esbuild";
import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
const output = join(process.cwd(), "codex-shots");
mkdirSync(output, { recursive: true });
const fixture = join(process.cwd(), "preview/dist/g4-pruning.html");
const code = await build({
  stdin: {
    contents: `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "@godxjp/ui/app";
import { PageContainer, Flex } from "@godxjp/ui/layout";
import { Button } from "@godxjp/ui/general";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <PageContainer title="Account settings" extra={<Button>Save changes</Button>}>
      <Flex direction="col" gap="md"><p>Manage your account preferences.</p><Button variant="outline">Review preferences</Button></Flex>
    </PageContainer>
  </AppProvider>
);`,
    loader: "tsx",
    resolveDir: process.cwd(),
  },
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  define: { "process.env.NODE_ENV": '"production"' },
});
const browser = await chromium.launch({ headless: true });
const measurements = {};
const consoleMessages = [];
try {
  for (const [phase, css] of [
    ["before", "allTailwind"],
    ["after", "application"],
  ]) {
    const styles = readFileSync(join(output, "css", `${css}.css`), "utf8");
    writeFileSync(
      fixture,
      `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles}</style></head><body><div id="root"></div><script>${code.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script></body></html>`,
    );
    for (const width of [320, 390, 1280])
      for (const dir of ["ltr", "rtl"]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        page.on("console", (msg) => {
          if (["error", "warning"].includes(msg.type())) consoleMessages.push(msg.text());
        });
        page.on("pageerror", (error) => consoleMessages.push(error.message));
        await page.goto("http://127.0.0.1:6454/g4-pruning.html");
        await page.locator(".ui-page-container").waitFor();
        await page.evaluate((direction) => {
          document.documentElement.dir = direction;
        }, dir);
        await page.screenshot({
          path: join(output, `${phase}-${width}-${dir}.png`),
          fullPage: true,
        });
        measurements[`${phase}-${width}-${dir}`] = await page.evaluate(() => {
          const props = [
            "width",
            "height",
            "padding-inline-start",
            "padding-inline-end",
            "font-size",
            "line-height",
            "background-color",
            "color",
          ];
          return [...document.querySelectorAll(".ui-page-container,.ui-button")].map((el) => {
            const style = getComputedStyle(el);
            return Object.fromEntries(props.map((p) => [p, style.getPropertyValue(p)]));
          });
        });
        await page.close();
      }
  }
  for (const width of [320, 390, 1280])
    for (const dir of ["ltr", "rtl"]) {
      if (
        JSON.stringify(measurements[`before-${width}-${dir}`]) !==
        JSON.stringify(measurements[`after-${width}-${dir}`])
      )
        throw new Error(`computed style drift at ${width}/${dir}`);
    }
  writeFileSync(
    join(output, "visual-comparison.json"),
    JSON.stringify({ measurements, consoleMessages }, null, 2),
  );
  if (consoleMessages.length) throw new Error(`browser console: ${consoleMessages.join("; ")}`);
  console.log(
    "12 Chromium screenshots; 6 viewport/direction comparisons have identical computed styles; console errors/warnings: 0",
  );
} catch (error) {
  console.error(consoleMessages);
  throw error;
} finally {
  await browser.close();
  rmSync(fixture, { force: true });
}
