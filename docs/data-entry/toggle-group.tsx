import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, ToggleGroup, ToggleGroupItem } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
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
            <CardTitle level={2}>Single selection (type=“single”)</CardTitle>
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
            <CardTitle level={2}>Multiple selection (type=“multiple”)</CardTitle>
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
            <CardTitle level={2}>View density switcher</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle level={2}>variant · default / outline</CardTitle>
            <CardDescription>
              variant は ToggleGroup にだけ指定すれば全アイテムへ伝播する（各 ToggleGroupItem
              への繰り返し指定は不要）。default は選択時に背景が塗られ、outline は枠線で示す。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  variant=&quot;default&quot;
                </Text>
                <ToggleGroup type="single" variant="default" defaultValue="pdf">
                  <ToggleGroupItem value="pdf">PDF</ToggleGroupItem>
                  <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
                  <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  variant=&quot;outline&quot;
                </Text>
                <ToggleGroup type="single" variant="outline" defaultValue="pdf">
                  <ToggleGroupItem value="pdf">PDF</ToggleGroupItem>
                  <ToggleGroupItem value="csv">CSV</ToggleGroupItem>
                  <ToggleGroupItem value="xlsx">Excel</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>size · sm / md / lg</CardTitle>
            <CardDescription>
              size も ToggleGroup にだけ指定すれば全アイテムへ伝播する。md
              が既定。周囲のコントロール密度に合わせて sm または lg を選ぶ。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  size=&quot;sm&quot;
                </Text>
                <ToggleGroup type="single" size="sm" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month">月次</ToggleGroupItem>
                  <ToggleGroupItem value="year">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  size=&quot;md&quot;
                </Text>
                <ToggleGroup type="single" size="md" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month">月次</ToggleGroupItem>
                  <ToggleGroupItem value="year">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  size=&quot;lg&quot;
                </Text>
                <ToggleGroup type="single" size="lg" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month">月次</ToggleGroupItem>
                  <ToggleGroupItem value="year">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>継承と上書き（group → item）</CardTitle>
            <CardDescription>
              group の variant / size は全アイテムへ伝播し、item 側で明示した prop
              が常に優先される。group だけ・item だけ・両方に指定した 3
              つの書き方はすべて同じ描画になる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  group size=&quot;sm&quot; · 中央のみ item size=&quot;lg&quot; で上書き
                </Text>
                <ToggleGroup type="single" size="sm" variant="outline" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month" size="lg">
                    月次
                  </ToggleGroupItem>
                  <ToggleGroupItem value="year">年次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  group にのみ指定（伝播）
                </Text>
                <ToggleGroup type="single" size="lg" variant="outline" defaultValue="day">
                  <ToggleGroupItem value="day">日次</ToggleGroupItem>
                  <ToggleGroupItem value="month">月次</ToggleGroupItem>
                </ToggleGroup>
              </Flex>
              <Flex direction="col" gap="sm">
                <Text as="p" size="sm" tone="muted">
                  item にのみ指定（従来の書き方・描画は不変）
                </Text>
                <ToggleGroup type="single" defaultValue="day">
                  <ToggleGroupItem value="day" size="lg" variant="outline">
                    日次
                  </ToggleGroupItem>
                  <ToggleGroupItem value="month" size="lg" variant="outline">
                    月次
                  </ToggleGroupItem>
                </ToggleGroup>
              </Flex>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
