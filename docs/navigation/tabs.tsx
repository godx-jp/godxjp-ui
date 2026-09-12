import { useState } from "react";

import { CircleX } from "lucide-react";

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

/**
 * A 設定 screen shaped like the one gh#502 was filed from: a vertical strip beside a panel whose
 * content does NOT collapse below about 200px (an action row of two buttons). That min-content is
 * what starved the strip — measured at 393px before the fold, the strip was 8px wide with 0px of
 * tab in it. `pnpm check:frame-geometry` sweeps this frame at 320/375/390 and fails on the inline
 * overflow it produced; a demo whose panel holds one short paragraph proves nothing, because a
 * paragraph's min-content is one character wide.
 */
const settingItems = [
  {
    value: "general",
    label: "基本設定",
    content: (
      <Flex direction="col" gap="sm">
        <Text as="p">表示名・タイムゾーン・言語。</Text>
        <Flex gap="sm">
          <Button variant="outline">変更を破棄</Button>
          <Button>保存する</Button>
        </Flex>
      </Flex>
    ),
  },
  {
    value: "members",
    label: "メンバー",
    content: (
      <Flex direction="col" gap="sm">
        <Text as="p">招待済 8 名 · 管理者 2 名。</Text>
        <Flex gap="sm">
          <Button variant="outline">権限を見る</Button>
          <Button>招待する</Button>
        </Flex>
      </Flex>
    ),
  },
  {
    value: "billing",
    label: "請求",
    content: (
      <Flex direction="col" gap="sm">
        <Text as="p">次回請求日 2026年10月1日。</Text>
        <Flex gap="sm">
          <Button variant="outline">履歴を見る</Button>
          <Button>支払方法</Button>
        </Flex>
      </Flex>
    ),
  },
];

/**
 * 20 saved views with real Japanese labels — a strip that is wider than 1920px, so it overflows at
 * EVERY width the browser gates sweep. `scripts/check-tabs-overflow-menu.mjs` measures this frame;
 * it fails if the strip ever stops overflowing, because a gate over a bar that fits proves nothing.
 */
