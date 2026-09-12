import * as React from "react";
import { ChevronRight, CircleCheck, CircleMinus, CircleX, Loader2 } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { VisuallyHidden } from "../general/visually-hidden";
import { Text } from "../general/typography";

import type {
  ThoughtChainItemProp,
  ThoughtChainProp,
  ThoughtChainStatusProp,
} from "../../props/components/data-display.prop";

export type {
  ThoughtChainProp,
  ThoughtChainProp as ThoughtChainProps,
  ThoughtChainItemsProp,
  ThoughtChainItemProp,
  ThoughtChainItemProp as ThoughtChainItemProps,
  ThoughtChainStatusProp,
  ThoughtChainLineProp,
  ThoughtChainVariantProp,
} from "../../props/components/data-display.prop";

const STATUS_GLYPH: Record<ThoughtChainStatusProp, React.ReactNode> = {
  loading: <Loader2 aria-hidden="true" className="ui-thought-chain-spinner" />,
  success: <CircleCheck aria-hidden="true" />,
  error: <CircleX aria-hidden="true" />,
  abort: <CircleMinus aria-hidden="true" />,
};

/**
 * The glyph AND the word.
 *
 * Ant paints the status as an icon and nothing else (`es/thought-chain/Status.js`), so "this step
 * failed" is carried by a shape and a tint — which is exactly what WCAG 1.4.1 says may not be the
 * only channel. The word rides along in a visually hidden span, so the chain reads correctly aloud
 * and looks identical.
 */
function StatusMark({
  status,
  fallback,
}: {
  status?: ThoughtChainStatusProp;
  fallback?: React.ReactNode;
}) {
  const { t } = useTranslation();
  if (!status) return <>{fallback}</>;
  return (
    <>
      {STATUS_GLYPH[status]}
      <VisuallyHidden>{t(`dataDisplay.thoughtChain.status.${status}`)}</VisuallyHidden>
    </>
  );
}

/**
 * ThoughtChain — the assistant's reasoning, step by step (Ant Design X `ThoughtChain`).
 *
 * ## The shape, and why it is an `<ol>`
 *
 * Ant renders the whole chain as nested `<div>`s and paints the step number itself
 * (`index + 1` in `es/thought-chain/Node.js`). The order of the steps IS the content here — step 3
 * only makes sense after step 2 — so the chain is an ordered list and a screen reader gets "list,
 * 4 items" plus each step's position for free. The visible ordinal stays, because the same number
 * has to be on screen for a sighted reader following a long chain.
 *
 * ## The disclosure is a real button
 *
 * A `collapsible` step's title in Ant is a `<div onClick>` with a rotating chevron — no role, no
 * `tabIndex`, no `aria-expanded`. Here it is a `<button aria-expanded aria-controls>` over the
 * body it opens: the WAI-ARIA APG Disclosure pattern, so the step can be opened from the keyboard
 * and its state is announced rather than inferred from a rotation.
 *
 * Everything a caller passes keeps Ant's spelling: `items` (with `icon`, `title`, `description`,
 * `content`, `footer`, `status`, `collapsible`, `blink`, `destroyOnHidden`), the
 * `defaultExpandedKeys` / `expandedKeys` / `onExpand` triad, and `line`. `styles` / `classNames` /
 * `prefixCls` / `rootClassName` are not ported — the standing style-hole decision
 * (docs/WHAT-BELONGS-HERE.md, docs/DESIGN-AUTHORITY.md); the chain is retuned through
 * `src/tokens/components/thought-chain.css`.
 */
