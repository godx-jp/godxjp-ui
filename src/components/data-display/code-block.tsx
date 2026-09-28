import * as React from "react";
import { Check, Copy, LoaderCircle } from "lucide-react";

import { useTranslation } from "../../i18n/use-translation";
import { cn } from "../../lib/utils";
import type { CodeBlockProp } from "../../props/components/data-display.prop";
import type { TypographyCopyConfigProp } from "../../props/vocabulary";
import { Button } from "../general/button";
import {
  ActionTooltip,
  COPIED_RESET_MS,
  getNode,
  toCopyConfigList,
  useMergedConfig,
  writeClipboard,
} from "../general/typography";

export type { CodeBlockProp, CodeBlockProp as CodeBlockProps };

/**
 * The copy button, its tooltip and its live region — a separate component so a plain block keeps
 * no copy state and reads no locale.
 */
function CodeBlockCopy({
  config,
  codeRef,
}: {
  config: TypographyCopyConfigProp;
  codeRef: React.RefObject<HTMLElement | null>;
}) {
  const { t } = useTranslation();
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
    setCopyLoading(true);
    try {
      const configured = typeof config.text === "function" ? await config.text() : config.text;
      // The block's TEXT CONTENT, not its children: highlighter spans are elements, and copying
      // them must yield the code, not an empty string.
      await writeClipboard(configured || codeRef.current?.textContent || "", config.format);
      setCopyLoading(false);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
      config.onCopy?.(event);
    } catch {
      // Clipboard refused — never claim a copy that did not happen (Typography, CredentialReveal).
      setCopyLoading(false);
    }
  };

  const copyLabels = toCopyConfigList(config.tooltips);
  const copyIcons = toCopyConfigList(config.icon);
  const systemCopyLabel = copied ? t("ui.codeBlock.copied") : t("ui.codeBlock.copy");
  const copyTitle = getNode(copyLabels[copied ? 1 : 0], systemCopyLabel);
  const copyAriaLabel = typeof copyTitle === "string" ? copyTitle : systemCopyLabel;

  return (
    <>
      <ActionTooltip title={copyTitle}>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          data-slot="code-block-copy"
          data-state={copied ? "copied" : "idle"}
          aria-label={copyAriaLabel}
          tabIndex={config.tabIndex}
          onClick={onCopyClick}
          className="ui-code-block-copy"
        >
          {copied
            ? getNode(copyIcons[1], <Check aria-hidden="true" />, true)
            : getNode(
                copyIcons[0],
                copyLoading ? <LoaderCircle aria-hidden="true" /> : <Copy aria-hidden="true" />,
                true,
              )}
        </Button>
      </ActionTooltip>
      <span aria-live="polite" className="sr-only" data-slot="code-block-status">
        {copied ? t("ui.codeBlock.copiedAnnounce") : ""}
      </span>
    </>
  );
}

export const CodeBlock = React.forwardRef<
  HTMLPreElement,
  CodeBlockProp & Omit<React.ComponentPropsWithoutRef<"pre">, keyof CodeBlockProp>
>(function CodeBlock(
  {
    children,
    wrap = true,
    maxHeight = "none",
    size = "sm",
    language,
    copyable,
    className,
    style,
    ...rest
  },
  ref,
) {
  // antd `Typography` copyable, the same machinery: `true` = defaults, an object = overrides.
  const [enableCopy, copyConfig] = useMergedConfig<TypographyCopyConfigProp>(copyable);
  const codeRef = React.useRef<HTMLElement>(null);

  // A block that can scroll must be reachable from the keyboard (WCAG 2.1.1).
  const scrolls = maxHeight !== "none" || !wrap;
  const pre = (
    <pre
      ref={ref}
      data-slot="code-block"
      data-wrap={wrap ? undefined : "false"}
      data-max-height={
        typeof maxHeight === "string" && maxHeight !== "none" ? maxHeight : undefined
      }
      data-copyable={enableCopy ? "" : undefined}
      style={{
        ...style,
        ...(typeof maxHeight === "object"
          ? { maxBlockSize: maxHeight.value, overflow: "auto" }
          : undefined),
      }}
      data-size={size === "sm" ? undefined : size}
      data-language={language}
      tabIndex={scrolls ? 0 : undefined}
      className={cn("ui-code-block", className)}
      {...rest}
    >
      <code ref={codeRef}>{children}</code>
    </pre>
  );

  if (!enableCopy) return pre;

  // The button is a SIBLING of the `pre`, pinned to the frame's inline-end corner, so it stays put
  // while the block scrolls; the `pre` reserves that column (`data-copyable`) so no line runs under it.
  return (
    <div data-slot="code-block-frame" className="ui-code-block-frame">
      {pre}
      <CodeBlockCopy config={copyConfig} codeRef={codeRef} />
    </div>
  );
});
