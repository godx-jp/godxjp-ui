import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { Star } from "lucide-react";
import { renderWithUi } from "@/test/render";
import { Alert } from "../alert";

/**
 * v32 #1223 — Banner and Callout fold into `Alert variant`.
 *
 * PARITY FIRST. This file was written against the retired components and compared the merged
 * expression with them, byte for byte (`html(<Alert variant="banner">) === html(<Banner>)`, and
 * every Callout `kind`). It was red for `kind` until Alert learned the preset, then green; only
 * then were `Banner` and `Callout` deleted. The inline snapshots below are that proven output, so
 * a later change to Alert that would have broken a migrated Banner/Callout still goes red here.
 */
const html = (ui: ReactElement) => renderWithUi(ui).container.innerHTML;

describe("Banner → <Alert variant='banner'> parity (#1223)", () => {
  it("warning with slots", () => {
    expect(
      html(
        <Alert variant="banner" tone="warning">
          <Alert.Content>
            <Alert.Title>T</Alert.Title>
            <Alert.Description>D</Alert.Description>
          </Alert.Content>
          <Alert.Actions>A</Alert.Actions>
        </Alert>,
      ),
    ).toMatchInlineSnapshot(
      `"<div role="alert" data-slot="alert" data-variant="banner" data-tone="warning"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert" data-slot="alert-icon" data-tone="warning" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg><div data-slot="alert-body"><div data-slot="alert-content"><p data-slot="alert-title" data-tone="warning">T</p><p data-slot="alert-description">D</p></div><div data-slot="alert-actions">A</div></div></div>"`,
    );
  });

  it("dismissible info", () => {
    expect(
      html(
        <Alert variant="banner" tone="info" onDismiss={() => {}} className="x">
          <Alert.Title>T</Alert.Title>
        </Alert>,
      ),
    ).toMatchInlineSnapshot(
      `"<div role="status" data-slot="alert" data-variant="banner" data-tone="info" data-dismissible="" class="x"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info" data-slot="alert-icon" data-tone="info" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg><div data-slot="alert-body"><p data-slot="alert-title" data-tone="info">T</p></div><button type="button" data-slot="alert-dismiss" class="ui-focus-ring" aria-label="Đóng"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x ui-alert-dismiss-icon" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></div>"`,
    );
  });

  it("no icon", () => {
    expect(
      html(
        <Alert variant="banner" icon={false}>
          T
        </Alert>,
      ),
    ).toMatchInlineSnapshot(
      `"<div role="status" data-slot="alert" data-variant="banner" data-tone="default"><div data-slot="alert-body">T</div></div>"`,
    );
  });
});

describe("Callout → <Alert variant='callout' kind> parity (#1223)", () => {
  it("each kind keeps the retired Callout's tone, glyph and non-live role", () => {
    const out = (["note", "tip", "important", "warning", "caution"] as const).map((kind) =>
      html(
        <Alert variant="callout" kind={kind}>
          <Alert.Title>T</Alert.Title>
        </Alert>,
      ),
    );
    expect(out).toMatchInlineSnapshot(`
      [
        "<div role="note" data-slot="alert" data-variant="callout" data-tone="info"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info" data-slot="alert-icon" data-tone="info" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg><div data-slot="alert-body"><p data-slot="alert-title" data-tone="info">T</p></div></div>",
        "<div role="note" data-slot="alert" data-variant="callout" data-tone="success"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb" data-slot="alert-icon" data-tone="success" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg><div data-slot="alert-body"><p data-slot="alert-title" data-tone="success">T</p></div></div>",
        "<div role="note" data-slot="alert" data-variant="callout" data-tone="neutral"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-warning" data-slot="alert-icon" data-tone="neutral" aria-hidden="true"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path><path d="M12 15h.01"></path><path d="M12 7v4"></path></svg><div data-slot="alert-body"><p data-slot="alert-title" data-tone="neutral">T</p></div></div>",
        "<div role="note" data-slot="alert" data-variant="callout" data-tone="warning"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert" data-slot="alert-icon" data-tone="warning" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg><div data-slot="alert-body"><p data-slot="alert-title" data-tone="warning">T</p></div></div>",
        "<div role="note" data-slot="alert" data-variant="callout" data-tone="destructive"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-octagon-alert" data-slot="alert-icon" data-tone="destructive" aria-hidden="true"><path d="M12 16h.01"></path><path d="M12 8v4"></path><path d="M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z"></path></svg><div data-slot="alert-body"><p data-slot="alert-title" data-tone="destructive">T</p></div></div>",
      ]
    `);
  });

  it("default kind is note (info tone, non-live role=note)", () => {
    const merged = html(<Alert variant="callout">T</Alert>);
    expect(merged).toContain('role="note"');
    expect(merged).toContain('data-tone="info"');
    expect(merged).toMatchInlineSnapshot(
      `"<div role="note" data-slot="alert" data-variant="callout" data-tone="info"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info" data-slot="alert-icon" data-tone="info" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg><div data-slot="alert-body">T</div></div>"`,
    );
  });

  it("tone and icon still override the kind preset", () => {
    expect(
      html(
        <Alert variant="callout" kind="tip" tone="warning" icon={Star}>
          T
        </Alert>,
      ),
    ).toMatchInlineSnapshot(
      `"<div role="note" data-slot="alert" data-variant="callout" data-tone="warning"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" data-slot="alert-icon" data-tone="warning" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg><div data-slot="alert-body">T</div></div>"`,
    );
  });

  it("kind is inert outside variant=callout", () => {
    expect(html(<Alert kind="caution">T</Alert>)).toBe(html(<Alert>T</Alert>));
  });
});
