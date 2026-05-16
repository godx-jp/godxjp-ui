import { forwardRef } from "react"
import type { HTMLAttributes } from "react"
import { cn } from "./cn"

// Skeleton — loading placeholder atom.
//
// Renders the canonical `.skeleton` class from tokens.css
// (animate-skeleton + muted background). Use in place of any
// content that is loading from the network. Works at any size;
// set w-* and h-* via className.
//
// @example
//   <Skeleton className="h-8 w-36 rounded-md" />
//   <Skeleton className="h-4 w-full" />

export type SkeletonProps = HTMLAttributes<HTMLDivElement>

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn("skeleton", className)}
      {...props}
    />
  ),
)
Skeleton.displayName = "Skeleton"
