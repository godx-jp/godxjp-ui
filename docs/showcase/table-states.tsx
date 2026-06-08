/**
 * Showcase · table-states — 状態 (V16)
 *
 * The five states a 勤怠 (kintai) DataTable must render — each shown statically,
 * side by side, so a reader learns every state at rest without clicking:
 *
 *   1. loading … SkeletonTable inside the real Card+toolbar chrome, preserving
 *                the column layout (no spinner overlay).
 *   2. empty   … two distinct wordings — filter-empty (絞り込み結果なし, offers
 *                「条件をクリア」) vs truly-empty (データなし, offers a create CTA).
 *   3. error   … Alert tone="destructive" carrying an error code + request-id
 *                (copyable, tabular-nums) + a 再試行 retry action.
 *   4. partial … rows that DID load, with a warning Alert that one segment
 *                failed / is stale, plus a 部分再取得 retry for the missing part.
 *   5. ideal   … the fully-populated DataTable (sorted, status Badges).
 *
 * Built ENTIRELY from real @godxjp/ui primitives — DataTable / Table chrome via
 * Card + DataTable.Toolbar, Skeleton family, Alert family, EmptyState, Badge,
 * Button. No hand-rolled <table>, no raw controls, tokens only.
 *
 * DNA: compact density · small headings · tabular-nums on 時刻/件数 · fixed color
 * signaling (success 若竹 / warning 山吹 / attention 朱 / danger 茜 / info 群青 via
 * tone) · quiet factual JP copy · no emoji.
 */
import * as React from "react";
import { Clock, Inbox, Plus, RefreshCw, SearchX } from "lucide-react";

import { Button, Text } from "@godxjp/ui/general";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  type ColumnDef,
  DataTable,
  EmptyState,
} from "@godxjp/ui/data-display";
import {
  Alert,
  AlertActions,
  AlertDescription,
  AlertTitle,
  SkeletonTable,
} from "@godxjp/ui/feedback";
import { Flex, PageContainer } from "@godxjp/ui/layout";

// ── Domain: 勤怠 (打刻) records ────────────────────────────────────────────────

type Punch = {
  id: string;
  employee: string;
  dept: string;
  clockIn: string;
  clockOut: string;
  workH: string;
  status: "present" | "late" | "early" | "pending";
};

/** 勤怠ステータス → Badge tone (fixed color signaling). */
const STATUS_META: Record<
  Punch["status"],
  { label: string; tone: "success" | "warning" | "info" | "neutral" }
> = {
  // 出勤 = 若竹(success) · 遅刻 = 山吹(warning, non-destructive lateness) ·
  // 早退 = 群青(info) · 承認待ち = neutral(quiet, not a warning yet).
  present: { label: "出勤", tone: "success" },
  late: { label: "遅刻", tone: "warning" },
  early: { label: "早退", tone: "info" },
  pending: { label: "承認待ち", tone: "neutral" },
};

const COLUMNS: ColumnDef<Punch>[] = [
  { key: "employee", header: "従業員", width: "w-40" },
  { key: "dept", header: "部署", hiddenOnMobile: true },
  {
    key: "clockIn",
    header: "出勤",
    align: "right",
    render: (r) => <Text tabular>{r.clockIn}</Text>,
  },
  {
    key: "clockOut",
    header: "退勤",
    align: "right",
    render: (r) => <Text tabular>{r.clockOut}</Text>,
  },
  {
    key: "workH",
    header: "実働",
    align: "right",
    hiddenOnMobile: true,
    render: (r) => <Text tabular>{r.workH}</Text>,
  },
  {
    key: "status",
    header: "状態",
    align: "center",
    render: (r) => (
      <Badge tone={STATUS_META[r.status].tone} variant="outline">
        {STATUS_META[r.status].label}
      </Badge>
    ),
  },
];

const ROWS: Punch[] = [
  {
    id: "EMP-1042",
    employee: "佐藤 美咲",
    dept: "受付",
    clockIn: "08:58",
    clockOut: "18:02",
    workH: "8.0h",
    status: "present",
  },
  {
    id: "EMP-1043",
    employee: "鈴木 一郎",
    dept: "倉庫",
    clockIn: "09:14",
    clockOut: "18:05",
    workH: "7.8h",
    status: "late",
  },
  {
    id: "EMP-1044",
    employee: "高橋 結衣",
    dept: "経理",
    clockIn: "08:55",
    clockOut: "16:30",
    workH: "6.6h",
    status: "early",
  },
  {
    id: "EMP-1045",
    employee: "田中 健太",
    dept: "配送",
    clockIn: "08:49",
    clockOut: "—",
    workH: "—",
    status: "pending",
  },
  {
    id: "EMP-1046",
    employee: "伊藤 さくら",
    dept: "受付",
    clockIn: "08:52",
    clockOut: "18:00",
    workH: "8.1h",
    status: "present",
  },
];

/** Only the segment that succeeded in the `partial` case (倉庫 fetch failed). */
const PARTIAL_ROWS = ROWS.filter((r) => r.dept !== "倉庫");

// ── Local chrome: a titled section that frames each state demo ─────────────────

function StateSection({
  step,
  title,
  note,
  children,
}: {
  step: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="col" gap="sm">
      <Flex direction="row" align="baseline" gap="sm" wrap>
        <Text size="xs" tone="muted" tabular>
          {step}
        </Text>
        <h2 className="text-sm font-bold">{title}</h2>
        <Text size="xs" tone="muted">
          {note}
        </Text>
      </Flex>
      {children}
    </Flex>
  );
}

