import { useCallback, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../cn";

/**
 * Collapse — accordion-style expandable panel group.
 *
 * Small uncontrolled-friendly implementation (Radix Accordion is not
 * in the locked stack today; if it is added later, swap the internals
 * without touching the public API). Prop vocabulary follows cardinal
 * rule 23 §B: `value` / `defaultValue` / `onValueChange` for
 * expansion state, `multiple` boolean, `variant` for visual treatment,
 * `size` for dimensional scale. NEVER `activeKey` / `accordion` /
 * `bordered`.
 *
 */

type CollapseValue = string | string[] | undefined;

function normalize(value: CollapseValue, multiple: boolean): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return multiple ? value : value.slice(0, 1);
  return [value];
}

export interface CollapseItem {
  value: string;
  title: ReactNode;
  extra?: ReactNode;
  disabled?: boolean;
  content?: ReactNode;
}

export interface CollapseProps {
  /** Expanded panel key(s). String for single, string[] for multi. */
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  /** Allow multiple panels open simultaneously. Default false. */
  multiple?: boolean;
  /** Visual treatment. Default "default". */
  variant?: "default" | "ghost" | "outlined";
  /** Dimensional scale. Default "default". */
  size?: "small" | "default" | "large";
  /** Disable every panel. */
  disabled?: boolean;
  items: CollapseItem[];
  className?: string;
}

export function Collapse({
  value: controlled,
  defaultValue,
  onValueChange,
  multiple = false,
  variant = "default",
  size = "default",
  disabled = false,
  items,
  className,
}: CollapseProps) {
  const [internal, setInternal] = useState<string[]>(
    normalize(defaultValue, multiple),
  );
  const expanded =
    controlled !== undefined ? normalize(controlled, multiple) : internal;

  const toggle = useCallback(
    (panelValue: string) => {
      if (disabled) return;
      let nextList: string[];
      if (expanded.includes(panelValue)) {
        nextList = expanded.filter((v) => v !== panelValue);
      } else if (multiple) {
        nextList = [...expanded, panelValue];
      } else {
        nextList = [panelValue];
      }
      if (controlled === undefined) setInternal(nextList);
      onValueChange?.(multiple ? nextList : (nextList[0] ?? ""));
    },
    [controlled, disabled, expanded, multiple, onValueChange],
  );

  return (
    <div
      className={cn(
        "collapse-root",
        `collapse-variant-${variant}`,
        `collapse-size-${size}`,
        className,
      )}
      data-disabled={disabled || undefined}
    >
      {items.map((item) => {
        const isOpen = expanded.includes(item.value);
        const isDisabled = disabled || item.disabled;
        return (
          <div
            key={item.value}
            className="collapse-panel"
            data-state={isOpen ? "open" : "closed"}
            data-disabled={isDisabled || undefined}
          >
            <button
              type="button"
              className="collapse-trigger"
              aria-expanded={isOpen}
              aria-controls={`collapse-content-${item.value}`}
              disabled={isDisabled}
              onClick={() => toggle(item.value)}
            >
              <ChevronRight className="collapse-chevron" size={14} aria-hidden />
              <span className="collapse-title">{item.title}</span>
              {item.extra !== undefined && <span className="collapse-extra">{item.extra}</span>}
            </button>
            {isOpen && (
              <div
                id={`collapse-content-${item.value}`}
                role="region"
                className="collapse-content"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
        </div>
  );
}
