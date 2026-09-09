import { useState } from "react";
import { z } from "zod";
import { Alert, AlertDescription } from "@godxjp/ui/feedback";
import { Input, Select } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import {
  FormFieldArray,
  FormFieldControl,
  FormRoot,
  useFormDisabled,
  useFormWatch,
  useZodForm,
} from "@godxjp/ui/form";

const schema = z.object({
  plan: z.enum(["standard", "enterprise"]),
  contacts: z
    .array(
      z.object({
        name: z.string().min(1, "担当者名を入力してください"),
        email: z.string().email("有効なメールアドレスを入力してください"),
      }),
    )
    .min(1, "担当者を 1 名以上登録してください"),
});

type Values = z.infer<typeof schema>;

const emptyContact = { name: "", email: "" };

/** Counter driven by useFormWatch — re-renders on `contacts` only, not on every keystroke elsewhere. */
function ContactCount() {
  const contacts = useFormWatch<Values>("contacts");
  return (
    <CardDescription>
      {`登録済み ${Array.isArray(contacts) ? contacts.length : 0} 名 · 行の追加・削除・並べ替えは送信値の順序にそのまま反映されます。`}
    </CardDescription>
  );
}

/** Action buttons are not fields, so they read the form-level disabled state themselves. */
function Actions({ onReset }: { onReset: () => void }) {
  const disabled = useFormDisabled();
  return (
    <Flex gap="sm" wrap>
      <Button type="submit" disabled={disabled}>
        保存
      </Button>
      <Button type="reset" variant="outline" disabled={disabled} onClick={onReset}>
        リセット
      </Button>
    </Flex>
  );
}

export default function Demo() {
  const [status, setStatus] = useState<"idle" | "saved" | "failed">("idle");
  const [locked, setLocked] = useState(false);
  const form = useZodForm(schema, {
    defaultValues: {
      plan: "standard",
      contacts: [{ name: "田中 花子", email: "tanaka@example.jp" }],
    },
  });

  return (
    <PageContainer
      title="FormFieldArray"
      subtitle="動的な繰り返しフィールド · watch / disabled / reset / 送信失敗"
    >
      <Card>
        <CardHeader>
          <CardTitle level={2}>請求先の担当者</CardTitle>
        </CardHeader>
        <CardContent>
          <FormRoot
            form={form}
            layout="horizontal"
            disabled={locked}
            onSubmit={() => setStatus("saved")}
            onSubmitFailed={() => setStatus("failed")}
            onReset={() => setStatus("idle")}
          >
            <ContactCount />
            {status === "failed" && (
              <Alert tone="destructive">
                <AlertDescription>
                  入力内容を確認してください。最初のエラー項目へ移動しました。
                </AlertDescription>
              </Alert>
            )}
            {status === "saved" && (
              <Alert tone="success">
                <AlertDescription>保存しました。</AlertDescription>
              </Alert>
            )}

            <FormFieldControl<Values> name="plan" label="プラン">
              {(field) => (
                <Select
                  {...field}
                  value={typeof field.value === "string" ? field.value : "standard"}
                  onValueChange={field.onValueChange}
                  options={[
                    { value: "standard", label: "スタンダード" },
                    { value: "enterprise", label: "エンタープライズ" },
                  ]}
                />
              )}
            </FormFieldControl>

            <FormFieldArray<Values, "contacts"> name="contacts">
              {({ fields, append, remove, move, error, disabled }) => (
                <>
                  {error && (
                    <Alert tone="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {fields.map((row, position) => (
                    <Card key={row.key} variant="outline">
                      <CardContent>
                        <Flex direction="col" gap="md">
                          <FormFieldControl<Values>
                            name={`${row.name}.name`}
                            label={`担当者 ${position + 1} · 氏名`}
                            required
                          >
                            {(field) => (
                              <Input
                                {...field}
                                value={typeof field.value === "string" ? field.value : ""}
                              />
                            )}
                          </FormFieldControl>
                          <FormFieldControl<Values>
                            name={`${row.name}.email`}
                            label={`担当者 ${position + 1} · メール`}
                            required
                          >
                            {(field) => (
                              <Input
                                {...field}
                                type="email"
                                value={typeof field.value === "string" ? field.value : ""}
                              />
                            )}
                          </FormFieldControl>
                          <Flex gap="sm" wrap>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={disabled || position === 0}
                              onClick={() => move(row.index, row.index - 1)}
                            >
                              {`担当者 ${position + 1} を上へ`}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={disabled || fields.length === 1}
                              onClick={() => remove(row.index)}
                            >
                              {`担当者 ${position + 1} を削除`}
                            </Button>
                          </Flex>
                        </Flex>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => append(emptyContact)}
                  >
                    担当者を追加
                  </Button>
                </>
              )}
            </FormFieldArray>

            <Actions onReset={() => setStatus("idle")} />
          </FormRoot>
        </CardContent>
      </Card>

      <Flex gap="sm" wrap>
        <Button type="button" variant="ghost" onClick={() => setLocked((value) => !value)}>
          {locked ? "フォームのロックを解除" : "フォーム全体をロック (disabled)"}
        </Button>
      </Flex>
    </PageContainer>
  );
}
