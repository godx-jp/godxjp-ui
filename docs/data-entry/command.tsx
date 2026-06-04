import { useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@godxjp/ui/data-entry";
import { Skeleton } from "@godxjp/ui/feedback";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Command — キーボードナビゲーション対応のコマンドパレット。
 * 必ずツリー構造を守る: Command > CommandInput + CommandList > CommandGroup > CommandItem。
 * CommandItem は必ず CommandList の内側に配置する。
 * CommandEmpty は CommandList の内側に置くと自動で表示/非表示が切り替わる。
 * Composed only from real @godxjp/ui components.
 */

type Suggestion = { value: string; label: string };

const VENDOR_DIRECTORY: Suggestion[] = [
  { value: "v-001", label: "株式会社山田商事" },
  { value: "v-002", label: "山下電機株式会社" },
  { value: "v-003", label: "やまと運輸サービス" },
  { value: "v-004", label: "佐藤工業株式会社" },
  { value: "v-005", label: "田中物産" },
];

export default function Demo() {
  // Card 1: grouped quick-select. Controlled `value` pre-highlights an item so the
  // [aria-selected=true] accent is visible at rest, without keyboard interaction.
  const [account, setAccount] = useState<string>("1020");

  // Card 2: action palette — its own independent state (Rule #6).
  const [action, setAction] = useState<string>("");

  // Card 3: async server-side search. `shouldFilter={false}` + controlled input +
  // an externally-fetched result list, staged mid-flight so the loading row renders.
  const [query, setQuery] = useState<string>("やま");
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<Suggestion[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    // Simulated server round-trip; the delay keeps the loading state observable at rest.
    const timer = setTimeout(() => {
      if (!active) return;
      const q = query.trim();
      setResults(q ? VENDOR_DIRECTORY.filter((v) => v.label.includes(q)) : []);
      setLoading(false);
    }, 1500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <PageContainer
      title="Command"
      subtitle="コマンドパレット / キーボードナビゲーション — cmdk ベース"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>勘定科目クイック選択</CardTitle>
            <CardDescription>
              グループ化された科目リストをキーボードで素早く選択。 ハイライト中の科目を value
              で制御（現在: {account || "未選択"}）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command label="勘定科目クイック選択" loop value={account} onValueChange={setAccount}>
              <CommandInput placeholder="科目名・コードで検索..." />
              <CommandList>
                <CommandEmpty>該当する科目がありません。</CommandEmpty>
                <CommandGroup heading="資産">
                  <CommandItem value="1010" onSelect={setAccount}>
                    1010 — 現金
                  </CommandItem>
                  <CommandItem value="1020" onSelect={setAccount}>
                    1020 — 普通預金
                  </CommandItem>
                  <CommandItem value="1030" onSelect={setAccount}>
                    1030 — 売掛金
                  </CommandItem>
                  <CommandItem value="1040" onSelect={setAccount}>
                    1040 — 前払費用
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="負債">
                  <CommandItem value="2010" onSelect={setAccount}>
                    2010 — 買掛金
                  </CommandItem>
                  <CommandItem value="2020" onSelect={setAccount}>
                    2020 — 未払費用
                  </CommandItem>
                  <CommandItem value="2030" onSelect={setAccount} disabled>
                    2030 — 廃止済科目（選択不可）
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="収益">
                  <CommandItem value="4010" onSelect={setAccount}>
                    4010 — 売上高
                  </CommandItem>
                  <CommandItem value="4020" onSelect={setAccount}>
                    4020 — 受取利息
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="費用">
                  <CommandItem value="5010" onSelect={setAccount}>
                    5010 — 売上原価
                  </CommandItem>
                  <CommandItem value="5020" onSelect={setAccount}>
                    5020 — 給料手当
                  </CommandItem>
                  <CommandItem value="5030" onSelect={setAccount}>
                    5030 — 旅費交通費
                  </CommandItem>
                  <CommandItem value="5040" onSelect={setAccount}>
                    5040 — 通信費
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>勤怠アクションパレット（Cmd+K 想定）</CardTitle>
            <CardDescription>
              ページ横断のクイックアクション。キーワードで絞り込み、Enter で実行。 実行:{" "}
              {action || "なし"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command label="アクションパレット" loop vimBindings={false}>
              <CommandInput placeholder="アクションを検索..." />
              <CommandList>
                <CommandEmpty>一致するアクションがありません。</CommandEmpty>
                <CommandGroup heading="打刻">
                  <CommandItem
                    value="clock-in"
                    keywords={["出勤", "打刻", "開始"]}
                    onSelect={setAction}
                  >
                    出勤打刻
                  </CommandItem>
                  <CommandItem
                    value="clock-out"
                    keywords={["退勤", "打刻", "終了"]}
                    onSelect={setAction}
                  >
                    退勤打刻
                  </CommandItem>
                  <CommandItem value="break-start" keywords={["休憩", "開始"]} onSelect={setAction}>
                    休憩開始
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="申請">
                  <CommandItem
                    value="apply-leave"
                    keywords={["有給", "休暇", "申請"]}
                    onSelect={setAction}
                  >
                    有給休暇申請
                  </CommandItem>
                  <CommandItem
                    value="apply-overtime"
                    keywords={["残業", "時間外", "申請"]}
                    onSelect={setAction}
                  >
                    時間外勤務申請
                  </CommandItem>
                  <CommandItem
                    value="apply-remote"
                    keywords={["テレワーク", "在宅", "リモート", "申請"]}
                    onSelect={setAction}
                  >
                    テレワーク申請
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="ナビゲーション">
                  <CommandItem
                    value="nav-dashboard"
                    keywords={["ダッシュボード", "トップ", "ホーム"]}
                    onSelect={setAction}
                  >
                    ダッシュボードへ移動
                  </CommandItem>
                  <CommandItem
                    value="nav-attendance"
                    keywords={["勤怠", "一覧", "確認"]}
                    onSelect={setAction}
                  >
                    勤怠一覧へ移動
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>取引先サーバー検索（非同期）</CardTitle>
            <CardDescription>
              shouldFilter={"{false}"} で内蔵フィルタを無効化し、入力値（value /
              onValueChange）でサーバー検索した結果だけを表示。 取得中はローディング行、0
              件は CommandEmpty を表示。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command label="取引先サーバー検索" loop shouldFilter={false}>
              <CommandInput
                placeholder="取引先名で検索..."
                value={query}
                onValueChange={setQuery}
              />
              <CommandList aria-busy={loading}>
                {loading ? (
                  <Flex direction="col" gap="sm" className="ui-command-group" aria-live="polite">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </Flex>
                ) : (
                  <>
                    <CommandEmpty>該当する取引先が見つかりません。</CommandEmpty>
                    {results.length > 0 ? (
                      <CommandGroup heading="検索結果">
                        {results.map((v) => (
                          <CommandItem key={v.value} value={v.value} onSelect={() => undefined}>
                            {v.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : null}
                  </>
                )}
              </CommandList>
            </Command>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
