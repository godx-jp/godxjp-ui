import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Command — キーボードナビゲーション対応のコマンドパレット。
 * 必ずツリー構造を守る: Command > CommandInput + CommandList > CommandGroup > CommandItem。
 * CommandItem は必ず CommandList の内側に配置する。
 * CommandEmpty は CommandList の内側に置くと自動で表示/非表示が切り替わる。
 * Composed only from real @godxjp/ui components.
 */

export default function Demo() {
  const [selected, setSelected] = useState<string>("");

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
              グループ化された科目リストをキーボードで素早く選択。 選択値: {selected || "未選択"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Command label="勘定科目クイック選択" loop>
              <CommandInput placeholder="科目名・コードで検索..." />
              <CommandList>
                <CommandEmpty>該当する科目がありません。</CommandEmpty>
                <CommandGroup heading="資産">
                  <CommandItem value="1010" onSelect={setSelected}>
                    1010 — 現金
                  </CommandItem>
                  <CommandItem value="1020" onSelect={setSelected}>
                    1020 — 普通預金
                  </CommandItem>
                  <CommandItem value="1030" onSelect={setSelected}>
                    1030 — 売掛金
                  </CommandItem>
                  <CommandItem value="1040" onSelect={setSelected}>
                    1040 — 前払費用
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="負債">
                  <CommandItem value="2010" onSelect={setSelected}>
                    2010 — 買掛金
                  </CommandItem>
                  <CommandItem value="2020" onSelect={setSelected}>
                    2020 — 未払費用
                  </CommandItem>
                  <CommandItem value="2030" onSelect={setSelected} disabled>
                    2030 — 廃止済科目（選択不可）
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="収益">
                  <CommandItem value="4010" onSelect={setSelected}>
                    4010 — 売上高
                  </CommandItem>
                  <CommandItem value="4020" onSelect={setSelected}>
                    4020 — 受取利息
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="費用">
                  <CommandItem value="5010" onSelect={setSelected}>
                    5010 — 売上原価
                  </CommandItem>
                  <CommandItem value="5020" onSelect={setSelected}>
                    5020 — 給料手当
                  </CommandItem>
                  <CommandItem value="5030" onSelect={setSelected}>
                    5030 — 旅費交通費
                  </CommandItem>
                  <CommandItem value="5040" onSelect={setSelected}>
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
              ページ横断のクイックアクション。キーワードで絞り込み、Enter で実行。
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
                    onSelect={(v) => setSelected(v)}
                  >
                    出勤打刻
                  </CommandItem>
                  <CommandItem
                    value="clock-out"
                    keywords={["退勤", "打刻", "終了"]}
                    onSelect={(v) => setSelected(v)}
                  >
                    退勤打刻
                  </CommandItem>
                  <CommandItem
                    value="break-start"
                    keywords={["休憩", "開始"]}
                    onSelect={(v) => setSelected(v)}
                  >
                    休憩開始
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="申請">
                  <CommandItem
                    value="apply-leave"
                    keywords={["有給", "休暇", "申請"]}
                    onSelect={(v) => setSelected(v)}
                  >
                    有給休暇申請
                  </CommandItem>
                  <CommandItem
                    value="apply-overtime"
                    keywords={["残業", "時間外", "申請"]}
                    onSelect={(v) => setSelected(v)}
                  >
                    時間外勤務申請
                  </CommandItem>
                  <CommandItem
                    value="apply-remote"
                    keywords={["テレワーク", "在宅", "リモート", "申請"]}
                    onSelect={(v) => setSelected(v)}
                  >
                    テレワーク申請
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="ナビゲーション">
                  <CommandItem
                    value="nav-dashboard"
                    keywords={["ダッシュボード", "トップ", "ホーム"]}
                    onSelect={(v) => setSelected(v)}
                  >
                    ダッシュボードへ移動
                  </CommandItem>
                  <CommandItem
                    value="nav-attendance"
                    keywords={["勤怠", "一覧", "確認"]}
                    onSelect={(v) => setSelected(v)}
                  >
                    勤怠一覧へ移動
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
