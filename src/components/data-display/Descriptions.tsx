import type { ComponentProps, ReactNode } from "react";
import { cn } from "../cn";

/**
 * Descriptions — Ant-Design label/value table for static info.
 *
 *   <Descriptions title="User info" column={2}>
 *     <Descriptions.Item label="Name">Yuki Tanaka</Descriptions.Item>
 *     <Descriptions.Item label="Email">yuki@example.com</Descriptions.Item>
 *     <Descriptions.Item label="Role" span={2}>Owner · Operations</Descriptions.Item>
 *   </Descriptions>
 */

export interface DescriptionsProps extends Omit<ComponentProps<"div">, "title"> {
  title?: ReactNode;
  extra?: ReactNode;
  /** Columns at default breakpoint (1..6). */
  column?: number;
  /** Layout — `horizontal` (default) puts label inline-left of value;
   * `vertical` stacks label above value. */
  layout?: "horizontal" | "vertical";
  /** Show outer + inner borders (Ant default `false`). */
  bordered?: boolean;
  /** Density step. */
  size?: "small" | "default" | "large";
  children?: ReactNode;
}

export interface DescriptionsItemProps extends ComponentProps<"div"> {
  label: ReactNode;
  /** Columns this item spans (1..column). */
  span?: number;
  children?: ReactNode;
}

const SIZE_CLASS: Record<NonNullable<DescriptionsProps["size"]>, string> = {
  small: "descriptions-size-small",
  default: "",
  large: "descriptions-size-large",
};

const Item = function DescriptionsItem({
  label,
  span = 1,
  className,
  children,
  ...rest
}: DescriptionsItemProps) {
  return (
    <div
      className={cn("descriptions-item", className)}
      style={{ gridColumn: `span ${span}` }}
      {...rest}
    >
      <div className="descriptions-item-label">{label}</div>
      <div className="descriptions-item-value">{children}</div>
    </div>
  );
};

function DescriptionsRoot({
  title,
  extra,
  column = 3,
  layout = "horizontal",
  bordered = false,
  size = "default",
  className,
  style,
  children,
  ...rest
}: DescriptionsProps) {
  return (
    <div
      className={cn(
        "descriptions",
        layout === "vertical" && "descriptions-vertical",
        bordered && "descriptions-bordered",
        SIZE_CLASS[size],
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${column}, minmax(0, 1fr))`,
        ...style,
      }}
      {...rest}
    >
      {(title !== undefined || extra !== undefined) && (
        <div className="descriptions-header">
          {title !== undefined && (
            <h3 className="descriptions-title">{title}</h3>
          )}
          {extra !== undefined && (
            <div className="descriptions-extra">{extra}</div>
          )}
        </div>
      )}
      <div
        className="descriptions-body"
        style={{
          gridTemplateColumns: `repeat(${column}, minmax(0, 1fr))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export const Descriptions = Object.assign(DescriptionsRoot, { Item });
