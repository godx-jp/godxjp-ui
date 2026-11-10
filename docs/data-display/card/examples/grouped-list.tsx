import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  Descriptions,
  ListRow,
} from "@godxjp/ui/data-display";
import { Button, Heading, Logo, Text } from "@godxjp/ui/general";
import { AuthAccountSummary, CenteredShell, Flex } from "@godxjp/ui/layout";
import { ChevronRight } from "lucide-react";

/**
 * Inset grouped list — an app-access consent screen built from `Card variant="grouped"`.
 *
 * Three groups, each a header caption · the grouped Card · an optional footer caption: a
 * key/value group (Descriptions), a scope group (ListRow + a mono scope at the trailing edge) and
 * a navigation group (ListRow + a chevron). Inside a grouped card the row hairlines start at the
 * row text and run to the card edge; the captions take `pad={{ inline: 4 }}`, the row inset, so
 * they start on the same axis. No page-local CSS.
 */
const scopes = [
  { title: "Basic profile information", scope: "profile" },
  { title: "See the members of the organisation", scope: "members.read" },
  { title: "See and edit work shifts", scope: "shifts.write" },
];

export default function GroupedListExample() {
  return (
    <CenteredShell variant="auth" brand={<Logo />}>
      <Flex direction="col" gap="lg">
        <Flex direction="col" gap="xs" align="center">
          <Heading level={1}>Shift Planner Pro</Heading>
          <Text tone="muted" align="center">
            This app is asking for access to your account.
          </Text>
        </Flex>

        <Card variant="grouped">
          <CardContent flush>
            <Descriptions layout="horizontal" columns={1}>
              <Descriptions.Item label="Provider">Sample Software Ltd.</Descriptions.Item>
              <Descriptions.Item label="Organisation">Sample Inc.</Descriptions.Item>
            </Descriptions>
          </CardContent>
        </Card>

        <Flex direction="col" gap="xs">
          <Flex pad={{ inline: 4 }}>
            <Text size="sm" tone="muted">
              Permissions to allow · {scopes.length}
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
          <Flex pad={{ inline: 4 }}>
            <Text size="sm" tone="muted">
              Allowing lets this app reach the organisation data with the permissions above.
            </Text>
          </Flex>
        </Flex>

        <Card variant="grouped">
          <CardContent flush>
            <Flex as="ul" marker="none" direction="col" gap="none">
              <ListRow
                as="li"
                leading={
                  <Avatar shape="square" appearance="tinted">
                    <AvatarFallback>T</AvatarFallback>
                  </Avatar>
                }
                title="Terms of service"
                description="Version 3 · due 30 Nov"
                trailing={
                  <>
                    <Badge tone="warning">To do</Badge>
                    <ChevronRight aria-hidden="true" />
                  </>
                }
              />
              <ListRow
                as="li"
                leading={
                  <Avatar shape="square" appearance="tinted">
                    <AvatarFallback>P</AvatarFallback>
                  </Avatar>
                }
                title="Privacy policy"
                description="Revised 2026-10-01"
                trailing={<ChevronRight aria-hidden="true" />}
              />
            </Flex>
          </CardContent>
        </Card>

        <Button fullWidth>Allow</Button>
        <AuthAccountSummary
          name="Hanako Yamada"
          surface="card"
          email="yamada@example.com"
          avatarFallback="HY"
          actionLabel="Switch"
        />
      </Flex>
    </CenteredShell>
  );
}
