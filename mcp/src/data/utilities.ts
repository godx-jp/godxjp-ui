/**
 * The NON-COMPONENT half of `@godxjp/ui`'s public surface — hooks, functions and constants (gh#951).
 *
 * Why this file exists, measured rather than assumed. godx-jp/godxjp-ui#947 compared two products
 * built on this package and found `hooks/use-current-url.ts`, `hooks/use-initials.tsx` and
 * `lib/utils.ts` hand-written in both, byte for byte. The third one wraps `clsx` in twelve lines —
 * and `cn` has shipped from the root of this package all along. An agent asked the MCP how to merge
 * classNames, got `Component "cn" not found`, and wrote its own.
 *
 * So the gap was never a missing package: it was that 29 shipped names had no way to be found. They
 * are NOT in `COMPONENTS` because `get_component`'s whole answer is a props table, and
 * `cn(...inputs)` has no props; they are a separate catalog with a separate shape, and
 * `get_component` falls through to it so the wrong-but-natural guess still gets an answer.
 *
 * `component-api-manifest.json`'s `utilities` section is the machine-checked source for the names,
 * kinds, subpaths and signatures here — `utilities-cover-the-manifest.test.ts` fails when the two
 * drift, so a new export cannot be added without landing here too.
 */

export type UtilityKind = "hook" | "function" | "value";

export interface UtilityEntry {
  name: string;
  kind: UtilityKind;
  /** Every published subpath it is importable from; the first is the canonical one to copy. */
  subpaths: string[];
  signature: string;
  tagline: string;
  usage: string[];
  related: string[];
  example: string;
  /** Set when the export is re-exported from a third-party package rather than authored here. */
  reExportedFrom?: string;
}

/**
 * `formatDate` is NOT here, and that is a recorded decision rather than an omission.
 *
 * It already has a full entry in `COMPONENTS` — written before this catalog existed, by someone who
 * needed agents to find it — and that entry is richer than a fresh one would be: it documents the
 * `options.kind` auto-detection (`yyyy-MM-dd` → date, `HH:mm` → time) that decides what a caller
 * actually sees. Duplicating it would create two sources of truth for one function, and the copy
 * would be the worse one. `utilities-cover-the-manifest.test.ts` carries the exception by name, so a
 * NEW export still cannot slip through uncatalogued.
 */
