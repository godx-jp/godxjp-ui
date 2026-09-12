import * as React from "react";
import { Check, Copy, LoaderCircle, Pencil } from "lucide-react";

import { cn } from "../../lib/utils";
import { useTranslation } from "../../i18n/use-translation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../feedback/tooltip";
import { Textarea } from "../data-entry/textarea";
import type {
  HeadingProp,
  LinkProp,
  ParagraphProp,
  TextProp,
  TypographyBlockProp,
  TypographyProp,
  TypographyTitleProp,
} from "../../props/components/general.prop";
import type {
  TypographyCopyConfigProp,
  TypographyEditConfigProp,
  TypographyEllipsisConfigProp,
} from "../../props/vocabulary";

export type {
  TextProp,
  TextProp as TextProps,
  HeadingProp,
  HeadingProp as HeadingProps,
  TypographyProp,
  TypographyProp as TypographyProps,
  TypographyBlockProp,
  TypographyTitleProp,
  TypographyTitleProp as TitleProps,
  ParagraphProp,
  ParagraphProp as ParagraphProps,
  LinkProp,
  LinkProp as LinkProps,
} from "../../props/components/general.prop";

/*
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * antd `Typography`, ported. Source read: **antd 6.6.3**, `es/typography/**` — `Base/index.js`,
 * `Base/CopyBtn.js`, `Base/Ellipsis.js`, `Editable.js`, `Text.js`, `Title.js`, `Paragraph.js`,
 * `Link.js`, `hooks/{useCopyClick,useMergedConfig,useTooltipProps}.js` and `style/mixins.js`, in a
 * throw-away checkout OUTSIDE this repository. antd is not a dependency here and
 * `check:no-antd-runtime` keeps it that way.
 *
 * ── THIS MODULE IS NOW A CLIENT MODULE, AND THAT IS THE ONE COST OF PARITY ─────────────────────
 *
 * It used to be hook-free on purpose, so `Text` and `Heading` could render inside a React Server
 * Component; `use-client-directive.test.ts` asserted it. `copyable`, `editable` and `ellipsis` are
 * three of the fourteen props antd declares on `Typography.Text`, and all three need state, so the
 * module takes a hook call and `scripts/add-use-client.mjs` now stamps it.
 *
 * The alternative was a SECOND component also called Text — one server-rendered and static, one
 * client and complete — which is the worse failure: a consumer reading `<Text copyable>` in the
 * catalog and getting a type error from the `Text` their editor auto-imported. Three measurements
 * said the cost is small. `Button` — comparably ubiquitous, and next to almost every `Text` on a
 * real screen — has been a client module all along (`useTranslation` + Slot), so a page carrying
 * any control was already past the boundary. Nothing about the API or the emitted DOM changes: a
 * server component may still render `<Text>`; it is the bundle graph that moves. And the barrel
 * `components/general/index.ts` STAYS server (`check:use-client` pins it in `MUST_BE_SERVER`),
 * because the client fixpoint in `add-use-client.mjs` propagates only through `.tsx` files.
 *
 * ── WHERE THIS LIBRARY AND antd NAME THE SAME AXIS ────────────────────────────────────────────
 *
 * Both spellings are accepted; the winner is written at the prop in `general.prop.ts` and enforced
 * in `TextBase` below (`resolvedTone`, `effectiveClamp`, `truncating`):
 *
 *     antd `type`      ↔  this library's `tone`       →  `tone` wins   (wider: default/primary/info)
 *     antd `strong`    ↔  this library's `weight`     →  both apply    (different layers: element vs paint)
 *     antd `ellipsis`  ↔  this library's `truncate`/`clamp`  →  `ellipsis` wins  (carries suffix/expand/tooltip)
 *     antd `component` ↔  this library's `as`         →  `as` wins
 *     antd `code`      ↔  this library's `mono`       →  both apply    (element vs font family)
 *
 * ── THE ONE BEHAVIOURAL DEVIATION: HOW A CLAMPED BLOCK IS MEASURED ────────────────────────────
 *
 * antd truncates in JAVASCRIPT whenever an action, a suffix or `onEllipsis` is present: it paints
 * three off-screen probe spans, binary-searches the character index at which the text stops fitting
 * (`Base/Ellipsis.js`, O(log n) re-renders per resize), and re-slices the children so the "…" and
 * the expand link land INLINE on the last line.
 *
 * This port clamps in CSS (`-webkit-line-clamp`, the same mechanism `clamp` already used) and puts
 * the action cluster in a sibling AFTER the clamped box. Two reasons, both stated so the next
 * person can reverse it deliberately:
 *
 *  1. The probe measures `scrollHeight`/`clientHeight` on painted elements. jsdom reports 0 for
 *     both, so the entire algorithm is unverifiable in this repo's test environment — and the
 *     working agreement here is that "it looks right" is not a result. The CSS path's one
 *     measurable claim (does this box overflow?) IS verifiable, and `typography-ellipsis.test.tsx`
 *     verifies it by stubbing the two heights.
 *  2. Re-slicing children drops any React element after the cut point. antd accepts that; a design
 *     system whose `Text` routinely wraps `<Badge>`/`<Link>` children should not.
 *
 * The visible difference: with `expandable`, the expand control sits on its own line after the
 * clamped text instead of inline at the end of the last one. Every prop still behaves as antd
 * documents it.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 */

