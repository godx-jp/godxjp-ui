import { useState } from "react";
import { z } from "zod";
import { Alert, AlertDescription } from "@godxjp/ui/feedback";
import { Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { FormFieldControl, FormRoot, useZodForm } from "@godxjp/ui/form";

const schema = z.object({
  name: z.string().min(1, "組織名を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
});

export default function Demo() {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "server-error">("idle");
  const form = useZodForm(schema, {
    defaultValues: { name: "株式会社アクメ", email: "billing@example.jp" },
  });

  async function submit() {
    setStatus("pending");
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setStatus("success");
  }

  return (
    <PageContainer
      title="FormRoot"
      subtitle="Zod + React Hook Form · validation timing / reset / pending / summary"
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle level={2}>送付先設定</CardTitle>
          <CardDescription>
            Submit 後に field error を表示し、最初の invalid field へ focus。reset は defaultValues
            を復元する。server error summary は application が管理する。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormRoot form={form} onSubmit={submit}>
            {status === "server-error" && (
              <Alert tone="destructive">
                <AlertDescription>
                  保存できませんでした。接続を確認して再試行してください。
                </AlertDescription>
              </Alert>
            )}
            {status === "success" && (
              <Alert tone="success">
                <AlertDescription>保存しました。</AlertDescription>
              </Alert>
            )}
            <FormFieldControl name="name" label="組織名" required helper="請求書に表示します">
              {(field) => (
                <Input
                  {...field}
                  disabled={status === "pending"}
                  value={String(field.value ?? "")}
                />
              )}
            </FormFieldControl>
            <FormFieldControl name="email" label="送付先メール" required>
              {(field) => (
                <Input
                  {...field}
                  type="email"
                  disabled={status === "pending"}
                  value={String(field.value ?? "")}
                />
              )}
            </FormFieldControl>
            <Flex gap="sm" wrap>
              <Button type="submit" loading={status === "pending"}>
                保存
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={status === "pending"}
                onClick={() => {
                  form.reset();
                  setStatus("idle");
                }}
              >
                リセット
              </Button>
              <Button type="button" variant="ghost" onClick={() => setStatus("server-error")}>
                Server error を表示
              </Button>
            </Flex>
          </FormRoot>
        </CardContent>
      </Card>
      <p className="text-muted-foreground mt-4 text-sm">
        warning state、form-level error-summary から field への focus link、touched-only timing は
        public wrapper API では未提供。React Hook Form の設定または consumer composition として
        UNTESTED。
      </p>
    </PageContainer>
  );
}
