import { Card, CardContent, Descriptions, ListRow } from "@godxjp/ui/data-display";
import { Form, FormField, Input, PasswordInput } from "@godxjp/ui/data-entry";
import { Button, Heading, Logo, Text } from "@godxjp/ui/general";
import { CenteredShell, Flex, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * Auth CenteredShell `measure="split"` (54rem) holding two `measure="column"`-width halves — what
 * is connecting on one side, what it may do on the other — and, in the second half, a GROUPED
 * FORM: `Card variant="grouped"` + `Form layout="horizontal"`, so each FormField is a row (label
 * left, borderless input, inset hairline). A single-column page is `measure="column"` (25rem).
 * The verification code field shows `FormField labelHidden`: the label still names the input
 * for a screen reader. No page-local CSS.
 */
export default function Demo() {
  return (
    <CenteredShell variant="auth" barAppearance="frosted" measure="split" brand={<Logo />}>
      <ResponsiveGrid columns={{ sm: 1, md: 2 }}>
        <Flex direction="col" gap="md">
          <Heading level={1} size="3xl" weight="bold">
            Create your account
          </Heading>
          <Text tone="muted">One account for every app your organisation invites you to.</Text>
          <Card variant="grouped">
            <CardContent flush>
              <Descriptions layout="horizontal" columns={1}>
                <Descriptions.Item label="Invited by">Sample Inc.</Descriptions.Item>
                <Descriptions.Item label="Role">Member</Descriptions.Item>
              </Descriptions>
            </CardContent>
          </Card>
          <Card variant="grouped">
            <CardContent flush>
              <Flex as="ul" marker="none" direction="col" gap="none">
                <ListRow as="li" title="Tasks" description="Shared task board" />
                <ListRow as="li" title="Pages" description="Documents and reports" />
              </Flex>
            </CardContent>
          </Card>
        </Flex>
        <Flex direction="col" gap="md">
          <Card variant="grouped">
            <CardContent flush>
              <Form layout="horizontal" labelWidth="7rem">
                <FormField label="Name">
                  <Input id="m-name" defaultValue="Hanako Yamada" />
                </FormField>
                <FormField label="Email">
                  <Input id="m-email" type="email" defaultValue="yamada@example.com" />
                </FormField>
                <FormField label="Password">
                  <PasswordInput id="m-password" />
                </FormField>
              </Form>
            </CardContent>
          </Card>
          <Form>
            <FormField label="Invitation code" labelHidden>
              <Input id="m-code" placeholder="Invitation code" />
            </FormField>
          </Form>
          <Button fullWidth size="lg">
            Create account
          </Button>
        </Flex>
      </ResponsiveGrid>
    </CenteredShell>
  );
}
