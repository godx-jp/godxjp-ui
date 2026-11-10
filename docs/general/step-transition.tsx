import { useState } from "react";

import { Card, CardContent } from "@godxjp/ui/data-display";
import { FormField, Input, PasswordInput } from "@godxjp/ui/data-entry";
import { Button, Heading, StepTransition, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { Steps } from "@godxjp/ui/navigation";

/**
 * StepTransition — the swap between the steps of a sign-in. "Next" pushes the email step out toward
 * the inline start while the password step enters from the end; "Change" goes back on the mirrored
 * path. Reduced motion: a cross-fade. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [step, setStep] = useState<"email" | "password">("email");
  const [back, setBack] = useState(false);
  const [email, setEmail] = useState("yamada@example.com");
  const go = (next: "email" | "password", backward: boolean) => {
    setBack(backward);
    setStep(next);
  };

  return (
    <PageContainer title="StepTransition" subtitle="exit + enter between the steps of a flow">
      <Card>
        <CardContent>
          <Flex direction="col" gap="lg">
            <Steps
              type="bar"
              value={step === "email" ? 0 : 1}
              items={[{ title: "Email" }, { title: "Password" }, { title: "Done" }]}
            />
            <StepTransition value={step} direction={back ? "backward" : "forward"}>
              {step === "email" ? (
                <Flex direction="col" gap="md">
                  <Heading level={2}>Sign in</Heading>
                  <FormField label="Email">
                    <Input id="st-email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </FormField>
                  <Button fullWidth onClick={() => go("password", false)}>
                    Next
                  </Button>
                </Flex>
              ) : (
                <Flex direction="col" gap="md">
                  <Heading level={2}>Enter your password</Heading>
                  <Flex align="center" justify="between" gap="sm">
                    <Text tone="muted">{email}</Text>
                    <Button variant="ghost" size="sm" onClick={() => go("email", true)}>
                      Change
                    </Button>
                  </Flex>
                  <FormField label="Password">
                    <PasswordInput id="st-password" />
                  </FormField>
                  <Button fullWidth>Sign in</Button>
                </Flex>
              )}
            </StepTransition>
          </Flex>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
