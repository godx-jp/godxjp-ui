import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Breadcrumb } from "@godxjp/ui/layout";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Breadcrumb — a STANDALONE "where am I" trail. Place `<Breadcrumb items={[…]} />` anywhere
 * (no shell required); it is NOT tied to AppShell or PageContainer. Pass one `items` array of
 * `{ label, to? }`; the segment with no `to` is the current page. Import from @godxjp/ui/layout.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Breadcrumb"
      subtitle="Standalone location trail · pass one items array, the last (no `to`) is the current page"
    >
      <Flex direction="col" gap="lg">
        {/* 1 · IN FOCUS — the bare component + what every part does. */}
        <Card>
          <CardHeader>
            <CardTitle>基本 · これがコンポーネントそのもの</CardTitle>
            <CardDescription>
              `&lt;Breadcrumb items={"{[…]}"} /&gt;` を置くだけ。シェル不要。リンクのセグメント
              (to あり) はクリックで戻れ、末尾 (to なし) は現在地として aria-current=&quot;page&quot;
              の span に、区切り記号と nav/aria は自動付与。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Breadcrumb
              items={[
                { label: "ホーム", to: "/" },
                { label: "会計", to: "/accounting" },
                { label: "請求書 INV-0042" },
              ]}
            />
          </CardContent>
        </Card>

        {/* 2 · ONE KNOB — depth is just the array length. Stacked so the scaling is obvious. */}
        <Card>
          <CardHeader>
            <CardTitle>深さ · items を増やすだけ</CardTitle>
            <CardDescription>
              2 から 4 階層まで、変えるのは配列の長さだけ。区切りと折り返しは自動。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Breadcrumb items={[{ label: "ホーム", to: "/" }, { label: "仕訳一覧" }]} />
              <Breadcrumb
                items={[
                  { label: "ホーム", to: "/" },
                  { label: "給与管理", to: "/payroll" },
                  { label: "2024年5月分給与明細" },
                ]}
              />
              <Breadcrumb
                items={[
                  { label: "ホーム", to: "/" },
                  { label: "給与管理", to: "/payroll" },
                  { label: "経理部", to: "/payroll/departments/accounting" },
                  { label: "田中 太郎" },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>

        {/* 3 · PLACEMENT — standalone, or the optional shell convenience. Reference, last. */}
        <Card>
          <CardHeader>
            <CardTitle>配置 · 単体 または シェルの任意プロップ</CardTitle>
            <CardDescription>
              単体でどこにでも置ける。任意で `PageContainer`/`AppShell` の `breadcrumb`
              プロップに渡すと、ヘッダーの定位置に出る (シェルが強制するものではない)。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Text as="p" size="xs" tone="muted">
                単体 (どこでも):
              </Text>
              <pre className="bg-muted overflow-x-auto rounded p-3 text-xs">
                {`<Breadcrumb items={[{ label: "ホーム", to: "/" }, { label: "現在ページ" }]} />`}
              </pre>
              <Text as="p" size="xs" tone="muted">
                PageContainer / AppShell の breadcrumb プロップに (任意):
              </Text>
              <pre className="bg-muted overflow-x-auto rounded p-3 text-xs">
                {`<PageContainer title="仕訳詳細" breadcrumb={[{ label: "ホーム", to: "/" }, { label: "JE-0042" }]}>`}
              </pre>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
