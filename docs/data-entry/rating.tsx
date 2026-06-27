import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Rating } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Rating — star-rating input (radiogroup internally). Controlled via
 * value/onValueChange. Use readOnly for displaying an average score.
 * Pass name for native form submission. Composed only from real @godxjp/ui
 * components.
 */
export default function Demo() {
  const [vendorScore, setVendorScore] = useState(0);
  const [qualityScore, setQualityScore] = useState(4);

  return (
    <PageContainer
      title="Rating"
      subtitle="Star-rating input (radiogroup) — collecting reviews or displaying averages"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Controlled input</CardTitle>
            <CardDescription>
              Controlled via value/onValueChange. Keyboard accessible (radiogroup). Pass name= for
              native form submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="vendor-rating" label="取引先評価">
                <Rating name="vendor_rating" value={vendorScore} onValueChange={setVendorScore} />
              </FormField>
              <FormField id="quality-rating" label="品質スコア">
                <Rating
                  name="quality_score"
                  value={qualityScore}
                  onValueChange={setQualityScore}
                  max={5}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Read-only display</CardTitle>
            <CardDescription>
              readOnly=true turns it into a display widget with no interaction. Use for showing average
              scores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="avg-payment" label="支払い信頼性 (平均)">
                <Rating value={4} readOnly />
              </FormField>
              <FormField id="avg-response" label="対応速度 (平均)">
                <Rating value={3} readOnly />
              </FormField>
              <FormField id="avg-accuracy" label="請求正確性 (平均)">
                <Rating value={5} readOnly />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom max stars</CardTitle>
            <CardDescription>
              max= controls the number of stars rendered. Default is 5.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="priority-rating" label="優先度 (10段階)">
              <Rating name="priority" defaultValue={7} max={10} />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
