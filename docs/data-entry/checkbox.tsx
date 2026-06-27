import { useState } from "react";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Checkbox, CheckboxGroup, Field, FormField } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

const ALL_SCOPES = ["read", "write", "delete"];

/**
 * Checkbox — a single boolean (wrap in Field for a labelled row) or a
 * CheckboxGroup from an options array. Composed only from real @godxjp/ui
 * components.
 */
export default function Demo() {
  // Controlled CheckboxGroup — selection is surfaced at rest below the group.
  const [channels, setChannels] = useState<string[]>(["email", "sms"]);

  // Indeterminate "select all" — parent reflects the children's mixed state.
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const allChecked = scopes.length === ALL_SCOPES.length;
  const someChecked = scopes.length > 0 && !allChecked;
  const toggleScope = (scope: string) =>
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );

  return (
    <PageContainer
      title="Checkbox"
      subtitle="Single checkbox (in Field) or a CheckboxGroup from options"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Single · labelled with Field</CardTitle>
            <CardDescription>
              Field pairs the control with a label + optional description. The last row is disabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field id="agree" label="利用規約に同意する" description="続行するには同意が必要です">
                <Checkbox id="agree" defaultChecked />
              </Field>
              <Field id="news" label="お知らせを受け取る">
                <Checkbox id="news" />
              </Field>
              <Field id="locked" label="管理者ロック" description="権限がないため変更できません">
                <Checkbox id="locked" defaultChecked disabled />
              </Field>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indeterminate · select all</CardTitle>
            <CardDescription>
              The parent uses checked=&quot;indeterminate&quot; when only some children are selected
              (children composed from explicit Field + Checkbox).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field id="scope-all" label="すべての権限">
                <Checkbox
                  id="scope-all"
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={(next) => setScopes(next === true ? ALL_SCOPES : [])}
                />
              </Field>
              <Flex direction="col" gap="sm" className="ps-6">
                <Field id="scope-read" label="閲覧">
                  <Checkbox
                    id="scope-read"
                    value="read"
                    checked={scopes.includes("read")}
                    onCheckedChange={() => toggleScope("read")}
                  />
                </Field>
                <Field id="scope-write" label="編集">
                  <Checkbox
                    id="scope-write"
                    value="write"
                    checked={scopes.includes("write")}
                    onCheckedChange={() => toggleScope("write")}
                  />
                </Field>
                <Field id="scope-delete" label="削除">
                  <Checkbox
                    id="scope-delete"
                    value="delete"
                    checked={scopes.includes("delete")}
                    onCheckedChange={() => toggleScope("delete")}
                  />
                </Field>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error · invalid in a FormField</CardTitle>
            <CardDescription>
              FormField wires aria-invalid + the error message onto the control (role=alert).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="terms" label="利用規約に同意する" error="同意が必要です">
              <Checkbox id="terms" />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CheckboxGroup (options)</CardTitle>
            <CardDescription>
              Multi-select from a data-driven options array, with per-option description and disabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CheckboxGroup
              name="export"
              defaultValue={["pdf"]}
              options={[
                { value: "pdf", label: "PDF 出力", description: "印刷向けのレイアウト" },
                { value: "csv", label: "CSV 出力", description: "表計算ソフトで開けます" },
                { value: "mail", label: "メール送信", disabled: true, description: "送信先が未設定です" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horizontal orientation</CardTitle>
            <CardDescription>
              orientation=&quot;horizontal&quot; lays the options out in a wrapping row.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CheckboxGroup
              defaultValue={["mon", "wed", "fri"]}
              orientation="horizontal"
              options={[
                { value: "mon", label: "月" },
                { value: "tue", label: "火" },
                { value: "wed", label: "水" },
                { value: "thu", label: "木" },
                { value: "fri", label: "金" },
                { value: "sat", label: "土" },
                { value: "sun", label: "日" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controlled value</CardTitle>
            <CardDescription>
              value + onValueChange own the selection; it is surfaced below the group.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <CheckboxGroup
                value={channels}
                onValueChange={setChannels}
                options={[
                  { value: "email", label: "メール" },
                  { value: "sms", label: "SMS" },
                  { value: "push", label: "プッシュ通知" },
                ]}
              />
              <Flex gap="sm" wrap>
                {channels.length === 0 ? (
                  <Badge variant="secondary">未選択</Badge>
                ) : (
                  channels.map((c) => <Badge key={c}>{c}</Badge>)
                )}
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disabled group</CardTitle>
            <CardDescription>disabled on the group disables every option at once.</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckboxGroup
              disabled
              defaultValue={["auto"]}
              options={[
                { value: "auto", label: "自動承認" },
                { value: "manual", label: "手動承認" },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