/** Shared table-card shell: the toolbar chrome stays identical across states so
 *  the loading skeleton visibly preserves the table's column layout. */
function TableShell({
  caption,
  children,
}: {
  caption: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>本日の打刻</CardTitle>
        <Text size="xs" tone="muted">
          {caption}
        </Text>
      </CardHeader>
      <CardContent flush>{children}</CardContent>
    </Card>
  );
}

export default function Demo() {
  return (
    <PageContainer
      title="DataTable の状態"
      subtitle="勤怠一覧が取りうる 5 つの状態。loading · empty(絞り込み / データなし) · error · partial · ideal をすべて静止状態で並べて確認する。"
      density="compact"
    >
      <Flex direction="col" gap="lg">
        {/* 1 ─ loading: skeleton that preserves the column layout */}
        <StateSection
          step="1 / 5"
          title="読み込み中"
          note="列レイアウトを保持した SkeletonTable。スピナーオーバーレイは使わない。"
        >
          <TableShell caption="取得中…">
            <SkeletonTable rows={5} columns={6} />
          </TableShell>
        </StateSection>

        {/* 2 ─ empty: filter-empty vs truly-empty wording */}
        <StateSection
          step="2 / 5"
          title="空"
          note="「絞り込み結果なし」と「データなし」は文言とアクションを使い分ける。"
        >
          <Flex direction="col" gap="md" className="md:flex-row md:[&>*]:flex-1">
            <TableShell caption="絞り込み: 部署=倉庫 / 状態=遅刻">
              {/* filter-empty: data exists, the FILTER matched nothing → clear filters */}
              <DataTable
                data={[]}
                columns={COLUMNS}
                getRowId={(r) => r.id}
                empty={
                  <EmptyState
                    icon={SearchX}
                    title="条件に一致する打刻はありません"
                    description="絞り込み条件を緩めるか、条件をクリアしてください。"
                    action={
                      <Button variant="outline" size="sm">
                        条件をクリア
                      </Button>
                    }
                  />
                }
              />
            </TableShell>

            <TableShell caption="2026-06-04 · 打刻 0 件">
              {/* truly-empty: no data at all for the day → create / 打刻登録 CTA */}
              <DataTable
                data={[]}
                columns={COLUMNS}
                getRowId={(r) => r.id}
                empty={
                  <EmptyState
                    icon={Inbox}
                    title="本日の打刻はまだありません"
                    description="従業員が打刻すると、ここに一覧が表示されます。"
                    action={
                      <Button size="sm">
                        <Plus aria-hidden="true" />
                        打刻を登録
                      </Button>
                    }
                  />
                }
              />
            </TableShell>
          </Flex>
        </StateSection>

        {/* 3 ─ error: code + request-id + retry */}
        <StateSection
          step="3 / 5"
          title="エラー"
          note="エラーコード・リクエストID・再試行を明示する。"
        >
          <TableShell caption="取得に失敗しました">
            <div className="p-4">
              <Alert tone="destructive">
                <AlertTitle>勤怠データを取得できませんでした</AlertTitle>
                <AlertDescription>
                  サーバーが応答しませんでした。時間をおいて再試行してください。
                  <br />
                  <Text tone="muted">
                    コード <code className="tabular-nums">KINTAI_FETCH_504</code> ・ リクエストID{" "}
                    <code className="tabular-nums">req_7f3a91c0d2</code>
                  </Text>
                </AlertDescription>
                <AlertActions>
                  <Button variant="outline" size="sm">
                    <RefreshCw aria-hidden="true" />
                    再試行
                  </Button>
                </AlertActions>
              </Alert>
            </div>
          </TableShell>
        </StateSection>

        {/* 4 ─ partial: some rows loaded, one segment failed / stale */}
        <StateSection
          step="4 / 5"
          title="部分的"
          note="一部のみ取得できた状態。失敗した区分だけを再取得できる。"
        >
          <TableShell caption="4 / 5 部署を表示中">
            <div>
              <div className="p-4 pb-0">
                <Alert tone="warning">
                  <AlertTitle>一部のデータを取得できませんでした</AlertTitle>
                  <AlertDescription>
                    「倉庫」部署の打刻が取得できなかったため、最新ではない可能性があります。
                    <br />
                    <Text tone="muted">
                      コード <code className="tabular-nums">KINTAI_PARTIAL_倉庫</code> ・
                      リクエストID <code className="tabular-nums">req_7f3a91c0e8</code>
                    </Text>
                  </AlertDescription>
                  <AlertActions>
                    <Button variant="outline" size="sm">
                      <RefreshCw aria-hidden="true" />
                      倉庫を再取得
                    </Button>
                  </AlertActions>
                </Alert>
              </div>
              <DataTable data={PARTIAL_ROWS} columns={COLUMNS} getRowId={(r) => r.id} />
            </div>
          </TableShell>
        </StateSection>

        {/* 5 ─ ideal: fully populated */}
        <StateSection
          step="5 / 5"
          title="理想"
          note="全件取得済み。状態は Badge tone で固定マッピング表示。"
        >
          <TableShell
            caption={
              <Flex direction="row" align="center" gap="xs">
                <Clock className="size-3" aria-hidden="true" />
                <Text tabular>5 件 · 14:32 更新</Text>
              </Flex>
            }
          >
            <DataTable data={ROWS} columns={COLUMNS} getRowId={(r) => r.id} />
          </TableShell>
        </StateSection>
      </Flex>
    </PageContainer>
  );
}