const savedViewItems = [
  { value: "all", label: "すべての仕訳", content: <Text as="p">全 1,284 件</Text> },
  { value: "pending", label: "未承認の仕訳", content: <Text as="p">未承認 2 件</Text> },
  { value: "posted", label: "承認済の仕訳", content: <Text as="p">承認済 48 件</Text> },
  { value: "voided", label: "取消済の仕訳", content: <Text as="p">取消済 3 件</Text> },
  { value: "returned", label: "差戻しの仕訳", content: <Text as="p">差戻し 5 件</Text> },
  { value: "draft", label: "下書きの仕訳", content: <Text as="p">下書き 12 件</Text> },
  { value: "recurring", label: "定期仕訳のひな形", content: <Text as="p">ひな形 7 件</Text> },
  { value: "accrual", label: "未払費用の計上", content: <Text as="p">未払費用 9 件</Text> },
  { value: "prepaid", label: "前払費用の振替", content: <Text as="p">前払費用 4 件</Text> },
  { value: "payroll", label: "給与支払の仕訳", content: <Text as="p">給与 3 件</Text> },
  { value: "tax", label: "消費税の集計", content: <Text as="p">消費税 6 件</Text> },
  { value: "closing", label: "決算整理の仕訳", content: <Text as="p">決算整理 11 件</Text> },
  { value: "audit", label: "監査対象の仕訳", content: <Text as="p">監査対象 8 件</Text> },
  {
    value: "archived",
    label: "アーカイブ済の仕訳",
    content: <Text as="p">アーカイブ 214 件</Text>,
  },
  { value: "fx", label: "外貨建の換算差額", content: <Text as="p">換算差額 2 件</Text> },
  { value: "intercompany", label: "関係会社間の取引", content: <Text as="p">関係会社 15 件</Text> },
  {
    value: "fixed-asset",
    label: "固定資産の減価償却",
    content: <Text as="p">減価償却 22 件</Text>,
  },
  { value: "inventory", label: "棚卸資産の評価替", content: <Text as="p">評価替 6 件</Text> },
  { value: "bank", label: "銀行勘定の照合", content: <Text as="p">未照合 4 件</Text> },
  { value: "reversal", label: "翌期首の振戻し", content: <Text as="p">振戻し 9 件</Text> },
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

        {/* antd `more` — overflow="menu" beside the default overflow="scroll" */}
        <Card>
          <CardHeader>
            <CardTitle level={2}>overflow · scroll(既定) / menu</CardTitle>
            <CardDescription>
              antd の more をこのライブラリの overflow 語彙に写したもの。既定の scroll
              は今までどおり、帯が自分の水平オーバーフローをスクロールする。menu
              はそれに加えて、帯の外に「他のタブ」ボタンを出し、いま見えていないタブだけを並べる ·
              antd と違いタブは帯から取り除かれない(tablist はタブ以外を持てず、display:none
              のタブはロービングフォーカスを受け取れないため · WAI-ARIA APG)。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  overflow=&quot;scroll&quot;(既定)
                </Text>
                <Tabs
                  id="antd-overflow-scroll"
                  defaultValue="all"
                  variant="line"
                  items={savedViewItems}
                />
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  overflow=&quot;menu&quot;
                </Text>
                <Tabs
                  id="antd-overflow-menu"
                  defaultValue="all"
                  variant="line"
                  overflow="menu"
                  items={savedViewItems}
                />
              </Flex>
            </Flex>
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
                closeIcon={<CircleX aria-hidden="true" />}
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

        <Card>
          <CardHeader>
            <CardTitle level={2}>tabPlacement=&quot;start&quot; · 狭い画面での折り返し</CardTitle>
            <CardDescription>
              縦のタブ列はパネルと同じインライン軸を共有するので、パネルの min-content
              が画面の大半を占めると列が 0px
              まで潰れ、開いているタブ以外へ行く手段が消える(gh#502)。
              --tabs-placement-responsive-breakpoint-width(48rem)以下では start / end を top /
              bottom へ折り返す。ロービングフォーカスの軸も一緒に切り替わる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              id="antd-start-narrow"
              defaultValue="general"
              variant="line"
              tabPlacement="start"
              items={settingItems}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>indicator · animated</CardTitle>
            <CardDescription>
              Ant Design の indicator
              は下線バーの長さと寄せ方を決める。size=&quot;full&quot;(既定)はタブ全幅、size=&quot;label&quot;
              はタブ自身の左右パディングを引いた分、つまりラベルの幅。align
              はバーが短いときだけ効く。animated は inkBar(下線のクロスフェード・既定 ON)と
              tabPane(パネルのフェードイン・既定 OFF)の二つのスイッチで、prefers-reduced-motion
              では両方とも止まる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="lg">
              <Tabs
                id="antd-indicator-full"
                defaultValue="pending"
                variant="line"
                items={journalItems}
              />
              <Tabs
                id="antd-indicator-label"
                defaultValue="pending"
                variant="line"
                indicator={{ size: "label" }}
                items={journalItems}
              />
              <Tabs
                id="antd-indicator-label-start"
                defaultValue="pending"
                variant="line"
                indicator={{ size: "label", align: "start" }}
                items={journalItems}
              />
              <Tabs
                id="antd-indicator-label-end"
                defaultValue="pending"
                variant="line"
                indicator={{ size: "label", align: "end" }}
                items={journalItems}
              />
              <Tabs
                id="antd-animated-off"
                defaultValue="pending"
                variant="line"
                animated={false}
                items={journalItems}
              />
              <Tabs
                id="antd-animated-pane"
                defaultValue="pending"
                variant="line"
                animated={{ tabPane: true }}
                items={journalItems}
              />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
