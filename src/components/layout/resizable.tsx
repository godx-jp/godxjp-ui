import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "../../lib/utils";

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
  ...props
}: React.ComponentPropsWithoutRef<typeof ResizablePrimitive.Panel>) => (
  <ResizablePrimitive.Panel
    data-slot="resizable-panel"
    className={cn("ui-resizable-panel", className)}
    {...props}
  />
);

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
