---
title: Long labels — ja / en / vi
viewport: 1440x1500
---

## The panel width is a constant; the copy is not

All three panels are 432px wide because the measure is
`--auth-shell-recovery-card-max-width`, not a function of the copy. What changes with locale is the
panel's **height** (the title and description wrap inside the content column) and whether the
**fallback row** stays on one line.

| Locale | Longest fallback pair                                   | Behaviour at 432px                         |
| ------ | ------------------------------------------------------- | ------------------------------------------ |
| ja     | リカバリコードを使う · パスキーで再試行する             | one row                                    |
| en     | Use a recovery code · Try passkey again                 | one row                                    |
| vi     | Dùng mã khôi phục dự phòng · Thử lại bằng khóa truy cập | one row → wraps first as the panel narrows |

The reflow is **content-driven** (`Flex wrap`), never a media query and never a per-locale override,
so a translation that grows after launch degrades gracefully instead of overflowing the panel.

## What is deliberately not tuned per locale

No locale gets a different measure, a different type ramp or a shortened label. If a translation is
so long that the stacked fallback row makes the panel uncomfortable, the fix belongs to the
consumer's copy, or to `--auth-shell-recovery-card-max-width` in the service theme — never to a
locale-conditional branch in the markup.
