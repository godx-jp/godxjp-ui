import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { RadioGroup } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * RadioGroup — 2–4 mutually-exclusive choices, all visible at once (use Select
 * when the list is long or must collapse). Data-driven via an options array.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="RadioGroup"
      subtitle="Mutually-exclusive choices, all visible · options array"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Vertical</CardTitle>
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
            <CardTitle>Horizontal</CardTitle>
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
