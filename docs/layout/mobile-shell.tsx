import * as React from "react";
import { Inbox, Package, ScanLine, Truck } from "lucide-react";

import { Badge, Card, CardContent } from "@godxjp/ui/data-display";
import { Button, Heading, Text } from "@godxjp/ui/general";
import { Flex, MobileShell } from "@godxjp/ui/layout";

/**
 * MobileShell — the handheld app shell: a status band, an app bar, ONE scroll region, a sticky
 * action bar and a bottom tab bar. The two things a composed `Card` stack cannot do are exactly
 * what the shell owns: the root is one screen tall so the DOCUMENT never scrolls (the tab bar can
 * never slide away under a collapsing URL bar), and every band pads itself out of the device
 * safe areas. Zero custom CSS — no `min-h-dvh`, no `position: sticky`, no page gutter by hand.
 */
const ITEMS = [
  { rc: "RC-204881", name: "洗顔フォーム", status: "未仕分け", tone: "warning" as const },
  { rc: "RC-204882", name: "日焼け止め", status: "棚上", tone: "info" as const },
  { rc: "RC-204879", name: "ビタミン B", status: "棚上", tone: "info" as const },
  { rc: "RC-204875", name: "歯ブラシ", status: "梱包済み", tone: "muted" as const },
  { rc: "RC-204871", name: "入浴剤", status: "棚上", tone: "info" as const },
  { rc: "RC-204864", name: "解熱鎮痛薬", status: "梱包済み", tone: "muted" as const },
];

const TABS = [
  { id: "inbound", label: "入庫", icon: Inbox },
  { id: "packing", label: "梱包", icon: Package },
  { id: "outbound", label: "出庫", icon: Truck },
];

export default function Demo() {
  const [tab, setTab] = React.useState("inbound");

  return (
    <MobileShell
      // `width="phone"` because this frame is READ ON A DESKTOP. The shell's own docstring already
      // named this case on the block axis (`height="fill"` for "a phone view embedded in a wider
      // page"); the inline axis had no answer until now, so this page drew a 1232px-wide handheld
      // app with its four tab-bar destinations spread across the screen.
      width="phone"
      statusBar={
        <>
          <Text size="sm" weight="medium" tabular>
            9:41
          </Text>
          <Text size="sm" weight="medium" tone="muted" tabular>
            Acme Handy
          </Text>
        </>
      }
      header={
        <Flex align="center" justify="between" gap="xs" className="w-full">
          <Heading level={3} as="h1">
            入庫
          </Heading>
          <Button variant="ghost" size="sm">
            選択
          </Button>
        </Flex>
      }
      actions={
        <>
          <Button className="flex-[2]">
            <ScanLine aria-hidden="true" />
            スキャン
          </Button>
          <Button variant="outline" className="flex-1">
            手入力
          </Button>
        </>
      }
      tabBar={TABS.map((t) => {
        const Icon = t.icon;
        return (
          <Button
            key={t.id}
            variant="ghost"
            onClick={() => setTab(t.id)}
            aria-current={t.id === tab ? "page" : undefined}
            className="h-full flex-col rounded-none"
          >
            <Icon aria-hidden="true" />
            <Text size="2xs">{t.label}</Text>
          </Button>
        );
      })}
    >
      <Flex direction="col" gap="sm">
        {ITEMS.map((item) => (
          <Card key={item.rc} density="tight">
            <CardContent solo>
              <Flex align="center" justify="between" gap="sm">
                <Flex direction="col" gap="none">
                  <Text weight="medium">{item.name}</Text>
                  <Text size="xs" mono tone="muted" tabular>
                    {item.rc}
                  </Text>
                </Flex>
                <Badge tone={item.tone}>{item.status}</Badge>
              </Flex>
            </CardContent>
          </Card>
        ))}
      </Flex>
    </MobileShell>
  );
}
