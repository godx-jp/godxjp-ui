import type { Meta, StoryObj } from "@storybook/react";
import { Clock } from "lucide-react";
import { Checklist } from "../../components/data-entry/Checklist";

/**
 * data-entry/Checklist — vertical pass/fail rule list with per-row icon.
 *
 * Documented props (per `Checklist.tsx`):
 *   items:      ChecklistItem[]    rows to render
 *   iconSize?:  number              default 11
 *
 *   ChecklistItem = {
 *     ok:    boolean | null    true = ok / false = bad / null = neutral
 *     label: ReactNode
 *     icon?: ReactNode         override default check / x icon
 *     hint?: ReactNode         trailing muted hint text
 *   }
 *
 * Maps to `.checklist` / `.checklist li.ok` / `.checklist li.bad` in
 * shell.css per cardinal rule 25.
 */

const meta: Meta<typeof Checklist> = {
  title: "Data Entry/Checklist",
  component: Checklist,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Checklist** — vertical list of pass/fail rules. Common use: password
validation hints, form-completion summaries, capability matrices. Each
\`item.ok\` value drives the tone (\`true\` → success / \`false\` →
destructive / \`null\` → neutral) and selects the default icon.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Checklist>;

// ─── Default — password rules with mixed states ──────────────────

export const Default: Story = {
  name: "Default · password rules (mixed states)",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Checklist
        items={[
          { ok: true, label: "8 文字以上" },
          { ok: true, label: "大文字・小文字を含む" },
          { ok: false, label: "記号 (! @ # …) を 1 つ以上" },
          { ok: null, label: "辞書語を含まない" },
        ]}
      />
    </div>
  ),
};

// ─── AllPassed — every rule satisfied ────────────────────────────

export const AllPassed: Story = {
  name: "AllPassed · every rule satisfied",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Checklist
        items={[
          { ok: true, label: "8 文字以上" },
          { ok: true, label: "大文字・小文字を含む" },
          { ok: true, label: "記号 (! @ # …) を 1 つ以上" },
          { ok: true, label: "辞書語を含まない" },
        ]}
      />
    </div>
  ),
};

// ─── WithCustomIcons — neutral pending + hint slots ──────────────

export const WithCustomIcons: Story = {
  name: "WithCustomIcons · neutral pending icon + hint slots",
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Checklist
        items={[
          { ok: true, label: "シフト提出", hint: "5/12 完了" },
          {
            ok: null,
            label: "店長承認待ち",
            icon: <Clock size={11} aria-hidden />,
            hint: "5/14 期限",
          },
          { ok: false, label: "残業申請の上限超過", hint: "再申請が必要" },
        ]}
      />
    </div>
  ),
};

// ─── Empty — no items rendered ───────────────────────────────────

export const Empty: Story = {
  name: "Empty · no items",
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Checklist items={[]} />
    </div>
  ),
};
