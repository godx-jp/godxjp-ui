/** Horizontal padding aligned with PageContainer header — use inside `variant="flush"`. */
import { cn } from "../../lib/utils";
import type { PageInsetProp } from "../../props/components/layout.prop";

export type {
  PageInsetProp,
  PageInsetProp as PageInsetProps,
} from "../../props/components/layout.prop";

export function PageInset({ className, children, ...props }: PageInsetProp) {
  return (
    <div className={cn("ui-page-inset", className)} {...props}>
      {children}
    </div>
  );
}
