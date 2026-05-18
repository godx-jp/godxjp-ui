"use client";

/**
 * plan-005 Phase A (A6.2) — /admin/[brandSlug]/absences
 *
 * Admin approval UI for absence records. Filters by type / status / date
 * range. Inline approve / reject / reclassify actions on each row; bulk
 * reclassify via checkbox selection + toolbar. Admin sees all branches;
 * shop_manager automatically scoped by backend via ScopeByBranch.
 */

import { useMemo, useState } from "react";

import { useParams } from "next/navigation";

import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  SelectMenu,
  SelectOptionRow,
  SelectControl,
  SelectDisplay,
  Skeleton,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui";
import { Check, Tag, X } from "lucide-react";

import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import {
  useAbsences,
  useApproveAbsence,
  useBulkReclassifyAbsences,
  useRejectAbsence,
  useUpdateAbsence,
} from "@/hooks/api/admin/absences/use-absences";
import { useTranslation } from "@/providers/app-provider";
import type { AbsenceRow, AbsenceStatus, AbsenceType } from "@/services/admin/absence-service";

const ABSENCE_TYPES: AbsenceType[] = ["Paid", "Unpaid", "Late", "EarlyLeave", "Trip"];
const ABSENCE_STATUSES: AbsenceStatus[] = ["draft", "approved", "rejected"];

function typeBadgeVariant(type: AbsenceType): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "Paid":
    case "Trip":
      return "default";
    case "Late":
    case "EarlyLeave":
      return "secondary";
    case "Unpaid":
    default:
      return "destructive";
  }
}

function statusBadgeVariant(
  status: AbsenceStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default";
    case "rejected":
      return "destructive";
    case "draft":
    default:
      return "secondary";
  }
}

