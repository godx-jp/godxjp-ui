# godxjp-ui-performance — measure-first React perf, lib AND consumer

> 🛠️ **AUDIENCE: CORE + CONSUMER.** Distilled from a real audit (2026-06, exseli 受注書一覧:
> keystroke 165ms → 5ms, 詳細条件 open 270ms → 18ms, app bundle −27%) plus the upstream
> `react-performance-optimization` skill — only the parts that proved decisive here, with the
> repo-specific numbers and commands. Generic theory lives upstream; THIS file is the playbook.

**DO / DON'T:**

| ✅ DO | ⛔ DON'T |
|---|---|
| Profile FIRST (longtask + React Profiler + esbuild metafile), fix what the numbers indict | Guess, blanket-memo, or optimize components measured fast |
| Per-field `memo` units + STABLE setters for big filter panes | Page-root state with zero memo boundaries (165ms/keystroke) |
| Defer heavy panel mounts; keep mounted after; pre-mount at idle | Mount/unmount a 25-field subtree inside a click handler |
| Route-level `lazy()` per page in consumer apps | One 929KB chunk for an app that will grow dozens of screens |
| Verify dev-mode numbers, then remember prod is 3–5× faster | Treat a one-off 65ms dev long task as an emergency |

---

## 1. Measurement protocol (run these, paste the numbers)

**Interaction cost — long tasks (anything >50ms triggers Chrome `[Violation]`):**
```js
// in the page (playwright evaluate works)
const tasks = [];
new PerformanceObserver(l => l.getEntries().forEach(e => tasks.push(Math.round(e.duration))))
  .observe({ type: "longtask", buffered: true });
// ...drive the interaction, then read `tasks`
```

**Attribution — which subtree is slow (dev only, temporary):**
```tsx
<Profiler id="section" onRender={(id, phase, d) => (window.__perf ??= []).push([id, phase, Math.round(d)])}>
```
Wrap candidate sections; compare `actualDuration` of the mount/update entries against the total
long task. In the exseli audit this is what acquitted the lib (25 composite fields = 79ms mount)
and indicted the page architecture (the other ~150ms was re-rendering everything else).

**Bundle — per-import cost of THIS library (run against `dist/`):**
```bash
echo 'import { Button } from "<repo>/dist/components/general/index.js"; console.log(Button);' > /tmp/probe.mjs
npx esbuild /tmp/probe.mjs --bundle --minify --format=esm \
  --external:react --external:react-dom --external:react/jsx-runtime \
  --outfile=/dev/null --metafile=/tmp/meta.json
# aggregate meta.json outputs[].inputs[].bytesInOutput by package to attribute
```

## 2. Consumer patterns (proven in exseli — copy these)

1. **Per-field memo + stable setters** for any filter pane / large form
   (reference: `exseli/apps/web/src/pages/OrdersListPage.tsx`):
   module-level `memo` units shaped `({ id, label, k, value, onSet })`; ONE
   `useCallback((key, value) => setState(s => ({ ...s, [key]: value })), [])` per state map.
   A keystroke then re-renders exactly one field. Results table in its own `memo` component;
   pagination pages WITHIN the submitted query (`setSubmitted(prev => ({ ...prev, page }))`)
   so its handler stays identity-stable.
2. **Heavy hidden panels**: urgent state for the toggle chrome, `useDeferredValue` for the first
   mount, keep-mounted afterwards (`className={open ? "contents" : "hidden"}`), and
   `requestIdleCallback` pre-mount after first paint so even the first open is a display flip.
3. **Route-level code splitting**: `lazy()` every page + one `Suspense` with a quiet
   `PageContainer`+`Skeleton` fallback. exseli: initial 929KB → 675KB; 受注書一覧 (day-picker +
   table stack) 122KB and login (rhf+zod) 93KB load only when visited.
4. **react-compiler lint traps**: no ref writes in render, no sync `setState` in effect bodies —
   the sanctioned latch is the guarded render-time set: `if (cond && !state) setState(true)`.
5. **Thresholds**: handler work >50ms = violation; virtualize lists only >100 rows (DataTable at
   50/page is fine); don't memo cheap leaves (over-memoization is real overhead).

## 3. Library facts & budget (measured 2026-06)

Per-import minified cost (probe of §1, react externalized). 13.9.x shipped a bundled+split dist
whose shared chunks gave every import a ~100KB floor (date-fns + tailwind-merge + a mixed chunk
landed even in `Button`); **13.10.0 moved to preserved module structure** (dist mirrors src, one
file per module — `tsup bundle:false` + `tsc -p tsconfig.build.json` for d.ts + copy-styles also
ships the i18n JSONs) so consumers' bundlers see the real graph:

| Import | 13.9.x | 13.10.0 | | Import | 13.9.x | 13.10.0 |
|---|---|---|---|---|---|---|
| StatCard | 81 | **30** | | DataTable | 172 | **79** |
| Input | 102 | **52** | | DateRangePicker | 209 | 207¹ |
| Button | 107 | **56** | | Select | 215 | **165** |
| full index | 366 | 362 | | | | |

¹ legitimately needs react-day-picker + date-fns. The remaining ~50KB floor is intrinsic:
tailwind-merge ≈26KB (`cn`) + bundled 3-locale i18n ≈21KB; going lower means lazy locale
loading — an API/behaviour change, only do it against a measured need.

**Layout guardrails (don't regress these):** the dist is bundler-oriented ESM — extensionless
relative + directory imports and raw `.json` imports — so any script that walks dist must resolve
like a bundler (`<spec>` → `<spec>.js` → `<spec>/index.js`; see check-core-isolation.mjs). Probe
commands in §1 need `--loader:.json=json`. Compat was proven by npm-pack tarball install into
exseli (full tests + browser smoke); note the file:-link **vitest** setup hits a dual-React
artifact in the lib's pnpm tree — test against a tarball, not the symlink.

**CSS**: the compiled sheet is ~573KB raw / ~210KB gzip and ships whole; per-group CSS would be
a lib-level project (tracked, not started).

## 4. Pre-flight before claiming "optimized"

- [ ] Baseline numbers captured (longtask + Profiler + bundle) BEFORE the change
- [ ] The fix targets what the numbers indicted — not a vibe
- [ ] After-numbers pasted next to before-numbers (same protocol)
- [ ] Functionality re-verified in the browser (typing, toggles, submit) + tests green
- [ ] No new lint violations (react-compiler rules in §2.4)
