import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@godxjp/ui/data-display";
import { Calendar } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { CalendarIcon } from "lucide-react";
import { ja } from "react-day-picker/locale";
import type { DateRange } from "react-day-picker";

/**
 * Calendar — styled react-day-picker grid for single, multiple, or range
 * selection. Embed inside a Popover for picker UX; use DatePicker /
 * DateRangePicker for form-submittable inputs instead. Composed only from
 * real @godxjp/ui components.
 */
export default function Demo() {
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date(2026, 3, 15));
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(2026, 3, 1),
    to: new Date(2026, 3, 30),
  });
  const [shiftDays, setShiftDays] = useState<Date[] | undefined>([
    new Date(2026, 3, 6),
    new Date(2026, 3, 13),
    new Date(2026, 3, 20),
  ]);

  return (
    <PageContainer
      title="Calendar"
      subtitle="カレンダーグリッド · 常時表示またはポップオーバー内で使用"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>単一日付選択 (インライン常時表示)</CardTitle>
            <CardDescription>
              mode="single" で日付を選択。フォームに送信が必要な場合は DatePicker を使用する。ja
              ロケールで曜日・月名を日本語表示。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={issueDate}
              onSelect={setIssueDate}
              defaultMonth={issueDate}
              locale={ja}
              disabled={{ before: new Date(2026, 0, 1) }}
              footer={
                issueDate
                  ? `選択日: ${issueDate.toLocaleDateString("ja-JP")}`
                  : "発行日を選択してください"
              }
              aria-label="発行日カレンダー"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>範囲選択 · Popover 内</CardTitle>
            <CardDescription>
              mode="range" でポップオーバー内に配置。DateRangePicker
              はこのパターンにフォーム送信を加えた上位コンポーネント。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon />
                  期間を選択
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  defaultMonth={range?.from}
                  locale={ja}
                  numberOfMonths={2}
                  disabled={{ after: new Date(2027, 2, 31) }}
                  autoFocus
                  aria-label="レポート期間カレンダー"
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>年月ドロップダウン (captionLayout="dropdown")</CardTitle>
            <CardDescription>
              過去の会計期間に素早くジャンプする場合に便利。startMonth / endMonth
              でナビゲーション範囲を絞る。captionLayout は dropdown-months / dropdown-years
              で月のみ・年のみのドロップダウンにも切り替え可能。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={issueDate}
              onSelect={setIssueDate}
              defaultMonth={issueDate}
              locale={ja}
              captionLayout="dropdown"
              startMonth={new Date(2020, 0, 1)}
              endMonth={new Date(2030, 11, 31)}
              aria-label="会計期間カレンダー"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>複数日選択 (mode="multiple")</CardTitle>
            <CardDescription>
              mode="multiple" で個別の複数日を選択 (Date[])。max
              で選択上限を制限できる。ここでは出勤シフト日を最大 5 日まで選択。showOutsideDays=
              {"{false}"} で前後月のはみ出し日を非表示にしている。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="multiple"
              selected={shiftDays}
              onSelect={setShiftDays}
              defaultMonth={shiftDays?.[0]}
              locale={ja}
              max={5}
              showOutsideDays={false}
              footer={
                shiftDays && shiftDays.length > 0
                  ? `選択日数: ${shiftDays.length} 日`
                  : "出勤日を選択してください"
              }
              aria-label="出勤シフトカレンダー"
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
