import { useEffect, useMemo, useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CodeBlock,
  DataTable,
  Swatch,
  type ColumnDef,
} from "@godxjp/ui/data-display";
import {
  Checkbox,
  ColorPicker,
  Field,
  FormField,
  Input,
  Segmented,
  Select,
  Slider,
  Switch,
} from "@godxjp/ui/data-entry";
import { Alert, AlertDescription, AlertTitle } from "@godxjp/ui/feedback";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

import {
  SEED_PRESETS,
  brandFor,
  genBrandCommand,
  parseHex,
  previewScope,
  readThemeSpine,
  toHex,
  type Brand,
  type BrandTheme,
  type ContrastRow,
  type ThemeSpine,
} from "./_theme-editor-scope";

/**
 * Theme editor · one seed colour in, a complete brand out, MEASURED rather than asserted.
 *
 * THE PAGE IS THE HIERARCHY. `docs/CUSTOMER-THEMING.md` opens with a priority order — seed, role,
 * scope, instance — and says the point of the order is that you stop at the first level that does
 * the job. So the seed is one control at the top, the roles it produces are READ-ONLY underneath
 * it (the causality has to be visible, not asserted), and the two per-token overrides sit below
 * both, after the sentence that says what they cost. Ant Design reaches the same conclusion from
 * the other end: "In most cases, using Seed Tokens is sufficient for custom themes".
 *
 * THE EXPORT IS `gen:brand`'s, NOT A SECOND OPINION. Both call `deriveBrand`
 * (src/tokens/__tests__/brand-derivation.ts), so for the same hex the CSS below is byte for byte
 * what `pnpm gen:brand '#RRGGBB'` writes — including the three tokens per theme it emits and the
 * four it refuses to, because those derive from the `--primary` in scope and a literal would pin
 * them (gh#678). The one input that has no CLI flag is the authored dark lightness, and when it is
 * used the page stops printing a command rather than print one that emits something else.
 *
 * THE PREVIEW IS SCOPED, NOT ROOTED, and that is the freeze rule doing real work. Each pane
 * declares the seed on ITSELF, which is the only way two seeds can be on screen at once; what a
 * pane must declare, and why `--ring` is one of them, is documented at `previewScope`.
 *
 * NO CHART. The `--chart-*` series are decorative primitives on purpose and do not derive from the
 * seed, so a chart here would move for no reason a reader could learn anything from.
 *
 * Composed only from real @godxjp/ui components.
 */

type LabelMode = "auto" | "light" | "dark";

/** `gen:brand --foreground` takes the LABEL colour, so `light` is a white label on the fill. */
const FORCED_LABEL: Record<LabelMode, string | null> = {
  auto: null,
  light: "#ffffff",
  dark: "#000000",
};

type RoleRow = {
  id: string;
  token: string;
  light: string;
  dark: string;
  emitted: boolean;
};

type LineRow = { id: string; item: string; owner: string; state: "active" | "pending" };

const PREVIEW_LINES: LineRow[] = [
  { id: "INV-2041", item: "themeEditor.preview.line.licence", owner: "OP-14", state: "active" },
  { id: "INV-2042", item: "themeEditor.preview.line.support", owner: "OP-03", state: "pending" },
  { id: "INV-2043", item: "themeEditor.preview.line.setup", owner: "OP-14", state: "active" },
];

/**
 * ONE PREVIEW, RENDERED TWICE — once plain and once under `.dark`, each with its own seed on
 * ITSELF. The dark seed is searched for contrast parity with the light one, so an editor that
 * showed only light would hide the half that is hard.
 */
