import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Select } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

const countries = [
  { value: "jp", label: "日本", sublabel: "Japan" },
  { value: "vn", label: "Việt Nam", sublabel: "Vietnam" },
];

export default function Demo() {
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <PageContainer
      title="Select async contracts"
      subtitle="Retry · load more · controlled state · read-only"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Explicit retry action</CardTitle>
            <CardDescription>
              A rejected loader exposes a keyboard-focusable retry action.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField id="retry-country" label="Country">
              <Select
                id="retry-country"
                errorMessage="国を読み込めませんでした"
                loadOptions={async () => {
                  if (attempt === 0) {
                    setAttempt(1);
                    throw new Error("offline");
                  }
                  return { options: countries };
                }}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keyboard load more</CardTitle>
            <CardDescription>
              Infinite scroll also exposes a normal button for keyboard and switch users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              aria-label="Paged country"
              loadOptions={async ({ page }) => ({
                options: [countries[(page - 1) % countries.length]],
                hasMore: page === 1,
              })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controlled popup + search</CardTitle>
            <CardDescription>
              Parent state can synchronize deep links, dialogs, and external filter controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              aria-label="Controlled country"
              showSearch
              options={countries}
              open={open}
              onOpenChange={setOpen}
              search={search}
              onSearchChange={setSearch}
              filterOption={(option, query) =>
                option.sublabel?.toLowerCase().includes(query.toLowerCase()) ?? false
              }
              size="sm"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Read-only value</CardTitle>
            <CardDescription>
              Users may inspect options but cannot change or clear the committed value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              aria-label="Locked country"
              showSearch
              options={countries}
              defaultValue="jp"
              readOnly
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
