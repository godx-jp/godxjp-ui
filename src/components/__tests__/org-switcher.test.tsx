import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { Check, ChevronsUpDown, Plus, TicketPlus } from "lucide-react";

import { renderWithUi, screen, userEvent, waitFor } from "@/test/render";
import { Button, Text } from "../general";
import { Avatar, AvatarFallback } from "../data-display/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../data-display/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../data-entry/command";

/**
 * Behavioral tests for the OrgSwitcher COMPOSITION PATTERN (docs/showcase/org-switcher.tsx,
 * godxjp-ui#196). It is NOT a framework component — this codifies that the recipe, built
 * ONLY from real primitives (Popover + Command + Button + Avatar), behaves correctly so
 * future runs need no browser MCP: open, live search filtering, select fires + closes,
 * footer create/join actions fire, and the current org carries a non-colour-only marker.
 */

type Org = { id: string; name: string; role: string };

const ORGS: Org[] = [
  { id: "acme-hq", name: "Acme Holdings", role: "Admin" },
  { id: "bluewave", name: "BlueWave Retail", role: "Member" },
  { id: "northwind", name: "Northwind Trading", role: "Accountant" },
];

function OrgSwitcher({
  currentId,
  onSelect,
  onCreate,
  onJoin,
}: {
  currentId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onJoin: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const current = ORGS.find((o) => o.id === currentId) ?? ORGS[0];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Current org: ${current.name}. Switch org`}
        >
          <Avatar className="size-6 rounded">
            <AvatarFallback>{current.name[0]}</AvatarFallback>
          </Avatar>
          <Text as="span" size="sm">
            {current.name}
          </Text>
          <ChevronsUpDown aria-hidden className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command label="Choose organization">
          <CommandInput
            placeholder="Search org…"
            aria-label="Search org"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Your organizations">
              {ORGS.map((o) => {
                const active = o.id === currentId;
                return (
                  <CommandItem
                    key={o.id}
                    value={`${o.name} ${o.role}`}
                    keywords={[o.id]}
                    onSelect={() => {
                      onSelect(o.id);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Text as="span" size="sm">
                      {o.name}
                    </Text>
                    {active ? (
                      <>
                        <Check aria-hidden className="ms-auto size-4" />
                        <span className="sr-only">(selected)</span>
                      </>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          <div className="border-t p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onCreate();
                setOpen(false);
              }}
            >
              <Plus aria-hidden className="size-4" />
              Create organization
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onJoin();
                setOpen(false);
              }}
            >
              <TicketPlus aria-hidden className="size-4" />
              Join by invite code
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function setup() {
  const onSelect = vi.fn();
  const onCreate = vi.fn();
  const onJoin = vi.fn();
  const user = userEvent.setup();
  renderWithUi(
    <OrgSwitcher currentId="acme-hq" onSelect={onSelect} onCreate={onCreate} onJoin={onJoin} />,
  );
  return { onSelect, onCreate, onJoin, user };
}

describe("OrgSwitcher composition", () => {
  it("shows the current organization on the trigger", () => {
    setup();
    expect(screen.getByRole("button", { name: /Current org: Acme Holdings/ })).toBeInTheDocument();
  });

  it("opens the searchable list and lists every organization", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /Current org: Acme Holdings/ }));
    expect(await screen.findByLabelText("Search org")).toBeInTheDocument();
    for (const org of ORGS) {
      // Scope to the listbox — the current org name ALSO appears in the trigger.
      expect(screen.getByRole("option", { name: new RegExp(org.name) })).toBeInTheDocument();
    }
  });

  it("filters the list live as the query is typed", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /Current org: Acme Holdings/ }));
    await user.type(await screen.findByLabelText("Search org"), "north");
    // The Acme OPTION is filtered out of the listbox (its name still shows in the trigger).
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: /Acme Holdings/ })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("option", { name: /Northwind Trading/ })).toBeInTheDocument();
  });

  it("fires onSelect with the org id and closes on select", async () => {
    const { user, onSelect } = setup();
    await user.click(screen.getByRole("button", { name: /Current org: Acme Holdings/ }));
    await user.click(await screen.findByText("BlueWave Retail"));
    expect(onSelect).toHaveBeenCalledWith("bluewave");
    await waitFor(() => expect(screen.queryByLabelText("Search org")).not.toBeInTheDocument());
  });

  it("marks the current org with a non-colour-only status", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /Current org: Acme Holdings/ }));
    expect(await screen.findByText("(selected)")).toBeInTheDocument();
  });

  it("fires the create-organization footer action and closes", async () => {
    const { user, onCreate } = setup();
    await user.click(screen.getByRole("button", { name: /Current org: Acme Holdings/ }));
    await user.click(await screen.findByRole("button", { name: "Create organization" }));
    expect(onCreate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByLabelText("Search org")).not.toBeInTheDocument());
  });

  it("fires the join-by-invite-code footer action", async () => {
    const { user, onJoin } = setup();
    await user.click(screen.getByRole("button", { name: /Current org: Acme Holdings/ }));
    await user.click(await screen.findByRole("button", { name: "Join by invite code" }));
    expect(onJoin).toHaveBeenCalledTimes(1);
  });
});