function PreviewPane({
  theme,
  dark,
  idPrefix,
}: {
  theme: BrandTheme;
  dark: boolean;
  idPrefix: string;
}) {
  const { t } = useTranslation();

  const columns: ColumnDef<LineRow>[] = [
    { key: "id", header: t("themeEditor.preview.column.id"), width: "w-28" },
    { key: "item", header: t("themeEditor.preview.column.item"), render: (row) => t(row.item) },
    { key: "owner", header: t("themeEditor.preview.column.owner") },
    {
      key: "state",
      header: t("themeEditor.preview.column.state"),
      render: (row) => (
        <Badge tone={row.state === "active" ? "primary" : "neutral"}>
          {t(`themeEditor.preview.state.${row.state}`)}
        </Badge>
      ),
    },
  ];

  return (
    <Flex
      direction="col"
      gap="md"
      className={dark ? "dark" : undefined}
      style={previewScope(theme)}
    >
      <Card>
        <CardHeader>
          <CardTitle level={3}>
            {t(dark ? "themeEditor.preview.darkTitle" : "themeEditor.preview.lightTitle")}
          </CardTitle>
          <CardDescription>
            {t("themeEditor.preview.seedIs", { hex: toHex(theme.seed) })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Flex direction="col" gap="lg">
            <Flex gap="sm" wrap>
              <Button>{t("themeEditor.preview.action.save")}</Button>
              <Button variant="secondary">{t("themeEditor.preview.action.duplicate")}</Button>
              <Button variant="outline">{t("themeEditor.preview.action.export")}</Button>
              <Button variant="dashed">{t("themeEditor.preview.action.add")}</Button>
              <Button variant="ghost">{t("themeEditor.preview.action.dismiss")}</Button>
              <Button variant="destructive">{t("themeEditor.preview.action.delete")}</Button>
              <Button variant="link">{t("themeEditor.preview.action.details")}</Button>
            </Flex>

            <Flex gap="sm" wrap>
              <Badge tone="primary">{t("themeEditor.preview.badge.brand")}</Badge>
              <Badge tone="success">{t("themeEditor.preview.badge.success")}</Badge>
              <Badge tone="warning">{t("themeEditor.preview.badge.warning")}</Badge>
              <Badge tone="destructive">{t("themeEditor.preview.badge.destructive")}</Badge>
              <Badge tone="info">{t("themeEditor.preview.badge.info")}</Badge>
              <Badge tone="neutral">{t("themeEditor.preview.badge.neutral")}</Badge>
            </Flex>

            <Alert tone="info">
              <AlertTitle>{t("themeEditor.preview.alert.title")}</AlertTitle>
              <AlertDescription>
                {t("themeEditor.preview.alert.description")}{" "}
                <Text link href="#theme-editor-seed">
                  {t("themeEditor.preview.alert.link")}
                </Text>
              </AlertDescription>
            </Alert>

            <ResponsiveGrid columns={{ base: 1, md: 2 }}>
              <FormField
                id={`${idPrefix}-org`}
                label={t("themeEditor.preview.field.org")}
                helper={t("themeEditor.preview.field.orgHelper")}
              >
                <Input id={`${idPrefix}-org`} defaultValue="Acme 株式会社" />
              </FormField>
              <FormField id={`${idPrefix}-plan`} label={t("themeEditor.preview.field.plan")}>
                <Select
                  id={`${idPrefix}-plan`}
                  defaultValue="pro"
                  options={[
                    { value: "starter", label: t("themeEditor.preview.plan.starter") },
                    { value: "pro", label: t("themeEditor.preview.plan.pro") },
                    { value: "scale", label: t("themeEditor.preview.plan.scale") },
                  ]}
                />
              </FormField>
            </ResponsiveGrid>

            <Flex gap="lg" wrap>
              <Field id={`${idPrefix}-tax`} label={t("themeEditor.preview.field.tax")}>
                <Checkbox id={`${idPrefix}-tax`} defaultChecked />
              </Field>
              <Field id={`${idPrefix}-mail`} label={t("themeEditor.preview.field.mail")}>
                <Switch id={`${idPrefix}-mail`} defaultChecked />
              </Field>
            </Flex>
          </Flex>
        </CardContent>
      </Card>

      <Card>
        <CardContent flush>
          <DataTable
            columns={columns}
            data={PREVIEW_LINES}
            getRowId={(row) => row.id}
            label={t("themeEditor.preview.tableLabel")}
          />
        </CardContent>
      </Card>
    </Flex>
  );
}

export default function Demo() {
  const { t, locale } = useTranslation();

  /* The spine is read once, eagerly, so the first paint already has a brand on it; the effect is
   * the retry for the case where the stylesheet had not landed when the module ran. */
  const [spine, setSpine] = useState<ThemeSpine | null>(() => readThemeSpine());
  useEffect(() => {
    if (!spine) setSpine(readThemeSpine());
  }, [spine]);

  const [seed, setSeed] = useState(SEED_PRESETS[0].hex);
  const [labelMode, setLabelMode] = useState<LabelMode>("auto");
  const [darkL, setDarkL] = useState<number | null>(null);
  const [name, setName] = useState("acme");

  const safeName = name.trim().length > 0 ? name.trim() : "brand";
  const brand: Brand | null = useMemo(() => {
    if (!spine || !parseHex(seed)) return null;
    return brandFor(spine, seed, safeName, FORCED_LABEL[labelMode], darkL);
  }, [spine, seed, safeName, labelMode, darkL]);

  /* A ratio is a number a person reads, so it is formatted for the active locale rather than
   * printed with a hard-coded dot. The VALUE still comes from `deriveBrand`'s own 2dp string, so
   * what is shown and what `gen:brand` prints cannot round differently. */
  const ratioFormat = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    [locale],
  );
  const percentFormat = useMemo(
    () =>
      new Intl.NumberFormat(locale, { style: "unit", unit: "percent", maximumFractionDigits: 1 }),
    [locale],
  );

  if (!spine) {
    return (
      <PageContainer title={t("themeEditor.title")} subtitle={t("themeEditor.subtitle")}>
        <Alert tone="destructive">
          <AlertTitle>{t("themeEditor.unreadable.title")}</AlertTitle>
          <AlertDescription>{t("themeEditor.unreadable.description")}</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  const searchedL = brand?.darkSearched?.[2] ?? null;
  const darkOverridden = darkL !== null && searchedL !== null && darkL !== searchedL;
  const command = genBrandCommand(seed, safeName, FORCED_LABEL[labelMode], darkOverridden);

  const roleRows: RoleRow[] =
    brand && brand.dark
      ? [
          {
            id: "primary",
            token: "--primary",
            light: toHex(brand.light.seed),
            dark: toHex(brand.dark.seed),
            emitted: true,
          },
          {
            id: "primary-foreground",
            token: "--primary-foreground",
            light: toHex(brand.light.label),
            dark: toHex(brand.dark.label),
            emitted: true,
          },
          {
            id: "ring",
            token: "--ring",
            light: toHex(brand.light.seed),
            dark: toHex(brand.dark.seed),
            emitted: true,
          },
          {
            id: "text-link",
            token: "--text-link",
            light: toHex(brand.light.text.link),
            dark: toHex(brand.dark.text.link),
            emitted: false,
          },
          {
            id: "text-brand",
            token: "--text-brand",
            light: toHex(brand.light.text.brand),
            dark: toHex(brand.dark.text.brand),
            emitted: false,
          },
          {
            id: "text-primary",
            token: "--text-primary",
            light: toHex(brand.light.text.primary),
            dark: toHex(brand.dark.text.primary),
            emitted: false,
          },
        ]
      : [];

  const roleColumns: ColumnDef<RoleRow>[] = [
    {
      key: "token",
      header: t("themeEditor.derived.column.token"),
      render: (row) => (
        <Text mono size="xs">
          {row.token}
        </Text>
      ),
    },
    {
      key: "light",
      header: t("themeEditor.derived.column.light"),
      render: (row) => (
        <Flex gap="xs" align="center">
          <Swatch color={row.light} />
          <Text mono size="xs">
            {row.light}
          </Text>
        </Flex>
      ),
    },
    {
      key: "dark",
      header: t("themeEditor.derived.column.dark"),
      render: (row) => (
        <Flex gap="xs" align="center">
          <Swatch color={row.dark} />
          <Text mono size="xs">
            {row.dark}
          </Text>
        </Flex>
      ),
    },
    {
      key: "emitted",
      header: t("themeEditor.derived.column.emitted"),
      render: (row) => (
        <Badge tone={row.emitted ? "primary" : "neutral"} variant="outline">
          {t(row.emitted ? "themeEditor.derived.written" : "themeEditor.derived.derivedOnly")}
        </Badge>
      ),
    },
  ];

  const contrastColumns: ColumnDef<ContrastRow>[] = [
    {
      key: "id",
      header: t("themeEditor.contrast.column.pair"),
      render: (row) => t(`themeEditor.contrast.pair.${row.id}`),
    },
    {
      key: "measured",
      header: t("themeEditor.contrast.column.measured"),
      align: "right",
      render: (row) => (
        <Text tabular mono size="xs">
          {t("themeEditor.contrast.ratio", { value: ratioFormat.format(Number(row.measured)) })}
        </Text>
      ),
    },
    {
      key: "threshold",
      header: t("themeEditor.contrast.column.threshold"),
      align: "right",
      render: (row) => (
        <Text tabular mono size="xs" tone="muted">
          {t("themeEditor.contrast.ratio", { value: ratioFormat.format(row.threshold) })}
        </Text>
      ),
    },
    {
      key: "ok",
      header: t("themeEditor.contrast.column.result"),
      /* NEVER COLOUR ALONE (WCAG 1.4.1): the tone carries the same word the Badge says. */
      render: (row) => (
        <Badge tone={row.ok ? "success" : "destructive"}>
          {t(row.ok ? "themeEditor.contrast.pass" : "themeEditor.contrast.fail")}
        </Badge>
      ),
    },
  ];

  const report = brand?.report ?? [];
  const passing = report.filter((row) => row.ok).length;

  return (
    <PageContainer title={t("themeEditor.title")} subtitle={t("themeEditor.subtitle")}>
      <Alert tone="info" variant="callout">
        <AlertTitle>{t("themeEditor.order.title")}</AlertTitle>
        <AlertDescription>{t("themeEditor.order.description")}</AlertDescription>
      </Alert>

      <ResponsiveGrid columns={{ base: 1, lg: 2 }} gap="lg">
        <Flex direction="col" gap="lg">
          <Card accent="primary">
            <CardHeader>
              <CardTitle level={2}>{t("themeEditor.seed.title")}</CardTitle>
              <CardDescription>{t("themeEditor.seed.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <FormField
                  id="theme-editor-seed"
                  label={t("themeEditor.seed.label")}
                  helper={t("themeEditor.seed.helper")}
                >
                  <ColorPicker id="theme-editor-seed" value={seed} onValueChange={setSeed} />
                </FormField>

                <FormField
                  id="theme-editor-preset"
                  label={t("themeEditor.seed.presetLabel")}
                  helper={t("themeEditor.seed.presetHelper")}
                >
                  <Select
                    id="theme-editor-preset"
                    value={SEED_PRESETS.find((p) => p.hex === seed)?.id ?? ""}
                    placeholder={t("themeEditor.seed.presetPlaceholder")}
                    onValueChange={(next: string) => {
                      const preset = SEED_PRESETS.find((p) => p.id === next);
                      if (!preset) return;
                      setSeed(preset.hex);
                      setDarkL(null);
                    }}
                    options={SEED_PRESETS.map((preset) => ({
                      value: preset.id,
                      label: t(`themeEditor.seed.preset.${preset.id}`),
                      sublabel: preset.hex,
                    }))}
                  />
                </FormField>

                {/* The live region. It is VISIBLE as well as announced: the same sentence a screen
                    reader hears is the one the summary line needs anyway, so there is no hidden
                    copy to drift out of sync with what is on screen. */}
                <Text as="div" size="xs" tone="muted" role="status" aria-live="polite">
                  {brand && brand.dark
                    ? t("themeEditor.seed.announce", {
                        hex: toHex(brand.light.seed),
                        light: toHex(brand.light.seed),
                        dark: toHex(brand.dark.seed),
                        pass: passing,
                        count: report.length,
                      })
                    : t("themeEditor.seed.announceNoDark", { hex: seed })}
                </Text>
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>{t("themeEditor.derived.title")}</CardTitle>
              <CardDescription>{t("themeEditor.derived.description")}</CardDescription>
            </CardHeader>
            <CardContent flush>
              <DataTable
                columns={roleColumns}
                data={roleRows}
                getRowId={(row) => row.id}
                label={t("themeEditor.derived.tableLabel")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>{t("themeEditor.contrast.title")}</CardTitle>
              <CardDescription>{t("themeEditor.contrast.description")}</CardDescription>
            </CardHeader>
            <CardContent flush>
              <DataTable
                columns={contrastColumns}
                data={report}
                getRowId={(row) => row.id}
                label={t("themeEditor.contrast.tableLabel")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>{t("themeEditor.overrides.title")}</CardTitle>
              <CardDescription>{t("themeEditor.overrides.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <Alert tone="warning">
                  <AlertTitle>{t("themeEditor.overrides.costTitle")}</AlertTitle>
                  <AlertDescription>{t("themeEditor.overrides.costDescription")}</AlertDescription>
                </Alert>

                <FormField
                  id="theme-editor-label"
                  label={t("themeEditor.overrides.labelTitle")}
                  helper={t("themeEditor.overrides.labelHelper")}
                >
                  <Segmented
                    id="theme-editor-label"
                    aria-label={t("themeEditor.overrides.labelTitle")}
                    value={labelMode}
                    onValueChange={(next) => setLabelMode(next as LabelMode)}
                    options={[
                      { value: "auto", label: t("themeEditor.overrides.labelAuto") },
                      { value: "light", label: t("themeEditor.overrides.labelLight") },
                      { value: "dark", label: t("themeEditor.overrides.labelDark") },
                    ]}
                  />
                </FormField>

                <FormField
                  id="theme-editor-dark-l"
                  label={t("themeEditor.overrides.darkTitle")}
                  helper={
                    searchedL === null
                      ? t("themeEditor.overrides.darkNoParity")
                      : t("themeEditor.overrides.darkHelper", {
                          parity: percentFormat.format(searchedL),
                        })
                  }
                >
                  <Slider
                    id="theme-editor-dark-l"
                    aria-label={t("themeEditor.overrides.darkTitle")}
                    min={0}
                    max={100}
                    step={0.1}
                    value={darkL ?? searchedL ?? 0}
                    onChange={(next: number) => setDarkL(next)}
                    tooltip={{ formatter: (value) => percentFormat.format(value) }}
                    marks={searchedL === null ? undefined : { [searchedL]: "" }}
                  />
                </FormField>

                <Flex gap="sm" wrap align="center">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!darkOverridden}
                    onClick={() => setDarkL(null)}
                  >
                    {t("themeEditor.overrides.darkReset")}
                  </Button>
                  <Badge tone={darkOverridden ? "warning" : "neutral"} variant="outline">
                    {t(
                      darkOverridden
                        ? "themeEditor.overrides.darkAuthored"
                        : "themeEditor.overrides.darkParity",
                    )}
                  </Badge>
                </Flex>
              </Flex>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle level={2}>{t("themeEditor.export.title")}</CardTitle>
              <CardDescription>{t("themeEditor.export.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Flex direction="col" gap="md">
                <FormField
                  id="theme-editor-name"
                  label={t("themeEditor.export.nameLabel")}
                  helper={t("themeEditor.export.nameHelper", { name: safeName })}
                >
                  <Input id="theme-editor-name" value={name} onValueChange={setName} />
                </FormField>

                <Flex gap="sm" wrap align="center">
                  <Badge tone={command ? "success" : "warning"} variant="outline">
                    {t(command ? "themeEditor.export.matches" : "themeEditor.export.diverges")}
                  </Badge>
                  {command ? (
                    <Text mono size="xs" copyable>
                      {command}
                    </Text>
                  ) : (
                    <Text size="xs" tone="muted">
                      {t("themeEditor.export.divergesWhy")}
                    </Text>
                  )}
                </Flex>

                {brand?.css ? (
                  <CodeBlock
                    language="css"
                    maxHeight="md"
                    aria-label={t("themeEditor.export.cssLabel", { name: safeName })}
                  >
                    {brand.css}
                  </CodeBlock>
                ) : (
                  <Alert tone="destructive">
                    <AlertTitle>{t("themeEditor.export.noDarkTitle")}</AlertTitle>
                    <AlertDescription>{t("themeEditor.export.noDarkDescription")}</AlertDescription>
                  </Alert>
                )}

                {brand?.email ? (
                  <CodeBlock
                    language="ts"
                    maxHeight="md"
                    aria-label={t("themeEditor.export.emailLabel", { name: safeName })}
                  >
                    {brand.email}
                  </CodeBlock>
                ) : null}
              </Flex>
            </CardContent>
          </Card>
        </Flex>

        <Flex direction="col" gap="lg">
          {brand ? (
            <PreviewPane theme={brand.light} dark={false} idPrefix="theme-editor-light" />
          ) : null}
          {brand?.dark ? (
            <PreviewPane theme={brand.dark} dark idPrefix="theme-editor-dark" />
          ) : null}
        </Flex>
      </ResponsiveGrid>
    </PageContainer>
  );
}
