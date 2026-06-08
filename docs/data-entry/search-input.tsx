import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { SearchInput } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * SearchInput — debounced search box with a built-in clear button.
 * Always listen to onSearch (NOT onChange). Uncontrolled for local filters,
 * controlled when search state lives in a URL param. Never a raw <input>.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [journalQuery, setJournalQuery] = useState("");
  const [partnerQuery, setPartnerQuery] = useState("");

  const journals = [
    { id: "JE-0001", desc: "売上計上 — 株式会社山田商事" },
    { id: "JE-0002", desc: "仕入計上 — 有限会社田中工業" },
    { id: "JE-0003", desc: "経費精算 — 交通費" },
    { id: "JE-0004", desc: "売上計上 — ABC株式会社" },
    { id: "JE-0005", desc: "給与支払 — 2024年3月分" },
  ];

  const filtered = journals.filter(
    (j) =>
      j.id.toLowerCase().includes(journalQuery.toLowerCase()) ||
      j.desc.toLowerCase().includes(journalQuery.toLowerCase()),
  );

  return (
    <PageContainer
      title="SearchInput"
      subtitle="デバウンス付き検索ボックス — onSearch でフィルタリングを駆動する"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>仕訳一覧フィルター（制御モード）</CardTitle>
            <CardDescription>
              value + onValueChange で即時制御（入力に追従）。onSearch は 250 ms
              デバウンス後に発火。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <SearchInput
                placeholder="仕訳ID・摘要で検索"
                value={journalQuery}
                onValueChange={setJournalQuery}
                onSearch={() => {}}
              />
              <Flex direction="col" gap="sm">
                {filtered.length === 0 ? (
                  <Text as="p" tone="muted">
                    該当なし
                  </Text>
                ) : (
                  filtered.map((j) => (
                    <Text as="p" key={j.id}>
                      <Text tone="muted" mono>
                        {j.id}
                      </Text>{" "}
                      {j.desc}
                    </Text>
                  ))
                )}
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>取引先検索（非制御モード）</CardTitle>
            <CardDescription>
              defaultValue のみ渡して非制御。ローカルフィルターに適す。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <SearchInput
                placeholder="取引先名で検索"
                defaultValue=""
                onSearch={setPartnerQuery}
                debounce={300}
              />
              {partnerQuery && (
                <Text as="p" tone="muted">
                  検索中:{" "}
                  <Text as="strong" weight="medium">
                    {partnerQuery}
                  </Text>
                </Text>
              )}
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カスタム ariaLabel</CardTitle>
            <CardDescription>隣接するラベルがない場合は ariaLabel で補完する。</CardDescription>
          </CardHeader>
          <CardContent>
            <SearchInput placeholder="勘定科目コードで検索" onSearch={() => {}} />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
