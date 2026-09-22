# @godxjp/ui — for AI agents

You are about to write code against a design system you did not author. This file is the whole
contract. Read it before you write JSX.

**This catalog describes `@godxjp/ui` 28.10.0.** If the project you are editing has a different
version in its `package.json`, read the pinned catalog for THAT version instead
(`…/v<their-version>/agent/…`). A catalog newer than the installed package describes props that do
not exist yet; older, and it hides props that do. Neither failure announces itself.

Pinned catalogs only exist for releases whose tag actually contains `agent/`. If `…/v<version>/agent/index.json` returns 404, that release predates this catalog: read `…/main/…` instead and compare `index.json` → `version` against the package you have, so you at least know which way it drifted.

---

## Which lane are you in

## Where to read these files

Three places carry this catalog, and they are not equivalent:

| source | URL / path | use it when |
| --- | --- | --- |
| docs site | `https://godx-jp.github.io/godxjp-ui/agent/…` | you are an assistant in a browser and can only fetch a URL |
| npm package | `node_modules/@godxjp/ui/agent/…` | the project is on disk — this copy is **version-locked to the installed package by construction** |
| raw GitHub | `https://raw.githubusercontent.com/godx-jp/godxjp-ui/v<version>/agent/…` | you need a version the other two cannot give you |

Prefer the package copy when a project is in front of you: it cannot drift from what is installed,
which is exactly the failure the version note above describes. The docs-site copy always describes
the LATEST release, so pair it with the raw `v<version>` URL if the project is pinned to an older
one.

**You can run a process** (Claude Code · Codex CLI · Cursor · any client with MCP)
→ Do not use these files. Run the MCP server; it is searchable, version-locked to the package on
disk, and costs far fewer tokens than fetching a 1 MB JSON.

```jsonc
// .mcp.json — or let `npx @godxjp/ui sync-rules` write it for you
{ "mcpServers": { "godx-ui": { "command": "npx", "args": ["@godxjp/ui-mcp@<installed version>"] } } }
```

Then ask it: `search_components`, `get_component`, `get_tokens`, `get_rule`, `list_anti_ai_tells`.

**You cannot run a process** (ChatGPT web · Claude.ai · anything fetching URLs)
→ These files are for you. Fetch in this order:

0. `patterns-index.json` — 19 whole-task patterns as name + tagline + tags. **If your
   task is a task** — "build a settings page", "confirm a destructive delete", "a list page with
   filters" — start HERE, not at the components. Then fetch `patterns/<name>.json` for complete,
   copy-paste-ready code. A component index answers "does X exist"; it cannot answer "build Y".
1. `components-index.json` — 45 KB, all 170 components as name + group +
   tagline. Read this when you already know the SHAPE you need. Each entry may carry `absorbed`:
   names that **do not exist** and map to it — `Combobox`, `Autocomplete`, `CountrySelect` and
   `SearchSelect` are all `Select`. If you are about to hand-roll something, search this field
   first; it exists because that is the mistake.
2. `components/<Name>.json` — one file per component (1 KB–33 KB, median 6 KB), carrying its props,
   its `importPath`, and its examples. Fetch only the handful you picked in step 1.
3. `rules.json` — 47 cardinal rules. The ones about raw HTML and hardcoded colour are not
   style advice.
4. `tokens.json` — 1684 design tokens. Only when you need a specific knob's name.
5. `anti-ai-tells.json` — 26 shapes that make generated UI look generated, each with the
   fix. Read before you reach for a gradient hero or a wall of coloured chips.

**Do not fetch `components.json`.** It is 1.1 MB, and most URL fetchers truncate a
response that size and return the head without telling you. You get the first few entries, believe
you read the catalog, and answer the rest from memory — which is the failure this file exists to
prevent. The per-component files say the same thing without the cliff.

---

## The four rules that decide whether your output is usable

Everything else is detail. These four are why generated code gets rejected here.

### 1. Never a raw HTML control

No `<button>`, `<input>`, `<select>`, `<textarea>`, hand-rolled `<table>`. Use `Button`, `Input`,
`Select`, `Textarea`, `DataTable`. A raw control has no focus ring, no size ladder, no RTL, and no
dark mode — it *looks* fine in a screenshot and fails every gate this package ships.

### 2. Never a colour, size or spacing literal

