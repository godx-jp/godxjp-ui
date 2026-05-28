import { cn } from "../../lib/utils";
import type { TabsItemsProp } from "../../props/components/navigation.prop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

export type {
  TabsItemsProp,
  TabsItemsProp as TabsItemsProps,
} from "../../props/components/navigation.prop";

/** Ant Design `items` API — wraps Radix Tabs primitives. */
export function TabsItems({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "default",
  className,
  listClassName,
  contentClassName,
}: TabsItemsProp) {
  const firstKey = items[0]?.key;
  const resolvedDefault = defaultValue ?? firstKey;

  return (
    <Tabs
      value={value}
      defaultValue={value === undefined ? resolvedDefault : undefined}
      onValueChange={onValueChange}
      className={className}
      data-slot="tabs"
    >
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
            key={item.key}
            value={item.key}
            disabled={item.disabled}
            className={cn(
              variant === "line" &&
                "data-[state=active]:border-primary rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none",
              variant === "card" && "data-[state=active]:shadow-sm",
            )}
          >
            {item.icon && <span className="mr-1.5 inline-flex">{item.icon}</span>}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent
          key={item.key}
          value={item.key}
          data-slot="tabs-panel"
          className={cn(variant === "line" && "mt-0", contentClassName)}
        >
          {item.children}
        </TabsContent>
      ))}
    </Tabs>
  );
}
