import {
  forwardRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "./cn";

/**
 * Steps — wizard / progress indicator.
 *
 *   <Steps current={2}>
 *     <Step title="情報入力" description="5/14 09:22" />
 *     <Step title="確認" description="5/14 09:24" />
 *     <Step title="承認待ち" description="進行中" />
 *     <Step title="支払い" />
 *     <Step title="完了" />
 *   </Steps>
 *
 * Vocabulary (§23.B):
 *   - `orientation` — horizontal (default) | vertical
 *   - `current` (number) — active step index (0-based)
 *   - `color` per step — semantic role mapping (default/info/success/
 *     warning/destructive) instead of Ant's `status` enum
 *   - `title` / `description` / `icon` slots
 *
 * Reuses `.steps-h` (horizontal) and `.steps-v` (vertical) CSS atoms
 * from `shell.css` — both ported from the dxs-kintai design canon
 * (Card section F6 + branching timeline F8).
 */

export type StepsOrientation = "horizontal" | "vertical";
export type StepColor =
  | "default"
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "destructive";

export interface StepsProps extends Omit<ComponentProps<"ol">, "color"> {
  orientation?: StepsOrientation;
  /** Zero-based index of the current (in-progress) step. */
  current?: number;
}

export interface StepProps extends Omit<ComponentProps<"li">, "color" | "title"> {
  title?: ReactNode;
  description?: ReactNode;
  /** Override icon for the node (default: index number or check). */
  icon?: ReactNode;
  /** Override color for the node (default: derived from current/done state). */
  color?: StepColor;
}

interface InternalStepProps extends StepProps {
  __index?: number;
  __current?: number;
  __orientation?: StepsOrientation;
}

const CheckIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps(
  { orientation = "horizontal", current = 0, className, children, ...rest },
  ref,
) {
  const childArray = Array.isArray(children) ? children : [children];
  const wrapper = orientation === "vertical" ? "steps-v" : "steps-h";
  return (
    <ol
      ref={ref}
      className={cn(wrapper, className)}
      data-orientation={orientation}
      aria-orientation={orientation}
      {...rest}
    >
      {childArray.map((child, i) => {
        if (!child || typeof child !== "object" || !("props" in child)) {
          return child;
        }
        // Inject index + current + orientation into Step children.
        return {
          ...child,
          props: {
            ...(child as { props: InternalStepProps }).props,
            __index: i,
            __current: current,
            __orientation: orientation,
          },
        } as ReactNode;
      })}
    </ol>
  );
});

export const Step = forwardRef<HTMLLIElement, StepProps>(function Step(
  rawProps,
  ref,
) {
  const {
    title,
    description,
    icon,
    color,
    className,
    children,
    __index,
    __current,
    __orientation,
    ...rest
  } = rawProps as InternalStepProps;
  const index = __index ?? 0;
  const current = __current ?? 0;
  const orientation = __orientation ?? "horizontal";

  const stateClass =
    index < current
      ? "done"
      : index === current
        ? "cur"
        : "dis";

  if (orientation === "vertical") {
    return (
      <li
        ref={ref}
        className={cn("step", stateClass, className)}
        aria-current={stateClass === "cur" ? "step" : undefined}
        {...rest}
      >
        <span className="node">
          {icon ?? (stateClass === "done" ? <CheckIcon /> : index + 1)}
        </span>
        <div className="step-body">
          {title && <div className="lbl">{title}</div>}
          {description && <div className="desc">{description}</div>}
          {children}
        </div>
      </li>
    );
  }

  // Horizontal — matches the `.steps-h .step` shape from Card F6.
  return (
    <li
      ref={ref}
      className={cn("step", stateClass, className)}
      aria-current={stateClass === "cur" ? "step" : undefined}
      {...rest}
    >
      <span className="node">
        {icon ?? (stateClass === "done" ? <CheckIcon /> : index + 1)}
      </span>
      {title && <span className="lbl">{title}</span>}
      {description && <span className="sub">{description}</span>}
      {children}
    </li>
  );
});
