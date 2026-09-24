# gh#799 — where these screenshots came from

Consumer app **godx-kintai**, on its E2E demo fixture (fake names), **Chrome 141 / macOS,
1440×900, DPR 2**, captured 2026-09-21. Without that line the files are pixels: the viewport and the
DPR are what make a measured width mean anything.

They lived on an orphan branch `issue-evidence` until 2026-09-24, which is why they are not in the
history of the fix. Moved here because this is where this repo keeps evidence, and a branch that
exists only to hold four PNGs is a branch nobody prunes and nobody finds.

gh#799 is CLOSED. The durable guard is the regression test on `main`, not these images —
`src/components/data-entry/__tests__/picker-width-799.test.tsx` —
so these are the record of what was seen at the time, not a thing to re-measure against.
