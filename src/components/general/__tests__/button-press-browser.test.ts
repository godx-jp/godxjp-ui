import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * Press feedback (`--press-scale`) and the strength-meter fill, against the real stylesheet.
 * Default: a pressed Button does not move. Opted in (0.97): it scales while pressed, and not
 * under reduced motion. A lit PasswordStrength segment runs the fill animation; under reduced
 * motion it does not.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Button } from "./src/components/general/button";
import { PasswordStrength } from "./src/components/data-entry/password-strength";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready">
    <Button id="plain">Plain</Button>
    <div style={{ "--press-scale": "0.97" }}><Button id="press">Press</Button></div>
    <PasswordStrength value="correct horse battery staple 42!" />
  </div></AppProvider>,
);
`;

let fixture: ChromiumFixture;
beforeAll(async () => {
  fixture = await bootChromium(ENTRY);
}, 180_000);
afterAll(async () => {
  await fixture?.close();
});

const pressed = async (page: import("playwright").Page, id: string) => {
  const box = (await page.locator(`#${id}`).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(250);
  const t = await page.evaluate((i) => getComputedStyle(document.getElementById(i)!).transform, id);
  await page.mouse.up();
  return t;
};

describe("press feedback + strength fill", { timeout: 60_000 }, () => {
  it("scales a pressed Button only when opted in, and not under reduced motion", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    await page.waitForTimeout(150);
    expect(await pressed(page, "plain")).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    expect(await pressed(page, "press")).toMatch(/^matrix\(0\.97, 0, 0, 0\.97/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await pressed(page, "press")).toBe("none");
    await page.close();
  });

  it("grows a lit strength segment in, and not under reduced motion", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    const lit = await page.evaluate(
      () =>
        getComputedStyle(
          document.querySelector('.ui-password-strength-segment[data-state="filled"]')!,
        ).animationName,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    const still = await page.evaluate(
      () =>
        getComputedStyle(
          document.querySelector('.ui-password-strength-segment[data-state="filled"]')!,
        ).animationName,
    );
    await page.close();
    expect(lit).toBe("ui-password-strength-fill");
    expect(still).toBe("none");
  });
});
