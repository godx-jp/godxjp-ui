/**
 * ServiceRolePanel — ロール一覧 ⇄ 詳細 (canonical master-detail roles surface, gh#257).
 *
 * MasterDetail (rail=master) underneath owns all geometry: two tracks at 1440/1024, stacked
 * list-then-detail at 390. The panel adds selection (aria-current rows), locked system roles,
 * the built-in destructive AlertDialog (onDeleteRole fires only after confirm) and #216
 * lifecycle states. The detail body is consumer-composed — here a PermissionMatrix.
 */
import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
  PermissionMatrix,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer, ServiceRolePanel } from "@godxjp/ui/layout";
import { toast } from "@godxjp/ui/feedback";
import { grantKey } from "@godxjp/ui/lib/permission-grid";

const ROLES = [
  {
    id: "owner",
    name: "オーナー",
    description: "契約・請求を含む全操作",
    memberCount: 1,
    locked: true,
  },
  { id: "operator", name: "オペレーター", description: "日常運用の操作", memberCount: 12 },
  { id: "analyst", name: "アナリスト", description: "閲覧とレポート出力", memberCount: 34 },
];

const PERMISSIONS = [
  { id: "instance.manage", name: "インスタンス管理", group: "運用" },
  { id: "member.invite", name: "メンバー招待", group: "管理" },
  { id: "report.export", name: "レポート出力", group: "レポート" },
];

const GRANTS = new Set<string>([
  ...PERMISSIONS.map((p) => grantKey("owner", p.id)),
  grantKey("operator", "instance.manage"),
  grantKey("operator", "member.invite"),
  grantKey("analyst", "report.export"),
]);

export default function Demo() {
  const [selected, setSelected] = React.useState("operator");

  return (
    <PageContainer
      title="ServiceRolePanel"
      subtitle="ロールの一覧（レール）と選択中ロールの詳細。削除は破壊的確認ダイアログの後にのみ発火。"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>選択 + 削除確認</CardTitle>
            <CardDescription>
              locked の「オーナー」に削除ボタンは出ない。削除は AlertDialog で確認後に
              onDeleteRole。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceRolePanel
              roles={ROLES}
              value={selected}
              onValueChange={setSelected}
              onDeleteRole={(roleId) => toast.success(`ロール ${roleId} を削除しました（デモ）`)}
              masterViewport="compact"
            >
              {(role) =>
                role && (
                  <Flex direction="col" gap="md">
                    <Descriptions>
                      <Descriptions.Item label="ロール名">{role.name}</Descriptions.Item>
                      <Descriptions.Item label="説明">{role.description ?? "—"}</Descriptions.Item>
                      <Descriptions.Item label="メンバー数">
                        {String(role.memberCount ?? 0)}
                      </Descriptions.Item>
                    </Descriptions>
                    <PermissionMatrix
                      roles={[role]}
                      permissions={PERMISSIONS}
                      grants={GRANTS}
                      readOnly
                    />
                  </Flex>
                )
              }
            </ServiceRolePanel>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>読み取り専用</CardTitle>
            <CardDescription>readOnly では削除などの変更系アフォーダンスが消える。</CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceRolePanel roles={ROLES} onDeleteRole={() => {}} readOnly>
              {(role) =>
                role && (
                  <Descriptions>
                    <Descriptions.Item label="ロール名">{role.name}</Descriptions.Item>
                  </Descriptions>
                )
              }
            </ServiceRolePanel>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ライフサイクル状態（#216 の語彙）</CardTitle>
            <CardDescription>loading → denied → error → empty の優先順位。</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <ServiceRolePanel roles={[]} loading />
              <ServiceRolePanel roles={[]} denied />
              <ServiceRolePanel roles={[]} error onRetry={() => {}} />
              <ServiceRolePanel roles={[]} />
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
