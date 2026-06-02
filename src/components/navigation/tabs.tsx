import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

export type TabsItem = {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
};

export type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  items?: TabsItem[];
  variant?: "default" | "line" | "card";
  listClassName?: string;
  contentClassName?: string;
};

export function Tabs({
  className,
  orientation = "horizontal",
  items,
  value,
  defaultValue,
  variant = "default",
  listClassName,
  contentClassName,
  ...props
}: TabsProps) {
  const firstValue = items?.[0]?.value;
  const resolvedDefault = defaultValue ?? firstValue;

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      value={value}
      defaultValue={value === undefined ? resolvedDefault : undefined}
      className={cn("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", className)}
      {...props}
    >
      {items ? (
        <>
          <TabsList
            data-slot="tabs-list"
            className={cn(
              variant === "line" &&
                "h-auto w-full justify-start rounded-none border-b bg-transparent p-0",
              variant === "card" && "w-full justify-start",
              listClassName,
            )}
          >
            {items.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                className={cn(
                  variant === "line" &&
                    "data-[state=active]:border-primary rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                  variant === "card" && "data-[state=active]:shadow-sm",
                )}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {items.map((item) => (
            <TabsContent
              key={item.value}
              value={item.value}
              data-slot="tabs-panel"
              className={cn(variant === "line" && "mt-0", contentClassName)}
            >
              {item.content}
            </TabsContent>
          ))}
        </>
      ) : (
        props.children
      )}
    </TabsPrimitive.Root>
  );
}

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "line";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    data-variant={variant}
    className={cn(
      "group/tabs-list text-muted-foreground data-[variant=default]:bg-muted inline-flex w-fit items-center justify-center rounded-lg p-1 group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:gap-1 data-[variant=line]:rounded-none data-[variant=line]:bg-transparent",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      "text-foreground/60 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:outline-ring focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:ring-primary/25 after:bg-foreground relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:ring-1 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    className={cn("focus-visible:ring-ring flex-1 outline-none focus-visible:ring-2", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
