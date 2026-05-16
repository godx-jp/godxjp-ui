"use client";

import { useState } from "react";

import {
  Button,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@godxjp/ui";

import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { useConfirm } from "@/components/shared/confirm-dialog";
import {
  useMyShifts,
  useMyShiftsCalendar,
  useMyChangeRequests,
  useCancelChangeRequest,
} from "@/hooks/api/employee/use-my-shifts";
import { useTranslation } from "@/providers/app-provider";

import { CalendarGrid, type CalendarDay } from "./components/CalendarGrid";
import { SubmitRequestDialog } from "./components/SubmitRequestDialog";

export default function MyShiftsPage() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const shifts = useMyShifts(month);
  const calendar = useMyShiftsCalendar(month);
  const requests = useMyChangeRequests();
  const cancel = useCancelChangeRequest();
  const { confirm, dialog: confirmDialog } = useConfirm();

  return (
    <>
      <PageHeader
        title={t("nav.me.my_shifts")}
        actions={
          <div className="flex items-center gap-2">
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-40"
            />
            <SubmitRequestDialog shifts={shifts.data?.data ?? []} />
          </div>
        }
      />
      <PageContent>
        <Tabs defaultValue="calendar">
          <TabsList>
            <TabsTrigger value="calendar">Lịch</TabsTrigger>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
            <TabsTrigger value="requests">Yêu cầu đổi ca</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Card>
              <CardContent className="p-4">
                <CalendarGrid
                  month={month}
                  days={(calendar.data?.data.days ?? {}) as Record<string, CalendarDay>}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Ca</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.data?.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground text-center">
                        Không có ca trong tháng
                      </TableCell>
                    </TableRow>
                  )}
                  {shifts.data?.data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.date}</TableCell>
                      <TableCell>{s.shift?.name ?? s.shift_id}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{s.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.data?.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground text-center">
                        Chưa có yêu cầu
                      </TableCell>
                    </TableRow>
                  )}
                  {requests.data?.data.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.created_at?.slice(0, 10)}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell className="max-w-sm truncate">{r.reason}</TableCell>
                      <TableCell>
                        <Badge>{r.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {r.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const ok = await confirm({
                                title: "リクエスト取消",
                                description: "このシフト変更リクエストを取り消しますか？",
                                confirmLabel: "取消",
                                variant: "destructive",
                              });
                              if (ok) cancel.mutate(r.id);
                            }}
                          >
                            Hủy
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
      {confirmDialog}
    </>
  );
}
