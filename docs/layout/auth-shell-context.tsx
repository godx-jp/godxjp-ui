import { ChevronRight } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ListRow,
} from "@godxjp/ui/data-display";
import { Checkbox, Field } from "@godxjp/ui/data-entry";
import { Button, Logo, Reveal, Text } from "@godxjp/ui/general";
import { AuthFooter, AuthIdentity, AuthShell, Flex } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * AuthShell preset="context-selection" (gh#217) — the canonical organisation / context picker.
 *
 * The preset owns the whole page measure: a 25rem card at 1440/1024 and an edge-to-edge card at
 * 390 (0 inline gutter), plus the vertical rhythm between the three direct sections of the auth
 * column — the intro (`AuthIdentity`), the choice card, and the trailing "remember" row. There is
 * no page-local width, inset or colour here.
 *
 * The organisation list is a COMPOSITION, not a new framework component (Gate 0 / rule #46): a
 * `Card` + `CardContent flush` + a `<ul>` of `ListRow as="li"` already gives shared row dividers
 * with no per-row card outline — exactly the requested `OrganizationChoiceList`.
 *
 * The brand mark is the real GoDX identity mark that the package already owns
 * (`<Logo mark="godx" />`), and the footer locale switch is the compact labelled presentation
 * (`<AppSettingPicker kind="locale" appearance="labeled" compact />`) rather than the square
 * icon-only topbar default. Verify at 1440x900 · 1024x900 · 390x844.
 */
const ORGANIZATIONS = [
  { id: "acme", name: "Acme 株式会社", role: "管理者 · 128 メンバー", initials: "AC" },
  { id: "godx-labs", name: "GoDX Labs", role: "メンバー · 24 メンバー", initials: "GL" },
  {
    id: "tokyo-logistics",
    name: "東京ロジスティクス",
    role: "閲覧者 · 512 メンバー",
    initials: "TL",
  },
];

export default function Demo() {
  return (
    <AuthShell
      variant="canonical"
      preset="context-selection"
      brand={
        <Flex align="center" gap="sm">
          <Logo mark="godx" tone="success" />
          <Text weight="medium">GoDX ID</Text>
        </Flex>
      }
      footer={
        <AuthFooter
          product="GoDX ID"
          terms="利用規約"
          privacy="プライバシー"
          locale={<AppSettingPicker kind="locale" appearance="labeled" compact />}
        />
      }
    >
      <AuthIdentity title="組織を選択" requester="satoshi@example.com としてサインイン中" />
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle level={2}>続行する組織</CardTitle>
            <CardDescription>この後の操作はここで選んだ組織に適用されます。</CardDescription>
          </CardHeader>
          <CardContent flush>
            <ul>
              {ORGANIZATIONS.map((org) => (
                <ListRow
                  as="li"
                  key={org.id}
                  leading={
                    <Avatar>
                      <AvatarFallback>{org.initials}</AvatarFallback>
                    </Avatar>
                  }
                  title={org.name}
                  description={org.role}
                  trailing={
                    <Button variant="ghost" size="sm">
                      選択
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  }
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      </Reveal>
      <Field id="auth-remember-context" label="次回からこの組織を既定にする">
        <Checkbox id="auth-remember-context" />
      </Field>
    </AuthShell>
  );
}
