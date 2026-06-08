import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@godxjp/ui/navigation";

/**
 * Tabs — Radix tab container with items API and three variants (default / line / card).
 * Use items for the common full set; compose TabsList/TabsTrigger/TabsContent manually
 * when you need per-panel control (forceMount, custom props).
 * Composed only from real @godxjp/ui components.
 */
const journalItems = [
  {
    value: "pending",
    label: "未承認",
    content: (
      <Flex direction="col" gap="sm">
        <Text as="p">JE-0042 — 売上計上 株式会社山田商事 ¥480,000</Text>
        <Text as="p">JE-0043 — 仕入計上 有限会社田中工業 ¥120,000</Text>
      </Flex>
    ),
  },
  {
    value: "posted",
    label: "承認済",
    content: (
      <Flex direction="col" gap="sm">
        <Text as="p">JE-0040 — 給与支払 2024年5月分 ¥2,800,000</Text>
        <Text as="p">JE-0041 — 経費精算 交通費 ¥38,500</Text>
      </Flex>
    ),
  },
  {
    value: "voided",
    label: "取消済",
    content: (
      <Text as="p" tone="muted">
        取消済の仕訳はありません。
      </Text>
    ),
    disabled: false,
  },
];

export default function Demo() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <PageContainer
      title="Tabs"
      subtitle="items API (default / line / card variant) + manual compound composition"
    >
      <Flex direction="col" gap="lg">
        {/* items API — default variant (pill) */}
        <Card>
          <CardHeader>
            <CardTitle>Default variant — items API</CardTitle>
            <CardDescription>
              Pass an items array; Tabs renders all triggers and content panels automatically.
              variant=&quot;default&quot; is the pill style.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" variant="default" items={journalItems} />
          </CardContent>
        </Card>

        {/* items API — line variant */}
        <Card>
          <CardHeader>
            <CardTitle>Line variant — controlled</CardTitle>
            <CardDescription>
              variant=&quot;line&quot; renders an underline indicator. Pair value + onValueChange
              when the active tab is driven by parent state (e.g. URL param).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              variant="line"
              value={activeTab}
              onValueChange={setActiveTab}
              items={journalItems}
            />
          </CardContent>
        </Card>

        {/* items API — card variant */}
        <Card>
          <CardHeader>
            <CardTitle>Card variant</CardTitle>
            <CardDescription>
              variant=&quot;card&quot; gives each trigger a card-like surface. Good for settings or
              admin profile pages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="pending"
              variant="card"
              items={[
                {
                  value: "pending",
                  label: "未承認 (2)",
                  content: <Text as="p">未承認の仕訳が 2 件あります。</Text>,
                },
                {
                  value: "posted",
                  label: "承認済",
                  content: <Text as="p">当期承認済: 48 件</Text>,
                },
                {
                  value: "voided",
                  label: "取消済",
                  content: <Text as="p">取消済: 3 件</Text>,
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Manual compound — orientation vertical */}
        <Card>
          <CardHeader>
            <CardTitle>Manual compound — vertical orientation</CardTitle>
            <CardDescription>
              Compose TabsList / TabsTrigger / TabsContent when per-panel control is needed.
              orientation=&quot;vertical&quot; goes on the root Tabs element.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" orientation="vertical" className="gap-6">
              <TabsList variant="line" className="h-auto w-40 flex-col items-stretch">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="ledger">元帳</TabsTrigger>
                <TabsTrigger value="attachments">添付</TabsTrigger>
              </TabsList>
              <Flex direction="col" gap="md" className="flex-1">
                <TabsContent value="overview">
                  <Text as="p">取引先: 株式会社山田商事 — 売掛金残高 ¥480,000</Text>
                </TabsContent>
                <TabsContent value="ledger">
                  <Text as="p">元帳エントリ: 売掛金 Dr / 売上 Cr ¥480,000</Text>
                </TabsContent>
                <TabsContent value="attachments">
                  <Text as="p">添付ファイル: invoice_0042.pdf</Text>
                </TabsContent>
              </Flex>
            </Tabs>
          </CardContent>
        </Card>

        {/* Controlled with external Button */}
        <Card>
          <CardHeader>
            <CardTitle>外部制御 — ボタンでタブを切り替え</CardTitle>
            <CardDescription>
              value + onValueChange で親から active tab を制御できる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" gap="sm">
                <Button
                  size="sm"
                  variant={activeTab === "pending" ? "default" : "outline"}
                  onClick={() => setActiveTab("pending")}
                >
                  未承認へ
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "posted" ? "default" : "outline"}
                  onClick={() => setActiveTab("posted")}
                >
                  承認済へ
                </Button>
              </Flex>
              <Tabs
                variant="line"
                value={activeTab}
                onValueChange={setActiveTab}
                items={journalItems}
              />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
