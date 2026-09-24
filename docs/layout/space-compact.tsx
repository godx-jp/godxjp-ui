import { useState } from "react";
import { Flex, PageContainer, SpaceCompact } from "@godxjp/ui/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
} from "@godxjp/ui/data-display";
import {
  FormField,
  Input,
  NumberInput,
  SearchInput,
  Select,
  Textarea,
} from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Search, Send } from "lucide-react";

/**
 * SpaceCompact · weld a row of controls into ONE box.
 *
 * Shows: the recurrence row the component was built for (毎[N][週▾]ごと), a search field welded to
 * its button, a unit-suffixed amount, and the vertical axis with its documented limit.
 *
 * WHY THIS IS A COMPONENT AND NOT A RECIPE. Zeroing the inner corners and collapsing the shared
 * border seam needs `[&>*:not(:first-child)]`-shaped selectors, which `ui-audit`'s
 * `no-utility-layout` rule blocks at the call site. Everything else here is real primitives.
 *
 * ONE LABEL FOR THE PAIR. A `FormField` wrapping a `SpaceCompact` lands its label on the row, and a
 * named row with no explicit `role` becomes `role="group"` — a `<div>` has no role to lose, so the
 * name has somewhere to live. Each control inside keeps its own accessible name.
 */

/** Currency CODES are ISO 4217 identifiers, not chrome — they are the same in every locale. */
const CURRENCIES = [
  { value: "JPY", label: "JPY" },
  { value: "USD", label: "USD" },
  { value: "VND", label: "VND" },
];

export default function SpaceCompactShowcase() {
  const { t } = useTranslation();
  const [every, setEvery] = useState(2);
  const [unit, setUnit] = useState("week");
  const [amount, setAmount] = useState(48000);
  const [currency, setCurrency] = useState("JPY");
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const weekUnits = [
    { value: "day", label: t("spaceCompactDocs.unit.day") },
    { value: "week", label: t("spaceCompactDocs.unit.week") },
    { value: "month", label: t("spaceCompactDocs.unit.month") },
  ];

  return (
    <PageContainer title={t("spaceCompactDocs.title")} subtitle={t("spaceCompactDocs.subtitle")}>
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("spaceCompactDocs.recur.title")}</CardTitle>
            <CardDescription>{t("spaceCompactDocs.recur.body")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField
                label={t("spaceCompactDocs.recur.label")}
                helper={t("spaceCompactDocs.recur.helper")}
              >
                <SpaceCompact>
                  <NumberInput
                    value={every}
                    onValueChange={(next) => setEvery(next ?? 1)}
                    min={1}
                    max={52}
                    aria-label={t("spaceCompactDocs.recur.every")}
                  />
                  <Select
                    value={unit}
                    onValueChange={(next: string | string[] | undefined) => setUnit(next as string)}
                    options={weekUnits}
                    aria-label={t("spaceCompactDocs.recur.unit")}
                  />
                </SpaceCompact>
              </FormField>

              <Descriptions
                items={[
                  {
                    label: t("spaceCompactDocs.recur.reads"),
                    children: `${every} ${weekUnits.find((u) => u.value === unit)?.label ?? ""}`,
                  },
                  {
                    label: t("spaceCompactDocs.recur.role"),
                    children: t("spaceCompactDocs.recur.roleValue"),
                  },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("spaceCompactDocs.search.title")}</CardTitle>
            <CardDescription>{t("spaceCompactDocs.search.body")}</CardDescription>
          </CardHeader>
          <CardContent>
            <SpaceCompact aria-label={t("spaceCompactDocs.search.row")}>
              <SearchInput
                value={query}
                onValueChange={setQuery}
                placeholder={t("spaceCompactDocs.search.placeholder")}
                aria-label={t("spaceCompactDocs.search.term")}
              />
              <Button aria-label={t("spaceCompactDocs.search.run")}>
                <Search aria-hidden="true" />
              </Button>
            </SpaceCompact>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("spaceCompactDocs.amount.title")}</CardTitle>
            <CardDescription>{t("spaceCompactDocs.amount.body")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField label={t("spaceCompactDocs.amount.label")}>
              <SpaceCompact fullWidth>
                <NumberInput
                  value={amount}
                  onValueChange={(next) => setAmount(next ?? 0)}
                  min={0}
                  step={1000}
                  aria-label={t("spaceCompactDocs.amount.value")}
                />
                <Select
                  value={currency}
                  onValueChange={(next: string | string[] | undefined) =>
                    setCurrency(next as string)
                  }
                  options={CURRENCIES}
                  aria-label={t("spaceCompactDocs.amount.currency")}
                />
              </SpaceCompact>
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("spaceCompactDocs.vertical.title")}</CardTitle>
            <CardDescription>{t("spaceCompactDocs.vertical.body")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <SpaceCompact orientation="vertical" aria-label={t("spaceCompactDocs.vertical.row")}>
                <Textarea
                  value={note}
                  onValueChange={setNote}
                  placeholder={t("spaceCompactDocs.vertical.note")}
                  aria-label={t("spaceCompactDocs.vertical.note")}
                />
                <Button aria-label={t("spaceCompactDocs.vertical.send")}>
                  <Send aria-hidden="true" />
                  {t("spaceCompactDocs.vertical.send")}
                </Button>
              </SpaceCompact>
              <Text tone="muted" size="sm">
                {t("spaceCompactDocs.vertical.alias")}
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("spaceCompactDocs.dont.title")}</CardTitle>
            <CardDescription>{t("spaceCompactDocs.dont.body")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" gap="md" wrap>
              <FormField label={t("spaceCompactDocs.dont.dept")}>
                <Input placeholder="D-1024" aria-label={t("spaceCompactDocs.dont.dept")} />
              </FormField>
              <FormField label={t("spaceCompactDocs.dont.ext")}>
                <Input placeholder="2831" aria-label={t("spaceCompactDocs.dont.ext")} />
              </FormField>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
