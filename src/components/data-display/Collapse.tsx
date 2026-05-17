import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
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
 * @example
 *   <Collapse defaultValue="q1">
 *     <CollapsePanel value="q1" title="Question one">…</CollapsePanel>
 *     <CollapsePanel value="q2" title="Question two">…</CollapsePanel>
 *   </Collapse>
 */

type CollapseValue = string | string[] | undefined;

interface CollapseContext {
  expanded: string[];
  toggle: (value: string) => void;
  multiple: boolean;
  size: "small" | "default" | "large";
  disabled: boolean;
}

const CollapseCtx = createContext<CollapseContext | null>(null);

function useCollapseCtx(): CollapseContext {
  const ctx = useContext(CollapseCtx);
  if (!ctx)
    throw new Error("<CollapsePanel> must be rendered inside <Collapse>");
  return ctx;
}

function normalize(value: CollapseValue, multiple: boolean): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return multiple ? value : value.slice(0, 1);
  return [value];
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
  className?: string;
  children?: ReactNode;
}

export function Collapse({
  value: controlled,
  defaultValue,
  onValueChange,
  multiple = false,
  variant = "default",
  size = "default",
  disabled = false,
  className,
  children,
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
    <CollapseCtx.Provider
      value={{ expanded, toggle, multiple, size, disabled }}
    >
      <div
        className={cn(
          "collapse",
          `collapse-variant-${variant}`,
          `collapse-size-${size}`,
          className,
        )}
        data-disabled={disabled || undefined}
      >
        {Children.map(children, (child) =>
          isValidElement(child) ? child : null,
        )}
      </div>
    </CollapseCtx.Provider>
  );
}

export interface CollapsePanelProps {
  /** Panel key — referenced by `Collapse.value` / `defaultValue`. */
  value: string;
  /** Trigger label. */
  title: ReactNode;
  /** Right-aligned slot inside the trigger header. */
  extra?: ReactNode;
  /** Disable this panel only. */
  disabled?: boolean;
  children?: ReactNode;
}

export function CollapsePanel({
  value,
  title,
  extra,
  disabled: panelDisabled,
  children,
}: CollapsePanelProps) {
  const { expanded, toggle, disabled: rootDisabled } = useCollapseCtx();
  const isOpen = expanded.includes(value);
  const isDisabled = rootDisabled || panelDisabled;

  return (
    <div
      className="collapse-panel"
      data-state={isOpen ? "open" : "closed"}
      data-disabled={isDisabled || undefined}
    >
      <button
        type="button"
        className="collapse-trigger"
        aria-expanded={isOpen}
        aria-controls={`collapse-content-${value}`}
        disabled={isDisabled}
        onClick={() => toggle(value)}
      >
        <ChevronRight className="collapse-chevron" size={14} aria-hidden />
        <span className="collapse-title">{title}</span>
        {extra !== undefined && <span className="collapse-extra">{extra}</span>}
      </button>
      {isOpen && (
        <div
          id={`collapse-content-${value}`}
          role="region"
          className="collapse-content"
        >
          {children}
        </div>
      )}
    </div>
  );
}
