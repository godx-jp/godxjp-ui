import * as React from "react";
import { Check, Copy, MoreHorizontal, ThumbsDown, ThumbsUp, TriangleAlert } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../feedback/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../navigation/dropdown-menu";
import { Button } from "./button";
import { VisuallyHidden } from "./visually-hidden";

import type {
  ActionsCopyProp,
  ActionsFeedbackProp,
  ActionsItemProp,
  ActionsItemsProp,
  ActionsProp,
} from "../../props/components/general.prop";

export type {
  ActionsProp,
  ActionsProp as ActionsProps,
  ActionsItemsProp,
  ActionsItemProp,
  ActionsItemProp as ActionsItemProps,
  ActionsCopyProp,
  ActionsCopyProp as ActionsCopyProps,
  ActionsFeedbackProp,
  ActionsFeedbackProp as ActionsFeedbackProps,
  ActionsVariantProp,
  ActionsStatusProp,
  ActionsFeedbackValueProp,
} from "../../props/components/general.prop";

/**
 * Direction at the STRIP. An assistant answering in Arabic inside an otherwise LTR admin still
 * reads its own action row right to left, so "the next action" is resolved here, not at the root.
 */
function isRtl(element: HTMLElement | null): boolean {
  return element?.closest("[dir]")?.getAttribute("dir")?.toLowerCase() === "rtl";
}

