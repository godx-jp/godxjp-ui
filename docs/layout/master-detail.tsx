import { useState } from "react";
import { CreditCard, ShieldCheck, Users } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, MasterDetail, PageContainer } from "@godxjp/ui/layout";

/**
 * MasterDetail · チーム画面 (SCR-110) の正準構成 — 流動的な一覧 + 固定幅の詳細レール。
 *
 * Shows: rail="detail" (既定 · 1fr / 320px) と rail="master" (先頭ナビゲーションレール)、
 * railWidth compact/standard、collapseBelow の全段階、そして master 側の選択コントロールを
 * aria-controls / フォーカス移動で detail region に結び付ける方法。
 *
 * 幾何はすべてトークン所有 (--master-detail-rail-*, --master-detail-gap,
 * --master-detail-collapse-below)。このページには grid-template-columns も
 * 画面幅ごとの余白指定も一切ありません — 1440 / 1024 / 390 のいずれでも同じ JSX です。
 *
 * 選択とキーボード操作は呼び出し側の責務 (ここでは DataTable の行クリックと
 * aria-pressed のトグルボタン)。MasterDetail はレイアウトと 2 つの region だけを所有します。
 */

type Team = {
  id: string;
  name: string;
  owner: string;
  members: number;
  updatedAt: string;
  status: "active" | "pending";
};

const TEAMS: Team[] = [
  {
    id: "core",
    name: "コアプラットフォーム",
    owner: "佐藤 智",
    members: 24,
    updatedAt: "2026-07-28",
    status: "active",
  },
  {
    id: "billing",
    name: "請求基盤",
    owner: "田中 花子",
    members: 12,
    updatedAt: "2026-07-26",
    status: "active",
  },
  {
    id: "support",
    name: "カスタマーサポート",
    owner: "鈴木 一郎",
    members: 38,
    updatedAt: "2026-07-21",
    status: "pending",
  },
  {
    id: "security",
    name: "セキュリティ",
    owner: "高橋 美咲",
    members: 6,
    updatedAt: "2026-07-19",
    status: "active",
  },
];

const SERVICES = [
  {
    id: "members",
    label: "メンバー管理",
    description: "招待、状態、所属チーム",
    icon: Users,
    count: 128,
  },
  {
    id: "security",
    label: "セキュリティ",
    description: "MFAポリシーと監査ログ",
    icon: ShieldCheck,
    count: 6,
  },
  {
    id: "billing",
    label: "請求",
    description: "プラン、請求書、支払い方法",
    icon: CreditCard,
    count: 12,
  },
];

const RAIL_WIDTHS = ["compact", "standard"] as const;
const COLLAPSE_STEPS = ["token", "sm", "md", "lg", "xl", "false"] as const;

const numberFormat = new Intl.NumberFormat("ja-JP");
const dateFormat = new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" });
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

const TEAM_DETAIL_ID = "master-detail-team-detail";
const SERVICE_DETAIL_ID = "master-detail-service-detail";

