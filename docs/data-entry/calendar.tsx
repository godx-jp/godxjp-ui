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

  return (
    <PageContainer
      title="Calendar"
      subtitle="カレンダーグリッド — 常時表示またはポップオーバー内で使用"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>単一日付選択 (インライン常時表示)</CardTitle>
            <CardDescription>
              mode=“single” で日付を選択。フォームに送信が必要な場合は DatePicker を使用する。ja
              ロケールで曜日・月名を日本語表示。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={issueDate}
              onSelect={setIssueDate}
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
            <CardTitle>範囲選択 — Popover 内</CardTitle>
            <CardDescription>
              mode=“range” でポップオーバー内に配置。DateRangePicker
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
            <CardTitle>年月ドロップダウン (captionLayout=“dropdown”)</CardTitle>
            <CardDescription>
              過去の会計期間に素早くジャンプする場合に便利。startMonth / endMonth
              でナビゲーション範囲を絞る。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={issueDate}
              onSelect={setIssueDate}
              locale={ja}
              captionLayout="dropdown"
              startMonth={new Date(2020, 0, 1)}
              endMonth={new Date(2030, 11, 31)}
              aria-label="会計期間カレンダー"
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
