import type { ComponentProps, ReactNode } from "react"
import { cn } from "../cn"

export interface DescriptionsOption {
  label: ReactNode
  value: ReactNode
  span?: number
  className?: string
}

export interface DescriptionsProps extends Omit<ComponentProps<"div">, "title"> {
  title?: ReactNode
  extra?: ReactNode
  items: DescriptionsOption[]
  column?: number
  layout?: "horizontal" | "vertical"
  bordered?: boolean
  size?: "small" | "default" | "large"
}

const SIZE_CLASS: Record<NonNullable<DescriptionsProps["size"]>, string> = {
  small: "descriptions-size-small",
  default: "",
  large: "descriptions-size-large",
}

export function Descriptions({
  title,
  extra,
  items,
  column = 3,
  layout = "horizontal",
  bordered = false,
  size = "default",
  className,
  style,
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
        {items.map((item, index) => (
          <div
            key={`${String(item.label)}-${index}`}
            className={cn("descriptions-item", item.className)}
            style={{ gridColumn: `span ${item.span ?? 1}` }}
          >
            <div className="descriptions-item-label">{item.label}</div>
            <div className="descriptions-item-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
