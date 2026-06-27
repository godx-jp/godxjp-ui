import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  Badge,
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
  const [assignee, setAssignee] = useState("tanaka");
  const [reviewer, setReviewer] = useState("tanaka");
  const [reviewerAsync, setReviewerAsync] = useState("tanaka");
  const [reviewerCustom, setReviewerCustom] = useState("tanaka");
  const [reviewerLabel, setReviewerLabel] = useState("tanaka");

  const people = [
    { value: "tanaka", label: "田中 太郎", sublabel: "tanaka@example.com" },
    { value: "suzuki", label: "鈴木 花子", sublabel: "suzuki@example.com" },
    { value: "sato", label: "佐藤 次郎", sublabel: "sato@example.com" },
  ];
  const avatarFor = (label: string) => (
    <Avatar className="size-5">
      <AvatarFallback>{label.slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
  const peopleWithIcon = people.map((person) => ({ ...person, icon: avatarFor(person.label) }));

  // A real picker fetches + paginates server-side; we simulate latency so the loading state and the
  // selectedLabel / selectedIcon at-rest behaviour (option not loaded yet) are real.
  const loadPeople = async ({ query }: { query: string; page: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const needle = query.trim().toLowerCase();
    const list = needle
      ? peopleWithIcon.filter((person) => person.label.toLowerCase().includes(needle))
      : peopleWithIcon;
    return { options: list, hasMore: false };
  };

  return (
    <PageContainer
      title="Select"
      subtitle="Single-select · data-driven options, searchable, or compound"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Data-driven (options)</CardTitle>
            <CardDescription>
              Pass an options array; name= submits the value with the form.
            </CardDescription>
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
            <CardDescription>
              showSearch enables client-side filtering; group buckets options.
            </CardDescription>
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
            <CardTitle>Searchable + clearable</CardTitle>
            <CardDescription>
              With a value set and clearable (default), an inline ✕ on the trigger resets the
              selection without opening the list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="assignee" label="担当者">
              <Select
                id="assignee"
                name="assignee"
                value={assignee}
                onValueChange={setAssignee}
                showSearch
                searchPlaceholder="担当者を検索..."
                placeholder="担当者を選択"
                options={people}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Option icon · shown on the trigger too</CardTitle>
            <CardDescription>
              Give each option an `icon` (avatar / flag / lucide icon). It renders before the label
              in the list AND on the trigger once selected, with no `renderOption` needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="reviewer" label="レビュー担当">
              <Select
                id="reviewer"
                name="reviewer"
                value={reviewer}
                onValueChange={setReviewer}
                showSearch
                searchPlaceholder="担当者を検索..."
                placeholder="担当者を選択"
                options={peopleWithIcon}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Async (loadOptions) + selectedIcon</CardTitle>
            <CardDescription>
              With `loadOptions` and a preset value, `selectedLabel` + `selectedIcon` show the picked
              person's name AND avatar on the trigger at rest, before the async list has loaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="reviewer-async" label="レビュー担当 (async)">
              <Select
                id="reviewer-async"
                name="reviewer_async"
                value={reviewerAsync}
                onValueChange={setReviewerAsync}
                loadOptions={loadPeople}
                selectedLabel="田中 太郎"
                selectedIcon={avatarFor("田中 太郎")}
                searchPlaceholder="担当者を検索..."
                placeholder="担当者を選択"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom rows (renderOption)</CardTitle>
            <CardDescription>
              `renderOption` (like Ant&apos;s optionRender) draws a fully custom row: avatar + name +
              email + a status badge. Use a flex ROW (`div className=&quot;flex items-center&quot;`),
              not a bare `Flex` which defaults to a column.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="reviewer-custom" label="レビュー担当 (custom)">
              <Select
                id="reviewer-custom"
                name="reviewer_custom"
                value={reviewerCustom}
                onValueChange={setReviewerCustom}
                showSearch
                searchPlaceholder="担当者を検索..."
                placeholder="担当者を選択"
                options={people}
                renderOption={(option) => (
                  <div className="flex w-full items-center gap-2">
                    {avatarFor(option.label)}
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{option.label}</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {option.sublabel}
                      </span>
                    </div>
                    <Badge tone="success" className="ms-auto">
                      VIP
                    </Badge>
                  </div>
                )}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>labelRender · custom selected display</CardTitle>
            <CardDescription>
              `labelRender` (Ant Design) customizes the SELECTED value shown on the trigger: here an
              avatar + name + a role badge. The placeholder still shows when nothing is selected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="reviewer-label" label="レビュー担当 (labelRender)">
              <Select
                id="reviewer-label"
                name="reviewer_label"
                value={reviewerLabel}
                onValueChange={setReviewerLabel}
                showSearch
                searchPlaceholder="担当者を検索..."
                placeholder="担当者を選択"
                options={people}
                labelRender={({ label }) => (
                  <span className="flex items-center gap-2">
                    {avatarFor(String(label))}
                    <span className="truncate">{label}</span>
                    <Badge tone="info" icon={null} className="ms-1">
                      担当
                    </Badge>
                  </span>
                )}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compound API (custom trigger)</CardTitle>
            <CardDescription>
              Compose sub-parts when the trigger needs custom content.
            </CardDescription>
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
