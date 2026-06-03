import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import {
  FormField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Select — the single-select control. Prefer the data-driven `options` API
 * (handles search, grouping, async); compose sub-parts only for a custom
 * trigger. Never a raw <select>. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [status, setStatus] = useState("paid");
  const [currency, setCurrency] = useState("JPY");
  const [priority, setPriority] = useState("medium");

  return (
    <PageContainer title="Select" subtitle="Single-select — data-driven options, searchable, or compound">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Data-driven (options)</CardTitle>
            <CardDescription>Pass an options array; name= submits the value with the form.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="status" label="状態">
              <Select
                id="status"
                name="status"
                value={status}
                onValueChange={setStatus}
                placeholder="状態を選択"
                options={[
                  { value: "draft", label: "下書き" },
                  { value: "sent", label: "送付済" },
                  { value: "paid", label: "入金済" },
                  { value: "overdue", label: "期限超過" },
                ]}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Searchable + grouped</CardTitle>
            <CardDescription>showSearch enables client-side filtering; group buckets options.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="currency" label="通貨">
              <Select
                id="currency"
                name="currency"
                value={currency}
                onValueChange={setCurrency}
                showSearch
                clearable={false}
                searchPlaceholder="通貨を検索..."
                options={[
                  { value: "JPY", label: "日本円", group: "アジア" },
                  { value: "VND", label: "ベトナムドン", group: "アジア" },
                  { value: "EUR", label: "ユーロ", group: "ヨーロッパ" },
                  { value: "GBP", label: "英ポンド", group: "ヨーロッパ" },
                ]}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compound API (custom trigger)</CardTitle>
            <CardDescription>Compose sub-parts when the trigger needs custom content.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger size="sm" id="priority">
                <SelectValue placeholder="優先度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
