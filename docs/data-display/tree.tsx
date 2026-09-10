import * as React from "react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
  EmptyState,
  ScrollArea,
  Tree,
  type TreeNodeProp,
} from "@godxjp/ui/data-display";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer, Separator } from "@godxjp/ui/layout";
import { Building2, FolderTree, ShieldCheck } from "lucide-react";

/**
 * Tree — the standalone WAI-ARIA "Tree View" on a page.
 *
 * The screen is a real one: an access-control settings page whose left column is the permission
 * tree the administrator ticks, and whose right column reads back exactly what that means. Every
 * card below is an independent pattern with its own data and its own state, and every prop the
 * component declares is exercised somewhere on the page, at rest, without clicking.
 */

// ── card 1 · the permission tree ────────────────────────────────────────────────────────────
const permissions: TreeNodeProp[] = [
  {
    value: "billing",
    label: "請求管理",
    children: [
      { value: "billing.invoice.read", label: "請求書を閲覧" },
      { value: "billing.invoice.write", label: "請求書を発行" },
      { value: "billing.refund", label: "返金を実行", disableCheckbox: true },
    ],
  },
  {
    value: "people",
    label: "人事",
    children: [
      { value: "people.read", label: "プロフィールを閲覧" },
      { value: "people.write", label: "プロフィールを編集" },
      {
        value: "people.payroll",
        label: "給与",
        children: [
          { value: "people.payroll.read", label: "給与明細を閲覧" },
          { value: "people.payroll.approve", label: "給与を承認", disabled: true },
        ],
      },
    ],
  },
  { value: "audit", label: "監査ログ", isLeaf: true },
];

const permissionLabels = new Map<string, string>([
  ["billing", "請求管理"],
  ["billing.invoice.read", "請求書を閲覧"],
  ["billing.invoice.write", "請求書を発行"],
  ["billing.refund", "返金を実行"],
  ["people", "人事"],
  ["people.read", "プロフィールを閲覧"],
  ["people.write", "プロフィールを編集"],
  ["people.payroll", "給与"],
  ["people.payroll.read", "給与明細を閲覧"],
  ["people.payroll.approve", "給与を承認"],
  ["audit", "監査ログ"],
]);

// ── card 2 · the directory browser ──────────────────────────────────────────────────────────
const repository: TreeNodeProp[] = [
  {
    value: "src",
    label: "src",
    children: [
      {
        value: "src/components",
        label: "components",
        children: [
          { value: "src/components/tree.tsx", label: "tree.tsx", isLeaf: true },
          { value: "src/components/tree-list.tsx", label: "tree-list.tsx", isLeaf: true },
        ],
      },
      { value: "src/index.ts", label: "index.ts", isLeaf: true },
    ],
  },
  {
    value: "docs",
    label: "docs",
    children: [{ value: "docs/tree.mdx", label: "tree.mdx", isLeaf: true }],
  },
];

const fileDetails: Record<string, { size: string; changed: string }> = {
  "src/components/tree.tsx": { size: "18.4 KB", changed: "2026-09-10" },
  "src/components/tree-list.tsx": { size: "1.2 KB", changed: "2025-11-02" },
  "src/index.ts": { size: "0.9 KB", changed: "2026-08-21" },
  "docs/tree.mdx": { size: "4.1 KB", changed: "2026-09-10" },
};

// ── card 3 · async branches (fieldNames + loadData + titleRender) ────────────────────────────
type Department = { id: string; name: string; leaf?: boolean; units?: Department[] };

const initialDepartments: Department[] = [
  { id: "jp", name: "日本法人" },
  { id: "vn", name: "ベトナム法人" },
  { id: "sg", name: "シンガポール支店", leaf: true },
];

const departmentChildren: Record<string, Department[]> = {
  jp: [
    { id: "jp-sales", name: "営業部", leaf: true },
    { id: "jp-dev", name: "開発部", leaf: true },
  ],
  vn: [{ id: "vn-dev", name: "開発センター", leaf: true }],
};

