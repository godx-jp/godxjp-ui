import type { ComponentProps, ReactNode } from "react"
import { cn } from "./cn"

/**
 * Card — surface container for grouped content.
 *
 * The atom hierarchy mirrors the `.card`/`.card-header`/`.card-title`
 * classes in tokens.css. Compose as:
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Pull requests</CardTitle>
 *       <CardSubtitle>Open / merged this week</CardSubtitle>
 *     </CardHeader>
 *     <CardContent>...</CardContent>
 *   </Card>
 */
export function Card({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("card", className)} {...rest} />
}

export function CardHeader({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("card-header", className)} {...rest} />
}

export function CardTitle({ className, ...rest }: ComponentProps<"h3">) {
  return <h3 className={cn("card-title", className)} {...rest} />
}

export interface CardSubtitleProps extends ComponentProps<"p"> {
  children?: ReactNode
}

export function CardSubtitle({ className, ...rest }: CardSubtitleProps) {
  return <p className={cn("card-subtitle", className)} {...rest} />
}

export function CardContent({ className, ...rest }: ComponentProps<"div">) {
  return <div className={className} {...rest} />
}
