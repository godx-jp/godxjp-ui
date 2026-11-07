# Craft on app screens: taste, lenses, layout, interaction hygiene and action feedback

This guide covers what makes an app screen built with @godxjp/ui read as well made, beyond being
correct. Read it with DESIGN.md, which owns the visual spec. Where the two differ, DESIGN.md wins.

## 1. Using a taste skill on a restrained kit

Generic taste skills, such as taste-skill and its soft, minimalist and brutalist variants, exist
because AI-made UI defaults to generic. They give you three dials: variance, motion and density.
On app screens built with this kit, the dials are already set, and you should not reopen them:

- **Variance is low.** Layouts are predictable: `AppShell` + `PageContainer`, with filters in one
  `Toolbar`. Asymmetry is allowed only when it carries information hierarchy, such as the primary
  action at the end or a content-and-meta split. Do not add hero layouts, display type,
  diagonal sections or full-bleed imagery.
- **Motion is reserved for feedback.** Nothing moves at rest. Motion is spent on a real state
  change: an overlay opening, a row expanding, a value that just changed. Never animate to
  celebrate.
- **Density is chosen per surface, up front,** from the kit's track (`compact`, `default`,
  `comfortable`). Do not mix densities on one page.

Keep the skill's craft: hierarchy from the existing type scale, a consistent grid, tokens only,
an audit before a redesign, and a pre-flight check. Drop the advice to "be bold". On this kit,
distinctiveness comes from flawless, consistent execution. If you feel the urge to make a screen
pop with a new font, a gradient or a coloured hero, remove decoration instead. The one place
expressive design is allowed is a brand surface, such as sign-in or onboarding (skill
`godxjp-ui-brand-surface`).

## 2. Craft lenses

These patterns recur in premium products and fit the kit:

| Lens                   | Rule                                                                                                                              | With the kit                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Two-line rows          | An entity shows its name and one qualifying line.                                                                                 | `ListRow` title and description; the secondary line in `--muted-foreground`.      |
| Counts in the words    | Numbers that change with the user's action are text, next to what they count, including in the action ("Delete 3 items").         | `t()` with `{count}`, `Intl.PluralRules`, `Text tabular`, `Pagination showTotal`. |
| Progressive disclosure | A control exists only when it applies: a clear button once there is text, a bulk bar once there is a selection. Never hover-only. | `DataTable.BulkActions`; render or not.                                           |
| Presets and shortcuts  | Common answers are one click away, and the keyboard path is advertised.                                                           | `DatePicker presets`, `TimePicker showNow`.                                       |
| Commit model           | A picker that takes more than one gesture has Apply and Cancel, and Cancel restores the previous value.                           | `needConfirm`.                                                                    |
| Dependent controls     | A child field is disabled until its parent has a value, and resets when the parent changes.                                       | `disabled`, `loading`, a `FormField` helper.                                      |
| Neutral until finished | Validate when the user pauses or leaves the field. An empty value is neutral.                                                     | `FormField error`, `PasswordStrength`.                                            |
| Undo over theatre      | A reversible destructive action happens at once and offers Undo. An irreversible one asks first. Never show a fake progress bar.  | `toast` with an action; `AlertDialog`.                                            |
| Empty states in place  | One sentence where the content would be ("No results for 'x'").                                                                   | `EmptyState`, `Select notFoundContent`.                                           |

## 3. Layout hygiene

1. **No decorative fades or scrims at the edges of app content.** Content ends at a clean 1px
   border. A gradient or `mask-image` fading the bottom of a list hides data and reads as AI-made.
   A scroll cue is a real scrollbar or a sticky header.
2. **No dead space.** In a split, master-detail or grid layout, a short pane sizes to its
   content. It is not stretched to match the tallest sibling and left as an empty grey block. If
   a pane has nothing to show, give it an `EmptyState`.
3. **Mobile first for every multi-column block.** One column by default. Add columns at wider
   breakpoints only when each column keeps 14px body text and about 280px of width. Check 390,
   768 and 1280. If text has to shrink to fit two columns, use one.
4. **Bordered surfaces never touch.** `PageContainer` owns the page padding. Sections and Cards are
   separated by `Flex gap`, never border against border.
5. **Short labels stay on one line.** Section titles, KPI labels, `Badge`, column headers and
   buttons do not wrap mid-label. When a header row does not fit, wrap the whole group: stack it
   on a phone, and do not let each label break. A truly long value is truncated and shows its
   full value in a tooltip.