function attachChildren(nodes: Department[], id: string, children: Department[]): Department[] {
  return nodes.map((node) =>
    node.id === id
      ? { ...node, units: children }
      : { ...node, units: node.units ? attachChildren(node.units, id, children) : undefined },
  );
}

export default function Demo() {
  // Card 1 — checks are controlled so the readout beside the tree can never disagree with it.
  const [granted, setGranted] = React.useState<string[]>(["billing.invoice.read"]);
  // Card 2 — selection is controlled and drives the detail pane.
  const [openFile, setOpenFile] = React.useState<string | undefined>("src/components/tree.tsx");
  // Card 3 — async children land in state, exactly as a real fetch would.
  const [departments, setDepartments] = React.useState<Department[]>(initialDepartments);
  // Card 5 — independent (strict) checks, and a multi-select tree.
  const [strictChecks, setStrictChecks] = React.useState<string[]>(["people", "people.read"]);
  const [picked, setPicked] = React.useState<string[]>(["billing", "audit"]);

  const loadDepartment = async (node: TreeNodeProp) => {
    // A real delay, so the Skeleton row and aria-busy are OBSERVABLE rather than theoretical.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const children = departmentChildren[node.value] ?? [];
    setDepartments((current) => attachChildren(current, node.value, children));
  };

  return (
    <PageContainer
      title="Tree"
      subtitle="アクセス権限の設定 · 展開できる階層は Tree、平坦なインデントだけなら TreeList"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>権限ツリー（checkable · 三状態）</CardTitle>
            <CardDescription>
              親をチェックすると配下すべてが入り、一部だけのときは親がダッシュ（indeterminate）
              になります。「返金を実行」は disableCheckbox（チェックだけ不可）、「給与を承認」は
              disabled。どちらも親の分母に入らないため、残りを全部入れれば親はチェック済みになります。
              showLine で接続線、defaultExpandAll で最初から全展開。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="lg" wrap>
              <Tree
                aria-label="権限ツリー"
                treeData={permissions}
                checkable
                showLine
                defaultExpandAll
                checkedValues={granted}
                onCheckedValuesChange={setGranted}
              />
              <Separator orientation="vertical" />
              <Flex direction="col" gap="sm">
                <Text size="sm" tone="muted">
                  付与された権限（{granted.length} 件）
                </Text>
                {granted.length === 0 ? (
                  <EmptyState
                    icon={ShieldCheck}
                    title="権限がありません"
                    description="ツリーから付与する権限を選んでください。"
                  />
                ) : (
                  <Flex gap="xs" wrap>
                    {granted.map((value) => (
                      <Badge key={value} variant="secondary">
                        {permissionLabels.get(value) ?? value}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ファイルブラウザ（variant=&quot;directory&quot;）</CardTitle>
            <CardDescription>
              DirectoryTree 相当。showIcon でフォルダ／ファイルのグリフが出て、選択行は行全体が帯に
              なります。選択は value / onValueChange
              の制御コンポーネントで、右の詳細と常に一致します。 長いツリーは ScrollArea
              で高さを止めます（v1 に仮想スクロールはありません）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="lg" wrap>
              <ScrollArea className="max-h-64 w-72">
                <Tree
                  aria-label="リポジトリ"
                  variant="directory"
                  showIcon
                  treeData={repository}
                  defaultExpandedValues={["src", "src/components"]}
                  value={openFile}
                  onValueChange={(next) => setOpenFile(next as string | undefined)}
                />
              </ScrollArea>
              <Flex direction="col" gap="sm">
                {openFile && fileDetails[openFile] ? (
                  <Descriptions
                    items={[
                      { label: "パス", children: openFile },
                      { label: "サイズ", children: fileDetails[openFile].size },
                      { label: "最終更新", children: fileDetails[openFile].changed },
                    ]}
                  />
                ) : (
                  <EmptyState
                    icon={FolderTree}
                    title="ファイルが選択されていません"
                    description="ツリーからファイルを選ぶと詳細が出ます。"
                  />
                )}
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>組織ツリー（loadData · fieldNames · titleRender）</CardTitle>
            <CardDescription>
              API のキーが id / name / units でも fieldNames で読み替えるだけ。子を持たない枝は
              isLeaf: false 扱いで、初回展開時に loadData が一度だけ走り、その間は Skeleton 行と
              aria-busy が出ます（1.2 秒の実待ち）。titleRender で行の見た目を差し替えています。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tree
              aria-label="組織ツリー"
              size="lg"
              showIcon
              treeData={
                departments.map((node) => ({
                  ...node,
                  isLeaf: node.leaf ?? false,
                  icon: <Building2 />,
                })) as unknown as TreeNodeProp[]
              }
              fieldNames={{ label: "name", value: "id", children: "units" }}
              loadData={loadDepartment}
              titleRender={(node) => (
                <Text size="sm" weight="medium">
                  {node.label}
                </Text>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>checkStrictly と multiple（チェックと選択は別の軸）</CardTitle>
            <CardDescription>
              左は checkStrictly：親と子のチェックは独立で、カスケードも indeterminate
              もありません。 右は multiple の選択（チェックボックスなし）。ひとつの Tree で value と
              checkedValues が別々に動くことが分かるよう、読み出しを両方出しています。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="lg" wrap>
              <Flex direction="col" gap="sm">
                <Text size="sm" tone="muted">
                  checkStrictly · チェック: {strictChecks.length} 件
                </Text>
                <Tree
                  aria-label="権限ツリー（独立チェック）"
                  treeData={permissions}
                  checkable
                  checkStrictly
                  defaultExpandedValues={["people"]}
                  checkedValues={strictChecks}
                  onCheckedValuesChange={setStrictChecks}
                />
              </Flex>
              <Separator orientation="vertical" />
              <Flex direction="col" gap="sm">
                <Text size="sm" tone="muted">
                  multiple · 選択:{" "}
                  {picked.map((value) => permissionLabels.get(value) ?? value).join(" / ")}
                </Text>
                <Tree
                  aria-label="権限ツリー（複数選択）"
                  treeData={permissions}
                  multiple
                  defaultExpandAll
                  value={picked}
                  onValueChange={(next) => setPicked((next ?? []) as string[])}
                />
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>size の全段階 · disabled · 空</CardTitle>
            <CardDescription>
              行の高さは --control-height の段（xs / sm / md / lg）から来るので、同じ行に並ぶ他の
              コントロールと常に揃います。disabled
              はツリー全体を固め（読めるまま、開閉も選択も不可）、 treeData が空なら
              role=&quot;status&quot; の空メッセージが出ます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="lg" wrap>
              {(["xs", "sm", "md", "lg"] as const).map((step) => (
                <Flex key={step} direction="col" gap="xs">
                  <Text size="sm" tone="muted">
                    size=&quot;{step}&quot;
                  </Text>
                  <Tree
                    aria-label={`サイズ ${step}`}
                    size={step}
                    treeData={repository}
                    defaultExpandedValues={["src"]}
                  />
                </Flex>
              ))}
              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  disabled
                </Text>
                <Tree
                  aria-label="読み取り専用ツリー"
                  disabled
                  treeData={repository}
                  defaultExpandAll
                  defaultValue="src/index.ts"
                />
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  空
                </Text>
                <Tree aria-label="空のツリー" treeData={[]} />
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>キーボード（WAI-ARIA APG）</CardTitle>
            <CardDescription>
              ツリーに Tab で入るとタブストップはひとつだけ（roving
              tabindex）。あとは矢印で歩けます。 dir=&quot;rtl&quot; では → と ←
              の意味が入れ替わり、インデントも反転します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions
              items={[
                { label: "↓ / ↑", children: "表示されている次／前のノードへ" },
                { label: "→", children: "閉じた枝を開く。開いていれば最初の子へ" },
                { label: "←", children: "開いた枝を閉じる。閉じていれば親へ" },
                { label: "Home / End", children: "表示されている最初／最後のノードへ" },
                {
                  label: "Enter / Space",
                  children: "選択（checkable のときはチェックを切り替え）",
                },
                { label: "*", children: "同じ階層の兄弟をすべて展開" },
                { label: "文字キー", children: "先頭一致で次のノードへジャンプ（type-ahead）" },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
