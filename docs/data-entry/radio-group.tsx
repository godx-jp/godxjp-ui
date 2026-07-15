import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Field, RadioGroup, RadioItem } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * RadioGroup — 2–4 mutually-exclusive choices, all visible at once (use Select
 * when the list is long or must collapse). Data-driven via an options array.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [controlled, setControlled] = useState("email");
  return (
    <PageContainer
      title="RadioGroup"
      subtitle="Mutually-exclusive choices, all visible · options array"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Vertical</CardTitle>
            <CardDescription>The default stacked layout.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="taxed"
              options={[
                { value: "taxed", label: "税抜" },
                { value: "included", label: "税込" },
                { value: "exempt", label: "非課税" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Controlled · named · disabled</CardTitle>
            <CardDescription>
              Controlled callback and native form name with disabled options.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              className="contract-radio-group"
              name="notification_channel"
              value={controlled}
              onValueChange={setControlled}
              options={[
                { value: "email", label: "メール" },
                { value: "sms", label: "SMS" },
                { value: "push", label: "プッシュ", disabled: true },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Disabled group · custom children</CardTitle>
            <CardDescription>
              The children composition remains labelled and non-interactive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup disabled defaultValue="locked">
              <Field id="radio-locked" label="確定済み">
                <RadioItem id="radio-locked" value="locked" />
              </Field>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Horizontal</CardTitle>
            <CardDescription>orientation=“horizontal” for compact rows.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="round"
              orientation="horizontal"
              options={[
                { value: "round", label: "四捨五入" },
                { value: "floor", label: "切り捨て" },
                { value: "ceil", label: "切り上げ" },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