6. **Components with a natural width keep it.** Calendars, picker panels and segmented controls
   are not stretched to 100%. Only things that are naturally full width are: inputs, textareas,
   tables and cards.
7. **Overlay headers leave room for the close button.** Anything at the end of a `Sheet` or
   `Dialog` header must not sit under the close button. Open the overlay and look.
8. **Tabs on a list page are `variant="line"`.** Tabs that split one list into views (users /
   invitations, open / closed) are an underline strip: `<Tabs variant="line">`, with `count` on each
   `TabsTrigger` for the size of each view. The default pill strip is for a compact switch inside a
   card or panel; `card` is for document-style tabs. Do not hand-style a strip to look like either.
9. **A clickable tile or card is a control link, not a text link.** A link that wraps block
   content (a stat tile with its number, a card body, a heading and summary) keeps the content's
   own ink: it is never painted link colour or visited violet. The kit skips a link with block
   children; mark any other one `data-ui-link-style="control"`. Link ink is for a link in running
   text or a table cell.
10. **Links on a dark band.** An inverse or brand band is a dark scope (`ThemeScope
className="dark"`), so link and visited inks switch to their dark values (4.5:1 or better on
    the band). A band that only re-sets `--background`/`--foreground` must also re-set
    `--text-link` and `--text-link-visited`, or its links paint the light theme's inks on dark.

## 4. Interaction hygiene

Operate every stateful control by hand (click, type, Tab) in a real browser. A screenshot does not
show behaviour defects.

- A multi-step selection (date range, limited multi-select) that is complete starts again on the
  next click. It does not quietly move one end.
- An opened control (calendar, dropdown, combobox) shows the value it already holds.
- A text field that mirrors a picker commits only a valid, complete string, and stays in sync
  with the picker in both directions.
- Focus returns to the trigger when an overlay closes, and nothing traps focus without a way out.

The kit's controls already behave this way. If one of them does not, do not patch it in the app:
open an issue on the @godxjp/ui repository (MCP `draft_bug_report`).

## 5. Actions: no silent action

Every action that waits on the server (send, save, delete, resend, approve, import) answers the
person three times: while it runs, when it succeeds, and when it fails. An action that does none of
this reads as a dead button, and the person clicks it again.

- **While it runs**: the trigger shows `loading` (and `loadingText` when the label should say what
  is happening) and does not accept a second click. `Button loading` already blocks re-entry and
  sets `aria-busy`; do not hand-roll a spinner or a `disabled` flag.
- **On success**: a short `toast.success` that states what was done, in the past tense
  (「招待を再送しました」). Not "Success!", not praise. When the result is already on screen (a row
  moved, a value changed) the toast still confirms it.
- **On failure**: `toast.error` with the reason the server gave, or an `Alert` next to the form
  when the person must fix something there. Never swallow the error.
- **Undoable actions** (archive, remove from a list) get an Undo action on the success toast
  instead of a confirmation dialog: `toast.success(msg, { action: { label: t("undo"), onClick } })`.
- Navigation and purely local actions (open a sheet, switch a tab) need none of this.

```tsx
import { Button, toast } from "@godxjp/ui";

const resend = useMutation({
  mutationFn: () => api.resendInvite(id),
  onSuccess: () => toast.success(t("invite.resent")),
  onError: (e) => toast.error(t("invite.resendFailed"), { description: e.message }),
});

<Button
  loading={resend.isPending}
  loadingText={t("invite.resending")}
  onClick={() => resend.mutate()}
>
  {t("invite.resend")}
</Button>;
```

`toast.promise(p, { loading, success, error })` covers the same three answers when there is no
button to put into `loading` (a keyboard shortcut, a drag). `godxjp-ui audit` warns on a `<Button>`
whose `onClick` calls `.mutate`/`.mutateAsync` with no `loading` prop (rule
`button-mutation-needs-loading`).

## 6. Motion on app screens

| Need                                    | Token                                                           | Properties                                                                  |
| --------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| State change (hover, selected, checked) | `--duration-fast` with `--ease-standard`                        | an explicit list: colour, background, border, shadow, opacity. Never `all`. |
| Overlay enter and exit                  | the component's own token, decelerating in and accelerating out | opacity, transform                                                          |
| A value changing (progress, results)    | `--duration-base`                                               | the bar only                                                                |
| Hover                                   | colour only                                                     | no lift, no transform, no growing shadow                                    |

Anything over 250ms on an app screen fails, as does any overshoot or anything that loops at rest.
Every rule sits inside `prefers-reduced-motion: no-preference`.