export const UTILITIES: UtilityEntry[] = [
  {
    name: "cn",
    kind: "function",
    subpaths: ["."],
    signature: "(...inputs: ClassValue[]): string",
    tagline:
      "Merge class names with Tailwind conflict resolution — `clsx` + `tailwind-merge` in one call. The last conflicting utility wins, so a caller's `className` can always override a component's default.",
    usage: [
      "DO use it for every `className` you compose, including in your own app components — it is why a consumer's `className=\"p-6\"` beats a component's built-in padding instead of both landing in the attribute.",
      "DO pass conditionals directly: `cn(\"base\", isActive && \"active\", className)`. Falsy entries drop out.",
      "DON'T hand-write a `cn`/`classNames` helper in your app. Two products in this org each wrote a byte-identical 12-line copy (godx-jp/godxjp-ui#947) because this one could not be found.",
      "DON'T reach for it to override a framework component's look — a token or a documented prop is the supported route (cardinal rules #44/#45).",
    ],
    related: [
      "buttonVariants — when you need Button's classes without its element.",
      "Rule #45 — token overrides, not selector overrides, for restyling a component.",
    ],
    example: `import { cn } from "@godxjp/ui";

<div className={cn("ui-thing", isActive && "ui-thing-active", className)} />`,
  },
  {
    name: "formatCurrency",
    kind: "function",
    subpaths: [".", "./admin"],
    signature:
      "(amountMinor: number | null | undefined, currency: string, locale?: string): string",
    tagline:
      "Money from MINOR units through `Intl.NumberFormat` — the amount is in the currency's smallest unit (yen, cents), so nothing arrives pre-divided and no float rounding creeps in.",
    usage: [
      "DO pass minor units. `formatCurrency(1050, \"USD\")` is $10.50; passing 10.5 gives $1,050.00, and that mistake is invisible in review.",
      "DO pass an ISO 4217 code (`JPY`, `USD`, `VND`) — the number of decimals comes from the code, not from a guess.",
      "DON'T divide by 100 yourself first, and DON'T concatenate a symbol — JPY has no decimals and VND places the symbol differently.",
    ],
    related: [
      "formatDate — the same treatment for dates.",
      "Text tabular — the prop that stops digits jittering in a column of these.",
    ],
    example: `import { formatCurrency } from "@godxjp/ui";

formatCurrency(150_000, "JPY");   // ￥150,000
formatCurrency(1050, "USD");      // $10.50`,
  },
  {
    name: "formatBytes",
    kind: "function",
    subpaths: [".", "./admin"],
    signature: "(n: number | null | undefined, locale?: string): string",
    tagline:
      "Byte counts as a human size with a locale-correct number — the label beside an upload, not a raw integer.",
    usage: [
      "DO use it for file sizes and quotas anywhere a person reads them.",
      "DON'T use it for a count of things — it adds a byte unit.",
    ],
    related: ["Upload — where these usually appear.", "Attachments — the list that shows them."],
    example: `import { formatBytes } from "@godxjp/ui";

formatBytes(file.size);   // 2.4 MB`,
  },
  {
    name: "shortId",
    kind: "function",
    subpaths: [".", "./admin"],
    signature: "(id: string | null | undefined): string",
    tagline:
      "Shorten a UUID or long key for display while keeping it recognisable — for a cell or a chip where the full value would push the layout out.",
    usage: [
      "DO show it where the full id is available another way (a tooltip, a detail page, copy-to-clipboard).",
      "DON'T use the result as a value — it is display text, and it is not unique.",
    ],
    related: [
      "CredentialReveal — for a secret that must be shown deliberately.",
      "Text truncate — when the string is prose rather than an id.",
    ],
    example: `import { shortId } from "@godxjp/ui";

shortId(row.id);   // 3f9c…a41b`,
  },
  {
    name: "humanError",
    kind: "function",
    subpaths: [".", "./admin"],
    signature: "(err: unknown): string",
    tagline:
      "Turn an unknown thrown value into one sentence a person can read — it takes `unknown`, so a string, an `Error`, a rejected fetch or a plain object all resolve to something showable.",
    usage: [
      "DO use it in a catch block before putting a message on screen. `String(err)` yields \"[object Object]\" often enough to matter.",
      "DON'T show a raw server message straight to a user — it may carry a stack trace or an internal identifier.",
    ],
    related: [
      "classifyQueryError — when you need to decide behaviour, not text.",
      "ErrorSurface — the full-page treatment.",
      "useToast — for a transient failure.",
    ],
    example: `import { humanError } from "@godxjp/ui";

try { await save(); } catch (err) { toast.error(humanError(err)); }`,
  },
  {
    name: "toast",
    kind: "function",
    subpaths: [".", "./admin", "./feedback"],
    signature: "(message: ReactNode | (() => ReactNode), data?: ExternalToast): string | number",
    tagline:
      "The canonical transient notification. Re-exported from `sonner` so every app raises toasts through one instance and one set of styles.",
    reExportedFrom: "sonner",
    usage: [
      "DO import it from `@godxjp/ui` (or `/feedback`), never from `sonner` directly — a second `sonner` instance renders its own container and your toasts land in the wrong one.",
      "DO render `<Toaster />` once at the app root, or none of these appear.",
      "DON'T use a toast for something the user must act on or must not miss — that is a Dialog, a Banner or an inline field error.",
    ],
    related: [
      "useToast — the hook form with the app's defaults applied.",
      "Banner — for a persistent, page-level message.",
      "humanError — what to pass it in a catch block.",
    ],
    example: `import { toast } from "@godxjp/ui/feedback";

toast.success("保存しました");`,
  },
  {
    name: "useDebouncedValue",
    kind: "hook",
    subpaths: [".", "./admin"],
    signature: "<T>(value: T, delay?: number): T",
    tagline:
      "The value, but settled — returns the previous one until `delay` ms have passed without a change (default 250). One line instead of a `useEffect` plus a timer ref.",
    usage: [
      "DO debounce the QUERY, not the input: keep the field controlled and instant, and feed the debounced copy to the request, so typing never feels laggy.",
      "DO leave the default unless measured — 250ms is the value the framework's own search fields use.",
      "DON'T debounce a value you then write back into the input; that is what makes a field drop characters.",
    ],
    related: [
      "Select loadOptions — already debounced internally; you do not need this for it.",
      "SearchInput — the field this usually sits behind.",
      "useTimeoutFlag — for a flag that flips after a delay rather than a value that settles.",
    ],
    example: `import { useDebouncedValue } from "@godxjp/ui";

const [query, setQuery] = useState("");
const settled = useDebouncedValue(query);
const { data } = useQuery({ queryKey: ["search", settled], queryFn: () => search(settled) });

<Input value={query} onValueChange={setQuery} />`,
  },
  {
    name: "useTimeoutFlag",
    kind: "hook",
    subpaths: [".", "./admin"],
    signature: "(signal: unknown, ms?: number): boolean",
    tagline:
      "False, then true once `ms` has passed since `signal` last changed (default 2000) — for the \"this is taking a while\" affordance that must not flash on a fast response.",
    usage: [
      "DO use it to delay a spinner or a slow-request notice, so a 90ms response shows nothing at all.",
      "DON'T use it as a general timer — it resets whenever `signal` changes identity.",
    ],
    related: [
      "Skeleton — what to show once it flips.",
      "DataState — already handles the loading/empty/error split for a query.",
      "useDebouncedValue — for a value rather than a flag.",
    ],
    example: `import { useTimeoutFlag } from "@godxjp/ui";

const slow = useTimeoutFlag(isFetching);
{isFetching && slow ? <SkeletonRows /> : null}`,
  },
  {
    name: "classifyQueryError",
    kind: "function",
    subpaths: ["./query"],
    signature: "(error: unknown): QueryErrorInfo",
    tagline:
      "Sort an unknown query error into the shape a UI decision needs — offline, unauthorised, not found, validation, server — instead of matching on message text.",
    usage: [
      "DO branch on the returned kind. Matching `err.message.includes(\"401\")` breaks the moment a message is translated.",
      "DO pair it with `isRetryableQueryError` when deciding whether to offer a Retry button.",
      "DON'T show the classification to a user — `humanError` is the display text.",
    ],
    related: [
      "isRetryableQueryError — the retry half of the same decision.",
      "humanError — the sentence for the screen.",
      "DataState / ErrorSurface — the components that render the outcome.",
    ],
    example: `import { classifyQueryError, isRetryableQueryError } from "@godxjp/ui/query";

const info = classifyQueryError(error);
if (info.kind === "unauthorized") redirectToLogin();`,
  },
  {
    name: "isRetryableQueryError",
    kind: "function",
    subpaths: ["./query"],
    signature: "(error: unknown): boolean",
    tagline:
      "Whether retrying this error could plausibly succeed — true for a network blip or a 5xx, false for a 404 or a validation failure.",
    usage: [
      "DO gate the Retry affordance on it. A Retry button on a 422 teaches users that the button does nothing.",
      "DON'T use it to decide react-query's own `retry` policy — that belongs in the QueryClient defaults.",
    ],
    related: [
      "classifyQueryError — the full classification.",
      "QueryRefetchButton — the component that would carry the retry.",
    ],
    example: `import { isRetryableQueryError } from "@godxjp/ui/query";

{isRetryableQueryError(error) ? <QueryRefetchButton /> : null}`,
  },
  {
    name: "flattenItemPages",
    kind: "function",
    subpaths: ["./query"],
    signature:
      "<TItem>(data: { pages: { items: TItem[] }[] } | undefined): TItem[]",
    tagline:
      "Flatten `useInfiniteQuery`'s page structure into one list, `undefined` included — the line every infinite list writes, once.",
    usage: [
      "DO pass the raw `data` from `useInfiniteQuery`; an undefined first load returns `[]` rather than throwing.",
      "DON'T use it if your pages are not `{ items: [] }` shaped — flatten them yourself instead of reshaping to fit.",
    ],
    related: [
      "InfiniteQueryState — the component that renders the flattened list with its states.",
      "DataTable — where the result usually goes.",
    ],
    example: `import { flattenItemPages } from "@godxjp/ui/query";

const rows = flattenItemPages(data);`,
  },
  {
    name: "useCarousel",
    kind: "hook",
    subpaths: ["./data-display"],
    signature:
      "(): { canScrollPrev: boolean; canScrollNext: boolean; selectedIndex: number; scrollSnaps: number[]; api: CarouselApi | null; scrollPrev: () => void; scrollNext: () => void; scrollTo: (index: number) => void }",
    tagline:
      "Read and drive the enclosing `Carousel` from inside it — position, bounds and the scroll actions, for controls you place yourself.",
    usage: [
      "DO call it inside a `<Carousel>` subtree. Outside one there is no context and it throws.",
      "DO use `scrollSnaps` + `selectedIndex` to build your own dots or a counter when `CarouselDots` is not the shape you want.",
      "DON'T animate the track yourself through `api` — the component owns the transition.",
    ],
    related: [
      "Carousel — the provider; its props cover most cases without this hook.",
      "CarouselDots / CarouselNext / CarouselPrevious — the built-in controls.",
    ],
    example: `import { useCarousel } from "@godxjp/ui/data-display";

function Counter() {
  const { selectedIndex, scrollSnaps } = useCarousel();
  return <Text size="2xs" tabular>{selectedIndex + 1} / {scrollSnaps.length}</Text>;
}`,
  },
  {
    name: "flexRender",
    kind: "function",
    subpaths: ["./data-display"],
    signature: "<TProps extends object>(Comp: Renderable<TProps>, props: TProps): ReactNode",
    tagline:
      "Render a TanStack Table cell/header definition, which may be a component or a value. Re-exported so a custom table body does not need a direct `@tanstack/react-table` dependency.",
    reExportedFrom: "@tanstack/react-table",
    usage: [
      "DO use it only when hand-rendering a table body that `DataTable` cannot express — `DataTable` already does this internally.",
      "DON'T add `@tanstack/react-table` to your app just for this; the version must match the one this package renders with.",
    ],
    related: [
      "DataTable — the supported route; reach for it first.",
      "Table — the primitive family underneath.",
    ],
    example: `import { flexRender } from "@godxjp/ui/data-display";

{flexRender(cell.column.columnDef.cell, cell.getContext())}`,
  },
  {
    name: "buttonVariants",
    kind: "function",
    subpaths: ["./general"],
    signature:
      '(props?: { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "dashed" | "bare"; size?: "xs" | "sm" | "md" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"; shape?: "default" | "pill" | "sharp" } & ClassProp): string',
    tagline:
      "Button's class string without Button's element — for when the thing must be an `<a>`, a `<Link>` or a label, but must look exactly like a button.",
    usage: [
      "DO use it for a router `Link` that should read as a button, so the two never drift apart.",
      "DO pass the same `variant`/`size` vocabulary Button takes — that is the point of sharing it.",
      "DON'T use it on a `<button>`; use `Button`, which also carries the focus, disabled and loading behaviour this string does not.",
      "DON'T append your own colour or padding utilities to the result — set a token instead (rule #45).",
    ],
    related: [
      "Button — use this unless the element has to be something else.",
      "Anchor — a styled link when it should read as a link.",
      "cn — to merge the result with your own classes.",
    ],
    example: `import { buttonVariants } from "@godxjp/ui/general";
import { Link } from "@inertiajs/react";

<Link href="/new" className={buttonVariants({ variant: "default", size: "sm" })}>
  新規作成
</Link>`,
  },
  {
    name: "createSidebarLink",
    kind: "function",
    subpaths: ["./layout"],
    signature:
      '<P>(Link: React.ComponentType<P>, hrefProp?: "href" | "to"): SidebarLinkComponentProp',
    tagline:
      "Adapt your router's Link into the component `Sidebar` renders — one call at app setup, so the framework never depends on which router you use.",
    usage: [
      "DO call it once at module scope and pass the result to `Sidebar`; calling it during render makes a new component type every frame and remounts the nav.",
      'DO pass `hrefProp: "to"` for routers that use `to` (React Router) instead of `href`.',
      "DON'T wrap `Sidebar`'s items in your own anchors — the active state and keyboard behaviour live in the component.",
    ],
    related: [
      "Sidebar — the consumer of the result.",
      "SidebarLink — the shape this produces.",
      "PrefetchLink — for prefetch-on-hover behaviour.",
    ],
    example: `import { createSidebarLink } from "@godxjp/ui/layout";
import { Link } from "@inertiajs/react";

const SidebarLink = createSidebarLink(Link);   // module scope, not inside render`,
  },
  {
    name: "useAppShellNavigationMode",
    kind: "hook",
    subpaths: ["./layout"],
    signature: '(): "drawer" | "docked"',
    tagline:
      "Whether the enclosing `AppShell` is currently showing navigation as a docked rail or a drawer — so page content can match without re-deriving the breakpoint.",
    usage: [
      "DO use it when a page needs to know, e.g. to hide its own menu button while the rail is docked.",
      "DON'T re-implement it with a media query; the shell's own breakpoint is the authority and it can be configured.",
    ],
    related: [
      "AppShell — the provider.",
      "useIsMobile — not public; this hook is the supported way to ask.",
    ],
    example: `import { useAppShellNavigationMode } from "@godxjp/ui/layout";

const mode = useAppShellNavigationMode();
{mode === "drawer" ? <MenuButton /> : null}`,
  },
  {
    name: "useSheetResponsiveMode",
    kind: "hook",
    subpaths: ["./feedback"],
    signature: "(responsive?: SheetResponsiveProp): SheetPresentation",
    tagline:
      "Resolve how a `Sheet` will present itself at the current viewport — a side panel or a bottom sheet — before it opens.",
    usage: [
      "DO use it when the CONTENT has to differ between presentations, not merely the container.",
      "DON'T use it to decide whether to render a Sheet at all; pass `responsive` to the Sheet and let it choose.",
    ],
    related: ["Sheet — the component; its `responsive` prop covers most cases.", "Dialog — when the surface should always be modal and centred."],
    example: `import { useSheetResponsiveMode } from "@godxjp/ui/feedback";

const presentation = useSheetResponsiveMode("bottom-on-mobile");`,
  },
  {
    name: "useFormLayout",
    kind: "hook",
    subpaths: ["./data-entry"],
    signature: "(): FormLayoutContextValue | null",
    tagline:
      "The enclosing `Form`'s layout (columns, label placement, density), or `null` outside one — for a custom field that must line up with the real ones.",
    usage: [
      "DO handle `null`: a field component may legitimately be used outside a Form, and it must still render.",
      "DO use it so a bespoke field inherits the form's label column instead of guessing a width.",
      "DON'T use it to read values or errors — that is the form library's job (`useZodForm`, `FormFieldControl`).",
    ],
    related: [
      "Form — the provider.",
      "FormField — build on this before writing a custom field.",
      "Field — the label/description/error wrapper.",
    ],
    example: `import { useFormLayout } from "@godxjp/ui/data-entry";

const layout = useFormLayout();   // null outside a <Form>`,
  },
  {
    name: "usePasswordStrength",
    kind: "hook",
    subpaths: ["./data-entry"],
    signature: "(value: string, rules?: PasswordRule[]): PasswordStrengthReturn",
    tagline:
      "Score a password against the same rules `PasswordStrength` renders — for a custom meter, or to gate a submit button on the same verdict the user is shown.",
    usage: [
      "DO pass the same `rules` the visible meter uses, or the button and the meter will disagree.",
      "DON'T treat it as validation: the server decides, and this is a client-side affordance.",
    ],
    related: [
      "PasswordStrength — the meter; use it unless you need a bespoke one.",
      "PasswordInput — the field.",
    ],
    example: `import { usePasswordStrength } from "@godxjp/ui/data-entry";

const { score, unmet } = usePasswordStrength(value);
<Button disabled={unmet.length > 0}>登録</Button>`,
  },
  {
    name: "useUploadDraft",
    kind: "hook",
    subpaths: [".", "./admin", "./data-entry"],
    signature:
      "({ value, onChange }: UseUploadDraftOptions): { state: UploadDraftState; markRemove: () => void; undoRemove: () => void; stageReplace: (file: File) => void; undoReplace: () => void; getCommitActions: () => UploadCommitAction }",
    tagline:
      "Staged file edits that only take effect on save — mark a removal or a replacement, let the user undo it, and hand the server the resulting actions at submit.",
    usage: [
      "DO use it whenever a file change must be cancellable with the rest of the form: deleting on click is not undoable, and the user has not pressed Save yet.",
      "DO send `getCommitActions()` with the submit, so the server learns remove-then-replace as one intent.",
      "DON'T call your delete endpoint from the remove handler — that is the behaviour this exists to replace.",
    ],
    related: [
      "Upload — the field this drives.",
      "createUploadItem / collectUploadCommitActions — the pieces underneath.",
      "Attachments — the read-only list.",
    ],
    example: `import { useUploadDraft } from "@godxjp/ui/data-entry";

const draft = useUploadDraft({ value: files, onChange: setFiles });
await save({ ...form, files: draft.getCommitActions() });`,
  },
  {
    name: "createUploadItem",
    kind: "function",
    subpaths: [".", "./admin", "./data-entry"],
    signature: "(file: File, partial?: Partial<UploadFileItem>): UploadFileItem",
    tagline:
      "Build the `UploadFileItem` shape `Upload` and `Attachments` expect from a raw `File`, with the id and status fields filled in.",
    usage: [
      "DO use it instead of assembling the object literal — the required fields change with the component, and this moves with it.",
      "DON'T construct one from a server response by hand; map the response into the same shape through this.",
    ],
    related: [
      "useUploadDraft — the staged-edit layer above it.",
      "collectUploadCommitActions — the submit side.",
      "Upload — the field.",
    ],
    example: `import { createUploadItem } from "@godxjp/ui/data-entry";

setFiles((prev) => [...prev, createUploadItem(file)]);`,
  },
  {
    name: "collectUploadCommitActions",
    kind: "function",
    subpaths: [".", "./admin", "./data-entry"],
    signature: "(items: UploadFileItem[]): UploadCommitAction",
    tagline:
      "Reduce a list of upload items to what the server has to do — which to keep, add and remove — so the payload carries intent rather than a diff the backend must infer.",
    usage: [
      "DO call it at submit time and send the result; inferring the removals server-side from a shorter list loses the ordering and the replacements.",
      "DON'T call it on every change — nothing has been committed until the form is saved.",
    ],
    related: [
      "useUploadDraft — calls this for you via `getCommitActions()`.",
      "createUploadItem — the other half of the pair.",
    ],
    example: `import { collectUploadCommitActions } from "@godxjp/ui/data-entry";

await save({ files: collectUploadCommitActions(items) });`,
  },
  {
    name: "UPLOAD_LIST_IGNORE",
    kind: "value",
    subpaths: ["./data-entry"],
    signature: "unique symbol",
    tagline:
      "Sentinel returned from an upload hook to say \"drop this file from the list entirely\" — distinct from rejecting it, which leaves a visible failed row.",
    usage: [
      "DO return it when a file should vanish silently, e.g. a duplicate the user already has.",
      "DON'T use it for a validation failure — the user needs to see why a file was refused.",
    ],
    related: ["Upload — the field that honours it.", "useUploadDraft — staged edits."],
    example: `import { UPLOAD_LIST_IGNORE } from "@godxjp/ui/data-entry";

beforeUpload: (file) => (alreadyAttached(file) ? UPLOAD_LIST_IGNORE : true)`,
  },
  {
    name: "SHOW_ALL",
    kind: "value",
    subpaths: ["./data-entry"],
    signature: '"SHOW_ALL"',
    tagline:
      "`TreeSelect` display strategy: show every checked node as its own tag, parents and children alike.",
    usage: [
      "DO use it when each selected node is independently meaningful to the reader.",
      "DON'T use it on a deep tree with many selections — the tag row grows without bound; `SHOW_PARENT` collapses it.",
    ],
    related: [
      "SHOW_PARENT — one tag for a fully-selected parent.",
      "SHOW_CHILD — leaves only.",
      "TreeSelect — the component that takes these.",
    ],
    example: `import { SHOW_ALL } from "@godxjp/ui/data-entry";

<TreeSelect showCheckedStrategy={SHOW_ALL} />`,
  },
  {
    name: "SHOW_PARENT",
    kind: "value",
    subpaths: ["./data-entry"],
    signature: '"SHOW_PARENT"',
    tagline:
      "`TreeSelect` display strategy: when every child of a node is checked, show the parent alone instead of all its children.",
    usage: [
      "DO use it when the parent means \"all of these\" to the user — a whole department rather than each member.",
      "DON'T use it when the server needs the leaves; this affects DISPLAY, and the value it emits follows the strategy.",
    ],
    related: ["SHOW_ALL — every checked node.", "SHOW_CHILD — leaves only.", "TreeSelect"],
    example: `import { SHOW_PARENT } from "@godxjp/ui/data-entry";

<TreeSelect showCheckedStrategy={SHOW_PARENT} />`,
  },
  {
    name: "SHOW_CHILD",
    kind: "value",
    subpaths: ["./data-entry"],
    signature: '"SHOW_CHILD"',
    tagline:
      "`TreeSelect` display strategy: show only leaf nodes, never an intermediate parent.",
    usage: [
      "DO use it when only leaves are real records — people, files, accounts — and parents are just grouping.",
      "DON'T mix strategies across screens that submit to the same endpoint; the emitted value differs.",
    ],
    related: ["SHOW_ALL", "SHOW_PARENT", "TreeSelect"],
    example: `import { SHOW_CHILD } from "@godxjp/ui/data-entry";

<TreeSelect showCheckedStrategy={SHOW_CHILD} />`,
  },
  {
    name: "dateMatchModifiers",
    kind: "function",
    subpaths: ["./data-entry"],
    signature: "(date: Date, matchers: Matcher | Matcher[], dateLib?: DateLib): boolean",
    tagline:
      "Test a date against the same matcher shapes `Calendar`'s `disabled`/`modifiers` accept. Re-exported from `react-day-picker` so a consumer can reuse one rule set outside the calendar.",
    reExportedFrom: "react-day-picker",
    usage: [
      "DO use it to validate a typed date against the very matchers the picker disables, so the field and the calendar agree.",
      "DON'T add `react-day-picker` to your app for it — the version must match the one Calendar renders.",
    ],
    related: [
      "Calendar / DatePicker — where the matchers are configured.",
      "TimeRangePicker — for time rather than dates.",
    ],
    example: `import { dateMatchModifiers } from "@godxjp/ui/data-entry";

const blocked = dateMatchModifiers(typed, disabledMatchers);`,
  },
  {
    name: "CHART_COLORS",
    kind: "value",
    subpaths: ["./charts"],
    signature:
      'readonly ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"]',
    tagline:
      "The six categorical series colours, as token references — the palette every chart in the framework draws from, in order.",
    usage: [
      "DO index into it when you render a series the chart components do not cover, so a bespoke chart matches the rest.",
      "DO let it wrap past six only if the categories are visually separated another way; six is the discriminable limit chosen for these hues.",
      "DON'T paste the hex values or reorder them — these are `var(--chart-N)` so a tenant theme can restyle every chart at once.",
      "DON'T use them for status. Success/warning/danger have their own fixed semantic tokens; a chart colour carrying meaning breaks under a re-theme.",
    ],
    related: [
      "LineChart / BarChart / AreaChart / PieChart — already use this palette.",
      "Legend — renders the same colours beside labels.",
      "Rule #44 — why this is a token reference and not a value.",
    ],
    example: `import { CHART_COLORS } from "@godxjp/ui/charts";

<Cell fill={CHART_COLORS[index % CHART_COLORS.length]} />`,
  },
];

export function findUtility(name: string): UtilityEntry | undefined {
  const normalized = name.trim().toLowerCase();
  return UTILITIES.find((u) => u.name.toLowerCase() === normalized);
}

export function utilitiesByKind(kind: UtilityKind): UtilityEntry[] {
  return UTILITIES.filter((u) => u.kind === kind);
}

export function searchUtilities(query: string): UtilityEntry[] {
  const q = query.trim().toLowerCase();
  if (q === "") return UTILITIES;
  return UTILITIES.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.tagline.toLowerCase().includes(q) ||
      u.kind.includes(q) ||
      u.subpaths.some((s) => s.includes(q)),
  );
}
