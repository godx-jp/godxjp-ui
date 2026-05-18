import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { Button } from "../../components/primitives";
import { CommandPalette } from "../../components/shell";
import type { CommandItem } from "../../components/shell";

/**
 * Shell/CommandPalette — ⌘K overlay built on cmdk + Radix Dialog.
 *
 * Per cardinal rule 29 trigger is a framework Button.
 */

const meta: Meta<typeof CommandPalette> = {
  title: "Shell/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Centered command palette. Caller supplies commands + " +
          "handlers; this component owns chrome + cmdk filtering. " +
          "⌘K binds globally while mounted.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof CommandPalette>;

const COMMANDS: CommandItem[] = [
  {
    id: "go-dashboard",
    label: "Go to dashboard",
    group: "Navigate",
    hint: "G D",
    onSelect: () => undefined,
  },
  {
    id: "go-projects",
    label: "Go to projects",
    group: "Navigate",
    hint: "G P",
    onSelect: () => undefined,
  },
  {
    id: "go-issues",
    label: "Go to issues",
    group: "Navigate",
    hint: "G I",
    onSelect: () => undefined,
  },
  {
    id: "new-issue",
    label: "New issue",
    group: "Create",
    hint: "C I",
    onSelect: () => undefined,
  },
  {
    id: "new-plan",
    label: "New plan",
    group: "Create",
    hint: "C P",
    onSelect: () => undefined,
  },
  {
    id: "toggle-theme",
    label: "Toggle theme",
    group: "Tweaks",
    onSelect: () => undefined,
  },
];

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useState } from "react";
import { Button, CommandPalette, type CommandItem } from "@godxjp/ui";

export default function Example() {
  const [open, setOpen] = useState(true);
  const commands: CommandItem[] = [
    {
      id: "go-dashboard",
      label: "Go to dashboard",
      group: "Navigate",
      hint: "G D",
      onSelect: () => console.log("go-dashboard"),
    },
    {
      id: "go-projects",
      label: "Go to projects",
      group: "Navigate",
      hint: "G P",
      onSelect: () => console.log("go-projects"),
    },
    {
      id: "go-issues",
      label: "Go to issues",
      group: "Navigate",
      hint: "G I",
      onSelect: () => console.log("go-issues"),
    },
    {
      id: "new-issue",
      label: "New issue",
      group: "Create",
      hint: "C I",
      onSelect: () => console.log("new-issue"),
    },
    {
      id: "new-plan",
      label: "New plan",
      group: "Create",
      hint: "C P",
      onSelect: () => console.log("new-plan"),
    },
    {
      id: "toggle-theme",
      label: "Toggle theme",
      group: "Tweaks",
      onSelect: () => console.log("toggle-theme"),
    },
  ];

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command palette
      </Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={commands} />
    </>
  );
}`,
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open command palette
        </Button>
        <CommandPalette open={open} onOpenChange={setOpen} commands={COMMANDS} />
      </>
    );
  },
  play: async ({ canvasElement, step }) => {
    const portal = within(canvasElement.ownerDocument.body);

    await step("palette is open with a search input visible", async () => {
      const search = await portal.findByPlaceholderText(/search…|検索…/i);
      await expect(search).toBeVisible();
    });
  },
};

export const Empty: Story = {
  name: "Empty (commands=[])",
  parameters: {
    docs: {
      source: {
        language: "tsx",
        code: `import { useState } from "react";
import { Button, CommandPalette } from "@godxjp/ui";

export default function Example() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command palette
      </Button>
      <CommandPalette open={open} onOpenChange={setOpen} commands={[]} />
    </>
  );
}`,
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open command palette
        </Button>
        <CommandPalette open={open} onOpenChange={setOpen} commands={[]} />
      </>
    );
  },
};
