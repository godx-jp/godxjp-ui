import { useState } from "react";
import { Shield, User } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { RecordPicker } from "@godxjp/ui/data-entry";
import { Icon, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * RecordPicker — the three shapes a real consumer needed (gh#932).
 *
 * Every case on this page is one that shipped WRONG in an app before the component existed, and
 * the page is arranged so the failure each one fixes is visible: a dropdown that cannot be
 * searched, two kinds of thing in one field, and a free-text key that only failed validation
 * after save.
 */

const SMALL = [
  { value: "u1", label: "Alex Tran" },
  { value: "u2", label: "Bea Nakamura" },
  { value: "u3", label: "Cam Ito" },
];

/** 800 people is the case the report is actually about; a dropdown cannot be the answer. */
const PEOPLE = Array.from({ length: 800 }, (_, i) => ({
  value: `u${i}`,
  label: `Member ${String(i).padStart(3, "0")}`,
  sublabel: `member${i}@example.co.jp`,
}));

const ROLES = [
  { value: "r-admin", label: "Administrator", group: "Roles" },
  { value: "r-review", label: "Reviewer", group: "Roles" },
  { value: "r-observer", label: "Observer", group: "Roles" },
];

const ISSUES = Array.from({ length: 300 }, (_, i) => ({
  value: `PKG-${i + 1}`,
  label: `PKG-${i + 1}`,
  sublabel: `Requirement ${i + 1} — imported from the spec sheet`,
}));

const delay = <T,>(value: T) => new Promise<T>((r) => setTimeout(() => r(value), 120));

export default function Demo() {
  const [small, setSmall] = useState<string | null>("u2");
  const [owner, setOwner] = useState<string | null>("");
  const [approvers, setApprovers] = useState<string[]>(["r-review"]);
  const [issue, setIssue] = useState<string | null>("PKG-1");

  return (
    <PageContainer
      title="RecordPicker"
      subtitle="One control whose shape follows the size of the set — dropdown under the threshold, searchable dialog over it"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Under the threshold, it IS a Select</CardTitle>
            <CardDescription>
              Three people, so nothing is gained by a dialog. The same component renders Select —
              same trigger, same panel, same search. Nothing here is a lookalike.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm" align="start">
              <RecordPicker options={SMALL} value={small} onValueChange={(v) => setSmall(v as string)} />
              <Text as="p" size="2xs" tone="muted" tabular>
                value: {JSON.stringify(small)}
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Assigning an owner out of 800</CardTitle>
            <CardDescription>
              The case the report is about: this field was a dropdown with no search. `count` comes
              from the server — the page of rows in hand says nothing about the set behind it. The
              pinned “Unassigned” row is a value the record HOLDS, not an empty field.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm" align="start">
              <RecordPicker
                count={PEOPLE.length}
                loadOptions={async ({ query, filters }) =>
                  delay({
                    options: PEOPLE.filter(
                      (p) =>
                        p.label.toLowerCase().includes(query.toLowerCase()) &&
                        (!filters.scope || filters.scope === "project"),
                    ).slice(0, 40),
                  })
                }
                filters={[
                  {
                    name: "scope",
                    label: "Scope",
                    options: [
                      { value: "project", label: "On this project" },
                      { value: "all", label: "Everyone" },
                    ],
                  },
                ]}
                emptyOption={{ value: "", label: "Unassigned" }}
                selectedOptions={[{ value: "", label: "Unassigned" }]}
                value={owner}
                onValueChange={(v) => setOwner(v as string)}
                dialogTitle="Choose an owner"
              />
              <Text as="p" size="2xs" tone="muted" tabular>
                value: {JSON.stringify(owner)}
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Two kinds of thing in one field</CardTitle>
            <CardDescription>
              An approval step accepts a PERSON or a ROLE. They are two `group`s in one list rather
              than two controls, and the option `icon` is what keeps the chips apart once chosen.
              `multiple` commits on Confirm, so a mis-click is undone by Cancel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm" align="start">
              <RecordPicker
                mode="multiple"
                count={PEOPLE.length + ROLES.length}
                loadOptions={async ({ query }) =>
                  delay({
                    options: [
                      ...ROLES.filter((r) => r.label.toLowerCase().includes(query.toLowerCase())).map(
                        (r) => ({ ...r, icon: <Icon as={Shield} size="sm" tone="muted" /> }),
                      ),
                      ...PEOPLE.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 30)
                        .map((p) => ({
                          ...p,
                          group: "Users",
                          icon: <Icon as={User} size="sm" tone="muted" />,
                        })),
                    ],
                  })
                }
                selectedOptions={ROLES}
                value={approvers}
                onValueChange={(v) => setApprovers(v as string[])}
                dialogTitle="Choose approvers"
              />
              <Text as="p" size="2xs" tone="muted" tabular>
                value: {JSON.stringify(approvers)}
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>A record, by key or by title</CardTitle>
            <CardDescription>
              This field used to be free text: you typed the key, and a wrong one failed with a 422
              AFTER save. Searching both the key and the title, with the key shown beside it, means
              the value cannot be wrong by the time it is submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm" align="start">
              <RecordPicker
                count={ISSUES.length}
                loadOptions={async ({ query, filters }) =>
                  delay({
                    options: ISSUES.filter(
                      (o) =>
                        (o.label + o.sublabel).toLowerCase().includes(query.toLowerCase()) &&
                        (!filters.state || filters.state === "open"),
                    ).slice(0, 40),
                  })
                }
                filters={[
                  {
                    name: "state",
                    label: "State",
                    options: [
                      { value: "open", label: "Open" },
                      { value: "closed", label: "Closed" },
                    ],
                  },
                ]}
                selectedOptions={[{ value: "PKG-1", label: "PKG-1", sublabel: "Requirement 1" }]}
                value={issue}
                onValueChange={(v) => setIssue(v as string)}
                dialogTitle="Choose a requirement"
              />
              <Text as="p" size="2xs" tone="muted" tabular>
                value: {JSON.stringify(issue)}
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
