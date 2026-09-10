import * as React from "react";
import { ArrowDown } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { useMediaQuery } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import type {
  ChatBubbleListProp,
  ChatBubbleProp,
  ChatBubbleTypingProp,
  ChatBubbleToneProp,
} from "../../props/components/data-display.prop";
import type { SizeProp, TextSizeProp } from "../../props/vocabulary";
import { Skeleton } from "../feedback/skeleton";
import { Button } from "../general/button";
import { Text } from "../general/typography";
import { VisuallyHidden } from "../general/visually-hidden";
import { ScrollArea } from "./scroll-area";

export type {
  ChatBubbleListProp,
  ChatBubblePlacementProp,
  ChatBubbleProp,
  ChatBubbleToneProp,
  ChatBubbleTypingProp,
  ChatBubbleVariantProp,
  ChatMessageProp,
} from "../../props/components/data-display.prop";

/**
 * The bubble's type step rides the same ladder every other sized primitive uses (`Activity`,
 * `Badge`): `--font-size-sm` IS `--font-size-base`, so the four distinct steps below `xl` are
 * `2xs · xs · sm · lg` and the ladder skips the alias rather than repeating a size.
 */
const BODY_SIZE: Record<SizeProp, TextSizeProp> = {
  xs: "2xs",
  sm: "xs",
  md: "sm",
  lg: "lg",
};

/** The author line is always one step quieter than the body it names. */
const META_SIZE: Record<SizeProp, TextSizeProp> = {
  xs: "2xs",
  sm: "2xs",
  md: "xs",
  lg: "sm",
};

/** Ant Design X's own defaults: one character every 50ms. */
const TYPING_STEP = 1;
const TYPING_INTERVAL = 50;

function resolveTyping(typing: ChatBubbleTypingProp | undefined): {
  enabled: boolean;
  step: number;
  interval: number;
} {
  if (typing === undefined || typing === false) {
    return { enabled: false, step: TYPING_STEP, interval: TYPING_INTERVAL };
  }
  if (typing === true) return { enabled: true, step: TYPING_STEP, interval: TYPING_INTERVAL };
  return {
    enabled: true,
    // A non-positive step would never reach the end of the string and a non-positive interval
    // would spin the timer — both are "the animation never completes", which is the one outcome
    // a reader can neither read nor dismiss.
    step: typing.step != null && typing.step > 0 ? Math.floor(typing.step) : TYPING_STEP,
    interval: typing.interval != null && typing.interval > 0 ? typing.interval : TYPING_INTERVAL,
  };
}

/**
 * How many characters of `text` are revealed right now.
 *
 * When the animation is off — `typing` unset, a non-string body, or
 * `prefers-reduced-motion: reduce` — this is the WHOLE string from the very first render, with no
 * timer ever started. That is the accessible behaviour the roadmap requires (WCAG 2.2 SC 2.3.3):
 * reduced motion does not mean "animate faster", it means the text is simply there.
 */
function useRevealedLength(
  text: string | undefined,
  enabled: boolean,
  step: number,
  interval: number,
): number {
  const full = text?.length ?? 0;
  const [revealed, setRevealed] = React.useState(() => (enabled ? 0 : full));

  React.useEffect(() => {
    if (!enabled || text === undefined) {
      setRevealed(text?.length ?? 0);
      return undefined;
    }
    setRevealed(0);
    let shown = 0;
    const timer = setInterval(() => {
      shown = Math.min(text.length, shown + step);
      setRevealed(shown);
      if (shown >= text.length) clearInterval(timer);
    }, interval);
    return () => {
      clearInterval(timer);
    };
  }, [text, enabled, step, interval]);

  return Math.min(revealed, full);
}

/** The i18n key carrying the word for a status tone. `default` has no word — it is not a status. */
const TONE_KEY: Record<Exclude<ChatBubbleToneProp, "default">, string> = {
  info: "chat.bubble.tone.info",
  success: "chat.bubble.tone.success",
  warning: "chat.bubble.tone.warning",
  destructive: "chat.bubble.tone.destructive",
};

