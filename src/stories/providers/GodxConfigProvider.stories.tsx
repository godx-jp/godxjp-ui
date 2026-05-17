import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  GodxConfigProvider,
  useGodxConfig,
} from "../../preferences";
import { useFormatters } from "../../hooks/useFormatters";
import { Button } from "../../components/general/Button";
import { Tag } from "../../components/data-display/Tag";
import { Card, CardHeader, CardBody } from "../../components/data-display/Card";
import { Typography } from "../../components/primitives";

/**
 * Providers/GodxConfigProvider — the framework's root provider.
 *
 * Carries locale, timezone, currency. Internally renders React Aria's
 * `<I18nProvider>` so every date / time / number primitive picks up
 * the locale without consumer ceremony.
 *
 */

const meta: Meta = {
  title: "Providers/GodxConfigProvider",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
**\`GodxConfigProvider\`** is the canonical root provider for
\`@godxjp/ui\` consumer apps.

\`\`\`tsx
import { GodxConfigProvider } from "@godxjp/ui/preferences"

<GodxConfigProvider
  defaultLocale="ja"
  defaultTimezone="Asia/Tokyo"
  defaultCurrency="JPY"
  storage="localStorage"
>
  <App />
</GodxConfigProvider>
\`\`\`

Props:

- \`defaultLocale\` — BCP 47 fallback ("ja", "en-US", "vi", "fil").
- \`defaultTimezone\` — IANA fallback ("Asia/Tokyo", …).
- \`defaultCurrency\` — ISO 4217 (optional).
- \`storage\` — \`"localStorage"\` | \`"cookie"\` | \`"both"\`.
- \`cookieOptions\` — Cookie attributes when storage uses cookies.
- \`onChange\` — Fires on every change (analytics / \`<html lang>\` sync).

Hooks:

- \`useGodxConfig()\` — \`{ locale, timezone, currency, setLocale,
  setTimezone, setCurrency, setGodxConfig, reset, headers }\`.
- \`useFormatters()\` — \`{ formatDate, formatTime, formatDateTime,
  formatRelative, formatNumber, formatCurrency }\` bound to the
  current locale + timezone.
        `.trim(),
      },
    },
  },
};
export default meta;
type Story = StoryObj;

function LocaleDemo() {
  const { locale, timezone, setLocale, setTimezone } = useGodxConfig();
  const fmt = useFormatters();
  const now = new Date();

  return (
    <Card padding="cozy">
      <CardHeader>
        <Typography.Title size={4} style={{ margin: 0 }}>
          Active config
        </Typography.Title>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <Tag color="primary" bordered={false}>locale: {locale}</Tag>
          <Tag color="primary" bordered={false}>tz: {timezone}</Tag>
        </div>
      </CardHeader>
      <CardBody>
        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          <Typography.Text>
            <strong>Date:</strong> {fmt.formatDate(now)}
          </Typography.Text>
          <Typography.Text>
            <strong>Time:</strong> {fmt.formatTime(now)}
          </Typography.Text>
          <Typography.Text>
            <strong>Datetime:</strong> {fmt.formatDateTime(now)}
          </Typography.Text>
          <Typography.Text>
            <strong>Relative:</strong>{" "}
            {fmt.formatRelative(new Date(now.getTime() - 2 * 60 * 60 * 1000))}
          </Typography.Text>
          <Typography.Text>
            <strong>Number:</strong> {fmt.formatNumber(1234567.89)}
          </Typography.Text>
          <Typography.Text>
            <strong>Currency:</strong>{" "}
            {fmt.formatCurrency(1234.5, { currency: "USD" })}
          </Typography.Text>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button size="small" onClick={() => setLocale("ja")}>ja</Button>
          <Button size="small" onClick={() => setLocale("en-US")}>en-US</Button>
          <Button size="small" onClick={() => setLocale("vi")}>vi</Button>
          <Button size="small" onClick={() => setLocale("fil")}>fil</Button>
          <Button
            size="small"
            variant="ghost"
            onClick={() =>
              setTimezone(
                timezone === "Asia/Tokyo" ? "America/New_York" : "Asia/Tokyo",
              )
            }
          >
            toggle tz
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export const Default: Story = {
  name: "Default — JA / Asia/Tokyo / JPY",
  render: function Default() {
    return (
      <GodxConfigProvider
        defaultLocale="ja"
        defaultTimezone="Asia/Tokyo"
        defaultCurrency="JPY"
      >
        <LocaleDemo />
      </GodxConfigProvider>
    );
  },
};

export const Switching: Story = {
  name: "Switching locales live",
  parameters: {
    docs: {
      description: {
        story:
          "Click `ja` / `en-US` / `vi` / `fil` to see every formatter re-render in the new locale; toggle the timezone button to see absolute times shift.",
      },
    },
  },
  render: function Switching() {
    return (
      <GodxConfigProvider
        defaultLocale="en-US"
        defaultTimezone="Asia/Tokyo"
      >
        <LocaleDemo />
      </GodxConfigProvider>
    );
  },
};

export const HeadersAxios: Story = {
  name: "headers() — wire axios",
  parameters: {
    docs: {
      description: {
        story: `Pair the provider with the axios interceptor:

\`\`\`tsx
import axios from "axios"
import { applyGodxConfigHeaders } from "@godxjp/ui/preferences"

const api = axios.create({ baseURL: "/api" })
applyGodxConfigHeaders(api)
\`\`\`

Every request gets \`Accept-Language\` + \`X-Timezone\` headers from the
current config. The interceptor reads through the module-level holder
so values stay fresh as the user changes them.`,
      },
    },
  },
  render: function HeadersAxios() {
    return (
      <GodxConfigProvider defaultLocale="ja" defaultTimezone="Asia/Tokyo">
        <HeadersInspector />
      </GodxConfigProvider>
    );
  },
};

function HeadersInspector() {
  const { headers, locale, timezone, setLocale, setTimezone } = useGodxConfig();
  const [snapshot, setSnapshot] = useState<Record<string, string> | null>(null);

  return (
    <Card padding="cozy">
      <CardHeader>
        <Typography.Title size={4} style={{ margin: 0 }}>
          headers()
        </Typography.Title>
        <Typography.Text color="secondary">
          Inspect the headers axios would send right now.
        </Typography.Text>
      </CardHeader>
      <CardBody>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Button size="small" onClick={() => setSnapshot(headers())}>
            snapshot
          </Button>
          <Button
            size="small"
            variant="ghost"
            onClick={() => setLocale(locale === "ja" ? "en-US" : "ja")}
          >
            toggle locale ({locale})
          </Button>
          <Button
            size="small"
            variant="ghost"
            onClick={() =>
              setTimezone(
                timezone === "Asia/Tokyo" ? "America/New_York" : "Asia/Tokyo",
              )
            }
          >
            toggle tz ({timezone})
          </Button>
        </div>
        {snapshot ? (
          <pre
            style={{
              margin: 0,
              padding: 12,
              borderRadius: 8,
              background: "var(--muted)",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        ) : null}
      </CardBody>
    </Card>
  );
}
