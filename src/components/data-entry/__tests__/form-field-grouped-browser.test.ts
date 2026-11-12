import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { bootChromium, type ChromiumFixture } from "../../../test/chromium-fixture";

/**
 * FormFields inside `Card variant="grouped"` read as rows of the group: no gap between fields, a
 * hairline from the row text (the label) to the card edge between rows and none under the last,
 * the label left of the control (`layout="horizontal"`), and the input without its own border.
 */
const ENTRY = `
import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./src/app/app-provider";
import { Card, CardContent } from "./src/components/data-display/card";
import { Form } from "./src/components/data-entry/form";
import { FormField } from "./src/components/data-entry/form-field";
import { Input } from "./src/components/data-entry/input";
createRoot(document.getElementById("root")).render(
  <AppProvider defaultLocale="en" persist={false}><div id="ready" style={{ width: 400 }}>
    <Card variant="grouped"><CardContent flush>
      <Form layout="horizontal" labelWidth="7rem">
        <FormField label="Name"><Input defaultValue="Hanako Yamada" /></FormField>
        <FormField label="Email"><Input defaultValue="yamada@example.com" /></FormField>
        <FormField label="Password"><Input type="password" defaultValue="secret-secret" /></FormField>
      </Form>
    </CardContent></Card>
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

describe("FormField rows in a grouped card", { timeout: 60_000 }, () => {
  it("draws inset hairlines between rows, label left, borderless inputs, no gaps", async () => {
    const page = await fixture.open("", { width: 800, height: 600 });
    await page.waitForTimeout(150);
    const m = await page.evaluate(() => {
      const fields = [...document.querySelectorAll<HTMLElement>('[data-slot="form-field"]')];
      return fields.map((f, i) => {
        const r = f.getBoundingClientRect();
        const after = getComputedStyle(f, "::after");
        const label = f.querySelector('[data-slot="form-field-label"]')!.getBoundingClientRect();
        const control = f
          .querySelector('[data-slot="form-field-control"]')!
          .getBoundingClientRect();
        const input = f.querySelector("input")!;
        const next = fields[i + 1]?.getBoundingClientRect();
        return {
          content: after.content,
          lineStart: r.left + parseFloat(after.left) - label.left,
          labelLeft: label.right <= control.left,
          border: getComputedStyle(input.closest(".ui-control-surface") ?? input).borderTopColor,
          gap: next ? next.top - r.bottom : 0,
        };
      });
    });
    await page.close();
    expect(m).toHaveLength(3);
    for (const row of m.slice(0, 2)) {
      expect(Math.abs(row.lineStart)).toBeLessThanOrEqual(1);
      expect(Math.abs(row.gap)).toBeLessThanOrEqual(0.5);
    }
    expect(m[2]!.content).toBe("none");
    for (const row of m) {
      expect(row.labelLeft).toBe(true);
      expect(row.border).toBe("rgba(0, 0, 0, 0)");
    }
  });
});
