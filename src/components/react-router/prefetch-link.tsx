import * as React from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import type { PrefetchLinkProp } from "../../props/components/query.prop";

export type {
  PrefetchLinkProp,
  PrefetchLinkProp as PrefetchLinkProps,
} from "../../props/components/query.prop";

/**
 * React Router `Link` + `queryClient.prefetchQuery` on hover/focus.
 * Detail routes feel instant when list rows are hovered.
 */
export function PrefetchLink({
  queryKey,
  queryFn,
  prefetchOn = "both",
  staleTime = 30_000,
  onMouseEnter,
  onFocus,
  ...linkProps
}: PrefetchLinkProp) {
  const queryClient = useQueryClient();

  const prefetch = React.useCallback(() => {
    if (prefetchOn === "none") return;
    void queryClient.prefetchQuery({ queryKey, queryFn, staleTime });
  }, [prefetchOn, queryClient, queryFn, queryKey, staleTime]);

  return (
    <Link
      {...linkProps}
      onMouseEnter={(event) => {
        if (prefetchOn === "hover" || prefetchOn === "both") prefetch();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        if (prefetchOn === "focus" || prefetchOn === "both") prefetch();
        onFocus?.(event);
      }}
    />
  );
}
