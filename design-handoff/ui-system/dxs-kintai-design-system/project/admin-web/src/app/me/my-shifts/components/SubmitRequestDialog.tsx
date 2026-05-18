"use client";

import { useState } from "react";

import {
  Button,
  Dialog,
  Label,
  Select,
  SelectMenu,
  SelectOptionRow,
  SelectControl,
  SelectDisplay,
  Spinner,
  Textarea,
} from "@godxjp/ui";

import { useSubmitChangeRequest } from "@/hooks/api/employee/use-my-shifts";
import type { ShiftChangeRequestInput } from "@/services/employee/my-shifts-service";
import type { EmployeeShift } from "@/types/models/EmployeeShift";

export type SubmitRequestDialogProps = {
  shifts: EmployeeShift[];
};

type RequestType = ShiftChangeRequestInput["type"];

export function SubmitRequestDialog({ shifts }: SubmitRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<RequestType>("Cancel");
  const [fromShiftId, setFromShiftId] = useState<string>("");
  const [reason, setReason] = useState("");
  const submit = useSubmitChangeRequest();

  const canSubmit =
    fromShiftId !== "" && reason.trim().length > 0 && !submit.isPending;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    submit.mutate(
      {
        type,
        from_employee_shift_id: Number(fromShiftId),
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setFromShiftId("");
          setReason("");
          setType("Cancel");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button size="sm" data-slot="submit-request-dialog-trigger">
          Tạo yêu cầu đổi ca
        </Button>
      }
      title="Yêu cầu đổi ca"
      description="Chọn ca bạn muốn thay đổi và lý do. Quản lý sẽ review yêu cầu."
      contentProps={{ "data-slot": "submit-request-dialog" }}
      footer={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submit.isPending && <Spinner className="mr-2 size-4" />}
            Gửi yêu cầu
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Loại yêu cầu</Label>
          <Select value={type} onValueChange={(v) => setType(v as RequestType)}>
            <SelectControl>
              <SelectDisplay />
            </SelectControl>
            <SelectMenu>
              <SelectOptionRow value="Cancel">Hủy ca</SelectOptionRow>
              <SelectOptionRow value="ChangeShift">Đổi ca khác</SelectOptionRow>
              <SelectOptionRow value="Swap">Đổi với đồng nghiệp</SelectOptionRow>
            </SelectMenu>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ca hiện tại</Label>
          <Select value={fromShiftId} onValueChange={setFromShiftId}>
            <SelectControl>
              <SelectDisplay placeholder="Chọn ca" />
            </SelectControl>
            <SelectMenu>
              {shifts.length === 0 && (
                <SelectOptionRow value="none" disabled>
                  Không có ca trong tháng
                </SelectOptionRow>
              )}
              {shifts.map((s) => (
                <SelectOptionRow key={s.id} value={String(s.id)}>
                  {s.date} · {s.shift?.name ?? `Shift #${s.shift_id}`}
                </SelectOptionRow>
              ))}
            </SelectMenu>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Lý do</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do tạo yêu cầu"
            rows={3}
          />
        </div>

        {submit.isError && (
          <p className="text-destructive text-sm">
            Không thể gửi yêu cầu. Vui lòng thử lại.
          </p>
        )}
      </div>
    </Dialog>
  );
}
