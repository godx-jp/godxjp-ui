import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "../../lib/utils";
import { useScrollableRegionTabIndex } from "../../lib/hooks";

export const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Group>) => (
  <ResizablePrimitive.Group
    data-slot="resizable-panel-group"
    className={cn("ui-resizable-panel-group", className)}
    {...props}
  />
);

ResizablePanelGroup.displayName = "ResizablePanelGroup";

export const ResizablePanel = ({
  className,
  elementRef,
  ...props
}: React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Panel>) => {
  // Every panel is a scroll container: react-resizable-panels hardcodes `overflow: auto` on the
  // NESTED div it applies our className to. That div takes no props, so reach it from the root and
  // let the shared hook decide whether it needs its own tab stop (WCAG 2.1.1).
  const [scrollRegion, setScrollRegion] = React.useState<HTMLElement | null>(null);
  const setRootElement = React.useCallback(
    (node: HTMLDivElement | null) => {
      setScrollRegion(
        node?.firstElementChild instanceof HTMLElement ? node.firstElementChild : null,
      );
      if (typeof elementRef === "function") elementRef(node);
      else if (elementRef) (elementRef as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [elementRef],
  );
  useScrollableRegionTabIndex(scrollRegion);

  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("ui-resizable-panel", className)}
      elementRef={setRootElement}
      {...props}
    />
  );
};

ResizablePanel.displayName = "ResizablePanel";

export const ResizableHandle = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Separator>) => (
  <ResizablePrimitive.Separator
    data-slot="resizable-handle"
    className={cn("ui-resizable-handle", className)}
    {...props}
  />
);
ResizableHandle.displayName = "ResizableHandle";
