# AI / chatbot components — normalized spec

> **Reference:** Ant Design X (<https://x.ant.design/components/overview>) for *capabilities*.
> **Naming:** when a component's identity is unclear, look it up at
> <https://namethatui.com/?platform=web> before inventing a name.
> **Contract:** `.claude/skills/godxjp-ui-component/SKILL.md` is the hard gate — MCP-first, real
> primitives only, `t()` + `Intl`, WAI-ARIA APG + WCAG 2.2 AA, logical CSS, controlled
> vocabulary, semantic tokens, MCP catalog entry, real-screen docs page.

The library has **zero** chat/AI components today (verified against `mcp/src/data/components.ts` —
127 entries, none of them conversational). This document decides which of Ant Design X's surface
becomes a framework component and which is a composition, so no agent has to re-litigate it.

## 1. Scope decision — GATE 0 applied to every Ant Design X component

`docs/COMPOSITION-VS-COMPONENT.md` C1–C7. **Any FAIL ⇒ composition, never `src/components/`.**

| Ant Design X | godx name | Group | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Bubble` | **`ChatBubble`** | `data-display` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Framework component** |
| `Bubble.List` | **`ChatBubbleList`** | `data-display` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Framework component** |
| `Sender` | **`ChatComposer`** | `data-entry` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Framework component** |
| `Suggestion` | **`ChatSuggestion`** | `data-entry` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Framework component** |
| `Conversations` | **`ConversationList`** | `navigation` | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | **Verify C3 first** — see §6 |
| `ThoughtChain` / `Think` | **`ThoughtChain`** | `data-display` | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | **Verify C2/C3 first** — see §6 |
| `Prompts` | — | — | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | **Composition** — `ResponsiveGrid` + `Card` + `Button` |
| `Welcome` | — | — | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | **Composition** — static block, `EmptyState`-shaped |
| `Actions` | — | — | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | **Composition** — `Button` + `DropdownMenu` |
| `Attachments` / `FileCard` | — | — | ✅ | ✅ | ❌ | — | — | — | — | **Extend `Upload`** — duplicating it is an instant reject |
| `CodeHighlighter` | — | — | — | — | ❌ | — | — | — | — | **Use `CodeBlock`** |
| `Sources` | — | — | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | **Composition** — `ListRow` + `Badge` |
| `XProvider` | — | — | — | — | ❌ | — | — | — | — | **Use `AppProvider`** |
| `Mermaid` | — | — | ❌ | — | — | — | — | — | ❌ | **Out of scope** |
| `Folder/File Tree` | — | — | — | — | ❌ | — | — | — | — | **Covered by `Tree`** — see `docs/roadmap/tree-components.md` |

**v1 build set: `ChatBubble`, `ChatBubbleList`, `ChatComposer`, `ChatSuggestion`** (4 components,
all 7/7 PASS). `ConversationList` and `ThoughtChain` are conditional — §6.
Everything else ships as a `docs/` showcase composition, not library code.

---

## 2. `ChatBubble` — one message in a conversation

**Group:** `data-display` · **File:** `src/components/data-display/chat-bubble.tsx`

| Ant Design X | **godx `ChatBubble`** |
| --- | --- |
| `content` | `children` (a `ReactNode`; do not take an HTML string) |
| `placement: 'start' \| 'end'` | `placement: 'start' \| 'end'` (logical — flips under RTL) |
| `variant: 'filled' \| 'borderless' \| 'outlined' \| 'shadow'` | `variant: 'filled' \| 'borderless' \| 'outlined'` (drop `shadow`; the design system is 1px-border, no drop shadows) |
| `avatar` | `avatar` (a real `Avatar` node, never a styled div) |
| `header` / `footer` | `header` / `footer` |
| `loading` | `loading` (renders `Skeleton`, `aria-busy="true"`) |
| `typing` | `typing: boolean \| { step?: number; interval?: number }` |
| `messageRender` | *dropped* — the caller passes rendered `children` |
| `shape` | *dropped* — corner radius is a token |
| — | `size: 'xs' \| 'sm' \| 'lg'` (`md` default) |
| — | `tone` for status-tinted bubbles (error/warning), never colour-only |

**Semantics.** The bubble is an `<article>` inside the list's feed. Give it an accessible name from
its `header` (the author). The typing animation MUST respect `prefers-reduced-motion: reduce` —
render the full text immediately, no animation. Streaming text goes in an `aria-live="polite"`
region owned by `ChatBubbleList`, **not** per-bubble (a live region per bubble floods a screen
reader). Decorative avatars `aria-hidden`.

**Tokens** (`src/tokens/components/chat-bubble.css`): `--chat-bubble-background`,
`--chat-bubble-foreground`, `--chat-bubble-border-color`, `--chat-bubble-radius`,
`--chat-bubble-gap`, `--chat-bubble-max-inline-size`, `--chat-bubble-avatar-size`.
Role-mirror knobs default to `initial` (`docs/TOKENS.md`).

**i18n:** `chat.bubble.typing`, `chat.bubble.loading`, `chat.bubble.you`, `chat.bubble.assistant`.
Timestamps via `Intl.DateTimeFormat`; "2 minutes ago" via `Intl.RelativeTimeFormat`; counted nouns
via `Intl.PluralRules` — never a template string.

---

## 3. `ChatBubbleList` — the message feed

**Group:** `data-display` · **File:** same module as `ChatBubble`

| Ant Design X `Bubble.List` | **godx `ChatBubbleList`** |
| --- | --- |
| `items` | `items: ChatMessageProp[]` |
| `roles` | `roles: Record<string, Partial<ChatBubbleProp>>` — per-role defaults (`user`, `assistant`, `system`) |
| `autoScroll` | `autoScroll` (default `true`) |

**The behavior that earns C2/C3** — none of it is composable from `ScrollArea` + `map`:

1. **Stick-to-bottom.** Auto-scroll while the user is at the bottom; the moment they scroll up,
   **stop** and surface a "jump to latest" affordance. Silently yanking a reader back to the bottom
   mid-read is the classic chat-UI defect.
2. **Streaming without layout thrash** — appended text must not re-scroll the whole feed.
3. **One `aria-live="polite"` region** for the whole feed, announcing only the newest message.
4. `role="log"` on the scroll container, `aria-label` via `t()`.
5. Keyboard: the feed is focusable and scrollable with `PageUp`/`PageDown`/`Home`/`End`; bubbles
   are not a roving-tabindex widget (interactive controls inside them keep normal tab order).

---

## 4. `ChatComposer` — the message input (Ant's `Sender`)

**Group:** `data-entry` · **File:** `src/components/data-entry/chat-composer.tsx`

Named for what the industry calls it (Slack/Discord "composer"); `Sender` describes the person,
not the control.

| Ant Design X `Sender` | **godx `ChatComposer`** |
| --- | --- |
| `value` / `onChange` | `value` / `defaultValue` / `onValueChange` (**controlled triad — mandatory**) |
| `onSubmit` | `onSubmit(value: string)` |
| `loading` + `onCancel` | `loading` + `onCancel` |
| `submitType: 'enter' \| 'shiftEnter'` | `submitType: 'enter' \| 'shiftEnter'` |
| `placeholder` | `placeholder` (through `t()` at the call site) |
| `disabled` / `readOnly` | `disabled` / `readOnly` |
| `header` (`Sender.Header`) | `header` slot |
| `prefix` / `footer` / `actions` | `prefix` / `footer` / `actions` slots |
| `allowSpeech` | **out of scope v1** — Web Speech API is not cross-browser; file a follow-up |
| `autoSize` | always auto-sizing; not a prop |
| — | `size: 'xs' \| 'sm' \| 'lg'` · `maxLength` · `status` |

**Rules.**
- Built on the real `Textarea` primitive and real `Button`s — **no raw `<textarea>`/`<button>`**.
- Auto-grow between a min and max height expressed in `--control-height` tiers, then scroll
  inside. **No literal `height` and no `calc(var(--control-height) ± …)`** (`check:control-sizing`).
- `submitType="enter"`: `Enter` submits, `Shift+Enter` newline. `submitType="shiftEnter"`: the
  inverse. IME composition must never submit — guard on `compositionstart`/`compositionend`
  (this is the bug that breaks Japanese and Vietnamese input; it is not optional).
- Empty or whitespace-only input does not submit; the submit button is `disabled` with an
  accessible name, not merely greyed out.
- While `loading`, the submit button becomes a cancel button — **one trailing action at a time**,
  the same discipline as the picker trailing-action rule.
- The textarea is the semantic focus target; forward the `FormField` label/helper/error contract
  onto it via `pickFieldA11y` / `useFieldIdentity` — do not reinvent it (`src/lib/field-a11y.ts`).

---

## 5. `ChatSuggestion` — trigger-character autocomplete over the composer

**Group:** `data-entry` · **File:** `src/components/data-entry/chat-suggestion.tsx`

| Ant Design X `Suggestion` | **godx `ChatSuggestion`** |
| --- | --- |
| `items` | `items: SuggestionItemProp[]` (supports one level of `children`) |
| `onSelect` | `onValueChange(value: string)` |
| `block` | *dropped* — width follows the anchor |
| render-prop `children({ onTrigger, onKeyDown })` | same shape — it wraps `ChatComposer` |
| — | `triggerCharacter` (default `'/'`) · `open` / `defaultOpen` / `onOpenChange` |

**Rules.** Compose the existing `Command` (cmdk) inside a `Popover` anchored to the composer — do
**not** hand-roll a listbox; `Command` already ships correct ARIA. What this component owns is the
part `Command` does not: detecting the trigger character in a textarea, tracking the query as the
caret moves, and closing on `Escape`/blur/word-break. `Escape` returns focus to the textarea and
leaves the typed text intact.

---

## 6. Conditional components — prove C3 before writing code

Do **not** start these until the ledger is recorded in the PR description.

**`ConversationList`** (Ant's `Conversations`). `NavList` already renders selectable rows with
`aria-current="page"`, an icon column and a badge; `ListRow` covers short entity lists. Before
building, answer in writing: what does a conversation list own that `NavList` does not?
The honest candidates are date **grouping** (Today / Yesterday / Last 7 days — via
`Intl.RelativeTimeFormat` + `Intl.DateTimeFormat`, never hand-rolled buckets), a **per-item
overflow menu**, and **inline rename**. If those land as `NavList` props instead, that is the
better outcome — extend `NavList` and close this out.

**`ThoughtChain`** (Ant's `ThoughtChain` / `Think`). `Timeline` already has a 3-state per-item
`status` (`done`/`current`/`pending`), an icon rail and ordinal/status variants; `Collapsible`
owns disclosure. `ThoughtChain` = `Timeline` + per-item collapsible body + a streaming/pending
state. Strongly prefer adding a `collapsible` affordance to `Timeline` over a new component.
Whichever way it goes, the reasoning body must be collapsible, and the running step must be
announced once via `aria-live="polite"` — not on every token.

---

## 7. Per-component definition of done

Every component in the build set ships **all** of:

1. `src/components/<group>/<name>.tsx` — real primitives only, logical CSS, `t()` for every string
   and `aria-label`, `ref` forwarded, `...props` spread, `className` + `id` accepted.
2. `XProp` + `XProp as XProps` in `src/props/components/<group>.prop.ts`, **registered in
   `src/props/registry.ts`**.
3. `src/tokens/components/<name>.css` + an `@import` in `src/tokens/base.css`; names pass
   `check:token-tiers`; control boxes come from the `--control-height` tier.
4. Keys in `src/i18n/messages/en.json`, `vi.json`, `ja.json` — all three, no exceptions.
5. Tests in `src/components/<group>/__tests__/`: a behavior test using `@testing-library/user-event`
6. An `mcp/src/data/components.ts` entry (props / usage / useCases / related / example / rules) —
   `check:mcp-sync` and `check:mcp-orphans` must pass.
7. A real-screen docs page under `docs/<group>/` (AppShell + PageContainer + real primitives), not
   a bare `Card` snippet.
8. Export from the group's `index.ts`.

Gates, then **only** the touched group's tests:

```
pnpm typecheck && pnpm lint && pnpm run audit \
  && pnpm check:prop-vocabulary && pnpm check:mcp-sync && pnpm check:mcp-orphans \
  && pnpm check:token-tiers && pnpm check:control-sizing && pnpm check:example-imports
pnpm vitest run src/components/<group>/__tests__ --maxWorkers=2
```

`pnpm test` and a bare `pnpm vitest run` are **forbidden** — 506 files / 3700+ tests, and several
agents on one machine takes the load past 90. The full suite is CI's job on the PR.