export default function Demo() {
  const [teamId, setTeamId] = useState("core");
  const [railWidth, setRailWidth] = useState<(typeof RAIL_WIDTHS)[number]>("standard");
  const [collapseStep, setCollapseStep] = useState<(typeof COLLAPSE_STEPS)[number]>("token");
  const [serviceId, setServiceId] = useState("members");

  const team = TEAMS.find((item) => item.id === teamId) ?? TEAMS[0];
  const service = SERVICES.find((item) => item.id === serviceId) ?? SERVICES[0];
  const ServiceIcon = service.icon;

  // "token" は prop を渡さない = テーマの --master-detail-collapse-below に委ねる状態。
  const collapseBelow =
    collapseStep === "token" ? undefined : collapseStep === "false" ? false : collapseStep;

  const columns: ColumnDef<Team>[] = [
    {
      key: "name",
      header: "チーム",
      sortable: true,
      render: (row) => (
        <Flex direction="row" align="center" gap="sm">
          <Text weight="medium" truncate>
            {row.name}
          </Text>
          {row.id === teamId ? <Badge tone="info">選択中</Badge> : null}
        </Flex>
      ),
    },
    { key: "owner", header: "オーナー", hiddenOnMobile: true },
    {
      key: "members",
      header: "人数",
      align: "right",
      sortable: true,
      render: (row) => <Text tabular>{numberFormat.format(row.members)}</Text>,
    },
    {
      key: "status",
      header: "状態",
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: "updatedAt",
      header: "更新日",
      align: "right",
      hiddenOnMobile: true,
      render: (row) => <Text tabular>{formatDate(row.updatedAt)}</Text>,
    },
  ];

  return (
    <PageContainer
      title="チーム"
      subtitle="一覧が伸縮し、詳細レールは 320px を保つ (SCR-110)"
      breadcrumb={[{ label: "組織" }, { label: "チーム" }]}
      extra={
        <Flex direction="col" gap="sm">
          <Flex direction="row" wrap align="center" gap="sm">
            <Text size="xs" tone="muted">
              railWidth
            </Text>
            {RAIL_WIDTHS.map((value) => (
              <Button
                key={value}
                size="sm"
                variant={railWidth === value ? "default" : "outline"}
                aria-pressed={railWidth === value}
                onClick={() => setRailWidth(value)}
              >
                {value}
              </Button>
            ))}
          </Flex>
          <Flex direction="row" wrap align="center" gap="sm">
            <Text size="xs" tone="muted">
              collapseBelow
            </Text>
            {COLLAPSE_STEPS.map((value) => (
              <Button
                key={value}
                size="sm"
                variant={collapseStep === value ? "default" : "outline"}
                aria-pressed={collapseStep === value}
                onClick={() => setCollapseStep(value)}
              >
                {value}
              </Button>
            ))}
          </Flex>
        </Flex>
      }
    >
      <Flex direction="col" gap="lg">
        {/* ── 1. 正準構成: rail="detail" (既定) — 流動的な一覧 + 固定幅の詳細レール ── */}
        <MasterDetail
          railWidth={railWidth}
          collapseBelow={collapseBelow}
          masterLabel="チーム一覧"
          detailLabel={`${team.name} の詳細`}
          detailId={TEAM_DETAIL_ID}
          master={
            <Card>
              <CardContent flush>
                <DataTable
                  data={TEAMS}
                  columns={columns}
                  getRowId={(row) => row.id}
                  onRowClick={(row) => setTeamId(row.id)}
                />
              </CardContent>
            </Card>
          }
        >
          <Flex direction="col" gap="md">
            <Card>
              <CardHeader>
                <CardTitle level={2} className="text-base">
                  {team.name}
                </CardTitle>
                <CardDescription>オーナー: {team.owner}</CardDescription>
              </CardHeader>
              <CardContent>
                <Flex direction="col" gap="sm">
                  <Flex direction="row" justify="between" align="baseline" gap="sm">
                    <Text tone="muted">メンバー</Text>
                    <Text tabular weight="medium">
                      {numberFormat.format(team.members)}
                    </Text>
                  </Flex>
                  <Flex direction="row" justify="between" align="baseline" gap="sm">
                    <Text tone="muted">状態</Text>
                    <Badge status={team.status} />
                  </Flex>
                  <Flex direction="row" justify="between" align="baseline" gap="sm">
                    <Text tone="muted">最終更新</Text>
                    <Text tabular>{formatDate(team.updatedAt)}</Text>
                  </Flex>
                </Flex>
              </CardContent>
            </Card>
            <Button className="w-full">メンバーを招待</Button>
          </Flex>
        </MasterDetail>

        {/* ── 2. rail="master" — 先頭ナビゲーションレール + 流動的な詳細面。
               master 側のボタンが aria-controls で detail region を指し、
               「詳細へ移動」は tabIndex={-1} の region にフォーカスを移す。 ── */}
        <MasterDetail
          rail="master"
          railWidth="compact"
          masterLabel="管理カテゴリー"
          detailLabel={`${service.label} の詳細`}
          detailId={SERVICE_DETAIL_ID}
          master={
            <Flex direction="col" gap="xs">
              {SERVICES.map((item) => {
                const Icon = item.icon;
                const active = item.id === serviceId;

                return (
                  <Button
                    key={item.id}
                    variant={active ? "secondary" : "ghost"}
                    aria-pressed={active}
                    aria-controls={SERVICE_DETAIL_ID}
                    onClick={() => setServiceId(item.id)}
                  >
                    <Icon aria-hidden="true" />
                    {item.label}
                    <Badge tone="neutral">{numberFormat.format(item.count)}</Badge>
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(SERVICE_DETAIL_ID)?.focus()}
              >
                詳細へ移動
              </Button>
            </Flex>
          }
        >
          <Card>
            <CardHeader>
              <Flex align="center" gap="sm">
                <ServiceIcon aria-hidden="true" />
                <CardTitle level={2}>{service.label}</CardTitle>
              </Flex>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <Text>現在の設定件数: {numberFormat.format(service.count)}</Text>
                <Button>設定を開く</Button>
              </Flex>
            </CardContent>
          </Card>
        </MasterDetail>
      </Flex>
    </PageContainer>
  );
}
