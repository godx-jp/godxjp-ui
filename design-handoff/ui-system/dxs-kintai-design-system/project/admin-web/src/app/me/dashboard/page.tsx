"use client";

import {
  Card,
  CardSection,
  Card,
  CardTitleText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui";

import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { useMyStats, useMyTime } from "@/hooks/api/employee/use-my-time";
import { useTranslation } from "@/providers/app-provider";

import { PunchCard } from "./components/PunchCard";

function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const stats = useMyStats();
  const entries = useMyTime();
  const recent = entries.data?.data.slice(0, 7) ?? [];

  return (
    <>
      <PageHeader title={t("nav.me.dashboard")} />
      <PageContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <PunchCard />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            <Card>
              <Card>
                <CardTitleText className="text-muted-foreground text-sm">Tổng giờ làm</CardTitleText>
              </Card>
              <CardSection className="text-2xl font-bold">
                {fmtMinutes(stats.data?.data.total_work_minutes ?? 0)}
              </CardSection>
            </Card>
            <Card>
              <Card>
                <CardTitleText className="text-muted-foreground text-sm">Overtime</CardTitleText>
              </Card>
              <CardSection className="text-2xl font-bold">
                {fmtMinutes(stats.data?.data.overtime_minutes ?? 0)}
              </CardSection>
            </Card>
            <Card>
              <Card>
                <CardTitleText className="text-muted-foreground text-sm">Ngày đi làm</CardTitleText>
              </Card>
              <CardSection className="text-2xl font-bold">
                {stats.data?.data.days_worked ?? 0}
              </CardSection>
            </Card>
            <Card>
              <Card>
                <CardTitleText className="text-muted-foreground text-sm">Số phút đến trễ</CardTitleText>
              </Card>
              <CardSection className="text-2xl font-bold">
                {stats.data?.data.late_minutes ?? 0}m
              </CardSection>
            </Card>
          </div>
        </div>

        <Card className="mt-4">
          <Card>
            <CardTitleText>7 ngày gần nhất</CardTitleText>
          </Card>
          <CardSection>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ làm</TableHead>
                  <TableHead>OT</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground text-center">
                      {t("common.empty")}
                    </TableCell>
                  </TableRow>
                )}
                {recent.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>
                      {fmtMinutes((e.regular_minutes ?? 0) + (e.ot_minutes ?? 0))}
                    </TableCell>
                    <TableCell>{fmtMinutes(e.ot_minutes ?? 0)}</TableCell>
                    <TableCell>{e.status ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardSection>
        </Card>
      </PageContent>
    </>
  );
}
