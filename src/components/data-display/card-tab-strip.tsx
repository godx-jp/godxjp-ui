import type * as React from "react";

import { cn } from "../../lib/utils";
import type { CardTabItemProp } from "../../props/components/data-display.prop";
import { Tabs, type TabsExtraProp, type TabsProps } from "../navigation/tabs";

/**
 * The card-head tab strip, in a module of its OWN so `Card` loads it lazily: a card without
 * `tabList` — every card in an ErrorSurface, a grouped list, a form — never pulls `Tabs` (and
 * through it Toggle, react-aria Tabs/ToggleButton and tabs-scroll) into the consumer's graph.
 * Internal: `Card` is the public API; this file is not exported from the barrel.
 */
type CardTabStripProps = {
  tabs: CardTabItemProp[];
  tabProps?: Omit<
    TabsProps,
    "items" | "value" | "defaultValue" | "onValueChange" | "extra" | "children"
  >;
  activeKey: string | undefined;
  onValueChange: (key: string) => void;
  extra?: TabsExtraProp;
  body: React.ReactNode;
};

export default function CardTabStrip({
  tabs,
  tabProps,
  activeKey,
  onValueChange,
  extra,
  body,
}: CardTabStripProps) {
  return (
    <Tabs
      // The card head's strip is antd's: a rail of text triggers under the title, not the
      // package's default pill strip floating on the card surface. `tabProps` still wins.
      variant="line"
      {...tabProps}
      // Card-owned, so they are written AFTER the spread — the same precedence antd's own
      // Card uses when it writes its `items`/`activeKey`/`onChange` over `tabProps`.
      items={tabs.map((item) => ({
        value: item.key,
        label: item.tab,
        disabled: item.disabled,
        // antd's per-tab remove control. Forwarded rather than dropped: `items` is built
        // AFTER `...tabProps` above, so a consumer cannot supply these from outside —
        // this mapping is the only place they can arrive (gh#757).
        closable: item.closable,
        closeIcon: item.closeIcon,
        // The body belongs to the SELECTED tab and to no other: the card has exactly one
        // set of children, so handing them to every panel would render them N times the
        // moment `destroyOnHidden={false}` kept the hidden panels mounted.
        content: item.key === activeKey ? body : null,
      }))}
      value={activeKey}
      onValueChange={onValueChange}
      extra={extra}
      // The strip has to stand on the CARD's column, or the first tab does not line up
      // with the title above it. It goes on as an arbitrary-value UTILITY reading the card
      // token, never as a components-layer rule: the line strip already claims `px-*` in
      // the utilities layer, which outranks `@layer components` outright.
      listClassName={cn("px-[var(--card-space-inset)]", tabProps?.listClassName)}
    />
  );
}
