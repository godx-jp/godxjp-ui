import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderWithUi } from "@/test/render";
import { ruleSelector } from "@/test/css-selector";
import { Alert, AlertActions, AlertContent, AlertDescription, AlertTitle } from "../alert";
import { DialogContent, DialogHeader, DialogRoot } from "../dialog";

/** Structural selectors in alert-layout.css / dialog-layout.css against really rendered DOM. */
const here = dirname(fileURLToPath(import.meta.url));
const alertCss = readFileSync(join(here, "../../../styles/alert-layout.css"), "utf8");
const dialogCss = readFileSync(join(here, "../../../styles/dialog-layout.css"), "utf8");

describe("alert-layout.css structural selectors select the rendered DOM", () => {
  it("the actions grid puts the content in column 1 and only the actions in column 2", () => {
    const selector = ruleSelector(
      alertCss,
      /:has\(> \[data-slot="alert-actions"\]\)\s*> :not\(\[data-slot="alert-actions"\]\)/,
    );
    const { container } = renderWithUi(
      <Alert>
        <AlertContent>
          <AlertTitle>title</AlertTitle>
          <AlertDescription>desc</AlertDescription>
        </AlertContent>
        <AlertActions>
          <button type="button">再試行</button>
        </AlertActions>
      </Alert>,
    );

    const content = container.querySelector('[data-slot="alert-content"]')!;
    const actions = container.querySelector('[data-slot="alert-actions"]')!;
    expect(content.matches(selector)).toBe(true);
    expect(actions.matches(selector)).toBe(false);
  });
});

describe("dialog-layout.css structural selectors select the rendered DOM", () => {
  it("a toned header re-inks its description; the default tone keeps the muted ink", () => {
    const selector = ruleSelector(
      dialogCss,
      '[data-slot="dialog-header"]:not([data-tone="default"]) [data-slot="dialog-description"]',
    );
    renderWithUi(
      <>
        <DialogRoot open>
          <DialogContent>
            <DialogHeader
              data-testid="danger-header"
              tone="destructive"
              title="削除"
              subtitle="戻せません"
            />
          </DialogContent>
        </DialogRoot>
      </>,
    );

    // Radix portals into document.body.
    const dangerDesc = document.querySelector(
      '[data-testid="danger-header"] [data-slot="dialog-description"]',
    )!;
    expect(dangerDesc, "the danger header renders its description").not.toBeNull();
    expect(dangerDesc.matches(selector)).toBe(true);

    // The default tone EMITS data-tone="default" (dialog.tsx:126) — the negation
    // depends on that: if the attribute were omitted, `:not([data-tone="default"])`
    // would match the default header too and invert the rule.
    const header = document.querySelector('[data-testid="danger-header"]')!;
    header.setAttribute("data-tone", "default");
    expect(dangerDesc.matches(selector)).toBe(false);
  });
});
