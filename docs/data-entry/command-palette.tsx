import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  CommandPalette,
  type CommandPaletteItem,
  type CommandPaletteLabels,
} from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

const labels: CommandPaletteLabels = {
  open: "画面を検索",
  title: "コマンドパレット",
  description: "移動先または実行する操作を検索します。",
  placeholder: "画面や操作を検索…",
  empty: "一致する項目はありません。",
  loading: "候補を読み込み中…",
  move: "移動",
  select: "開く",
  close: "閉じる",
};

const groups = [
  {
    id: "screens",
    label: "画面",
    items: [
      { id: "dashboard", label: "ダッシュボード", meta: "/dashboard" },
      { id: "members", label: "メンバー管理", meta: "/organization/members" },
      {
        id: "billing",
        label: "請求とサブスクリプション",
        meta: "権限が必要",
        disabled: true,
      },
    ],
  },
  {
    id: "actions",
    label: "操作",
    items: [{ id: "invite", label: "メンバーを招待", meta: "⌘ I" }],
  },
];

/**
 * CommandPalette — searchable keyboard navigation with controlled async/error states and a durable
 * selected-item readout. Press Command/Ctrl+K or use the trigger.
 */
export default function Demo() {
  const [selected, setSelected] = useState<CommandPaletteItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <PageContainer title="CommandPalette" subtitle="キーボード検索 · 選択 · loading/error recovery">
      <Card>
        <CardHeader>
          <CardTitle level={2}>組織コンソールの移動先</CardTitle>
          <CardDescription>
            Command/Ctrl+K で開き、矢印キーで移動し、Enter で選択します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction="col" gap="md">
            <CommandPalette
              groups={groups}
              labels={labels}
              loading={loading}
              error={error}
              onSelect={(item) => setSelected(item)}
            />
            <Text size="sm" tone="muted" aria-live="polite">
              {selected ? `選択: ${String(selected.label)}` : "まだ項目を選択していません。"}
            </Text>
            <Flex gap="sm" wrap>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(undefined);
                  setLoading((current) => !current);
                }}
              >
                読み込み状態を切替
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(false);
                  setError((current) => (current ? undefined : "候補を取得できませんでした。"));
                }}
              >
                エラー状態を切替
              </Button>
            </Flex>
          </Flex>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
