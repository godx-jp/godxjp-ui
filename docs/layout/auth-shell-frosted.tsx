import { useState } from "react";

import { Badge, Card, CardContent, Descriptions, ListRow } from "@godxjp/ui/data-display";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@godxjp/ui/data-entry";
import { Button, Heading, Logo, Text } from "@godxjp/ui/general";
import { AuthAccountSummary, CenteredShell, Flex } from "@godxjp/ui/layout";
import { AppSettingPicker, Steps } from "@godxjp/ui/navigation";

/**
 * Frosted bar + the hosted device-connection flow (code, confirm, done).
 *
 * `barAppearance="frosted"`: the bar stays pinned and the page scrolls UNDER it — a translucent
 * pane with a backdrop blur; solid under prefers-reduced-transparency, written by the shell. The
 * column is composed from the kit only: `Steps type="bar"` for progress, a boxed 4+4 `InputOTP`
 * in the mono face for the device code, and a `Card variant="grouped"` of requested scopes. No
 * page-local CSS.
 */
const scopes = [
  { title: "Sign in with your account", scope: "openid" },
  { title: "Basic profile", detail: "Name, language, time zone", scope: "profile" },
  { title: "Keep access while you are away", detail: "Refresh token", scope: "offline_access" },
];

export default function Demo() {
  const [step, setStep] = useState(0);
  const [code, setCode] = useState("");

  return (
    <CenteredShell
      variant="auth"
      barAppearance="frosted"
      brand={<Logo />}
      actions={<AppSettingPicker kind="locale" appearance="labeled" compact />}
    >
      <Flex direction="col" gap="lg">
        <Steps
          type="bar"
          value={step}
          items={[{ title: "Enter code" }, { title: "Confirm" }, { title: "Done" }]}
        />
        <Flex direction="col" gap="xs">
          <Heading level={1}>Connect a device</Heading>
          <Text tone="muted">
            {step === 0
              ? "Enter the code shown on your device."
              : "Check the device and the permissions it asks for."}
          </Text>
        </Flex>

        {step === 0 ? (
          <Flex direction="col" gap="lg">
            <InputOTP
              aria-label="Device code"
              maxLength={8}
              mono
              align="center"
              value={code}
              onValueChange={setCode}
              formatter={(v) => v.toUpperCase()}
              pasteTransformer={(v) => v.replace(/[^a-z0-9]/gi, "")}
            >
              <InputOTPGroup appearance="boxed">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup appearance="boxed">
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
            <Button fullWidth disabled={code.length < 8} onClick={() => setStep(1)}>
              Continue
            </Button>
          </Flex>
        ) : (
          <Flex direction="col" gap="lg">
            <Card variant="grouped">
              <CardContent flush>
                <Descriptions layout="horizontal" columns={1}>
                  <Descriptions.Item label="Device">CLI · macOS</Descriptions.Item>
                  <Descriptions.Item label="Code" mono>
                    <Flex align="center" justify="between" gap="sm">
                      <Text mono weight="bold">
                        {code.slice(0, 4)}-{code.slice(4)}
                      </Text>
                      <Badge tone="success">Matches</Badge>
                    </Flex>
                  </Descriptions.Item>
                </Descriptions>
              </CardContent>
            </Card>
            <Flex direction="col" gap="xs">
              <Flex pad={{ inline: 4 }}>
                <Text size="sm" tone="muted">
                  Requested permissions · {scopes.length}
                </Text>
              </Flex>
              <Card variant="grouped">
                <CardContent flush>
                  <Flex as="ul" marker="none" direction="col" gap="none">
                    {scopes.map((item) => (
                      <ListRow
                        key={item.scope}
                        as="li"
                        title={item.title}
                        description={item.detail}
                        trailing={
                          <Text mono size="xs" tone="muted">
                            {item.scope}
                          </Text>
                        }
                      />
                    ))}
                  </Flex>
                </CardContent>
              </Card>
            </Flex>
            <Button fullWidth onClick={() => setStep(2)}>
              Approve
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setStep(0)}>
              Deny
            </Button>
          </Flex>
        )}

        <AuthAccountSummary email="yamada@example.com" avatarFallback="Y" actionLabel="Switch" />
      </Flex>
    </CenteredShell>
  );
}