export default function AbsencesPage() {
  const { t } = useTranslation();
  const params = useParams<{ brandSlug: string }>();
  const brandSlug = params?.brandSlug ?? "";

  const [typeFilter, setTypeFilter] = useState<AbsenceType | "">("");
  const [statusFilter, setStatusFilter] = useState<AbsenceStatus | "">("draft");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  const query = useAbsences({
    brandSlug,
    type: (typeFilter || undefined) as AbsenceType | undefined,
    status: (statusFilter || undefined) as AbsenceStatus | undefined,
    from: from || undefined,
    to: to || undefined,
    per_page: 50,
  });

  const approve = useApproveAbsence({ brandSlug });
  const reject = useRejectAbsence({ brandSlug });
  const updateRow = useUpdateAbsence({ brandSlug });
  const bulk = useBulkReclassifyAbsences({ brandSlug });

  const rows: AbsenceRow[] = query.data?.data ?? [];
  const draftIdsOnScreen = useMemo(
    () => rows.filter((r) => r.status === "draft").map((r) => r.id as number),
    [rows],
  );
  const allSelected =
    draftIdsOnScreen.length > 0 && draftIdsOnScreen.every((id) => selected.has(id));

  function toggleOne(id: number): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnScreen(): void {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(draftIdsOnScreen));
    }
  }

  async function handleBulkReclassify(target: AbsenceType): Promise<void> {
    if (selected.size === 0) return;
    await bulk.mutateAsync({
      ids: Array.from(selected),
      absence_type: target,
    });
    setSelected(new Set());
  }

  async function handleReject(): Promise<void> {
    if (rejectTargetId === null || rejectReason.trim() === "") return;
    await reject.mutateAsync({ id: rejectTargetId, reason: rejectReason });
    setRejectTargetId(null);
    setRejectReason("");
  }

  return (
    <PageContent>
      <PageHeader title={t("absence.page.title")} description={t("absence.page.subtitle")} />

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs">
              {t("absence.filter.type")}
            </label>
            <Select
              value={typeFilter || "all"}
              onValueChange={(v) => setTypeFilter(v === "all" ? "" : (v as AbsenceType))}
            >
              <SelectControl>
                <SelectDisplay placeholder={t("common.all")} />
              </SelectControl>
              <SelectMenu>
                <SelectOptionRow value="all">{t("common.all")}</SelectOptionRow>
                {ABSENCE_TYPES.map((tt) => (
                  <SelectOptionRow key={tt} value={tt}>
                    {t(`absence.type.${tt}`)}
                  </SelectOptionRow>
                ))}
              </SelectMenu>
            </Select>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs">
              {t("absence.filter.status")}
            </label>
            <Select
              value={statusFilter || "all"}
              onValueChange={(v) => setStatusFilter(v === "all" ? "" : (v as AbsenceStatus))}
            >
              <SelectControl>
                <SelectDisplay placeholder={t("common.all")} />
              </SelectControl>
              <SelectMenu>
                <SelectOptionRow value="all">{t("common.all")}</SelectOptionRow>
                {ABSENCE_STATUSES.map((s) => (
                  <SelectOptionRow key={s} value={s}>
                    {t(`absence.status.${s}`)}
                  </SelectOptionRow>
                ))}
              </SelectMenu>
            </Select>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs">
              {t("absence.filter.from")}
            </label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs">
              {t("absence.filter.to")}
            </label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <Card className="flex items-center gap-3 p-3">
          <span className="text-sm">
            {t("absence.bulk.selected", { count: String(selected.size) })}
          </span>
          <div className="ml-auto flex gap-2">
            {ABSENCE_TYPES.map((tt) => (
              <Button
                key={tt}
                size="sm"
                variant="outline"
                disabled={bulk.isPending}
                onClick={() => handleBulkReclassify(tt)}
              >
                <Tag className="mr-1 size-3.5" />
                {t(`absence.type.${tt}`)}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        {query.isLoading ? (
          <div className="p-4">
            <Skeleton className="mb-2 h-8 w-full" />
            <Skeleton className="mb-2 h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : query.isError ? (
          <Alert color="destructive" className="m-4" description={t("common.error.load_failed")} />
        ) : rows.length === 0 ? (
          <Alert className="m-4" description={t("absence.empty")} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAllOnScreen}
                    aria-label={t("common.select_all")}
                  />
                </TableHead>
                <TableHead>{t("absence.col.date")}</TableHead>
                <TableHead>{t("absence.col.employee")}</TableHead>
                <TableHead>{t("absence.col.type")}</TableHead>
                <TableHead>{t("absence.col.hours")}</TableHead>
                <TableHead>{t("absence.col.status")}</TableHead>
                <TableHead>{t("absence.col.reason")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const id = row.id as number;
                const isDraft = row.status === "draft";
                return (
                  <TableRow key={id}>
                    <TableCell>
                      <Checkbox
                        disabled={!isDraft}
                        checked={selected.has(id)}
                        onCheckedChange={() => toggleOne(id)}
                      />
                    </TableCell>
                    <TableCell>{row.absence_date as unknown as string}</TableCell>
                    <TableCell>{row.employee?.code ?? `#${row.employee_id}`}</TableCell>
                    <TableCell>
                      <Badge variant={typeBadgeVariant(row.absence_type as AbsenceType)}>
                        {t(`absence.type.${row.absence_type}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{String(row.hours ?? "—")}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(row.status as AbsenceStatus)}>
                        {t(`absence.status.${row.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[260px] truncate text-sm">
                      {row.reason ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isDraft ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={approve.isPending}
                            onClick={() => approve.mutate({ id })}
                            title={t("absence.action.approve")}
                          >
                            {approve.isPending ? (
                              <Spinner className="size-3.5" />
                            ) : (
                              <Check className="size-3.5" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectTargetId(id);
                              setRejectReason("");
                            }}
                            title={t("absence.action.reject")}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {t("absence.immutable")}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Inline reject reason prompt */}
      {rejectTargetId !== null && (
        <Card className="p-4">
          <p className="mb-2 text-sm">{t("absence.reject.prompt")}</p>
          <div className="flex gap-2">
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("absence.reject.placeholder")}
            />
            <Button
              onClick={handleReject}
              disabled={rejectReason.trim() === "" || reject.isPending}
            >
              {reject.isPending ? <Spinner className="mr-1 size-3.5" /> : null}
              {t("absence.action.reject")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectTargetId(null);
                setRejectReason("");
              }}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </Card>
      )}
    </PageContent>
  );
}
