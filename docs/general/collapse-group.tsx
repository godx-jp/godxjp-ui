import { useState } from "react";

import { Badge, Card, CardContent, ListRow, Progress } from "@godxjp/ui/data-display";
import { Button, CollapseGroup, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * CollapseGroup — a required-actions list: completing an item REMOVES it from the array, and the
 * row collapses out (height + opacity → 0) so the rows under it slide up instead of jumping. The
 * segmented meter above is `Progress steps`. Reduced motion: the row goes at once.
 */
const INITIAL = [
  { id: "terms", title: "Accept the terms of service (version 3)", meta: "Due 30 Nov" },
  { id: "profile", title: "Enter your onboarding details", meta: "Due 5 Dec" },
  { id: "mfa", title: "Turn on two-factor authentication", meta: "Recommended" },
];

export default function Demo() {
  const [pending, setPending] = useState(INITIAL);
  const done = INITIAL.length - pending.length;

  return (
    <PageContainer title="CollapseGroup" subtitle="a removed row collapses out">
      <Card variant="muted">
        <CardContent>
          <Flex direction="col" gap="md">
            <Progress
              steps={INITIAL.length}
              value={(done / INITIAL.length) * 100}
              label={`${done} of ${INITIAL.length} done`}
              tone="success"
            />
            <Card variant="grouped">
              <CardContent flush>
                <Flex as="ul" marker="none" direction="col" gap="none">
                  <CollapseGroup>
                    {pending.map((item) => (
                      <ListRow
                        key={item.id}
                        as="li"
                        title={item.title}
                        description={item.meta}
                        trailing={
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPending((xs) => xs.filter((x) => x.id !== item.id))}
                          >
                            Done
                          </Button>
                        }
                      />
                    ))}
                  </CollapseGroup>
                </Flex>
              </CardContent>
            </Card>
            {pending.length === 0 ? (
              <Flex gap="sm" align="center">
                <Badge tone="success">All done</Badge>
                <Button variant="link" onClick={() => setPending(INITIAL)}>
                  Reset
                </Button>
              </Flex>
            ) : (
              <Text size="sm" tone="muted">
                Press Done on a row.
              </Text>
            )}
          </Flex>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
