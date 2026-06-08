import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import {
  Checkbox,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Density — design-token foundation. One knob (`<PageContainer density>`) swaps a
 * single CSS class (`.ui-density-compact|default|comfortable`) that retunes
 * --control-height, --control-padding-x, --checkbox-size, --switch-* and the φ
 * unit. The first card renders the SAME real controls inside each density-scoped
 * subtree so the retune is visible at rest. The DataTable owns a separate density
 * prop (--table-row-height / --table-cell-padding-y), shown in its own card.
 * Composed only from real @godxjp/ui components.
 */

type Line = { id: string; item: string; qty: string };

const lines: Line[] = [
  { id: "L-01", item: "ライセンス", qty: "12" },
  { id: "L-02", item: "保守費", qty: "1" },
  { id: "L-03", item: "初期構築", qty: "1" },
];

const columns: ColumnDef<Line>[] = [
  { key: "id", header: "明細", width: "w-20" },
  { key: "item", header: "品目" },
  {
    key: "qty",
    header: "数量",
    align: "right",
    render: (row) => <Text tabular>{row.qty}</Text>,
  },
];

/** The same real controls, rendered once per density column. */
function DensitySample({ idPrefix }: { idPrefix: string }) {
  return (
    <Flex direction="col" gap="md">
      <Input defaultValue="株式会社ベトヤ" aria-label="取引先名" />
      <Select defaultValue="paid" name={`${idPrefix}-status`}>
        <SelectTrigger id={`${idPrefix}-status`} aria-label="状態">
          <SelectValue placeholder="状態を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">下書き</SelectItem>
          <SelectItem value="sent">送付済</SelectItem>
          <SelectItem value="paid">入金済</SelectItem>
        </SelectContent>
      </Select>
      <Flex direction="row" align="center" gap="md" wrap>
        <Field id={`${idPrefix}-tax`} label="税込表示">
          <Checkbox id={`${idPrefix}-tax`} defaultChecked />
        </Field>
        <Field id={`${idPrefix}-mail`} label="自動送信">
          <Switch id={`${idPrefix}-mail`} defaultChecked />
        </Field>
      </Flex>
      <Flex direction="row" align="center" gap="sm" wrap>
        <Button size="sm">保存</Button>
        <Button size="sm" variant="outline">
          下書き
        </Button>
        <Button size="sm" variant="ghost" disabled>
          ロック中
        </Button>
      </Flex>
    </Flex>
  );
}

const density = [
  {
    cls: "ui-density-compact",
    label: "compact",
    role: "kintone 風の密なテーブル",
  },
  {
    cls: "ui-density-default",
    label: "default",
    role: "標準アプリ画面",
  },
  {
    cls: "ui-density-comfortable",
    label: "comfortable",
    role: "公開 / モバイル · WCAG タッチ floor",
  },
];

export default function Demo() {
  return (
    <PageContainer
      title="Density"
      subtitle="One knob — <PageContainer density> — retunes controls, tables, checkbox/switch, φ unit"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Same UI, three densities</CardTitle>
            <CardDescription>
              Set density once per page via {"<PageContainer density>"} — never the .ui-density-*
              classes directly. Flip the one prop and Input, Select, Checkbox, Switch and Button all
              re-tune their height, padding and the φ rhythm together. 44px (comfortable) is the
              WCAG / Digital Agency touch floor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="lg" align="start" wrap>
              {density.map((d) => (
                <Flex key={d.cls} direction="col" gap="sm" className="min-w-72 flex-1">
                  <Flex direction="row" align="center" justify="between" gap="sm">
                    <Text size="xs" mono>
                      density=&quot;{d.label}&quot;
                    </Text>
                    {d.label === "default" && <Badge variant="secondary">default</Badge>}
                  </Flex>
                  <Text size="xs" tone="muted">
                    {d.role}
                  </Text>
                  <div className={d.cls}>
                    <DensitySample idPrefix={d.label} />
                  </div>
                </Flex>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table row density (DataTable density)</CardTitle>
            <CardDescription>
              The DataTable owns its own density axis — density=&quot;compact&quot; vs
              density=&quot;comfortable&quot; swaps --table-row-height and --table-cell-padding-y.
              The density toggle in the table toolbar drives the same prop at runtime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="lg" align="start" wrap>
              <Flex direction="col" gap="sm" className="min-w-72 flex-1">
                <Text size="xs" mono>
                  density=&quot;compact&quot;
                </Text>
                <Card>
                  <CardContent flush>
                    <DataTable
                      data={lines}
                      columns={columns}
                      getRowId={(row) => row.id}
                      density="compact"
                    />
                  </CardContent>
                </Card>
              </Flex>
              <Flex direction="col" gap="sm" className="min-w-72 flex-1">
                <Text size="xs" mono>
                  density=&quot;comfortable&quot;
                </Text>
                <Card>
                  <CardContent flush>
                    <DataTable
                      data={lines}
                      columns={columns}
                      getRowId={(row) => row.id}
                      density="comfortable"
                    />
                  </CardContent>
                </Card>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page-level knob (PageContainer density)</CardTitle>
            <CardDescription>
              In a real screen you pass density to the page shell once; this nested PageContainer is
              the comfortable knob applied to a whole form — note the taller controls and looser φ
              rhythm versus the compact column above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageContainer
              density="comfortable"
              title="請求書を作成"
              subtitle="comfortable density — login / mobile surfaces"
            >
              <Flex direction="col" gap="md">
                <Input defaultValue="2024-04-12" aria-label="発行日" />
                <Select defaultValue="JPY" name="page-currency">
                  <SelectTrigger id="page-currency" aria-label="通貨">
                    <SelectValue placeholder="通貨を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JPY">JPY 日本円</SelectItem>
                    <SelectItem value="USD">USD 米ドル</SelectItem>
                  </SelectContent>
                </Select>
                <Field id="page-terms" label="利用規約に同意する">
                  <Checkbox id="page-terms" defaultChecked />
                </Field>
                <Flex direction="row" gap="sm" wrap>
                  <Button>発行する</Button>
                  <Button variant="outline">下書き保存</Button>
                </Flex>
              </Flex>
            </PageContainer>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
