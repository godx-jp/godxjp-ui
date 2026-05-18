"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Badge,
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
import { MoreHorizontal, Plus } from "lucide-react";

import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { useDeleteDepartment, useDepartmentList } from "@/hooks/api/admin/use-departments";
import { useTranslation } from "@/providers/app-provider";

export default function DepartmentsListPage() {
  const { t } = useTranslation();
  const params = useParams<{ brandSlug: string }>();
  const brandSlug = params.brandSlug;
  const { confirm, dialog: confirmDialog } = useConfirm();

  const { data, isLoading } = useDepartmentList(brandSlug);
  const del = useDeleteDepartment(brandSlug);

  return (
    <>
      <PageHeader
        title={t("nav.admin.departments")}
        actions={
          <Button asChild>
            <Link href={`/admin/${brandSlug}/departments/new`}>
              <Plus className="mr-1 size-4" /> Tạo mới
            </Link>
          </Button>
        }
      />
      <PageContent>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground text-center">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground text-center">
                    Chưa có phòng ban nào
                  </TableCell>
                </TableRow>
              )}
              {data?.data.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.code ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={dept.is_active ? "default" : "secondary"}>
                      {dept.is_active ? "Hoạt động" : "Ngừng"}
                    </Badge>
                  </TableCell>
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
                          key: "edit",
                          label: <Link href={`/admin/${brandSlug}/departments/${dept.id}/edit`}>Sửa</Link>,
                        },
                        {
                          key: "delete",
                          variant: "destructive",
                          onSelect: async () => {
                            const ok = await confirm({
                              title: "削除確認",
                              description: `部門「${dept.name}」を削除しますか？`,
                              confirmLabel: "削除",
                              variant: "destructive",
                            });
                            if (ok) del.mutate(dept.id);
                          },
                          label: "Xóa",
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageContent>
      {confirmDialog}
    </>
  );
}
