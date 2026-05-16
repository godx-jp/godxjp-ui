"use client";

import { useState } from "react";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui";

import { useMyStats } from "@/hooks/api/employee/use-my-time";
import { usePunch } from "@/hooks/api/employee/use-punch";
import { ApiError } from "@/lib/api";

type PunchType = "In" | "Out" | "BreakStart" | "BreakEnd" | "OutingStart" | "OutingEnd";

const STATUS_LABEL: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  In: { label: "Đang làm", variant: "default" },
  BreakStart: { label: "Nghỉ giải lao", variant: "secondary" },
  BreakEnd: { label: "Đang làm", variant: "default" },
  OutingStart: { label: "Đi ngoài", variant: "secondary" },
  OutingEnd: { label: "Đang làm", variant: "default" },
  Out: { label: "Đã tan ca", variant: "secondary" },
};

export function PunchCard({ defaultLocationId }: { defaultLocationId?: number | null }) {
  const punch = usePunch();
  const stats = useMyStats();
  const [error, setError] = useState<string | null>(null);

  const lastType = stats.data?.data.last_punch?.type ?? null;
  const statusInfo = lastType ? STATUS_LABEL[lastType] : null;

  const punchButtons: Array<{ type: PunchType; label: string; variant?: "outline" | "default" }> = [
    { type: "In", label: "Check In" },
    { type: "Out", label: "Check Out" },
    { type: "BreakStart", label: "Nghỉ bắt đầu", variant: "outline" },
    { type: "BreakEnd", label: "Nghỉ kết thúc", variant: "outline" },
    { type: "OutingStart", label: "Đi ngoài", variant: "outline" },
    { type: "OutingEnd", label: "Về", variant: "outline" },
  ];

  async function handlePunch(type: PunchType) {
    setError(null);
    try {
      await punch.mutateAsync({
        type,
        location_id: type === "In" ? (defaultLocationId ?? null) : undefined,
      });
    } catch (e) {
      if (e instanceof ApiError) {
        const body = e.body as { message?: string };
        setError(body?.message ?? "Không thể ghi chấm công.");
      } else {
        setError("Không thể ghi chấm công.");
      }
    }
  }

  return (
    <Card data-slot="punch-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Chấm công</span>
          {statusInfo && <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {punchButtons.map((b) => (
            <Button
              key={b.type}
              variant={b.variant}
              disabled={punch.isPending}
              onClick={() => handlePunch(b.type)}
            >
              {b.label}
            </Button>
          ))}
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        {stats.data?.data.last_punch && (
          <p className="text-muted-foreground text-xs">
            Lần chấm công gần nhất: {stats.data.data.last_punch.type} —{" "}
            {stats.data.data.last_punch.timestamp}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
