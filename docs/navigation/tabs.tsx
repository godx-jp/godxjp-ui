import { useState } from "react";

import { Trash2 } from "lucide-react";

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
        <Text as="p">JE-0042 · 売上計上 株式会社山田商事 ¥480,000</Text>
        <Text as="p">JE-0043 · 仕入計上 有限会社田中工業 ¥120,000</Text>
      </Flex>
    ),
  },
  {
    value: "posted",
    label: "承認済",
    content: (
      <Flex direction="col" gap="sm">
        <Text as="p">JE-0040 · 給与支払 2024年5月分 ¥2,800,000</Text>
        <Text as="p">JE-0041 · 経費精算 交通費 ¥38,500</Text>
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
  const [reopened, setReopened] = useState(0);
  const [editableTabs, setEditableTabs] = useState([
    { value: "je-0042", label: "JE-0042", content: <Text as="p">売上計上 ¥480,000</Text> },
    { value: "je-0043", label: "JE-0043", content: <Text as="p">仕入計上 ¥120,000</Text> },
    {
      value: "je-0040",
      label: "JE-0040 (固定)",
      content: <Text as="p">給与支払 ¥2,800,000</Text>,
      closable: false,
    },
  ]);
  const [editableTab, setEditableTab] = useState("je-0042");

  return (
    <PageContainer
      title="Tabs"
      subtitle="items API (default / line / card variant) + manual compound composition"
    >
      <Flex direction="col" gap="lg">
        {/* items API — default variant (pill) */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>Default variant · items API</CardTitle>
            <CardDescription>
              Pass an items array; Tabs renders all triggers and content panels automatically.
              variant=&quot;default&quot; is the pill style.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" variant="default" items={journalItems} />
          </CardContent>
        </Card>

        {/* Disabled first item — fallback selection must skip it */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>先頭タブが disabled · フォールバック選択</CardTitle>
            <CardDescription>
              defaultValue/value を渡さない場合、Tabs は先頭の ENABLED タブを自動選択する(disabled
              の先頭タブは選ばない)。全タブが disabled の場合は何も選択しない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              variant="default"
              items={[
                {
                  value: "archived",
                  label: "アーカイブ済 (無効)",
                  content: <Text as="p">アーカイブ済の仕訳は表示できません。</Text>,
                  disabled: true,
                },
                {
                  value: "pending",
                  label: "未承認",
                  content: <Text as="p">未承認の仕訳が 2 件あります。</Text>,
                },
                {
                  value: "posted",
                  label: "承認済",
                  content: <Text as="p">当期承認済: 48 件</Text>,
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>320px stress · 長いローカライズラベル</CardTitle>
            <CardDescription>
              狭いコンテナでも長いラベルはクリップされず、水平タブリストが自身でスクロールする
              。compact navigation への変換は Tabs API に存在しないため擬似実装しない ·
              スクロールが意図した縮退動作。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card className="max-w-80">
              <CardContent>
                <Tabs
                  defaultValue="methods"
                  variant="line"
                  items={[
                    {
                      value: "methods",
                      label: "サインイン方法とパスワード",
                      content: <Text>方法</Text>,
                    },
                    {
                      value: "two-factor",
                      label: "二要素認証の設定",
                      content: <Text>二要素認証</Text>,
                    },
                    {
                      value: "recovery",
                      label: "アカウントの復旧方法",
                      content: <Text>復旧</Text>,
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* items API — line variant */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>Line variant · controlled</CardTitle>
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
            <CardTitle level={2}>Card variant</CardTitle>
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
            <CardTitle level={2}>Manual compound · vertical orientation</CardTitle>
            <CardDescription>
              Compose TabsList / TabsTrigger / TabsContent when per-panel control is needed.
              orientation=&quot;vertical&quot; goes on the root Tabs element.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" orientation="vertical" style={{ gap: "var(--space-6)" }}>
              <TabsList variant="line" className="h-auto w-40 flex-col items-stretch">
                <TabsTrigger value="overview">概要</TabsTrigger>
                <TabsTrigger value="ledger">元帳</TabsTrigger>
                <TabsTrigger value="attachments">添付</TabsTrigger>
              </TabsList>
              <Flex direction="col" gap="md" className="flex-1">
                <TabsContent value="overview">
                  <Text as="p">取引先: 株式会社山田商事 · 売掛金残高 ¥480,000</Text>
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
            <CardTitle level={2}>外部制御 · ボタンでタブを切り替え</CardTitle>
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

        {/* TabsList union — both list variants, hand-composed and named explicitly */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>TabsList variant · default / line</CardTitle>
            <CardDescription>
              手動合成では TabsList に variant を直接指定する。variant=&quot;default&quot;
              はピル型のリスト、variant=&quot;line&quot; は下線インジケータのリスト。items API
              を使う場合は Tabs の variant がそのまま TabsList に渡る。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  variant=&quot;default&quot;
                </Text>
                <Tabs defaultValue="summary">
                  <TabsList variant="default">
                    <TabsTrigger value="summary">サマリ</TabsTrigger>
                    <TabsTrigger value="detail">明細</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary">
                    <Text as="p">当月の売上合計 ¥4,820,000</Text>
                  </TabsContent>
                  <TabsContent value="detail">
                    <Text as="p">明細 24 件 · 未承認 2 件</Text>
                  </TabsContent>
                </Tabs>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  variant=&quot;line&quot;
                </Text>
                <Tabs defaultValue="summary">
                  <TabsList variant="line">
                    <TabsTrigger value="summary">サマリ</TabsTrigger>
                    <TabsTrigger value="detail">明細</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary">
                    <Text as="p">当月の売上合計 ¥4,820,000</Text>
                  </TabsContent>
                  <TabsContent value="detail">
                    <Text as="p">明細 24 件 · 未承認 2 件</Text>
                  </TabsContent>
                </Tabs>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        {/* Ant Design parity surface — editable-card + extra + centered + placement + size */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>Editable card · onEdit / extra / hideAdd</CardTitle>
            <CardDescription>
              variant=&quot;editable-card&quot; は Ant Design の editable-card。タブ内の ×
              はポインタ用ショートカット(aria-hidden)で、キーボードでは Delete /
              Backspace(aria-keyshortcuts)。追加ボタンは tablist の外にある本物の button。extra は
              antd の tabBarExtraContent を論理軸(start / end)にしたもの。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              id="antd-editable-card"
              variant="editable-card"
              value={editableTab}
              onValueChange={setEditableTab}
              onEdit={(target, action) => {
                if (action === "add") {
                  const next = `tab-${editableTabs.length + 1}`;
                  setEditableTabs([
                    ...editableTabs,
                    {
                      value: next,
                      label: `新規 ${editableTabs.length + 1}`,
                      content: <Text as="p">新規タブ {next}</Text>,
                    },
                  ]);
                  setEditableTab(next);
                  return;
                }
                const rest = editableTabs.filter((item) => item.value !== target);
                setEditableTabs(rest);
                if (target === editableTab && rest[0]) setEditableTab(rest[0].value);
              }}
              extra={{
                end: (
                  <Button size="sm" variant="outline">
                    一括操作
                  </Button>
                ),
              }}
              items={editableTabs}
            />
          </CardContent>
        </Card>

        {/* antd onTabClick / removeIcon / Tab.forceRender */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>onTabClick · closeIcon · forceRender</CardTitle>
            <CardDescription>
              onTabClick は antd の onTabClick で、ポインタで押されたときだけ発火し DOM の
              MouseEvent を渡す(キーボードは activationMode=&quot;manual&quot;
              でフォーカス移動と選択が分かれるため発火しない · 選択は onValueChange
              が担当)。closeIcon は antd の removeIcon で、タブ全体の既定グリフを差し替える(item
              側の closeIcon が優先)。item の forceRender は antd の Tab.forceRender
              で、そのパネルだけを先にマウントし、他のタブに 切り替えても保持する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Text as="p" size="sm" tone="muted">
                同じタブを押し直した回数: {reopened}
              </Text>
              <Tabs
                id="antd-tab-click"
                defaultValue="pending"
                variant="line"
                onTabClick={(value) => {
                  if (value === activeTab) setReopened((count) => count + 1);
                  setActiveTab(value);
                }}
                items={[
                  {
                    value: "pending",
                    label: "未承認",
                    content: <Text as="p">未承認の仕訳が 2 件あります。</Text>,
                  },
                  {
                    value: "chart",
                    label: "推移グラフ",
                    // The one panel that must survive a tab switch — antd Tab.forceRender.
                    forceRender: true,
                    content: <Text as="p">月次推移: 4 月 ¥3,120,000 · 5 月 ¥4,820,000</Text>,
                  },
                  {
                    value: "posted",
                    label: "承認済",
                    content: <Text as="p">当期承認済: 48 件</Text>,
                  },
                ]}
              />
              <Tabs
                id="antd-remove-icon"
                variant="editable-card"
                defaultValue="je-0042"
                closeIcon={<Trash2 aria-hidden="true" />}
                onEdit={() => undefined}
                items={[
                  {
                    value: "je-0042",
                    label: "JE-0042",
                    content: <Text as="p">売上計上 ¥480,000</Text>,
                  },
                  {
                    value: "je-0043",
                    label: "JE-0043",
                    content: <Text as="p">仕入計上 ¥120,000</Text>,
                  },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>tabPlacement · size · centered</CardTitle>
            <CardDescription>
              tabPlacement は antd 6.6.2 の名前で、値は論理軸(top / bottom / start / end)。start /
              end は tablist を縦方向のロービングフォーカスに切り替える。size はライブラリの control
              band(sm / md / lg)に対応。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Tabs
                id="antd-centered"
                defaultValue="pending"
                variant="line"
                centered
                items={journalItems}
              />
              <Tabs
                id="antd-bottom"
                defaultValue="pending"
                variant="card"
                tabPlacement="bottom"
                size="sm"
                items={journalItems}
              />
              <Tabs
                id="antd-start"
                defaultValue="pending"
                variant="line"
                tabPlacement="start"
                size="lg"
                items={journalItems}
              />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
