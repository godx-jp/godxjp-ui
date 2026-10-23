import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";
import type { BreadcrumbItemProp, BreadcrumbProp } from "../../props/vocabulary/navigation.prop";
import { EllipsisTooltip } from "../feedback/tooltip";

/*
 * `BreadcrumbItemProp.ellipsis` (gh#1046), shared by `Breadcrumb` and `PageContainer`'s own trail.
 * A module of its own so PageContainer does not pull Breadcrumb's dropdown menu into its bundle.
 */

/** Extract literal rich-label text for SSR, omitting decorative content. */
function labelText(label: ReactNode): string {
  return Children.toArray(label)
    .map((node) => {
      if (typeof node === "string" || typeof node === "number") return String(node);
      if (
        !isValidElement<{
          children?: ReactNode;
          "aria-hidden"?: boolean | "true" | "false";
          hidden?: boolean;
        }>(node)
      )
        return "";
      if (
        node.props["aria-hidden"] === true ||
        node.props["aria-hidden"] === "true" ||
        node.props.hidden
      )
        return "";
      return labelText(node.props.children);
    })
    .join("");
}

/** `data-ellipsis` for the `<ol>`: present when any crumb truncates, so the trail stays one line. */
export function trailEllipsis(items: BreadcrumbProp): "" | undefined {
  return items.some((item) => item.ellipsis) ? "" : undefined;
}

/**
 * gh#1046 — one crumb's text box, bounded to one line with "…", and the full label in a tooltip on
 * hover and on keyboard focus of the link. The crumb element itself is the clipped box (never a
 * wrapper around it), so the link's own focus ring is not clipped. Shared with PageContainer's
 * trail, which renders its own markup.
 */
export function BreadcrumbCrumbText({
  item,
  children,
}: {
  item: BreadcrumbItemProp;
  children: ReactElement<{ className?: string }>;
}) {
  const anchorRef = useRef<HTMLElement | null>(null);
  const fullLabel = labelText(item.label);
  // Opaque React labels may render their own text: recover that text on the actual clip box.
  useEffect(() => {
    const node = anchorRef.current;
    if (!node || !item.ellipsis) return;
    const rendered = node.cloneNode(true) as HTMLElement;
    rendered.querySelectorAll('[aria-hidden="true"], [hidden]').forEach((child) => child.remove());
    const text = rendered.textContent || fullLabel;
    if (text) {
      node.setAttribute("aria-label", text);
      node.setAttribute("title", text);
    }
  }, [fullLabel, item.label, item.ellipsis]);
  if (!item.ellipsis) return children;
  const tooltip =
    typeof item.ellipsis === "object" && "tooltip" in item.ellipsis
      ? item.ellipsis.tooltip === true
        ? item.label
        : item.ellipsis.tooltip
      : item.label;
  const hasTooltip =
    tooltip !== undefined && tooltip !== null && tooltip !== false && tooltip !== "";
  return (
    <>
      {cloneElement(children, {
        // Keep the label's own start visible regardless of the page direction (#1370).
        dir: "auto",
        ref: anchorRef,
        "aria-label": fullLabel || undefined,
        title: fullLabel || undefined,
        className: cn(children.props.className, "ui-breadcrumb-ellipsis"),
      } as never)}
      {hasTooltip ? <EllipsisTooltip anchorRef={anchorRef} title={tooltip} /> : null}
    </>
  );
}
