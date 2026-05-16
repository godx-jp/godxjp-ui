"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui";

import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { useMyLogs } from "@/hooks/api/employee/use-my-time";
import { useTranslation } from "@/providers/app-provider";

export default function TimesheetPage() {
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(now.toISOString().slice(0, 7));
  const [year, m] = month.split("-");
  const from = `${year}-${m}-01`;
  const last = new Date(Number(year), Number(m), 0).getDate();
  const to = `${year}-${m}-${String(last).padStart(2, "0")}`;

  const logs = useMyLogs(from, to);
  const byDay: Record<string, typeof logs.data extends { data: infer T } ? T : never[]> = {};
  logs.data?.data.forEach((l) => {
    const d = String(l.timestamp).slice(0, 10);
    byDay[d] = byDay[d] ?? ([] as never[]);
    (byDay[d] as unknown as Array<typeof l>).push(l);
  });

  return (
    <>
      <PageHeader
        title={t("nav.me.timesheet")}
        actions={
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-40"
          />
        }
      />
      <PageContent>
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Logs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.keys(byDay).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground text-center">
                      Không có log trong tháng
                    </TableCell>
                  </TableRow>
                )}
                {Object.entries(byDay)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, dayLogs]) => (
                    <TableRow key={date}>
                      <TableCell className="font-medium">{date}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 text-xs">
                          {(
                            dayLogs as unknown as Array<{
                              id: number;
                              type: string;
                              timestamp: string;
                            }>
                          ).map((l) => (
                            <span key={l.id} className="bg-muted rounded px-2 py-0.5">
                              {l.type} · {String(l.timestamp).slice(11, 16)}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
