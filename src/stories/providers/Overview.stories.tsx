import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardBody } from "../../components/data-display/Card";
import { Tag } from "../../components/data-display/Tag";
import { Typography } from "../../components/primitives";

/**
 * Providers — the React-context providers a `@godxjp/ui` consumer
 * mounts at the root of their app.
 *
 * Cardinal rule 33 — stories, source, and docs are name-synchronized.
 * The catalogue below is the canonical list; do not introduce a
 * provider here that doesn't exist as an export in the framework
 * surface, and do not omit a provider that consumers MUST mount.
 */

const meta: Meta = {
  title: "Providers/Overview",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**Providers** — the React-context layer that every \`@godxjp/ui\`
consumer mounts once at the root of their app.

\`\`\`tsx
import { GodxConfigProvider } from "@godxjp/ui/preferences"
import { I18nextProvider } from "react-i18next"
import { initI18n } from "@godxjp/ui/i18n"

const i18n = initI18n()

<GodxConfigProvider defaultLocale="ja" defaultTimezone="Asia/Tokyo" defaultCurrency="JPY">
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
</GodxConfigProvider>
\`\`\`

Open the sibling \`Providers/GodxConfigProvider\` story for live
locale / timezone switching and the \`headers()\` axios wiring.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj;

interface ProviderRow {
  name: string;
  importPath: string;
  responsibility: string;
  tags: string[];
  notes?: string;
  required: "required" | "recommended" | "optional";
}

const ROWS: ProviderRow[] = [
  {
    name: "GodxConfigProvider",
    importPath: '@godxjp/ui/preferences',
    responsibility:
      "Locale (BCP 47) + IANA timezone + currency defaults. Wraps children in React Aria's <I18nProvider> so every date / time / number primitive auto-localises.",
    tags: ["locale", "timezone", "currency", "i18n", "react-aria"],
    notes:
      "The only framework-side provider that a consumer is required to mount. Persists to localStorage / cookie / both. Pair with applyGodxConfigHeaders(axiosInstance) for Accept-Language + X-Timezone request headers.",
    required: "required",
  },
  {
    name: "I18nextProvider",
    importPath: 'react-i18next',
    responsibility:
      "i18next translation-string context. `@godxjp/ui` ships ONE shared singleton (ADR 0004) — consumers extend via `i18next.addResourceBundle(locale, namespace, dict)`.",
    tags: ["i18n", "translation"],
    notes:
      'Mount AFTER `initI18n()`. The Provider reads locale from `<GodxConfigProvider>` indirectly via the i18next singleton.',
    required: "required",
  },
];

const required = (tone: ProviderRow["required"]) => {
  switch (tone) {
    case "required":
      return <Tag color="primary" bordered={false}>required</Tag>;
    case "recommended":
      return <Tag color="success" bordered={false}>recommended</Tag>;
    case "optional":
      return <Tag color="default" bordered={false}>optional</Tag>;
  }
};

export const Overview: Story = {
  name: "Overview — provider catalogue",
  render: function Overview() {
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 880 }}>
        {ROWS.map((row) => (
          <Card key={row.name} padding="cozy">
            <CardHeader>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Typography.Title size={4} style={{ margin: 0 }}>
                  {row.name}
                </Typography.Title>
                {required(row.required)}
              </div>
              <Typography.Text code style={{ fontSize: "var(--text-xs)" }}>
                {row.importPath}
              </Typography.Text>
            </CardHeader>
            <CardBody>
              <Typography.Paragraph style={{ margin: 0, marginBottom: 8 }}>
                {row.responsibility}
              </Typography.Paragraph>
              {row.notes ? (
                <Typography.Paragraph color="secondary" style={{ margin: 0, marginBottom: 8 }}>
                  {row.notes}
                </Typography.Paragraph>
              ) : null}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {row.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  },
};

export const MountingOrder: Story = {
  name: "Mounting order — single root composition",
  render: function MountingOrder() {
    return (
      <Card padding="cozy">
        <CardHeader>
          <Typography.Title size={4} style={{ margin: 0 }}>
            Root composition
          </Typography.Title>
          <Typography.Text color="secondary">
            Mount each provider exactly once at the top of your tree.
          </Typography.Text>
        </CardHeader>
        <CardBody>
          <pre
            style={{
              margin: 0,
              padding: 16,
              borderRadius: 8,
              background: "var(--muted)",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-mono)",
              overflowX: "auto",
            }}
          >
{`import { GodxConfigProvider } from "@godxjp/ui/preferences"
import { I18nextProvider } from "react-i18next"
import { initI18n } from "@godxjp/ui/i18n"

const i18n = initI18n()

function Root() {
  return (
    <GodxConfigProvider
      defaultLocale="ja"
      defaultTimezone="Asia/Tokyo"
      defaultCurrency="JPY"
    >
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </GodxConfigProvider>
  )
}`}
          </pre>
        </CardBody>
      </Card>
    );
  },
};
