---
title: Password recovery (4 states)
viewport: 1440x1700
---

## request · sent · new-password · expired

One anatomy, four states. Nothing below the `Card` changes shape — only the **notice**, the
**fields** and the copy:

| State          | Notice                     | Fields                                             | Primary                               | Fallback row                          |
| -------------- | -------------------------- | -------------------------------------------------- | ------------------------------------- | ------------------------------------- |
| `request`      | —                          | email (`autoComplete="username"`)                  | send reset link                       | back to sign-in · contact support     |
| `sent`         | `Alert tone="success"`     | —                                                  | resend (**disabled** during cooldown) | back to sign-in · use another address |
| `new-password` | —                          | new + confirm `PasswordInput` + `PasswordStrength` | update password                       | back to sign-in                       |
| `expired`      | `Alert tone="destructive"` | —                                                  | request a new link                    | back to sign-in · contact support     |

## What is presentation and what is not

The panel renders **only** what the consumer passes it. It does **not** know reset semantics: no
route, no token lifetime, no "is this link still valid" decision, no password policy. The
`sent` panel prints the masked address the **server** sent (`h*****@example.co.jp`) — the library
never reconstructs an identifier from an email. The `expired` panel is simply the `destructive`
notice the server's answer produced.

## Error, loading and disabled

- **Error** — `FormField error` puts `aria-invalid` + `aria-errormessage` on the control and renders
  the message with `role="alert"`. The confirm field above shows the canonical mismatch case.
- **Disabled** — a resend cooldown is `<Button disabled>`. Never a hidden button: the affordance
  stays visible so the user knows resending is possible, just not yet.
- **Loading** — `<Button loading loadingText="…">` (demonstrated in the MFA example). The button
  keeps its box, so the panel height never jumps mid-submit.

## Heading level

A real route renders **one** panel and its `CardTitle` is the page `h1`. The four panels are stacked
here at `level={2}` under a caption line purely so the states can be compared at an identical
measure — do not copy `level={2}` into a route that has no other heading.
