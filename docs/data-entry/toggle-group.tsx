import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * ToggleGroup — single or multi-select toggle set. type='single' for mutually
 * exclusive modes; type='multiple' for independent selections. Never raw radio
 * buttons for this pattern. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [period, setPeriod] = useState<string>("monthly");
  const [formats, setFormats] = useState<string[]>(["pdf"]);
  const [view, setView] = useState<string>("list");

  return (
    <PageContainer
      title="ToggleGroup"
      subtitle="Single or multi-select toggle set · toolbar modes, output formats"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Single selection (type=“single”)</CardTitle>
            <CardDescription>
              Mutually exclusive · switching fiscal period. value is string, onValueChange receives
              string.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="period" label="集計期間">
              <ToggleGroup
                type="single"
                value={period}
                onValueChange={(v) => {
                  if (v) setPeriod(v);
                }}
              >
                <ToggleGroupItem value="daily">日次</ToggleGroupItem>
                <ToggleGroupItem value="monthly">月次</ToggleGroupItem>
                <ToggleGroupItem value="quarterly">四半期</ToggleGroupItem>
                <ToggleGroupItem value="yearly">年次</ToggleGroupItem>
              </ToggleGroup>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multiple selection (type=“multiple”)</CardTitle>
            <CardDescription>
              Independent toggles · output format selection. value is string[], onValueChange
              receives string[].
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="formats" label="出力形式">
              <ToggleGroup
                type="multiple"
                value={formats}
                onValueChange={(v) => setFormats(v as string[])}
              >
                <ToggleGroupItem value="pdf">PDF</ToggleGroupItem>
                <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
                <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
                <ToggleGroupItem value="mail">メール</ToggleGroupItem>
              </ToggleGroup>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View density switcher</CardTitle>
            <CardDescription>
              Common use case: switching between display modes in a list or dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => {
                if (v) setView(v);
              }}
            >
              <ToggleGroupItem value="list">一覧</ToggleGroupItem>
              <ToggleGroupItem value="card">カード</ToggleGroupItem>
              <ToggleGroupItem value="compact">コンパクト</ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
