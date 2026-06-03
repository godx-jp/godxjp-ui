import { useEffect } from "react";

import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { AlertMutationFeedback } from "@godxjp/ui/query";

/**
 * AlertMutationFeedback — inline mutation error below a form's submit. Renders
 * NOTHING while idle/successful; surfaces the error + a retry when useMutation
 * fails. Composed from real @godxjp/ui + @tanstack/react-query. (This demo fires
 * the mutation once on mount so the error state is visible.)
 */
const queryClient = new QueryClient();

function Block() {
  const mutation = useMutation({
    mutationFn: async () => {
      throw new Error("保存に失敗しました (422) — 取引先コードが重複しています");
    },
  });

  useEffect(() => {
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>取引先の登録</CardTitle>
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

export default function Demo() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer title="AlertMutationFeedback" subtitle="Inline useMutation error + retry, below a submit button">
        <Flex direction="col" gap="lg">
          <Block />
        </Flex>
      </PageContainer>
    </QueryClientProvider>
  );
}
