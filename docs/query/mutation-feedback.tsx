import { useEffect } from "react";

import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input } from "@godxjp/ui/data-entry";
import { FormFieldControl, FormRoot, useZodForm } from "@godxjp/ui/form";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { AlertMutationFeedback } from "@godxjp/ui/query";
import { z } from "zod";

/**
 * AlertMutationFeedback · inline mutation error below a form's submit. Renders
 * NOTHING while idle/successful; surfaces the error + a retry when useMutation
 * fails. Composed from real @godxjp/ui + @tanstack/react-query. (This demo fires
 * the mutation once on mount so the error state is visible.) Inside a FormRoot
 * that received `errors`, a 400/422 validation error is skipped by default —
 * the fields already show the bag — while a 5xx still renders the alert.
 */
const queryClient = new QueryClient();

function Block() {
  const mutation = useMutation({
    mutationFn: async () => {
      throw new Error("保存に失敗しました (422) · 取引先コードが重複しています");
    },
  });

  useEffect(() => {
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>取引先の登録</CardTitle>
        <CardDescription>The feedback sits between the form and the submit button.</CardDescription>
      </CardHeader>
      <CardContent>
        <Flex direction="col" gap="md">
          <FormField id="code" label="取引先コード">
            <Input id="code" defaultValue="BTY-0012" />
          </FormField>
          <AlertMutationFeedback mutation={mutation} onRetry={() => mutation.mutate()} />
          <Flex direction="row" wrap justify="end" gap="sm">
            <Button variant="outline" type="button">
              キャンセル
            </Button>
            <Button type="submit" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
              保存
            </Button>
          </Flex>
        </Flex>
      </CardContent>
    </Card>
  );
}

type SaveError = Error & { status: number; errors?: Record<string, string[]> };

function saveError(status: number, message: string, errors?: Record<string, string[]>) {
  return Object.assign(new Error(message), { status, errors }) as SaveError;
}

const schema = z.object({ code: z.string() });

function InFormBlock() {
  const form = useZodForm(schema, { defaultValues: { code: "BTY-0012" } });
  const mutation = useMutation<void, SaveError, number>({
    mutationFn: async (status) => {
      throw status === 422
        ? saveError(422, "The given data was invalid.", {
            code: ["取引先コードが重複しています"],
          })
        : saveError(500, "サーバーエラーが発生しました (500)");
    },
  });

  useEffect(() => {
    mutation.mutate(422);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>取引先の登録 · FormRoot errors</CardTitle>
        <CardDescription>
          A 422 shows on the field only; a 500 still renders the alert.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormRoot form={form} errors={mutation.error?.errors} onSubmit={() => mutation.mutate(422)}>
          <FormFieldControl name="code" label="取引先コード">
            {(field) => <Input {...field} value={String(field.value ?? "")} />}
          </FormFieldControl>
          <AlertMutationFeedback mutation={mutation} onRetry={() => mutation.mutate(500)} />
          <Flex direction="row" wrap justify="end" gap="sm">
            <Button variant="outline" type="button" onClick={() => mutation.mutate(500)}>
              500 を再現
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              保存
            </Button>
          </Flex>
        </FormRoot>
      </CardContent>
    </Card>
  );
}

export default function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer
        title="AlertMutationFeedback"
        subtitle="Inline useMutation error + retry, below a submit button"
      >
        <Flex direction="col" gap="lg">
          <Block />
          <InFormBlock />
        </Flex>
      </PageContainer>
    </QueryClientProvider>
  );
}