export const ThoughtChain = React.forwardRef<HTMLOListElement, ThoughtChainProp>(
  (
    {
      items = [],
      defaultExpandedKeys,
      expandedKeys,
      onExpand,
      line = true,
      label,
      id,
      className,
      ...rest
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const reactId = React.useId();
    const [uncontrolled, setUncontrolled] = React.useState<string[]>(() => [
      ...(defaultExpandedKeys ?? []),
    ]);
    const open = expandedKeys ? [...expandedKeys] : uncontrolled;

    const toggle = (key: string) => {
      const next = open.includes(key) ? open.filter((k) => k !== key) : [...open, key];
      if (!expandedKeys) setUncontrolled(next);
      onExpand?.(next);
    };

    return (
      <ol
        ref={ref}
        id={id}
        aria-label={label ?? t("dataDisplay.thoughtChain.label")}
        data-slot="thought-chain"
        data-line={line === false ? "none" : line === true ? "solid" : line}
        className={cn("ui-thought-chain", className)}
        {...rest}
      >
        {items.map((item, index) => {
          const key = item.key ?? `${reactId}-${index}`;
          const bodyId = `${reactId}-body-${index}`;
          const collapsible = Boolean(item.collapsible && item.content);
          const expanded = collapsible ? open.includes(key) : true;
          /* Ant's rule, byte for byte: `icon === false` removes the glyph, a supplied icon wins,
           * and otherwise the step shows its 1-based ordinal. */
          const glyph = item.icon === false ? null : (item.icon ?? index + 1);

          return (
            <li
              key={key}
              data-slot="thought-chain-node"
              data-status={item.status}
              className="ui-thought-chain-node"
            >
              {glyph === null ? null : (
                <span
                  data-slot="thought-chain-icon"
                  data-status={item.status}
                  className="ui-thought-chain-icon"
                >
                  <StatusMark status={item.status} fallback={glyph} />
                </span>
              )}

              <div className="ui-thought-chain-body">
                <div className="ui-thought-chain-header">
                  {collapsible ? (
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={bodyId}
                      data-blink={item.blink ? "" : undefined}
                      className="ui-thought-chain-trigger"
                      onClick={() => toggle(key)}
                    >
                      <ChevronRight
                        aria-hidden="true"
                        data-expanded={expanded ? "true" : undefined}
                        className="ui-thought-chain-chevron"
                      />
                      <Text weight="medium">{item.title}</Text>
                    </button>
                  ) : (
                    <Text weight="medium" data-blink={item.blink ? "" : undefined}>
                      {item.title}
                    </Text>
                  )}

                  {item.description ? (
                    <Text size="xs" tone="muted">
                      {item.description}
                    </Text>
                  ) : null}
                </div>

                {/* `destroyOnHidden` defaults to TRUE, as in Ant: a collapsed body is removed
                    rather than hidden, so a long chain does not keep every step's output mounted.
                    Passing `false` keeps it in the DOM and merely hides it. */}
                {item.content && (expanded || item.destroyOnHidden === false) ? (
                  <div
                    id={bodyId}
                    hidden={!expanded}
                    data-blink={item.blink ? "" : undefined}
                    className="ui-thought-chain-content"
                  >
                    {item.content}
                  </div>
                ) : null}

                {item.footer ? <div className="ui-thought-chain-footer">{item.footer}</div> : null}
              </div>
            </li>
          );
        })}
      </ol>
    );
  },
);
ThoughtChain.displayName = "ThoughtChain";

/**
 * ThoughtChainItem — one step OUTSIDE a chain (Ant Design X `ThoughtChain.Item`).
 *
 * A named export rather than `ThoughtChain.Item`, for the same reason `ActionsItem` is: every
 * compound in this library is separate named exports (`CardHeader`, `TabsList`), and attaching
 * statics to one component would be the only instance of it here.
 *
 * ONE DEVIATION: Ant renders the chip as a `<div>` and hangs `onClick` on it, so a clickable step
 * is invisible to the keyboard and to assistive technology. Here an item WITH `onClick` renders a
 * real `<button>` and one without renders a plain `<div>` — the element follows whether the thing
 * is actually a control.
 */
export const ThoughtChainItem = React.forwardRef<HTMLElement, ThoughtChainItemProp>(
  (
    {
      title,
      description,
      icon,
      status,
      variant = "solid",
      blink,
      disabled,
      onClick,
      id,
      className,
    },
    ref,
  ) => {
    const shared = {
      id,
      "data-slot": "thought-chain-item",
      "data-variant": variant,
      "data-status": status,
      "data-blink": blink ? "" : undefined,
      className: cn("ui-thought-chain-item", className),
    };

    const inner = (
      <>
        {status || icon ? (
          <span data-status={status} className="ui-thought-chain-icon">
            <StatusMark status={status} fallback={icon} />
          </span>
        ) : null}
        <span className="ui-thought-chain-item-text">
          {title ? <Text weight="medium">{title}</Text> : null}
          {description ? (
            <Text size="xs" tone="muted">
              {description}
            </Text>
          ) : null}
        </span>
      </>
    );

    if (!onClick) {
      return (
        <div ref={ref as React.Ref<HTMLDivElement>} {...shared}>
          {inner}
        </div>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        onClick={onClick}
        {...shared}
      >
        {inner}
      </button>
    );
  },
);
ThoughtChainItem.displayName = "ThoughtChainItem";
