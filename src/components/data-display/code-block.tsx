import * as React from "react";

import { cn } from "../../lib/utils";
import type { CodeBlockProp } from "../../props/components/data-display.prop";

export type { CodeBlockProp, CodeBlockProp as CodeBlockProps };

export const CodeBlock = React.forwardRef<
  HTMLPreElement,
  CodeBlockProp & Omit<React.ComponentPropsWithoutRef<"pre">, keyof CodeBlockProp>
>(function CodeBlock(
  { children, wrap = true, maxHeight = "none", size = "sm", language, className, ...rest },
  ref,
) {
  // A block that can scroll must be reachable from the keyboard (WCAG 2.1.1).
  const scrolls = maxHeight !== "none" || !wrap;
  return (
    <pre
      ref={ref}
      data-slot="code-block"
      data-wrap={wrap ? undefined : "false"}
      data-max-height={maxHeight === "none" ? undefined : maxHeight}
      data-size={size === "sm" ? undefined : size}
      data-language={language}
      tabIndex={scrolls ? 0 : undefined}
      className={cn("ui-code-block", className)}
      {...rest}
    >
      <code>{children}</code>
    </pre>
  );
});
