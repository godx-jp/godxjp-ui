"use client";

import { useTranslation } from "@/providers/app-provider";

import { ResourceStubPage } from "../_components/ResourceStubPage";

export default function Page() {
  const { t } = useTranslation();
  return (
    <ResourceStubPage
      title={t("nav.admin.employees")}
      path="employees"
      columns={[
        { key: "employee_code", label: "Mã NV" },
        {
          key: "name",
          label: "Họ tên",
          render: (row: Record<string, unknown>) => {
            const n = row.name as { full?: string; kanji?: string } | undefined;
            return n?.full ?? n?.kanji ?? (typeof row.name === "string" ? row.name : "—");
          },
        },
        { key: "email", label: "Email" },
        { key: "status", label: "Trạng thái" },
      ]}
    />
  );
}
