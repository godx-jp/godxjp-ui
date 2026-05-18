"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Button,
  Card,
  DropdownMenu,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { MoreHorizontal, Plus } from "lucide-react";

import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/providers/app-provider";
import type { Paginated } from "@/services/admin/master-data-service";

interface Column {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
}

interface Props {
  title: string;
  /** URL segment matching backend route, e.g. "locations" or "cost-centers". */
  path: string;
  columns: Column[];
  /** ID field name (default: "id") */
  idKey?: string;
  /** Hide the "Tạo mới" button (for system-generated resources). */
  readonly?: boolean;
  /** Disable delete action (for read-only resources like time-logs). */
  disableDelete?: boolean;
  /** Link row to `[id]` detail instead of `[id]/edit` (for resources with no edit endpoint). */
  viewOnly?: boolean;
}

export function ResourceStubPage({
  title,
  path,
  columns,
  idKey = "id",
  readonly,
  disableDelete,
  viewOnly,
}: Props) {
  const params = useParams<{ brandSlug: string }>();
  const brandSlug = params.brandSlug;
  const qc = useQueryClient();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", brandSlug, path, "list"],
    queryFn: () =>
      apiFetch<Paginated<Record<string, unknown>>>(`/api/v1/admin/${brandSlug}/${path}`),
  });

  const del = useMutation({
    mutationFn: (id: number | string) =>
      apiFetch<void>(`/api/v1/admin/${brandSlug}/${path}/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", brandSlug, path] }),
  });

  return (
    <>
      <PageHeader
        title={title}
        actions={
          readonly ? undefined : (
            <Button asChild>
              <Link href={`/admin/${brandSlug}/${path}/new`}>
                <Plus className="mr-1 size-4" /> {t("common.create_new")}
              </Link>
            </Button>
          )
        }
      />
      <PageContent>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key}>{c.label}</TableHead>
                ))}
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="text-muted-foreground text-center"
                  >
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="text-muted-foreground text-center"
                  >
                    {t("common.empty")}
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((row, i) => {
                const id = row[idKey] as number | string;
                return (
                  <TableRow key={id ?? i}>
                    {columns.map((c) => (
                      <TableCell key={c.key}>
                        {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu
                        align="end"
                        trigger={
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                        items={[
                          {
                            key: "details",
                            label: (
                              <Link
                                href={`/admin/${brandSlug}/${path}/${id}${viewOnly ? "" : "/edit"}`}
                              >
                                {viewOnly ? t("common.view_detail") : t("common.edit")}
                              </Link>
                            ),
                          },
                          ...(!disableDelete
                            ? [
                                {
                                  key: "delete",
                                  variant: "destructive" as const,
                                  onSelect: async () => {
                                    const ok = await confirm({
                                      title: "削除確認",
                                      description: "この項目を削除しますか？",
                                      confirmLabel: "削除",
                                      variant: "destructive",
                                    });
                                    if (ok) del.mutate(id);
                                  },
                                  label: t("common.delete"),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </PageContent>
      {confirmDialog}
    </>
  );
}
