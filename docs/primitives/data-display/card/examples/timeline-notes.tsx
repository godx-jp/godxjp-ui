import { MessageSquare } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

const notes = [
  { at: "09:30", author: "Lan", text: "Khách xác nhận nhận hàng tại District 1 sau 18:00." },
  { at: "10:12", author: "Ops", text: "Đã cập nhật địa chỉ giao hàng theo KYC profile." },
  { at: "11:05", author: "Agent", text: "Cần gọi lại trước khi dispatch tuyến chiều." },
];

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-4" aria-hidden="true" />
          CRM notes
        </CardTitle>
        <CardAction>
          <Button size="sm" variant="outline">
            Thêm note
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {notes.map((note) => (
          <div key={note.at} className="border-border border-l-2 pl-[var(--phi-n1)]">
            <div className="text-muted-foreground text-xs">
              {note.at} · {note.author}
            </div>
            <p className="mt-1 text-sm">{note.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
