---
title: Sign-in MFA challenge (5 states)
viewport: 1440x2000
---

## otp · otp/error · otp/loading · recovery-code · passkey-failure

This is the **sign-in challenge**. `TwoFactorSetup` is the **enrollment** Dialog (QR, manual key,
recovery-code output) — a challenge has no secret to reveal and no dialog to dismiss, it _is_ the
page. Reusing the enrollment dialog here is the anti-pattern this example exists to prevent.

## Focus order (WAI-ARIA APG + WCAG 2.4.3)

DOM order **is** the task order, so no `tabindex` is needed anywhere:

1. the code field — one `InputOTP` (or one `Input` for a recovery code)
2. the primary action — `Button fullWidth`
3. fallback A
4. fallback B

The 6-slot row is **one field**, not six. `InputOTP` owns paste, arrow keys, backspace and the
caret, and exposes a single focus stop; six `Input`s would put six stops in the tab ring and break
paste of a 6-digit code — the single most common real-world MFA interaction.

The error message is rendered by `FormField error` with `role="alert"` and wired as
`aria-errormessage` on the field, which also carries `aria-invalid` — so a screen-reader user hears
"wrong code" without leaving the field, and sighted users get the destructive slot borders. State is
never signalled by colour alone (WCAG 1.4.1): the text is always there.

## Loading

`<Button loading loadingText="検証中…">` keeps the button's box while it is pending, so the panel
never jumps mid-submit, and the input is `disabled` for the duration. The fallbacks are disabled
too — a second verification must not race the first.

## Fallback row

`<Flex justify="between" gap="sm" wrap>` with two ghost buttons. The two fallbacks share one
horizontal row while the localized labels fit the panel and **wrap to a stack** when they do not —
a content-driven reflow, so it is correct for JA, EN and VI without a media query. See the
long-label example.
