import { useState } from "react";
import { AlertDialog } from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * DangerConfirm recipe (godxui#193) — high-stakes deletion built on the AlertDialog preset.
 * No new component: `challenge` gates the confirm button behind an exact typed slug, and `stepUp`
 * runs an async passkey / 2FA re-auth before onConfirm fires. Both force the destructive tone.
 * Mirrors DXS SCR-203 (org delete by slug) and SCR-209 (refund with step-up).
 */
export default function Demo() {
  const [orgOpen, setOrgOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  return (
    <PageContainer
      title="DangerConfirm"
      subtitle="typed-challenge + step-up destructive confirmation · AlertDialog recipe"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Organization delete · typed slug challenge</CardTitle>
            <CardDescription>
              The confirm button stays disabled until the operator types the exact organization slug
              (<code>acme-inc</code>). A typed challenge always forces the destructive tone and a
              soft danger header band.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={() => setOrgOpen(true)}>
              Delete organization
            </Button>
            <AlertDialog
              open={orgOpen}
              onOpenChange={setOrgOpen}
              title="Delete “Acme Inc.” permanently?"
              description="This removes every workspace, member and billing record. This cannot be undone."
              challenge="acme-inc"
              confirmLabel="Delete organization"
              cancelLabel="Keep organization"
              onConfirm={async () => {
                await new Promise<void>((r) => setTimeout(r, 800));
                setOrgOpen(false);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Refund · step-up re-authentication</CardTitle>
            <CardDescription>
              A privileged action guarded by <code>stepUp</code>: the async passkey / 2FA check runs
              first, the button shows a verifying state, and a failed check keeps the dialog open
              with an announced error. onConfirm only fires after step-up resolves truthy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={() => setRefundOpen(true)}>
              Issue full refund
            </Button>
            <AlertDialog
              open={refundOpen}
              onOpenChange={setRefundOpen}
              title="Issue a full refund of ¥48,000?"
              description="The charge is reversed immediately and the customer is notified."
              confirmLabel="Refund now"
              cancelLabel="Cancel"
              variant="destructive"
              stepUp={async () => {
                // A real consumer triggers a passkey / WebAuthn or TOTP challenge here.
                await new Promise<void>((r) => setTimeout(r, 600));
                return true;
              }}
              onConfirm={async () => {
                await new Promise<void>((r) => setTimeout(r, 500));
                setRefundOpen(false);
              }}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