/** How long the copy button shows its confirmed state. antd's value (`useCopyClick`). */
const COPIED_RESET_MS = 3000;

/** antd's `wrapperDecorations` nesting order, outermost last. */
const DECORATION_ELEMENTS = [
  ["strong", "strong"],
  ["underline", "u"],
  ["delete", "del"],
  ["code", "code"],
  ["mark", "mark"],
  ["keyboard", "kbd"],
  ["italic", "i"],
] as const;

/** antd `toList` — a node, an array of nodes, or nothing. */
function toList<T>(value: T | T[] | undefined): (T | undefined)[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** antd `getNode` — `true`/`undefined` take the default; `false` suppresses unless a DOM node is required. */
function getNode(
  node: React.ReactNode | boolean | undefined,
  fallback: React.ReactNode,
  needDom = false,
): React.ReactNode {
  if (node === true || node === undefined) return fallback;
  if (node === false) return needDom ? fallback : null;
  return (node as React.ReactNode) || (needDom ? fallback : null);
}

/** antd `toCopyConfigList` — `false` suppresses BOTH states, otherwise index 0 = idle, 1 = copied. */
function toCopyConfigList(value: React.ReactNode | false | undefined) {
  if (value === false) return [false, false] as const;
  return toList(value as React.ReactNode);
}

/**
 * antd `useMergedConfig` — `true` means "on, all defaults"; an object means "on, these overrides".
 * The boolean is the SUPPORT flag, so `copyable={false}` and `copyable={undefined}` are both off.
 */
function useMergedConfig<T extends object>(
  propConfig: boolean | T | undefined,
  template?: Partial<T>,
): [boolean, T] {
  const support = Boolean(propConfig);
  return React.useMemo(() => {
    const isObject = propConfig !== null && typeof propConfig === "object";
    return [support, { ...template, ...(support && isObject ? propConfig : null) } as T];
    // `template` is rebuilt per render by design (it closes over the locale); keying on `support`
    // and the config itself is antd's own dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [support, propConfig]);
}

/**
 * Controlled-or-not, the house way: a defined prop wins, otherwise internal state.
 *
 * The first parameter is `initial`, and that name is load-bearing. React's own uncontrolled-initial
 * prop is inherited here from `HTMLAttributes`, and `gen-component-api-manifest.mjs` publishes such
 * an inherited prop whenever its name appears ANYWHERE in the module's raw text — comments
 * included. Spelling the parameter after it therefore put a phantom prop on BOTH `Text` and
 * `Heading` in the public API manifest. Measured, renamed, and this comment is careful not to
 * spell the word either, because writing it down here reproduced the bug exactly.
 */
function useControlledFlag(
  initial: boolean,
  controlled: boolean | undefined,
): [boolean, (next: boolean) => void] {
  const [internal, setInternal] = React.useState(initial);
  return [controlled ?? internal, setInternal];
}

/**
 * antd `type` → this library's `tone`.
 *
 * `tone` WINS: it is the axis `check:prop-vocabulary` governs, the one `text-layout.css` keys on,
 * and the wider of the two (antd has no `default`, `primary` or `info`).
 */
const TYPE_TO_TONE = {
  secondary: "muted",
  success: "success",
  warning: "warning",
  danger: "destructive",
} as const;

/**
 * The clipboard write, antd's `_util/copy` reduced to the one path a modern browser takes.
 *
 * antd keeps a `document.execCommand("copy")` fallback for browsers without the async Clipboard
 * API. It is NOT ported: `execCommand` is deprecated, every browser in this package's support
 * matrix ships `navigator.clipboard`, and the fallback's failure mode is worse than none — it
 * reports success from a synchronous flag that a permission prompt can leave stale, so the UI
 * claims a copy that never happened. Here a refusal throws, `onCopy` never fires, and the button
 * never shows its confirmed state.
 */
async function writeClipboard(text: string, format: "text/plain" | "text/html" | undefined) {
  if (format === "text/html" && typeof ClipboardItem !== "undefined") {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([text], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
    return;
  }
  await navigator.clipboard.writeText(text);
}

/** antd copies the rendered children when `copyable.text` is absent. */
function childrenToText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((node) => (typeof node === "string" || typeof node === "number" ? String(node) : ""))
    .join("");
}

/**
 * A tooltip that disappears entirely when its title is suppressed.
 *
 * antd wraps every action in `<Tooltip>`; this library's Tooltip is the house primitive and is
 * composed (`Tooltip > TooltipTrigger > TooltipContent`), so the wrapper lives here.
 */
function ActionTooltip({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  if (title === null || title === undefined || title === false || title === "") return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}

/**
 * The inline operation unit — antd's `operationUnit`, and the reason it is a bare `<button>`
 * rather than this library's `Button`.
 *
 * `.ui-button` is a CONTROL box: `white-space: nowrap`, `flex-shrink: 0`, a `--control-height` tier
 * and inline padding. `Text`'s own `link` prop already carries the measurement and the argument —
 * a control box cannot wrap, and cannot share the line box of the text it sits in. A copy affordance
 * at the end of a truncated table cell is running content, so it is type, not a control.
 */
const TypographyAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { slot: string }
>(({ slot, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    data-slot={slot}
    className={cn("ui-typography-action", className)}
    {...props}
  />
));
TypographyAction.displayName = "TypographyAction";

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * Editable — antd `Editable.js`.
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

function TypographyEditor({
  value,
  ariaLabel,
  maxLength,
  autoSize = true,
  enterIcon,
  className,
  style,
  onSave,
  onCancel,
  onEnd,
}: {
  value: string;
  ariaLabel?: string;
  maxLength?: number;
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  enterIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onSave: (value: string) => void;
  onCancel: () => void;
  onEnd?: () => void;
}) {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const inComposition = React.useRef(false);
  const lastKey = React.useRef<string | null>(null);
  const [current, setCurrent] = React.useState(value);

  React.useEffect(() => {
    setCurrent(value);
  }, [value]);

  // antd focuses the textarea and parks the caret at the END on mount — editing continues the
  // sentence rather than replacing it.
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.focus();
    node.setSelectionRange(node.value.length, node.value.length);
  }, []);

  const confirm = () => {
    onSave(current.trim());
  };

  return (
    <div data-slot="typography-edit" className={cn("ui-typography-edit", className)} style={style}>
      <Textarea
        ref={ref}
        variant="borderless"
        // The editor inherits the edited run's type step and weight (see `text-layout.css`), which
        // is what makes editing WYSIWYG — antd sets the same four font properties to `inherit`.
        className="ui-typography-edit-textarea"
        rows={1}
        autoSize={autoSize}
        maxLength={maxLength}
        aria-label={ariaLabel}
        value={current}
        onChange={(event) => {
          // antd strips newlines: the editor is a one-line field that merely grows.
          setCurrent(event.target.value.replace(/[\n\r]/g, ""));
        }}
        onCompositionStart={() => {
          inComposition.current = true;
        }}
        onCompositionEnd={() => {
          inComposition.current = false;
        }}
        onKeyDown={(event) => {
          // A key pressed while an IME is composing is the IME's, not the user's — committing a
          // Japanese conversion with Enter must not also confirm the edit.
          if (inComposition.current) return;
          lastKey.current = event.key;
        }}
        onKeyUp={(event) => {
          if (
            lastKey.current !== event.key ||
            inComposition.current ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey ||
            event.shiftKey
          ) {
            return;
          }
          if (event.key === "Enter") {
            confirm();
            onEnd?.();
          } else if (event.key === "Escape") {
            onCancel();
          }
        }}
        onBlur={confirm}
      />
      {enterIcon !== null ? (
        <span aria-hidden className="ui-typography-edit-confirm">
          {enterIcon ?? "⏎"}
        </span>
      ) : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * The shared antd block behaviour, consumed by Text / Title / Paragraph / Link.
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

type BlockBehaviour = TypographyBlockProp & { children?: React.ReactNode };

type BlockRender = {
  /** `true` while the editor has replaced the text; the caller renders `editor` instead. */
  editing: boolean;
  editor: React.ReactNode;
  /** The action cluster, when it sits before the text (`actions={{ placement: "start" }}`). */
  leading: React.ReactNode;
  /** The children, wrapped in antd's decoration elements. This is what gets clamped. */
  text: React.ReactNode;
  /** The suffix and the trailing action cluster — siblings of the clamped box, never inside it. */
  trailing: React.ReactNode;
  /** Attributes the rendered element must carry. */
  attrs: Record<string, unknown>;
  /** Ref the rendered element must take, so overflow can be measured. */
  measureRef: React.RefCallback<HTMLElement>;
  /** True when the text needs its own wrapper so the actions escape the clamped box. */
  wrapsContent: boolean;
  /** Set when `triggerType` includes `"text"`: clicking the text opens the editor. */
  onTextClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** The resolved tooltip that carries the full text while it is truncated. */
  ellipsisTooltip: React.ReactNode;
  isEllipsis: boolean;
};

function useTypographyBlock(props: BlockBehaviour, allowRows: boolean): BlockRender {
  const { t } = useTranslation();
  const { children, copyable, editable, ellipsis, actions, disabled } = props;
  const placement = actions?.placement ?? "end";

  // ── Editable ────────────────────────────────────────────────────────────────────────────────
  const [enableEdit, editConfig] = useMergedConfig<TypographyEditConfigProp>(editable);
  const [editing, setEditing] = useControlledFlag(false, editConfig.editing);
  const triggerType = editConfig.triggerType ?? ["icon"];
  const editButtonRef = React.useRef<HTMLButtonElement>(null);
  const wasEditing = React.useRef(false);

  // antd returns focus to the edit button when the editor closes, so the keyboard never lands on
  // `<body>` after a save (WCAG 2.4.3, focus order).
  React.useEffect(() => {
    if (!editing && wasEditing.current) editButtonRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  const startEditing = (event?: React.SyntheticEvent) => {
    event?.preventDefault();
    editConfig.onStart?.();
    setEditing(true);
  };

  // ── Copyable ────────────────────────────────────────────────────────────────────────────────
  const [enableCopy, copyConfig] = useMergedConfig<TypographyCopyConfigProp>(copyable);
  const [copied, setCopied] = React.useState(false);
  const [copyLoading, setCopyLoading] = React.useState(false);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const onCopyClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setCopyLoading(true);
    try {
      const configured =
        typeof copyConfig.text === "function" ? await copyConfig.text() : copyConfig.text;
      await writeClipboard(configured || childrenToText(children) || "", copyConfig.format);
      setCopyLoading(false);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => {
        setCopied(false);
      }, COPIED_RESET_MS);
      copyConfig.onCopy?.(event);
    } catch {
      // The clipboard refused (insecure context, denied permission). Leave every piece of state
      // untouched so the UI never claims a copy that did not happen — the same decision, for the
      // same reason, as `CredentialReveal`.
      setCopyLoading(false);
    }
  };

  // ── Ellipsis ────────────────────────────────────────────────────────────────────────────────
  const [enableEllipsis, ellipsisConfig] = useMergedConfig<TypographyEllipsisConfigProp>(ellipsis);
  const [expanded, setExpanded] = useControlledFlag(
    ellipsisConfig.defaultExpanded ?? false,
    ellipsisConfig.expanded,
  );
  const rows = allowRows ? (ellipsisConfig.rows ?? 1) : 1;
  const expandable = allowRows ? ellipsisConfig.expandable : undefined;
  // antd: once expanded, the clamp is released unless the caller asked to keep a collapse control.
  const clamping = enableEllipsis && (!expanded || expandable === "collapsible");

  const [isEllipsis, setIsEllipsis] = React.useState(false);
  const elementRef = React.useRef<HTMLElement | null>(null);
  const onEllipsisRef = React.useRef(ellipsisConfig.onEllipsis);
  onEllipsisRef.current = ellipsisConfig.onEllipsis;

  /**
   * The one measurable claim the CSS path makes: is this box clipping its own content?
   *
   * `scrollHeight > clientHeight` for a clamped block, `scrollWidth > clientWidth` for a single
   * line. antd probes with an injected `<em>` and a `getBoundingClientRect` comparison because it
   * also needs the CHARACTER index; this port only needs the boolean, and the boolean is the half
   * a test can stub and assert on.
   */
  const measure = React.useCallback(() => {
    const node = elementRef.current;
    if (!node || !enableEllipsis) return;
    const next =
      rows > 1 ? node.scrollHeight > node.clientHeight : node.scrollWidth > node.clientWidth;
    setIsEllipsis((prev) => {
      if (prev === next) return prev;
      onEllipsisRef.current?.(next);
      return next;
    });
  }, [enableEllipsis, rows]);

  const measureRef = React.useCallback<React.RefCallback<HTMLElement>>((node) => {
    elementRef.current = node;
  }, []);

  React.useLayoutEffect(() => {
    measure();
  }, [measure, children, expanded, clamping]);

  React.useEffect(() => {
    const node = elementRef.current;
    if (!node || !enableEllipsis || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [measure, enableEllipsis]);

  const onExpandClick = (event: React.MouseEvent<HTMLElement>) => {
    const next = !expanded;
    setExpanded(next);
    ellipsisConfig.onExpand?.(event, { expanded: next });
  };

  // ── Render the pieces ───────────────────────────────────────────────────────────────────────
  const copyLabels = toCopyConfigList(copyConfig.tooltips);
  const copyIcons = toCopyConfigList(copyConfig.icon);
  const systemCopyLabel = copied ? t("ui.typography.copied") : t("ui.typography.copy");
  const copyTitle = getNode(copyLabels[copied ? 1 : 0], systemCopyLabel);
  const copyAriaLabel = typeof copyTitle === "string" ? copyTitle : systemCopyLabel;

  const copyNode = enableCopy ? (
    <ActionTooltip key="copy" title={copyTitle}>
      <TypographyAction
        slot="typography-copy"
        data-copied={copied ? "" : undefined}
        aria-label={copyAriaLabel}
        tabIndex={copyConfig.tabIndex}
        onClick={onCopyClick}
      >
        {copied
          ? getNode(copyIcons[1], <Check aria-hidden className="ui-typography-icon" />, true)
          : getNode(
              copyIcons[0],
              copyLoading ? (
                <LoaderCircle aria-hidden className="ui-typography-icon ui-typography-icon-spin" />
              ) : (
                <Copy aria-hidden className="ui-typography-icon" />
              ),
              true,
            )}
      </TypographyAction>
    </ActionTooltip>
  ) : null;

  const editTitle = toList(editConfig.tooltip)[0] ?? t("ui.typography.edit");
  const editNode =
    enableEdit && triggerType.includes("icon") ? (
      <ActionTooltip key="edit" title={editConfig.tooltip === false ? null : editTitle}>
        <TypographyAction
          ref={editButtonRef}
          slot="typography-edit-trigger"
          aria-label={typeof editTitle === "string" ? editTitle : t("ui.typography.edit")}
          tabIndex={editConfig.tabIndex}
          onClick={startEditing}
        >
          {editConfig.icon ?? <Pencil aria-hidden className="ui-typography-icon" />}
        </TypographyAction>
      </ActionTooltip>
    ) : null;

  // antd hides the expand control when the text is not actually clipped; the measurement above is
  // what decides. `expanded` keeps a `collapsible` control reachable once it has been opened.
  const showExpand = Boolean(expandable) && (isEllipsis || expanded);
  const expandSymbol =
    typeof ellipsisConfig.symbol === "function"
      ? ellipsisConfig.symbol(expanded)
      : (ellipsisConfig.symbol ??
        (expanded ? t("ui.typography.collapse") : t("ui.typography.expand")));
  const expandNode = showExpand ? (
    <TypographyAction
      key="expand"
      slot={expanded ? "typography-collapse" : "typography-expand"}
      // WAI-ARIA APG owns interaction semantics here (docs/DESIGN-AUTHORITY.md, layer 1), and it
      // outranks antd, which ships only an aria-label. A disclosure button states its own state.
      aria-expanded={expanded}
      aria-label={expanded ? t("ui.typography.collapse") : t("ui.typography.expand")}
      onClick={onExpandClick}
    >
      {expandSymbol}
    </TypographyAction>
  ) : null;

  const hasActions = Boolean(copyNode || editNode || expandNode);
  const actionsNode = hasActions ? (
    <span
      key="actions"
      data-slot="typography-actions"
      data-placement={placement}
      className="ui-typography-actions"
    >
      {expandNode}
      {editNode}
      {copyNode}
    </span>
  ) : null;

  // ── Compose ─────────────────────────────────────────────────────────────────────────────────
  let decorated: React.ReactNode = children;
  for (const [flag, tag] of DECORATION_ELEMENTS) {
    if (props[flag]) decorated = React.createElement(tag, {}, decorated);
  }

  const suffix = ellipsisConfig.suffix;
  // Neither the actions nor the suffix may live INSIDE a `-webkit-line-clamp` box: the clamp eats
  // everything past the last visible line, so an expand button would disappear at exactly the
  // moment it is needed. When either is present the TEXT takes its own wrapper, the clamp moves
  // onto that wrapper, and these stay siblings of it.
  const wrapsContent = clamping && Boolean(hasActions || suffix !== undefined);

  const ellipsisTooltip =
    ellipsisConfig.tooltip === true ? (editConfig.text ?? children) : ellipsisConfig.tooltip;

  const attrs: Record<string, unknown> = {
    "data-disabled": disabled ? "" : undefined,
    "data-ellipsis": enableEllipsis ? "" : undefined,
    "data-expanded": enableEllipsis && expanded ? "" : undefined,
  };

  return {
    editing: enableEdit && editing,
    editor: (
      <TypographyEditor
        value={editConfig.text ?? (typeof children === "string" ? children : "")}
        ariaLabel={typeof editConfig.text === "string" ? editConfig.text : undefined}
        maxLength={editConfig.maxLength}
        autoSize={editConfig.autoSize}
        enterIcon={editConfig.enterIcon}
        onSave={(value) => {
          editConfig.onChange?.(value);
          setEditing(false);
        }}
        onCancel={() => {
          editConfig.onCancel?.();
          setEditing(false);
        }}
        onEnd={editConfig.onEnd}
      />
    ),
    leading: placement === "start" ? actionsNode : null,
    text: decorated,
    trailing: (
      <>
        {suffix}
        {placement === "start" ? null : actionsNode}
      </>
    ),
    attrs,
    measureRef,
    wrapsContent,
    onTextClick: enableEdit && triggerType.includes("text") ? startEditing : undefined,
    ellipsisTooltip,
    isEllipsis,
  };
}

/** Does this call use ANY antd block behaviour? A plain `<Text>` must render byte-for-byte as before. */
function usesBlockBehaviour(props: TypographyBlockProp): boolean {
  if (props.copyable || props.editable || props.ellipsis || props.actions || props.disabled) {
    return true;
  }
  return DECORATION_ELEMENTS.some(([flag]) => props[flag]);
}

/** Lines a clamped run keeps. `ellipsis` may be a boolean (one line) or carry `rows`. */
function ellipsisRows(ellipsis: unknown): number {
  if (!ellipsis || ellipsis === true) return 1;
  const rows = (ellipsis as TypographyEllipsisConfigProp).rows;
  return typeof rows === "number" && rows >= 1 ? Math.floor(rows) : 1;
}

/** Merge the forwarded ref with the one `useTypographyBlock` needs to measure overflow. */
function composeRefs(
  measureRef: React.RefCallback<HTMLElement>,
  forwarded: React.ForwardedRef<HTMLElement>,
): React.RefCallback<HTMLElement> {
  return (node) => {
    measureRef(node);
    if (typeof forwarded === "function") forwarded(node);
    else if (forwarded) (forwarded as React.RefObject<HTMLElement | null>).current = node;
  };
}

/**
 * `Text` and `Paragraph` are the same renderer.
 *
 * The ONLY difference is antd's own: `Typography.Text` drops `rows` / `expandable` / `onExpand`
 * from its `ellipsis` (an inline run has no second line to expand into) while
 * `Typography.Paragraph` keeps them. `allowRows` is that one switch, kept internal so the public
 * surface stays antd's two components rather than one with a mode flag.
 */
type TextBaseProp = TextProp & { allowRows?: boolean };

const TextBase = React.forwardRef<HTMLElement, TextBaseProp>((props, ref) => {
  const {
    as,
    component,
    asChild = false,
    size = "sm",
    // `link` is an affordance, not a colour: it only moves the DEFAULT tone, so
    // `link tone="destructive"` is a destructive link rather than an argument between two rules.
    tone,
    type,
    weight = "regular",
    align,
    truncate,
    clamp,
    whitespace,
    tabular,
    decoration,
    chip,
    mono,
    link,
    className,
    style,
    children,
    allowRows = false,
    // antd block behaviour — read by `useTypographyBlock`, never spread onto the DOM.
    copyable: _copyable,
    editable: _editable,
    ellipsis,
    actions: _actions,
    disabled,
    code: _code,
    mark: _mark,
    underline: _underline,
    delete: _delete,
    strong: _strong,
    keyboard: _keyboard,
    italic: _italic,
    ...rest
  } = props;

  const block = useTypographyBlock(props, allowRows);
  const element = as ?? (component as TextProp["as"]) ?? "span";

  // `clamp` is a max line count: integer ≥ 1. Anything else is ignored (dev builds warn).
  const clampLines =
    typeof clamp === "number" && Number.isFinite(clamp) && clamp >= 1
      ? Math.floor(clamp)
      : undefined;

  // antd's `ellipsis` OUTRANKS `truncate` / `clamp`: it is the only spelling that can also carry a
  // suffix, an expand control or a tooltip, so a call passing both meant the richer one. A
  // multi-row `ellipsis` becomes the clamp; a one-row `ellipsis` becomes the single-line truncate.
  const ellipsisRowCount = ellipsis ? ellipsisRows(ellipsis) : 0;
  const effectiveClamp =
    ellipsisRowCount > 1 ? ellipsisRowCount : ellipsis ? undefined : clampLines;
  const truncating = (truncate === true || ellipsisRowCount === 1) && effectiveClamp === undefined;

  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    if (clamp !== undefined && clampLines === undefined) {
      console.warn(`Text: \`clamp\` must be a finite number ≥ 1 (got ${String(clamp)}); ignored.`);
    }
    if (truncate && clampLines !== undefined) {
      // Mutually exclusive by contract: clamp (multi-line) wins over truncate (single-line).
      console.warn(
        "Text: `truncate` and `clamp` are mutually exclusive — `clamp` takes precedence; drop `truncate`.",
      );
    }
    if (whitespace === "pre-wrap" && truncating) {
      console.warn(
        'Text: `truncate` and `whitespace="pre-wrap"` are mutually exclusive — `truncate` takes precedence (one line, one ellipsis); use `clamp` to keep preserved line breaks and still bound the height.',
      );
    }
    if (ellipsis && (truncate || clamp !== undefined)) {
      console.warn(
        "Text: `ellipsis` (antd) and `truncate`/`clamp` are the same axis — `ellipsis` takes precedence; drop the other.",
      );
    }
    if (tone && type) {
      console.warn(
        "Text: `tone` and `type` (antd) are the same axis — `tone` takes precedence; drop `type`.",
      );
    }
  }

  const resolvedTone =
    tone ?? (type ? TYPE_TO_TONE[type] : undefined) ?? (link ? "primary" : "default");

  const clampStyle =
    effectiveClamp !== undefined
      ? ({ ...style, "--text-clamp": effectiveClamp } as React.CSSProperties)
      : style;

  const typography = {
    "data-slot": "text",
    "data-size": size,
    "data-tone": resolvedTone,
    "data-link": link ? "" : undefined,
    "data-weight": weight,
    "data-align": align,
    // When the action cluster or a suffix is present the clamp moves ONTO the inner wrapper, so the
    // buttons are not eaten by the clamped box. Everything else keeps the attribute where it has
    // always been, on the element itself.
    "data-truncate": truncating && !block.wrapsContent ? "" : undefined,
    "data-clamp": effectiveClamp !== undefined && !block.wrapsContent ? "" : undefined,
    // Inert default: `normal` is CSS's own behaviour, so it emits no attribute and there is no
    // `[data-whitespace="normal"]` rule to lose a specificity argument with anything.
    "data-whitespace": whitespace === "pre-wrap" && !truncating ? "pre-wrap" : undefined,
    style: clampStyle,
    "data-tabular": tabular ? "" : undefined,
    "data-decoration": decoration,
    "data-chip": chip ? "" : undefined,
    "data-mono": mono ? "" : undefined,
    "aria-disabled": disabled ? true : undefined,
    ...block.attrs,
    onClick: block.onTextClick,
    className: cn("ui-text", className),
    ...rest,
  } as Record<string, unknown>;

  if (block.editing) return block.editor;

  // The clamped box holds ONLY the text. `leading` and `trailing` — the action cluster and the
  // suffix — are its siblings, because `-webkit-line-clamp` clips everything inside its own box.
  const body = (
    <>
      {block.leading}
      {block.wrapsContent ? (
        <span
          data-slot="typography-content"
          data-truncate={truncating ? "" : undefined}
          data-clamp={effectiveClamp !== undefined ? "" : undefined}
          className="ui-typography-content"
          style={clampStyle}
        >
          {block.text}
        </span>
      ) : (
        block.text
      )}
      {block.trailing}
    </>
  );

  // `asChild` by cloneElement, NOT by Radix Slot.
  //
  // Slot is the house pattern and it is the right one for a Button, whose asChild has to chain
  // event handlers onto a child that already has its own. Text has no handlers of its own — it is
  // type, tone and truncation — so all Slot would add here is its import. That import used to
  // decide whether this module could render inside an RSC; it no longer does (see the header), but
  // cloneElement still wins on merge order being OURS to prove rather than Radix's to assume, and
  // `typography-link.test.tsx` proves it.
  //
  // Slot's merge order, reproduced: our props first, the child's own on top (so the child keeps its
  // `href`), with className concatenated rather than replaced.
  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{ className?: string }>;
    const cloned = {
      ...typography,
      ...child.props,
      ref,
      className: cn(typography.className as string, child.props.className),
    } as never;
    // A plain `<Text asChild>` leaves the child's own children untouched — the shape every existing
    // call site is written in, and the one `typography-link.test.tsx` pins. Only a call that ASKED
    // for decorations or an action cluster has its children replaced, because those nodes have
    // nowhere else to go.
    return usesBlockBehaviour(props)
      ? React.cloneElement(child, cloned, body)
      : React.cloneElement(child, cloned);
  }

  return React.createElement(
    element,
    { ref: composeRefs(block.measureRef, ref), ...typography },
    body,
  );
});
TextBase.displayName = "TextBase";

/**
 * Text — the typographic primitive, and antd's `Typography.Text`.
 *
 * Use it INSTEAD of a hand-rolled `<span className="text-[13px] font-medium text-muted-foreground">`.
 * Size is a step of the type scale (never a px); tone and weight are tokens.
 */
export const Text = React.forwardRef<HTMLElement, TextProp>((props, ref) => (
  <TextBase ref={ref} {...props} />
));
Text.displayName = "Text";

/**
 * Paragraph — antd `Typography.Paragraph`.
 *
 * Renders a `<div>`, matching antd, because the editing textarea and the action cluster are block
 * content that a `<p>` may not legally contain — a `<p>` would be split by the parser and the
 * actions would end up OUTSIDE the paragraph. Pass `as="p"` when the content is phrasing-only.
 *
 * The one difference from `Text` is antd's: `ellipsis` here keeps `rows`, `expandable` and
 * `onExpand`.
 */
export const Paragraph = React.forwardRef<HTMLElement, ParagraphProp>(
  ({ as = "div", className, ...rest }, ref) => (
    <TextBase
      ref={ref}
      as={as}
      allowRows
      className={cn("ui-typography-paragraph", className)}
      {...(rest as TextProp)}
    />
  ),
);
Paragraph.displayName = "Paragraph";

/**
 * Link — antd `Typography.Link`.
 *
 * `Text link` is the same affordance and is unchanged; `Link` is antd's anchor-by-default flavour
 * of it. It adds antd's `rel` guard: a `target="_blank"` with no explicit `rel` gets
 * `noopener noreferrer`, because the opened document otherwise keeps a live handle on
 * `window.opener`. antd restricts `ellipsis` to a boolean on `Link`, and that restriction is ported
 * by the type — `allowRows` stays off.
 */
export const Link = React.forwardRef<HTMLElement, LinkProp>(
  ({ as = "a", rel, target, className, ...rest }, ref) => (
    <TextBase
      ref={ref}
      as={as}
      link
      target={target}
      rel={rel === undefined && target === "_blank" ? "noopener noreferrer" : rel}
      className={cn("ui-typography-link", className)}
      {...(rest as TextProp)}
    />
  ),
);
Link.displayName = "Link";

/**
 * Heading — h1..h4 sized from the `--heading-h*` tokens. `level` sets both the size token and the
 * semantic element; override the rendered element with `as` (e.g. a visual h2 that is a real <h1>).
 *
 * UNCHANGED by the antd port. antd's heading is `Title`, which is the sibling below; `Heading` is
 * this library's own and keeps its four levels, its props and its markup exactly as they shipped.
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProp>(
  (
    { level = 2, as, tone = "default", align, truncate, weight = "medium", className, ...props },
    ref,
  ) =>
    React.createElement(as ?? `h${level}`, {
      ref,
      "data-slot": "heading",
      "data-level": level,
      "data-tone": tone,
      "data-align": align,
      "data-weight": weight,
      "data-truncate": truncate ? "" : undefined,
      className: cn("ui-heading", className),
      ...props,
    }),
);
Heading.displayName = "Heading";

/**
 * Title — antd `Typography.Title`.
 *
 * A SIBLING of `Heading`, not a replacement: five levels instead of four, plus the antd block
 * behaviours (`copyable`, `editable`, `ellipsis`, the decorations). antd omits `strong` here
 * because a heading already renders at the strong weight, and that omission is ported.
 */
export const Title = React.forwardRef<HTMLElement, TypographyTitleProp>((props, ref) => {
  const {
    level = 1,
    as,
    component,
    tone,
    type,
    align,
    truncate,
    weight = "medium",
    className,
    style,
    children: _children,
    ellipsis,
    copyable: _copyable,
    editable: _editable,
    actions: _actions,
    disabled,
    code: _code,
    mark: _mark,
    underline: _underline,
    delete: _delete,
    keyboard: _keyboard,
    italic: _italic,
    ...rest
  } = props;

  const block = useTypographyBlock(props, true);
  // antd clamps `level` to 1..5 and falls back to h1. Ported, so a runtime `level={7}` renders a
  // heading rather than an `<h7>` the browser would treat as an unknown inline element.
  const safeLevel = level >= 1 && level <= 5 ? level : 1;
  const element = as ?? (component as string) ?? `h${safeLevel}`;

  const ellipsisRowCount = ellipsis ? ellipsisRows(ellipsis) : 0;
  const effectiveClamp = ellipsisRowCount > 1 ? ellipsisRowCount : undefined;
  const truncating = (truncate === true || ellipsisRowCount === 1) && effectiveClamp === undefined;
  const clampStyle =
    effectiveClamp !== undefined
      ? ({ ...style, "--text-clamp": effectiveClamp } as React.CSSProperties)
      : style;

  if (block.editing) return block.editor;

  // The clamped box holds ONLY the text. `leading` and `trailing` — the action cluster and the
  // suffix — are its siblings, because `-webkit-line-clamp` clips everything inside its own box.
  const body = (
    <>
      {block.leading}
      {block.wrapsContent ? (
        <span
          data-slot="typography-content"
          data-truncate={truncating ? "" : undefined}
          data-clamp={effectiveClamp !== undefined ? "" : undefined}
          className="ui-typography-content"
          style={clampStyle}
        >
          {block.text}
        </span>
      ) : (
        block.text
      )}
      {block.trailing}
    </>
  );

  return React.createElement(
    element,
    {
      ref: composeRefs(block.measureRef, ref),
      "data-slot": "heading",
      "data-level": safeLevel,
      "data-tone": tone ?? (type ? TYPE_TO_TONE[type] : undefined) ?? "default",
      "data-align": align,
      "data-weight": weight,
      "data-truncate": truncating && !block.wrapsContent ? "" : undefined,
      "data-clamp": effectiveClamp !== undefined && !block.wrapsContent ? "" : undefined,
      "aria-disabled": disabled ? true : undefined,
      style: clampStyle,
      ...block.attrs,
      onClick: block.onTextClick,
      className: cn("ui-heading", "ui-typography-title", className),
      ...rest,
    },
    body,
  );
});
Title.displayName = "Title";

/**
 * Typography — antd's plain wrapper for a run of prose.
 *
 * It renders an `<article>` and carries no emphasis of its own. It exists so `Title`, `Paragraph`,
 * `Text` and `Link` have a container with the reading measure and the block rhythm on it, and so
 * the compound spelling every antd codebase is written in — `<Typography.Text>` — works here
 * unchanged.
 */
const TypographyRoot = React.forwardRef<HTMLElement, TypographyProp>(
  ({ as, component, className, children, ...rest }, ref) =>
    React.createElement(
      as ?? component ?? "article",
      {
        ref,
        "data-slot": "typography",
        className: cn("ui-typography", className),
        ...rest,
      },
      children,
    ),
);
TypographyRoot.displayName = "Typography";

type TypographyCompound = typeof TypographyRoot & {
  Text: typeof Text;
  Title: typeof Title;
  Paragraph: typeof Paragraph;
  Link: typeof Link;
};

/**
 * The compound export. `Typography.Text` and the bare `Text` are the SAME component — there is no
 * second, poorer Text — so a paste from an antd codebase and a call written in this library's own
 * style compile to the same thing.
 */
export const Typography = Object.assign(TypographyRoot, {
  Text,
  Title,
  Paragraph,
  Link,
}) as TypographyCompound;
