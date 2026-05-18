import { forwardRef, type ComponentProps, type ReactNode } from "react"
import { cn } from "../cn"

export type StepsOrientation = "horizontal" | "vertical"

export interface StepsItem {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  content?: ReactNode
  className?: string
}

export interface StepsProps extends Omit<ComponentProps<"ol">, "children" | "color"> {
  items: StepsItem[]
  orientation?: StepsOrientation
  current?: number
}

const CheckIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps(
  { items, orientation = "horizontal", current = 0, className, ...rest },
  ref,
) {
  const wrapper = orientation === "vertical" ? "steps-v" : "steps-h"
  return (
    <ol
      ref={ref}
      className={cn(wrapper, className)}
      data-orientation={orientation}
      aria-orientation={orientation}
      {...rest}
    >
      {items.map((item, index) => {
        const stateClass =
          index < current ? "done" : index === current ? "cur" : "dis"

        return (
          <li
            key={`${String(item.title ?? "step")}-${index}`}
            className={cn("step", stateClass, item.className)}
            aria-current={stateClass === "cur" ? "step" : undefined}
          >
            <span className="node">
              {item.icon ?? (stateClass === "done" ? <CheckIcon /> : index + 1)}
            </span>
            {orientation === "vertical" ? (
              <div className="step-body">
                {item.title && <div className="lbl">{item.title}</div>}
                {item.description && <div className="desc">{item.description}</div>}
                {item.content}
              </div>
            ) : (
              <>
                {item.title && <span className="lbl">{item.title}</span>}
                {item.description && <span className="sub">{item.description}</span>}
                {item.content}
              </>
            )}
          </li>
        )
      })}
    </ol>
  )
})
