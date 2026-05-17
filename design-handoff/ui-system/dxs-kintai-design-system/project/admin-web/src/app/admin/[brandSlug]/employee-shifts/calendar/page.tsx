"use client";

// T9.1 — month calendar manager.  PageHeader: month picker + bulk
// assign button.  Body: CalendarGrid (shift badges per date cell) +
// Alert for the empty-state.  Bulk-assign Dialog opens over the grid.
//
// Uses `useAdminEmployeeShiftsCalendar({month})`.  No server-side
// department filter is exercised here (T7.2 hook surfaces it but we keep
// the page minimal for T9.1).
import { useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  Skeleton,
} from "@godxjp/ui";
import { CalendarDays, Info, Plus } from "lucide-react";

import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { useAdminEmployeeShiftsCalendar } from "@/hooks/api/admin/employee-shifts";
import { useLookup } from "@/hooks/api/admin/use-lookup";
import { useTranslation } from "@/providers/app-provider";
import type { Employee } from "@/types/models/Employee";
import type { Shift } from "@/types/models/Shift";

import { MonthPicker } from "../../time/monthly/components/MonthPicker";

import { BulkAssignDialog } from "./components/BulkAssignDialog";
import { CalendarGrid } from "./components/CalendarGrid";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatEmployeeName(e: Employee): string {
  const last = e.name_lastname ?? "";
  const first = e.name_firstname ?? "";
  return `${last} ${first}`.trim() || e.code || `#${e.id}`;
}

export default function Page() {
  const params = useParams<{ brandSlug: string }>();
  const brandSlug = params.brandSlug;
  const { t } = useTranslation();

  const [month, setMonth] = useState<string>(currentMonth());
  const [dialogOpen, setDialogOpen] = useState(false);

  const calendar = useAdminEmployeeShiftsCalendar({ brandSlug, month });
  const shifts = useLookup<Shift>(brandSlug, "shifts");
  const employees = useLookup<Employee>(brandSlug, "employees");

  const data = calendar.data?.data ?? {};
  const cellCount = Object.values(data).reduce((sum, day) => sum + day.shifts.length, 0);
  const loading = calendar.isLoading;
  const empty = !loading && cellCount === 0;

  const employeeOptions = (employees.data ?? []).map((e) => ({
    id: e.id,
    name: formatEmployeeName(e),
    code: e.code ?? null,
  }));
  const shiftOptions = (shifts.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <>
      <PageHeader
        title={t("admin.shifts.calendar.title")}
        backHref={`/admin/${brandSlug}/employee-shifts`}
      >
        <MonthPicker value={month} onChange={setMonth} />
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/${brandSlug}/employee-shifts/calendar/by-day`}>
            <CalendarDays className="mr-1 size-3.5" />
            {t("admin.shifts.calendar.by_day_link")}
          </Link>
        </Button>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 size-3.5" />
          {t("admin.shifts.calendar.bulk_assign_cta")}
        </Button>
      </PageHeader>
      <PageContent>
        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 42 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <CalendarGrid month={month} data={data} />
            )}
          </CardContent>
        </Card>

        {empty && (
          <Alert className="mt-4">
            <Info className="size-4" />
            <AlertTitle>{t("admin.shifts.calendar.empty_title")}</AlertTitle>
            <AlertDescription>{t("admin.shifts.calendar.empty_description")}</AlertDescription>
          </Alert>
        )}

        <BulkAssignDialog
          brandSlug={brandSlug}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          employees={employeeOptions}
          shifts={shiftOptions}
          defaultMonth={month}
        />
      </PageContent>
    </>
  );
}
