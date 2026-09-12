import { useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  DataTable,
  Descriptions,
  type CardTabItemProp,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Card `tabList` — Ant Design's card-head tab strip.
 *
 * The strip lives INSIDE the card's head: under the title, on the same surface, inside the same
 * border, so the card and its tabs read as one object. The card's children are the selected tab's
 * body — here a `DataTable` in a `CardContent flush`, which is what lets the table reach the card
 * edge instead of sitting in a second, narrower frame.
 *
 * What NOT to reach for instead: a `Tabs` parked on the page above a card (the strip floats off
 * the card and the two read as two objects), or a `Card` repeated inside every tab (the same
 * header and body shell copied once per view).
 */
const tabList: CardTabItemProp[] = [
  { key: "members", tab: "メンバー" },
  { key: "invitations", tab: "招待" },
  { key: "settings", tab: "設定" },
];

const members = [
  { id: "1", name: "佐藤 花子", email: "sato@example.co.jp", role: "管理者" },
  { id: "2", name: "鈴木 一郎", email: "suzuki@example.co.jp", role: "編集者" },
  { id: "3", name: "高橋 美咲", email: "takahashi@example.co.jp", role: "閲覧者" },
];

const invitations = [{ id: "4", name: "田中 健", email: "tanaka@example.co.jp", role: "編集者" }];

export default function Demo() {
  const [activeTabKey, setActiveTabKey] = useState("members");

  return (
    <PageContainer title="組織設定" subtitle="株式会社ベトヤ">
      <Card
        tabList={tabList}
        activeTabKey={activeTabKey}
        onTabChange={setActiveTabKey}
        extra={<Button size="sm">メンバーを招待</Button>}
      >
        <CardHeader>
          <CardTitle level={2}>チーム</CardTitle>
        </CardHeader>

        {activeTabKey === "settings" ? (
          <CardContent>
            <Descriptions>
              <Descriptions.Item label="組織名">株式会社ベトヤ</Descriptions.Item>
              <Descriptions.Item label="ドメイン">example.co.jp</Descriptions.Item>
              <Descriptions.Item label="既定の権限">閲覧者</Descriptions.Item>
            </Descriptions>
          </CardContent>
        ) : (
          <CardContent flush>
            <DataTable
              data={activeTabKey === "members" ? members : invitations}
              getRowId={(row) => row.id}
              columns={[
                { key: "name", header: "名前" },
                { key: "email", header: "メール" },
                {
                  key: "role",
                  header: "権限",
                  render: (row) => <Badge tone="info">{row.role}</Badge>,
                },
              ]}
            />
          </CardContent>
        )}

        <CardFooter separated>
          <Flex direction="row" justify="between" align="center" gap="sm">
            <Text tone="muted" size="sm">
              {activeTabKey === "invitations" ? "1件の保留中の招待" : "3名のメンバー"}
            </Text>
            <Button variant="outline" size="sm">
              CSV で書き出す
            </Button>
          </Flex>
        </CardFooter>
      </Card>
    </PageContainer>
  );
}
