import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import {
  Flex,
  OrgSwitcher,
  type OrgSwitcherLabels,
  PageContainer,
  ResponsiveGrid,
} from "@godxjp/ui/layout";

const organizations = [
  { id: "godx", name: "Godx株式会社", meta: "Owner" },
  {
    id: "platform",
    name: "非常に長い組織名株式会社プラットフォーム開発本部",
    meta: "Member",
  },
  { id: "suspended", name: "Archived Workspace", meta: "利用停止", disabled: true },
];

const labels: OrgSwitcherLabels = {
  trigger: (name) => `現在の組織: ${name}`,
  title: "組織を選択",
  search: "組織を検索",
  empty: "組織が見つかりません。",
  loading: "組織を読み込み中",
  retry: "再試行",
};

/**
 * OrgSwitcher — controlled organization selection plus explicit loading and recoverable error
 * states. Use the responsive mode to inspect the popover contract without viewport inference.
 */
export default function Demo() {
  const [value, setValue] = useState("godx");
  const [error, setError] = useState("組織一覧を取得できませんでした。");

  return (
    <PageContainer title="OrgSwitcher" subtitle="選択 · 検索 · collapsed · loading/error">
      <ResponsiveGrid columns={{ sm: 1, lg: 2 }}>
        <Card>
          <CardHeader>
            <CardTitle level={2}>デスクトップの組織選択</CardTitle>
            <CardDescription>検索可能なpopover。選択状態はconsumerが保持します。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <OrgSwitcher
                organizations={organizations}
                value={value}
                onValueChange={setValue}
                labels={labels}
                responsive="auto"
              />
              <Text size="sm" tone="muted" aria-live="polite">
                選択中: {organizations.find((organization) => organization.id === value)?.name}
              </Text>
              <OrgSwitcher
                organizations={organizations}
                value={value}
                labels={labels}
                collapsed
                responsive="sheet"
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>非同期状態</CardTitle>
            <CardDescription>
              loadingとerrorは選択操作の代わりに同じ所有surfaceへ表示されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <OrgSwitcher
                organizations={organizations}
                value={value}
                labels={labels}
                loading
                responsive="popover"
              />
              <OrgSwitcher
                organizations={organizations}
                value={value}
                labels={labels}
                error={error}
                onRetry={() => setError("")}
                responsive="popover"
              />
              {!error ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError("再試行に失敗しました。")}
                >
                  エラーを復元
                </Button>
              ) : null}
            </Flex>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </PageContainer>
  );
}
