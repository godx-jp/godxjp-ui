import { useEffect, useRef, useState } from "react";

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

const directory = [
  { id: "tanaka", label: "田中 太郎", meta: "経理部" },
  { id: "suzuki", label: "鈴木 花子", meta: "情報システム部" },
  { id: "sato", label: "佐藤 健", meta: "営業部" },
  { id: "takahashi", label: "高橋 美咲", meta: "人事部" },
];

const serverLabels: CommandPaletteLabels = {
  ...labels,
  open: "メンバーを検索",
  title: "メンバー検索",
  description: "サーバー検索で該当するメンバーを表示します。",
  placeholder: "氏名または部署で検索…",
  empty: "該当するメンバーはいません。",
  loading: "検索中…",
};

/**
 * Server-backed search-as-you-type. The consumer owns the query (`onSearchChange`) and the result
 * set, so `shouldFilter={false}` stops the palette from scoring the same rows a second time — and
 * with it off the palette derives the empty node from `groups`, never from cmdk's scheduled count.
 * `loading` is held for the whole in-flight window: a request that has not answered is not an
 * empty result, so "該当なし" can only appear on a query the server actually answered.
 */
function ServerSearchDemo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(directory);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    const request = (requestRef.current += 1);
    setLoading(true);
    const timer = setTimeout(() => {
      if (request !== requestRef.current) return;
      const trimmed = query.trim();
      setResults(
        trimmed === ""
          ? directory
          : directory.filter((entry) => `${entry.label}${entry.meta}`.includes(trimmed)),
      );
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Flex direction="col" gap="md">
      <CommandPalette
        shouldFilter={false}
        search={query}
        onSearchChange={setQuery}
        loading={loading}
        groups={[{ id: "members", label: "メンバー", items: results }]}
        labels={serverLabels}
        onSelect={(item) => setQuery(String(item.label))}
      />
      <Text size="sm" tone="muted" aria-live="polite">
        {`クエリ: ${query === "" ? "(未入力)" : query} · 結果 ${results.length} 件`}
      </Text>
    </Flex>
  );
}

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
      <Card>
        <CardHeader>
          <CardTitle level={2}>サーバー検索（search-as-you-type）</CardTitle>
          <CardDescription>
            `onSearchChange` でクエリを受け取り、結果を `groups` として返します。`shouldFilter=
            false` でクライアント側の再フィルタを止め、空状態は `groups` から決まります。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServerSearchDemo />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
