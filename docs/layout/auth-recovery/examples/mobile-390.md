---
title: Viewport 390x844
viewport: 390x844
---

## The 390 reference image is NOT a valid source

The 390 canonical reference shipped with gh#233
(`.design/evidence/reference/auth-2fa-390.png`) is **a desktop 2×2 composite scaled into a phone
frame**. It overflows and crops horizontally: the two 432px panels are still laid out side by side.
It shows no mobile route, no mobile gutter and no reflow, and it was **not traced**. Accepting its
cropped overflow as "intended mobile behaviour" would ship a broken screen with a canonical
signature on it, so the issue's own words apply: _a route-level mobile reference or an explicit
responsive contract is required_.

What follows is that **explicit contract**, decided in the library and enforced by tokens + tests.

## The contract at ≤ 30rem

| Aspect            | Contract                                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Page gutter       | `--auth-shell-recovery-main-padding-mobile` = **15px inline** ⇒ panel `x=15, width=360` at a 390 viewport.                                   |
| Why 15px          | It is the canonical **Login** mobile gutter (`--auth-shell-canonical-main-padding-mobile`). Login → Recovery must not make the surface jump. |
| Panel measure     | `min(100%, 27rem)`. 432px is a **max**-width, so the panel simply becomes 360px — it is never scaled, cropped or scrolled.                   |
| Card inset        | Unchanged (24px, `--auth-shell-compact-card-inset`) ⇒ a **310px** content column.                                                            |
| OTP row           | Stays **one row of 6 slots**: 6 × 36px = **216px** ≤ 310px. Slots are never shrunk and the row never scrolls.                                |
| Primary action    | `Button fullWidth` — spans the panel at every width.                                                                                         |
| Fallback row      | Wraps to a **stack** when the two localized labels exceed the content column; otherwise it stays one row. Content-driven, no media query.    |
| Title/description | Stay inside the bordered surface; long JA/VI strings wrap inside the 310px column and grow the panel's height.                               |
| Vertical          | The column stays centred; when the panel is taller than the viewport the shell scrolls from the top — the top of the panel is never clipped. |

## Not defined here

Anything the reference could have specified but did not — a mobile-specific type ramp, a sticky
bottom action bar, a full-bleed edge-to-edge panel — is **deliberately absent**. Inventing it would
be fabricating a canonical. If SCR-008 later ships a real 390 route artboard and it disagrees with
the table above, the fix is a token retune (or a new preset), not consumer CSS.
