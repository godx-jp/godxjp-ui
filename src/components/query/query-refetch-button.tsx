import { RefreshCw } from "lucide-react";

import { Button } from "../general/button";
import type { QueryRefetchButtonProp } from "../../props/components/query.prop";

export type {
  QueryRefetchButtonProp,
  QueryRefetchButtonProp as QueryRefetchButtonProps,
} from "../../props/components/query.prop";

/** Page-header Refresh — spins while `query.isFetching`, calls `query.refetch()`. */
export function QueryRefetchButton({
  query,
  label = "Refresh",
  children,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: QueryRefetchButtonProp) {
  const text = children ?? label;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => void query.refetch()}
      disabled={query.isFetching}
      {...props}
    >
      <RefreshCw
        className="ui-query-refetch-icon"
        data-fetching={query.isFetching}
        aria-hidden="true"
      />
      {text}
    </Button>
  );
}
