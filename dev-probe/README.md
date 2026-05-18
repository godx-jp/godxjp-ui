# dev-probe — CRM scaffold

**Dev-only sandbox. Never bundled into `dist/`. Never published.**

A Salesforce/HubSpot-style CRUD admin built on top of the `@godxjp/ui`
primitives directly from `../src/components/`. The schema is loaded
from `objects/*.json` files at module-load time; records are seeded into
`localStorage["dev-probe:records:v1"]` and survive refresh.

## Run

```sh
pnpm exec vite --config dev-probe/vite.config.ts
```

Open <http://localhost:5180/>.

## Files

- `main.tsx`            — bootstrap (`initI18n` + mount `<App />`).
- `crud/App.tsx`        — AppShell + Sidebar + Topbar + router outlet.
- `crud/routes.ts`      — hash router. `#/objects/<Object>[/new|<id>[/edit]]`.
- `crud/store.ts`       — in-memory record store + localStorage snapshot.
- `crud/fakeData.ts`    — 50-record-per-object seed generator.
- `crud/loadObjects.ts` — schema loader (imports `objects/*.json`).
- `crud/schemaTypes.ts` — TS shapes mirroring the omnify schema.
- `crud/ObjectListPage.tsx`   — Table-driven list view per object.
- `crud/RecordDetailPage.tsx` — Tab (Overview/Related) + view/edit modes.
- `crud/RecordCreatePage.tsx` — Sheet-based create form.
- `crud/fields/*.tsx`   — Field renderers keyed on property type.
- `objects/*.json`      — Six Object schemas (Account, Contact, Lead,
                          Opportunity, Activity, User).
- `objects/enums/*.json`— Six Enum schemas.

## Reset

Click "Reset seed data" in the bottom of the sidebar, or run in DevTools:

```js
localStorage.removeItem("dev-probe:records:v1"); location.reload();
```

## Constraints

- No new npm deps (only Vite + React + Tailwind that ship with the repo).
- No changes to `package.json`, `tsup.config.ts`, `src/` — the dev-probe
  consumes the framework as a library would.
- `pnpm type-check` only includes `src/**`; dev-probe types are checked
  only when an explicit IDE/CI run targets this folder.
