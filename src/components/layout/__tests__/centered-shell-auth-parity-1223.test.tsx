import { describe, expect, it } from "vitest";
import type { ReactElement } from "react";
import { renderWithUi } from "@/test/render";
import { CenteredShell } from "../centered-shell";

/**
 * v32 #1223 — CenteredShell + AuthShell are ONE centred shell; `variant="auth"` /
 * `"auth-canonical"` is what AuthShell / AuthShell `variant="canonical"` were.
 *
 * PARITY FIRST. This file was written against the retired `AuthShell` and compared every shape
 * below byte for byte (`html(<CenteredShell variant="auth" …>) === html(<AuthShell …>)`); it was
 * red until the variant existed, then green, and only then was AuthShell deleted. The snapshots
 * are that proven output — landmarks, localized labels and every `data-*` hook included.
 */
const html = (ui: ReactElement) => renderWithUi(ui).container.innerHTML;

describe("AuthShell → <CenteredShell variant='auth'> parity (#1223)", () => {
  it("every AuthShell shape", () => {
    const shapes = {
      bare: <CenteredShell variant="auth">card</CenteredShell>,
      chrome: (
        <CenteredShell variant="auth" brand="B" actions="A" footer="F" className="x">
          card
        </CenteredShell>
      ),
      actionsOnly: (
        <CenteredShell variant="auth" actions="A">
          card
        </CenteredShell>
      ),
      loginAnchored: (
        <CenteredShell variant="auth" preset="login" align="anchored">
          card
        </CenteredShell>
      ),
      recoveryCentered: (
        <CenteredShell variant="auth" preset="account-recovery" align="center">
          card
        </CenteredShell>
      ),
      wideCompact: (
        <CenteredShell variant="auth" measure="wide" density="compact">
          card
        </CenteredShell>
      ),
      canonical: (
        <CenteredShell variant="auth-canonical" brand="B">
          card
        </CenteredShell>
      ),
    };
    expect(Object.fromEntries(Object.entries(shapes).map(([k, ui]) => [k, html(ui)])))
      .toMatchInlineSnapshot(`
      {
        "actionsOnly": "<div data-slot="auth-shell" data-variant="default" data-density="comfortable" class="ui-auth-shell"><header class="ui-auth-shell-bar" aria-label="Thương hiệu"><div class="ui-auth-shell-bar-actions">A</div></header><main class="ui-auth-shell-main" aria-label="Nội dung chính"><div class="ui-auth-shell-card">card</div></main></div>",
        "bare": "<div data-slot="auth-shell" data-variant="default" data-density="comfortable" class="ui-auth-shell"><main class="ui-auth-shell-main" aria-label="Nội dung chính"><div class="ui-auth-shell-card">card</div></main></div>",
        "canonical": "<div data-slot="auth-shell" data-variant="canonical" data-density="compact" class="ui-auth-shell"><header class="ui-auth-shell-bar" aria-label="Thương hiệu">B</header><main class="ui-auth-shell-main" aria-label="Nội dung chính"><div class="ui-auth-shell-card">card</div></main></div>",
        "chrome": "<div data-slot="auth-shell" data-variant="default" data-density="comfortable" class="ui-auth-shell x"><header class="ui-auth-shell-bar" aria-label="Thương hiệu">B<div class="ui-auth-shell-bar-actions">A</div></header><main class="ui-auth-shell-main" aria-label="Nội dung chính"><div class="ui-auth-shell-card">card</div></main><footer class="ui-auth-shell-footer" aria-label="Chân trang">F</footer></div>",
        "loginAnchored": "<div data-slot="auth-shell" data-variant="default" data-preset="login" data-align="anchored" data-density="comfortable" class="ui-auth-shell"><main class="ui-auth-shell-main" aria-label="Nội dung chính"><div class="ui-auth-shell-card">card</div></main></div>",
        "recoveryCentered": "<div data-slot="auth-shell" data-variant="default" data-preset="account-recovery" data-align="center" data-density="comfortable" class="ui-auth-shell"><main class="ui-auth-shell-main" aria-label="Nội dung chính"><div class="ui-auth-shell-card">card</div></main></div>",
        "wideCompact": "<div data-slot="auth-shell" data-variant="default" data-measure="wide" data-density="compact" class="ui-auth-shell"><main class="ui-auth-shell-main" aria-label="Nội dung chính"><div class="ui-auth-shell-card">card</div></main></div>",
      }
    `);
  });

  it("the page shape is unchanged when variant is omitted or 'page'", () => {
    expect(html(<CenteredShell variant="page">c</CenteredShell>)).toBe(
      html(<CenteredShell>c</CenteredShell>),
    );
    expect(html(<CenteredShell>c</CenteredShell>)).toContain('data-slot="centered-shell"');
  });
});
