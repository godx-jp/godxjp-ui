import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Breadcrumb } from "@godxjp/ui/layout";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Breadcrumb — standalone ordered trail of page segments.
 * Import from @godxjp/ui/layout (not navigation).
 * Pass a single items array: { label, to? } — omit to on the last segment.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="Breadcrumb"
      subtitle="Spatial location trail · import from @godxjp/ui/layout, items array only"
    >
      <Flex direction="col" gap="lg">
        {/* 2-level trail */}
        <Card>
          <CardHeader>
            <CardTitle>2 階層 · モジュールルート + 現在ページ</CardTitle>
            <CardDescription>
              最後のセグメントに to を渡さない → aria-current=&quot;page&quot; として span
              でレンダリング。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Breadcrumb items={[{ label: "ホーム", to: "/" }, { label: "仕訳一覧" }]} />
          </CardContent>
        </Card>

        {/* 3-level — accounting detail */}
        <Card>
          <CardHeader>
            <CardTitle>3 階層 · 会計 / 請求書一覧 / 請求書詳細</CardTitle>
            <CardDescription>
              Master-detail drill-down。詳細ページが現在ページ (to なし)。
              親セグメントはクリックで一覧へ戻れる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Breadcrumb
              items={[
                { label: "ホーム", to: "/" },
                { label: "会計", to: "/accounting" },
                { label: "請求書一覧", to: "/accounting/invoices" },
                { label: "INV-0042" },
              ]}
            />
          </CardContent>
        </Card>

        {/* 4-level — payroll nested */}
        <Card>
          <CardHeader>
            <CardTitle>4 階層 · 給与 / 部門 / 従業員 / 給与明細</CardTitle>
            <CardDescription>
              深いネストでも items 配列を渡すだけ。区切り記号と aria は自動で付与される。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Breadcrumb
              items={[
                { label: "ホーム", to: "/" },
                { label: "給与管理", to: "/payroll" },
                { label: "経理部", to: "/payroll/departments/accounting" },
                { label: "田中 太郎", to: "/payroll/departments/accounting/tanaka" },
                { label: "2024年5月分給与明細" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Standalone — used in PageContainer breadcrumb prop */}
        <Card>
          <CardHeader>
            <CardTitle>PageContainer の breadcrumb prop へ渡す</CardTitle>
            <CardDescription>
              PageContainer は breadcrumb に BreadcrumbItemProp[] を直接受け取る。 AppShell
              に渡す場合は &lt;Breadcrumb items=&#123;…&#125; /&gt; として ReactNode で渡す。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Text as="p" tone="muted">
                PageContainer に渡す場合 (raw 配列):
              </Text>
              <pre className="bg-muted rounded p-3 text-xs">
                {`<PageContainer\n  title="仕訳詳細"\n  breadcrumb={[\n    { label: "ホーム", to: "/" },\n    { label: "会計", to: "/accounting" },\n    { label: "JE-0042" },\n  ]}\n>`}
              </pre>
              <Text as="p" tone="muted">
                AppShell に渡す場合 (ReactNode):
              </Text>
              <pre className="bg-muted rounded p-3 text-xs">
                {`<AppShell\n  breadcrumb={\n    <Breadcrumb items={[\n      { label: "ホーム", to: "/" },\n      { label: "会計", to: "/accounting" },\n    ]} />\n  }\n>`}
              </pre>
            </Flex>
          </CardContent>
        </Card>

        {/* Audit log example */}
        <Card>
          <CardHeader>
            <CardTitle>監査ログページ · 現在エンティティが末尾</CardTitle>
            <CardDescription>
              審査ログや文書履歴でもパターンは同じ。現在エンティティ (to なし) が末尾。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Breadcrumb
              items={[
                { label: "ホーム", to: "/" },
                { label: "監査ログ", to: "/audit" },
                { label: "請求書 INV-0042 の変更履歴" },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
