"use client";

import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@godxjp/ui";
import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";

import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingText } from "@/components/shared/loading-text";
import { apiFetch } from "@/lib/api";

/**
 * plan-030 #33 — Permission inheritance grid.
 *
 * Renders the result of GET /api/v1/me/permissions (plan-028) as a
 * grid: rows = resources (TimeEntry / Absence / ClosedPeriod / EmployeeShift),
 * columns = abilities. Read-only — for HR users to verify what their
 * current role lets them do without trial-and-error.
 */

type Permissions = {
  console_organization_id: string | null;
  time_entry: Record<string, boolean>;
  absence: Record<string, boolean>;
  closed_period: Record<string, boolean>;
  employee_shift: Record<string, boolean>;
};

type Response = { data: Permissions };

const RESOURCE_LABELS: Record<keyof Omit<Permissions, "console_organization_id">, string> = {
  time_entry: "勤怠エントリ",
  absence: "欠勤記録",
  closed_period: "月次締め",
  employee_shift: "シフト",
};

const ABILITY_LABELS: Record<string, string> = {
  view_any: "一覧",
  view: "閲覧",
  create: "作成",
  update: "編集",
  delete: "削除",
  submit: "提出",
  approve: "承認",
  reject: "却下",
  reclassify: "再分類",
  close: "締め実行",
  reopen: "再オープン",
};

function YesNo({ ok }: { ok: boolean }) {
  return ok ? (
    <Check className="size-4 text-emerald-600" aria-label="可" />
  ) : (
    <X className="text-muted-foreground size-4" aria-label="不可" />
  );
}

export default function Page() {
  const query = useQuery<Response>({
    queryKey: ["me", "permissions"],
    queryFn: () => apiFetch<Response>("/api/v1/me/permissions"),
    staleTime: 5 * 60 * 1000,
  });

  const data = query.data?.data;

  return (
    <>
      <PageHeader title="権限一覧" description="現在のロールで実行できる操作" />
      <PageContent>
        {query.isLoading && <LoadingText />}
        {data && (
          <div className="space-y-4">
            {(Object.keys(RESOURCE_LABELS) as (keyof typeof RESOURCE_LABELS)[]).map(
              (resourceKey) => {
                const abilities = data[resourceKey] ?? {};
                const abilityKeys = Object.keys(abilities);

                return (
                  <Card key={resourceKey} className="overflow-hidden p-0">
                    <div className="bg-muted/40 border-b px-4 py-2 text-sm font-medium">
                      {RESOURCE_LABELS[resourceKey]}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {abilityKeys.map((a) => (
                            <TableHead key={a} className="text-center">
                              {ABILITY_LABELS[a] ?? a}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          {abilityKeys.map((a) => (
                            <TableCell key={a} className="text-center">
                              <div className="flex justify-center">
                                <YesNo ok={!!abilities[a]} />
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>
                );
              },
            )}
          </div>
        )}
      </PageContent>
    </>
  );
}
