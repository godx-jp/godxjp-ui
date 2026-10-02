# @godxjp/editor

The Markdown editor for GoDX apps: a formatting toolbar, write / preview / side by side, a preview
rendered by [`@godxjp/markdown`](../markdown) (the same sanitiser as the published page), and files
pasted, dropped or attached through an upload function **the host** provides.

```bash
pnpm add @godxjp/editor @godxjp/markdown @godxjp/ui lucide-react
```

```tsx
import { MarkdownEditor } from "@godxjp/editor";
import { FormField } from "@godxjp/ui/data-entry";

<FormField id="body" label="本文">
  <MarkdownEditor
    value={body}
    onValueChange={setBody}
    upload={async (file) => ({ url: await storage.put(file) })}
  />
</FormField>;
```

## Behaviour

- It is the kit's `Textarea`: Japanese IME composition, the native caret, spell-check and the
  browser's undo keep working. Every toolbar edit is **one** undo step.
- ⌘/Ctrl + B, I, K — bold, italic, link. Never fire during IME composition.
- The toolbar is a WAI-ARIA toolbar (one tab stop, arrow keys). In preview, or when `disabled` /
  `readOnly`, its actions stay focusable but do nothing (`aria-disabled`).
- Files: `upload(file) => Promise<{ url, name? }>`. A placeholder marks each upload and is replaced
  by `![name](url)` (images) or `[name](url)`; a failure removes it and says which file failed.
  `uploadBlockedReason` refuses files with the host's message — with or without `upload`: a
  pasted or dropped file shows it, and the attach button names the reason and shows it when
  pressed instead of opening the picker. With neither prop, files are left to the browser.
- Strings come from the kit's catalogue in ja / en / vi; `labels` overrides any of them.

## Props

| prop                                              |                                                                                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value` / `defaultValue` / `onValueChange`        | The Markdown text.                                                                                                                                           |
| `mode` / `defaultMode` / `onModeChange`           | `"write" \| "preview" \| "split"`.                                                                                                                           |
| `upload`, `uploadBlockedReason`                   | Files, through the host's storage.                                                                                                                           |
| `renderPreview(value)`                            | Replace the preview (an app with its own embeds).                                                                                                            |
| `actions`                                         | Extra toolbar actions `{ key, label, icon, run(api) }` — the extension point for new block types; `api` has `value`, `selection`, `edit`, `insert`, `focus`. |
| `labels`                                          | Override strings.                                                                                                                                            |
| `rows`, `disabled`, `readOnly`, `id`, `aria-*`, … | Passed to the textarea.                                                                                                                                      |

`onKeyDown` from the host runs first; if it calls `preventDefault()`, the editor's shortcut does not
run — so a mention or link autocomplete wrapped around the editor keeps its keys.