/** An icon-only control with its label on BOTH channels — `aria-label` and a tooltip. */
function LabelledIconButton({
  label,
  children,
  ...props
}: { label: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" size="icon-sm" variant="ghost" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Actions — the strip of actions under an assistant message (Ant Design X `Actions`).
 *
 * ## What Ant X ships, measured
 *
 * `@ant-design/x@2.9.0`, `es/actions/Item.js`: each action is
 * `<div className="…-item" onClick>` wrapping `<div className="…-icon">{item.icon}</div>`, with
 * the label supplied only as a `Tooltip` title. Three consequences, all of them defects rather
 * than choices: the strip cannot be reached by keyboard at all, the actions have no accessible
 * name, and on a touch device — where `useMobile()` drops the Tooltip entirely — they have no
 * visible name either.
 *
 * ## What this port does about it, while keeping the API
 *
 * `items`, `onClick({ item, key, keyPath, domEvent })`, `onItemClick` winning over `onClick`,
 * `danger`, `subItems`, `actionRender`, `variant`, `fadeIn` / `fadeInLeft` — all Ant's, with Ant's
 * semantics. What changes is what they render onto: a real `Button` per action carrying `label` as
 * its accessible name AND its tooltip, inside a WAI-ARIA APG **Toolbar** — one tab stop for the
 * whole strip, the logical arrows moving between the actions, `Home` / `End` at its ends. That is
 * the same trade `Conversations` makes and for the same reason: a strip of eight actions under
 * every message would otherwise be eight tab stops between the reader and the next message.
 */
export const Actions = React.forwardRef<HTMLDivElement, ActionsProp>(
  (
    { items, onClick, variant = "borderless", fadeIn, fadeInLeft, label, id, className, ...rest },
    ref,
  ) => {
    const { t } = useTranslation();
    const nodes = React.useRef(new Map<string, HTMLElement>());
    const [focusKey, setFocusKey] = React.useState<string | null>(null);

    /* Only the actions this component RENDERS join the roving order. An `actionRender` item hands
     * back an arbitrary node whose focusables this strip cannot know about, so it is left to own
     * itself rather than being given a tabIndex it might not be able to carry. */
    const navKeys = items.filter((item) => !item.actionRender).map((item) => item.key);
    const tabStop = focusKey && navKeys.includes(focusKey) ? focusKey : navKeys[0];

    const moveTo = (key: string | undefined) => {
      if (!key) return;
      setFocusKey(key);
      nodes.current.get(key)?.focus();
    };

    const handleKeyDown = (key: string) => (event: React.KeyboardEvent<HTMLElement>) => {
      const rtl = isRtl(event.currentTarget);
      const forward = rtl ? "ArrowLeft" : "ArrowRight";
      const backward = rtl ? "ArrowRight" : "ArrowLeft";
      const index = navKeys.indexOf(key);
      if (event.key === forward) {
        event.preventDefault();
        moveTo(navKeys[(index + 1) % navKeys.length]);
      } else if (event.key === backward) {
        event.preventDefault();
        moveTo(navKeys[(index - 1 + navKeys.length) % navKeys.length]);
      } else if (event.key === "Home") {
        event.preventDefault();
        moveTo(navKeys[0]);
      } else if (event.key === "End") {
        event.preventDefault();
        moveTo(navKeys[navKeys.length - 1]);
      }
    };

    /** Ant X's dispatch order: a per-item handler WINS, and `onClick` never also fires. */
    const dispatch = (
      item: ActionsItemsProp,
      keyPath: string[],
      domEvent: React.MouseEvent<HTMLElement>,
    ) => {
      if (item.onItemClick) {
        item.onItemClick(item);
        return;
      }
      onClick?.({ item, key: keyPath[0], keyPath, domEvent });
    };

    return (
      <div
        ref={ref}
        id={id}
        role="toolbar"
        aria-label={label ?? t("general.actions.label")}
        aria-orientation="horizontal"
        data-slot="actions"
        data-variant={variant}
        data-fade-in={fadeIn || fadeInLeft ? "" : undefined}
        data-fade-in-inline={fadeInLeft ? "" : undefined}
        className={cn("ui-actions", className)}
        {...rest}
      >
        {items.map((item) => {
          if (item.actionRender) {
            return (
              <React.Fragment key={item.key}>
                {typeof item.actionRender === "function"
                  ? item.actionRender(item)
                  : item.actionRender}
              </React.Fragment>
            );
          }

          const name = item.label ?? item.key;
          const shared = {
            ref: (node: HTMLElement | null) => {
              if (node) nodes.current.set(item.key, node);
              else nodes.current.delete(item.key);
            },
            tabIndex: tabStop === item.key ? 0 : -1,
            onFocus: () => setFocusKey(item.key),
            onKeyDown: handleKeyDown(item.key),
            variant: item.danger ? ("destructive" as const) : ("ghost" as const),
          };

          if (item.subItems && item.subItems.length > 0) {
            return (
              <DropdownMenu key={item.key}>
                <DropdownMenuTrigger asChild>
                  <Button type="button" size="icon-sm" aria-label={name} {...shared}>
                    {item.icon ?? <MoreHorizontal aria-hidden="true" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {item.subItems.map((sub) => (
                    <DropdownMenuItem
                      key={sub.key}
                      variant={sub.danger ? "destructive" : undefined}
                      onSelect={(event) =>
                        dispatch(
                          sub as ActionsItemsProp,
                          [sub.key, item.key],
                          event as unknown as React.MouseEvent<HTMLElement>,
                        )
                      }
                    >
                      {sub.icon}
                      {sub.label ?? sub.key}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <LabelledIconButton
              key={item.key}
              label={name}
              onClick={(event) => dispatch(item, [item.key], event)}
              {...shared}
            >
              {item.icon}
            </LabelledIconButton>
          );
        })}
      </div>
    );
  },
);
Actions.displayName = "Actions";

/**
 * ActionsItem — one status-aware action (Ant Design X `Actions.Item`).
 *
 * It is a NAMED export rather than `Actions.Item`, because this library has no compound-static
 * convention: `CardHeader`, `TabsList` and `DropdownMenuItem` are all separate exports, and one
 * component attaching statics would be the only one of its kind.
 *
 * The status table is Ant's, from `es/actions/ActionsItem.js`: `loading` and `error` bring their
 * own glyph, `running` takes `runningIcon`, anything else takes `defaultIcon`. What is added is
 * that the status is ANNOUNCED — `aria-busy` while loading, and the state in the accessible name —
 * because a glyph swap is a colour-and-shape-only signal (WCAG 1.4.1).
 */
export const ActionsItem = React.forwardRef<HTMLButtonElement, ActionsItemProp>(
  ({ status = "default", defaultIcon, runningIcon, label, id, className, ...rest }, ref) => {
    const { t } = useTranslation();
    /* The NAME is computed before the glyph, and deliberately so: the status is information, and
     * a glyph swap alone is a shape-only signal (WCAG 1.4.1). Reading it first keeps the two in
     * one place and makes it obvious that no branch below can produce an unnamed button. */
    const base = label ?? t("general.actions.label");
    const name = status === "default" ? base : `${base} · ${t(`general.actions.status.${status}`)}`;

    const glyph =
      status === "loading" ? null : status === "error" ? (
        <TriangleAlert aria-hidden="true" />
      ) : status === "running" ? (
        (runningIcon ?? defaultIcon)
      ) : (
        defaultIcon
      );

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            id={id}
            type="button"
            size="icon-sm"
            variant="ghost"
            data-slot="actions-item"
            data-status={status}
            aria-label={name}
            aria-busy={status === "loading" || undefined}
            loading={status === "loading"}
            className={cn("ui-actions-item", className)}
            {...rest}
          >
            {glyph}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>
    );
  },
);
ActionsItem.displayName = "ActionsItem";

/**
 * ActionsCopy — copy the message to the clipboard (Ant Design X `Actions.Copy`).
 *
 * Ant X hands this to antd's `Typography copyable`, which swaps the glyph to a tick for 3s. The
 * tick is reproduced at the same 3s, and the change is also SPOKEN through a polite status region:
 * a glyph that only changes shape tells a screen-reader user nothing about whether the copy
 * worked, which is the one thing this control exists to report.
 */
export const ActionsCopy = React.forwardRef<HTMLButtonElement, ActionsCopyProp>(
  ({ text = "", icon, label, onCopy, id, className, ...rest }, ref) => {
    const { t } = useTranslation();
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    React.useEffect(() => () => clearTimeout(timer.current), []);

    const name = label ?? t("general.actions.copy");

    const run = async () => {
      try {
        await navigator.clipboard?.writeText(text);
      } catch {
        // A denied clipboard permission is not an error the reader can act on, and Ant X reports
        // nothing either; the tick simply does not appear.
        return;
      }
      onCopy?.(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 3000);
    };

    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={ref}
              id={id}
              type="button"
              size="icon-sm"
              variant="ghost"
              data-slot="actions-copy"
              data-copied={copied ? "" : undefined}
              aria-label={name}
              className={cn("ui-actions-copy", className)}
              onClick={run}
              {...rest}
            >
              {copied ? <Check aria-hidden="true" /> : (icon ?? <Copy aria-hidden="true" />)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{name}</TooltipContent>
        </Tooltip>
        <VisuallyHidden role="status" aria-live="polite">
          {copied ? t("general.actions.copied") : ""}
        </VisuallyHidden>
      </>
    );
  },
);
ActionsCopy.displayName = "ActionsCopy";

/**
 * ActionsFeedback — the like / dislike pair (Ant Design X `Actions.Feedback`).
 *
 * `value` / `onChange` and the clear-on-second-click behaviour are Ant's, byte for byte. ONE
 * rendering difference, and it is deliberate: Ant hides the opposite button once an opinion is
 * recorded (`[default, like].includes(value) && likeNode`), so a reader who mis-clicked "dislike"
 * finds no "like" button on the screen at all and has to guess that clicking dislike again brings
 * it back. Both buttons stay here, and the recorded opinion is carried by `aria-pressed` — the APG
 * toggle-button pattern, which states the value instead of removing its alternative.
 */
export const ActionsFeedback = React.forwardRef<HTMLDivElement, ActionsFeedbackProp>(
  (
    { value = "default", onChange, label, likeLabel, dislikeLabel, id, className, ...rest },
    ref,
  ) => {
    const { t } = useTranslation();
    const toggle = (next: "like" | "dislike") => onChange?.(value === next ? "default" : next);

    return (
      <div
        ref={ref}
        id={id}
        role="group"
        aria-label={label ?? t("general.actions.feedback")}
        data-slot="actions-feedback"
        className={cn("ui-actions-feedback", className)}
        {...rest}
      >
        <LabelledIconButton
          label={likeLabel ?? t("general.actions.like")}
          aria-pressed={value === "like"}
          data-pressed={value === "like" ? "" : undefined}
          onClick={() => toggle("like")}
        >
          <ThumbsUp aria-hidden="true" />
        </LabelledIconButton>
        <LabelledIconButton
          label={dislikeLabel ?? t("general.actions.dislike")}
          aria-pressed={value === "dislike"}
          data-pressed={value === "dislike" ? "" : undefined}
          onClick={() => toggle("dislike")}
        >
          <ThumbsDown aria-hidden="true" />
        </LabelledIconButton>
      </div>
    );
  },
);
ActionsFeedback.displayName = "ActionsFeedback";