Not `#6400D4`, not `color: rgb(...)`, not `p-[13px]`, not `height: 36px`. Reference the **role**:

```tsx
<Alert tone="warning">      {/* not: style={{ borderColor: "#B45309" }} */}
<Button size="sm">          {/* not: className="h-8" */}
<CardContent>               {/* not: <Card className="p-4"> */}
```

In CSS, reference the token by NAME so it re-resolves per theme and per tenant:

```css
color: var(--code-block-token-keyword-color, hsl(var(--primary)));   /* yes */
color: #6400D4;                                                       /* no  */
```

### 3. Compose primitives fully

Padding comes from `CardContent`, not from `p-4` on a bare `Card`. An empty table state comes from
`DataTable`'s own empty, not from a `<div>` you wrote. If you find yourself styling a `<div>` to
look like a component, the component exists — search the index.

### 4. It is one control, not a family

There is no `Combobox`, `Autocomplete`, `CountrySelect`, `SearchSelect`. There is `Select`, with
`showSearch` and `loadOptions`. The i18n pickers are one `AppSettingPicker kind=…`. Components were
deleted for being duplicates; do not add another by hand-rolling.

This is not advice you have to remember — it is **data**. Every one of those names is in the
`absorbed` field of the component that replaced it, in `components-index.json`, and
`check:absorbed-names` fails the build if any of them ever becomes real. Search the name you were
about to invent.

---

## Tokens: how to stay flexible

The common failure is treating tokens as a **closed menu of approved layouts**. They are not.
Tokens carry VALUES; composition, responsive behaviour and interaction are still yours.

What keeps a token-first page flexible is the **scoped override contract** — the same knob, settable
at three levels, each beating the one above:

| level | how | reaches |
|---|---|---|
| theme | `:root { --card-radius: 0; }` | every Card in the product |
| region / tenant | `[data-tenant="acme"] { --card-radius: 0; }` | one tenant, one section |
| instance | `<Card className="…">` or the documented prop | this one Card |

So: **build any layout you like out of primitives, and express every visual decision as a token or
a documented prop.** You keep full freedom of composition and lose none of the theming. The moment
you write a literal, that pixel stops following the theme and the tenant override silently skips it.

A knob you want to retheme globally is a **component token** (`--{component}-{part}-{property}`).
Most are declared `initial` with the real default at the call site — that is deliberate, so a
scoped override re-resolves instead of freezing at `:root`.

---

## A page that would pass review

```tsx
import { PageContainer, Flex } from "@godxjp/ui/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, DataTable } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Select } from "@godxjp/ui/data-entry";
import { Alert, AlertTitle, AlertDescription } from "@godxjp/ui/feedback";

export default function InvoicesPage() {
  return (
    <PageContainer title="請求一覧" subtitle="今月の未収を上から">
      <Flex direction="col" gap="lg">
        <Alert tone="warning">
          <AlertTitle>お支払いが確認できていません</AlertTitle>
          <AlertDescription>3 件の請求が期限を過ぎています。</AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle level={2}>未収</CardTitle>
            <CardDescription>期限順。金額は税込。</CardDescription>
          </CardHeader>
          {/* `flush` because DataTable draws its own edges — a padded body double-insets it */}
          <CardContent flush>
            <DataTable data={rows} columns={columns} getRowId={(r) => r.id} striped />
          </CardContent>
        </Card>

        <Flex direction="row" gap="sm" wrap>
          <Select width="auto" options={statuses} defaultValue="unpaid" aria-label="状態" />
          <Button variant="outline" size="sm">CSV</Button>
        </Flex>
      </Flex>
    </PageContainer>
  );
}
```

Note what is absent: no colour, no pixel, no raw control, no `<div className="flex gap-4">` where
`Flex` exists.

**Take the import path from the catalog, not from the group.** Every entry in
`components/<Name>.json` carries an `importPath`; it is the only one guaranteed to resolve. The
group is a docs heading and does not always match a subpath — `AppProvider` is in group
`providers`, and `@godxjp/ui/providers` does not exist (it is `@godxjp/ui/app`).

---

## Before you answer

Say which catalog version you read and which files you actually fetched. If you could not fetch
one, say so rather than filling the gap from memory — a prop invented from another library is the
single most common failure here, and it looks exactly like a correct answer.
