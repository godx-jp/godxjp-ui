/**
 * BranchScopePicker — 適用範囲 (all branches vs an explicit subset, gh#257).
 *
 * One controlled `{ mode, branchIds }` value; real RadioGroup + CheckboxGroup + SearchInput
 * underneath. `error` is FIELD VALIDATION (aria-errormessage); a failed branch read is
 * `listError`, a refused one is `denied` (#216 vocabulary). Branch data below is demo-only.
 */
import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { BranchScopePicker, FormField, type BranchScopeValueProp } from "@godxjp/ui/data-entry";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

const BRANCHES = [
  { id: "hq", name: "東京本社", description: "東京都千代田区" },
  { id: "osaka", name: "大阪支店", description: "大阪府大阪市" },
  { id: "nagoya", name: "名古屋支店", description: "愛知県名古屋市" },
  { id: "fukuoka", name: "福岡営業所", description: "福岡県福岡市" },
  {
    id: "hanoi",
    name: "Chi nhánh Hà Nội",
    description: "Việt Nam · đang chuẩn bị",
    disabled: true,
  },
];

export default function Demo() {
  const [scope, setScope] = React.useState<BranchScopeValueProp>({ mode: "all" });
  const [validated, setValidated] = React.useState<BranchScopeValueProp>({
    mode: "selected",
    branchIds: [],
  });

  const validationError =
    validated.mode === "selected" && (validated.branchIds?.length ?? 0) === 0
      ? "1 件以上のブランチを選択してください"
      : undefined;

  return (
    <PageContainer
      title="BranchScopePicker"
      subtitle="「すべてのブランチ」か「選択したブランチのみ」かを 1 つの値で扱う適用範囲コントロール。"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        <ResponsiveGrid columns={{ md: 2 }}>
          <Card>
            <CardHeader>
              <CardTitle level={2}>基本</CardTitle>
              <CardDescription>
                既定は「すべてのブランチ」。subset に切り替えると検索付きチェックリストが開く。 mode
                を戻しても branchIds は保持される。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField label="適用範囲" required>
                <BranchScopePicker branches={BRANCHES} value={scope} onValueChange={setScope} />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>バリデーション</CardTitle>
              <CardDescription>
                「選択したブランチのみ」で 0 件のままのとき、error が aria-errormessage
                付きで表示される。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField label="通知の配信範囲" required>
                <BranchScopePicker
                  branches={BRANCHES}
                  value={validated}
                  onValueChange={setValidated}
                  error={validationError}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>読み取り専用 / 無効</CardTitle>
              <CardDescription>
                readOnly は現在値の静的サマリー（バッジ）。disabled は表示のまま操作不可。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <BranchScopePicker
                  branches={BRANCHES}
                  value={{ mode: "selected", branchIds: ["hq", "osaka"] }}
                  readOnly
                />
                <BranchScopePicker
                  branches={BRANCHES}
                  value={{ mode: "selected", branchIds: ["hq"] }}
                  disabled
                />
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>コレクション状態（#216 の語彙）</CardTitle>
              <CardDescription>loading → denied → listError → empty の優先順位。</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <BranchScopePicker branches={[]} loading />
                <BranchScopePicker branches={[]} denied />
                <BranchScopePicker branches={[]} listError />
                <BranchScopePicker branches={[]} />
              </Flex>
            </CardContent>
          </Card>
        </ResponsiveGrid>
      </Flex>
    </PageContainer>
  );
}
