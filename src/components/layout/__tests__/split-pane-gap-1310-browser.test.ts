import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * gh#1310 (2) — the gap between SplitPane's main column and its aside was fixed at
 * `--space-stack-md` (16px) with no knob, so godx-content's aside read closer to the editor than
 * its paragraphs did to each other. `--split-pane-gap` (rule #45) tunes it: unset it is still
 * 16px, set on any ancestor it moves the aside, and a closed rail still has no gap.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { SplitPane } from "./src/components/layout/split-pane";
const q = new URLSearchParams(location.search);
const gap = q.get("gap");
const closed = q.has("closed");
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}>
    <div style={gap ? { "--split-pane-gap": gap } : undefined}>
      <SplitPane aside={closed ? null : <p id="aside">Aside</p>} asideWidth="sm" asideLabel="Details">
        <p id="main">Main</p>
      </SplitPane>
    </div>
  </AppProvider>,
);
`;

let fixture: ChromiumFixture;

beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);

afterAll(async () => {
  await fixture?.close();
});

const gapOf = (search: string) =>
  fixture.open(search).then((page) =>
    page.evaluate(() => {
      const main = document.querySelector(".ui-split-pane-main")!.getBoundingClientRect();
      const aside = document.querySelector(".ui-split-pane-aside")?.getBoundingClientRect();
      return {
        between: aside ? Math.round(aside.left - main.right) : null,
        column: getComputedStyle(document.querySelector(".ui-split-pane")!).columnGap,
      };
    }),
  );

describe("SplitPane gap knob (Chromium, gh#1310)", { timeout: 60_000 }, () => {
  it("defaults to 16px between main and aside", async () => {
    expect((await gapOf("")).between).toBe(16);
  });

  it("--split-pane-gap on an ancestor sets the distance", async () => {
    expect((await gapOf("?gap=var(--space-inline-xl)")).between).toBe(24);
    expect((await gapOf("?gap=40px")).between).toBe(40);
  });

  it("a closed rail still has no gap, knob or not", async () => {
    expect((await gapOf("?closed&gap=40px")).column).toBe("0px");
  });
});