export type ChatBubbleProps = ChatBubbleProp &
  Omit<React.HTMLAttributes<HTMLElement>, keyof ChatBubbleProp>;

/**
 * ChatBubble — ONE message in a conversation: an optional author mark, a header naming the turn,
 * the message body, and a footer for timestamps or per-message actions.
 *
 * It is an `<article>` inside the feed's `role="log"`, and it deliberately owns NO live region of
 * its own: one live region per bubble floods a screen reader on every token of a stream. The feed
 * (`ChatBubbleList`) owns the single `aria-live="polite"` region; a bubble only ever says "I am
 * still being produced" through `aria-busy`.
 */
export const ChatBubble = React.forwardRef<HTMLElement, ChatBubbleProps>(
  (
    {
      children,
      placement = "start",
      variant = "filled",
      avatar,
      header,
      footer,
      loading = false,
      typing,
      size = "md",
      tone = "default",
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const generatedId = React.useId();
    const headerId = `${id ?? generatedId}-header`;
    const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

    // Only a plain string has characters to reveal. A ReactNode body renders whole, always.
    const text = typeof children === "string" ? children : undefined;
    const { enabled, step, interval } = resolveTyping(typing);
    const animates = enabled && !loading && text !== undefined && !reduceMotion;
    const revealed = useRevealedLength(text, animates, step, interval);
    const streaming = animates && revealed < (text?.length ?? 0);

    const body = loading ? (
      <>
        {/* The bars are decorative: `aria-busy` on the article and the localized line below are
            what a screen reader needs, and Skeleton carries an aria-live of its own that must not
            become a second live region inside the feed's. */}
        <div className="ui-chat-bubble-skeleton" aria-hidden="true">
          <Skeleton className="ui-chat-bubble-skeleton-line" />
          <Skeleton className="ui-chat-bubble-skeleton-line ui-chat-bubble-skeleton-line--short" />
        </div>
        <VisuallyHidden>{t("chat.bubble.loading")}</VisuallyHidden>
      </>
    ) : streaming ? (
      <>
        <Text as="div" size={BODY_SIZE[size]} whitespace="pre-wrap" aria-hidden="true">
          {text?.slice(0, revealed)}
          <span className="ui-chat-bubble-caret" />
        </Text>
        {/* The state has a TEXT equivalent, not just a moving caret (WCAG 1.4.1 / 4.1.2). The
            finished message is announced once when it replaces this, as an addition to the log. */}
        <VisuallyHidden>{t("chat.bubble.typing")}</VisuallyHidden>
      </>
    ) : (
      <Text
        as="div"
        size={BODY_SIZE[size]}
        whitespace={text !== undefined ? "pre-wrap" : undefined}
      >
        {children}
      </Text>
    );

    return (
      <article
        ref={ref}
        id={id}
        data-slot="chat-bubble"
        data-placement={placement}
        data-variant={variant}
        data-size={size}
        data-tone={tone}
        aria-busy={loading || streaming ? true : undefined}
        aria-labelledby={header != null ? headerId : undefined}
        className={cn("ui-chat-bubble", className)}
        {...props}
      >
        {avatar != null ? (
          <span data-slot="chat-bubble-avatar" className="ui-chat-bubble-avatar">
            {avatar}
          </span>
        ) : null}
        <div data-slot="chat-bubble-column" className="ui-chat-bubble-column">
          {header != null ? (
            <Text
              as="div"
              id={headerId}
              className="ui-chat-bubble-header"
              size={META_SIZE[size]}
              tone="muted"
              weight="medium"
            >
              {header}
            </Text>
          ) : null}
          <div data-slot="chat-bubble-body" className="ui-chat-bubble-body">
            {/* A tone is a STATUS, and a status carried by colour alone is not carried at all. */}
            {tone !== "default" ? <VisuallyHidden>{t(TONE_KEY[tone])}</VisuallyHidden> : null}
            {body}
          </div>
          {footer != null ? (
            <Text as="div" className="ui-chat-bubble-footer" size={META_SIZE[size]} tone="muted">
              {footer}
            </Text>
          ) : null}
        </div>
      </article>
    );
  },
);
ChatBubble.displayName = "ChatBubble";

export type ChatBubbleListProps = ChatBubbleListProp &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof ChatBubbleListProp>;

/**
 * ChatBubbleList — the message feed.
 *
 * The behaviour that earns this a component rather than a `ScrollArea` + `map` is STICK-TO-BOTTOM:
 * new messages keep the viewport pinned only while the reader is ALREADY at the bottom. The moment
 * they scroll up to re-read something the pin is revoked and stays revoked until they ask for it
 * back — silently yanking a reader to the newest message mid-sentence is a change of context they
 * did not request (WCAG 3.2.5), and it is the classic chat-UI defect. The way back is a real,
 * focusable button that also says how many messages arrived while they were away.
 *
 * GIVE IT A DEFINITE HEIGHT — `className="h-96"`, or a flex/grid parent that hands it a track.
 * The feed scrolls INSIDE itself; with no height it simply grows to its content, nothing ever
 * overflows, and every behaviour above has nothing to act on.
 */
export const ChatBubbleList = React.forwardRef<HTMLDivElement, ChatBubbleListProps>(
  ({ items, roles, autoScroll = true, label, className, id, ...props }, ref) => {
    const { t } = useTranslation();
    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const [anchored, setAnchored] = React.useState(true);

    // How long the feed was when the reader last WAS at the bottom. Everything after that arrived
    // while they were reading history, and is what the affordance counts.
    const seen = React.useRef(items.length);
    React.useEffect(() => {
      if (anchored) seen.current = items.length;
    }, [anchored, items.length]);
    const pending = anchored ? 0 : Math.max(0, items.length - seen.current);

    const jumpToLatest = React.useCallback(() => {
      const viewport = viewportRef.current;
      if (viewport) {
        const bottom = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        // Never animated: a theme's `scroll-behavior: smooth` would otherwise ride the reader
        // down the page (WCAG 2.3.3).
        if (typeof viewport.scrollTo === "function") {
          viewport.scrollTo({ top: bottom, behavior: "instant" });
        } else {
          viewport.scrollTop = bottom;
        }
      }
      setAnchored(true);
    }, []);

    return (
      <div
        ref={ref}
        id={id}
        data-slot="chat-bubble-list"
        data-anchored={anchored ? "" : undefined}
        className={cn("ui-chat-bubble-list", className)}
        {...props}
      >
        <ScrollArea
          className="ui-chat-bubble-list-scroller"
          anchor={autoScroll ? "bottom" : "none"}
          viewportRef={viewportRef}
          onAnchoredChange={setAnchored}
        >
          {/* ONE live region for the whole feed. `log` announces ADDITIONS, which is exactly the
              newest message — and why a streaming bubble hides its half-typed text from the
              accessibility tree until it is finished. */}
          <div
            role="log"
            aria-live="polite"
            aria-label={label ?? t("chat.list.label")}
            data-slot="chat-bubble-list-feed"
            className="ui-chat-bubble-list-feed"
          >
            {items.map(({ id: messageId, role, content, ...message }) => (
              <ChatBubble
                key={messageId}
                id={messageId}
                {...(role != null ? roles?.[role] : undefined)}
                {...message}
              >
                {content}
              </ChatBubble>
            ))}
          </div>
        </ScrollArea>
        {/* Rendered OUTSIDE the log so its own appearance is never announced as a new message. */}
        {anchored ? null : (
          <div data-slot="chat-bubble-list-jump" className="ui-chat-bubble-list-jump">
            <Button type="button" size="sm" variant="secondary" shape="pill" onClick={jumpToLatest}>
              <ArrowDown aria-hidden="true" />
              {pending > 0
                ? t("chat.list.newMessages", { count: pending })
                : t("chat.list.jumpToLatest")}
            </Button>
          </div>
        )}
      </div>
    );
  },
);
ChatBubbleList.displayName = "ChatBubbleList";
