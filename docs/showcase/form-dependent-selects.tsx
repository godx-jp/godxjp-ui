/**
 * Showcase · form-dependent-selects — country → state → city (gh#1252)
 *
 * A COMPOSITION PATTERN, not a component (docs/COMPOSITION-VS-COMPONENT.md, C3): three plain
 * `Select`s inside `FormField`s, wired by app state. Nothing here is new behaviour the library
 * would have to own — `Select` already disables itself, shows a spinner for `loading`, and shows
 * its placeholder for the controlled empty value `""`.
 *
 * The four rules the pattern exists to get right:
 *   1. A child is `disabled` until its parent has a value, and its FormField `helper` says why
 *      ("Select a country first") — a disabled control with no reason is a dead end.
 *   2. While a child's options load it is `loading` (aria-busy + spinner) and has nothing to pick.
 *   3. Changing a parent RESETS every descendant to `""`, Select's controlled empty value.
 *      `undefined` would flip the child to uncontrolled (`isControlled = value !== undefined`).
 *   4. A slow response for an OLD parent never lands on the new one (the effect drops it).
 *
 * Country names come from `Intl.DisplayNames` (ISO 3166-1 alpha-2 → the reader's locale), so the
 * list localises with no catalogue. Subdivisions carry ISO 3166-2 codes; their romanised names
 * are DATA (what the simulated server returns), not chrome.
 */
import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Form, FormField, Select } from "@godxjp/ui/data-entry";
import { Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

type Option = { value: string; label: string };

/** ISO 3166-1 alpha-2. Labels are resolved per locale by Intl.DisplayNames. */
const COUNTRY_CODES = ["JP", "US", "VN"] as const;

/** ISO 3166-2 subdivisions per country — the simulated `/regions?country=` response. */
const REGIONS: Record<string, Option[]> = {
  JP: [
    { value: "JP-13", label: "Tokyo" },
    { value: "JP-27", label: "Osaka" },
    { value: "JP-01", label: "Hokkaido" },
  ],
  US: [
    { value: "US-CA", label: "California" },
    { value: "US-NY", label: "New York" },
    { value: "US-WA", label: "Washington" },
  ],
  VN: [
    { value: "VN-HN", label: "Ha Noi" },
    { value: "VN-SG", label: "Ho Chi Minh City" },
    { value: "VN-DN", label: "Da Nang" },
  ],
};

/** Cities per subdivision — the simulated `/cities?region=` response. */
const CITIES: Record<string, Option[]> = {
  "JP-13": [
    { value: "shinjuku", label: "Shinjuku" },
    { value: "shibuya", label: "Shibuya" },
    { value: "hachioji", label: "Hachioji" },
  ],
  "JP-27": [
    { value: "osaka", label: "Osaka" },
    { value: "sakai", label: "Sakai" },
    { value: "toyonaka", label: "Toyonaka" },
  ],
  "JP-01": [
    { value: "sapporo", label: "Sapporo" },
    { value: "hakodate", label: "Hakodate" },
    { value: "asahikawa", label: "Asahikawa" },
  ],
  "US-CA": [
    { value: "los-angeles", label: "Los Angeles" },
    { value: "san-francisco", label: "San Francisco" },
    { value: "san-diego", label: "San Diego" },
  ],
  "US-NY": [
    { value: "new-york-city", label: "New York City" },
    { value: "buffalo", label: "Buffalo" },
    { value: "albany", label: "Albany" },
  ],
  "US-WA": [
    { value: "seattle", label: "Seattle" },
    { value: "spokane", label: "Spokane" },
    { value: "tacoma", label: "Tacoma" },
  ],
  "VN-HN": [
    { value: "ba-dinh", label: "Ba Dinh" },
    { value: "hoan-kiem", label: "Hoan Kiem" },
    { value: "cau-giay", label: "Cau Giay" },
  ],
  "VN-SG": [
    { value: "district-1", label: "District 1" },
    { value: "thu-duc", label: "Thu Duc" },
    { value: "binh-thanh", label: "Binh Thanh" },
  ],
  "VN-DN": [
    { value: "hai-chau", label: "Hai Chau" },
    { value: "son-tra", label: "Son Tra" },
    { value: "ngu-hanh-son", label: "Ngu Hanh Son" },
  ],
};

/** How long the simulated server takes — long enough that the loading state is seen. */
const DEFAULT_FETCH_DELAY = 900;

function simulateFetch(table: Record<string, Option[]>, key: string, delay: number) {
  return new Promise<Option[]>((resolve) => {
    setTimeout(() => {
      resolve(table[key] ?? []);
    }, delay);
  });
}

/**
 * Options for a child select, fetched whenever its parent value changes. The result is stored
 * WITH the parent key it answers, so `loading` is derived (parent set, no answer for it yet) and
 * an answer for a parent that has since changed is simply never shown.
 */
function useChildOptions(table: Record<string, Option[]>, parent: string, delay: number) {
  const [answer, setAnswer] = React.useState<{ parent: string; options: Option[] }>({
    parent: "",
    options: [],
  });
  React.useEffect(() => {
    if (!parent) return;
    let live = true;
    void simulateFetch(table, parent, delay).then((options) => {
      if (live) setAnswer({ parent, options });
    });
    return () => {
      live = false;
    };
  }, [table, parent, delay]);
  const ready = parent !== "" && answer.parent === parent;
  return { options: ready ? answer.options : [], loading: parent !== "" && !ready };
}

export type LocationValue = { country: string; region: string; city: string };

const EMPTY: LocationValue = { country: "", region: "", city: "" };

/** Sized for the longest option ("Ho Chi Minh City"), not stretched to the column. */
const CONTROL_WIDTH = "20rem";

/**
 * The three fields. Exported so the behavioural test drives THIS code, not a copy of it
 * (src/components/data-entry/__tests__/dependent-select-pattern-1252.test.tsx).
 */
export function DependentLocationFields({
  idPrefix,
  defaultValue = EMPTY,
  fetchDelay = DEFAULT_FETCH_DELAY,
  onValueChange,
}: {
  idPrefix: string;
  defaultValue?: LocationValue;
  fetchDelay?: number;
  onValueChange?: (value: LocationValue) => void;
}) {
  const { t, locale } = useTranslation();
  const [value, setValue] = React.useState<LocationValue>(defaultValue);
  const regions = useChildOptions(REGIONS, value.country, fetchDelay);
  const cities = useChildOptions(CITIES, value.region, fetchDelay);

  const countryOptions = React.useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: "region" });
    return COUNTRY_CODES.map((code) => ({ value: code, label: names.of(code) ?? code }));
  }, [locale]);

  const commit = (next: LocationValue) => {
    setValue(next);
    onValueChange?.(next);
  };

  return (
    <Flex direction="col" gap="md">
      <FormField
        controlWidth={CONTROL_WIDTH}
        id={`${idPrefix}-country`}
        label={t("showcase.dependentSelects.country")}
      >
        <Select
          value={value.country}
          onValueChange={(country: string) => {
            // A new parent invalidates everything below it.
            commit({ country, region: "", city: "" });
          }}
          options={countryOptions}
          placeholder={t("showcase.dependentSelects.countryPlaceholder")}
        />
      </FormField>
      <FormField
        controlWidth={CONTROL_WIDTH}
        id={`${idPrefix}-region`}
        label={t("showcase.dependentSelects.region")}
        helper={value.country ? undefined : t("showcase.dependentSelects.selectCountryFirst")}
      >
        <Select
          value={value.region}
          onValueChange={(region: string) => {
            commit({ ...value, region, city: "" });
          }}
          options={regions.options}
          disabled={!value.country}
          loading={regions.loading}
          placeholder={
            regions.loading
              ? t("showcase.dependentSelects.loading")
              : t("showcase.dependentSelects.regionPlaceholder")
          }
        />
      </FormField>
      <FormField
        controlWidth={CONTROL_WIDTH}
        id={`${idPrefix}-city`}
        label={t("showcase.dependentSelects.city")}
        helper={value.region ? undefined : t("showcase.dependentSelects.selectRegionFirst")}
      >
        <Select
          value={value.city}
          onValueChange={(city: string) => {
            commit({ ...value, city });
          }}
          options={cities.options}
          disabled={!value.region}
          loading={cities.loading}
          placeholder={
            cities.loading
              ? t("showcase.dependentSelects.loading")
              : t("showcase.dependentSelects.cityPlaceholder")
          }
        />
      </FormField>
    </Flex>
  );
}

function AddressCard({
  idPrefix,
  title,
  description,
  defaultValue,
}: {
  idPrefix: string;
  title: string;
  description: string;
  defaultValue?: LocationValue;
}) {
  const { t, locale } = useTranslation();
  const [value, setValue] = React.useState<LocationValue>(defaultValue ?? EMPTY);
  const summary = React.useMemo(() => {
    if (!value.country) return t("showcase.dependentSelects.summaryNone");
    const country = new Intl.DisplayNames([locale], { type: "region" }).of(value.country);
    const region = REGIONS[value.country]?.find((r) => r.value === value.region)?.label;
    const city = CITIES[value.region]?.find((c) => c.value === value.city)?.label;
    const parts = [country, region, city].filter((p): p is string => Boolean(p));
    return t("showcase.dependentSelects.summary", {
      value: new Intl.ListFormat(locale, { type: "unit", style: "short" }).format(parts),
    });
  }, [value, locale, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Flex direction="col" gap="md">
          <Form>
            <DependentLocationFields
              idPrefix={idPrefix}
              defaultValue={defaultValue}
              onValueChange={setValue}
            />
          </Form>
          <Text size="sm" tone="muted" aria-live="polite">
            {summary}
          </Text>
        </Flex>
      </CardContent>
    </Card>
  );
}

export default function Demo() {
  const { t } = useTranslation();
  return (
    <PageContainer
      title={t("showcase.dependentSelects.title")}
      subtitle={t("showcase.dependentSelects.subtitle")}
    >
      <ResponsiveGrid columns={{ base: 1, md: 2 }}>
        {/* At rest: both children disabled, each helper naming the field it waits for. */}
        <AddressCard
          idPrefix="empty"
          title={t("showcase.dependentSelects.emptyTitle")}
          description={t("showcase.dependentSelects.emptyDescription")}
        />
        {/* At rest: a full address. Change the country to see state + city clear and reload. */}
        <AddressCard
          idPrefix="prefilled"
          title={t("showcase.dependentSelects.prefilledTitle")}
          description={t("showcase.dependentSelects.prefilledDescription")}
          defaultValue={{ country: "JP", region: "JP-13", city: "shinjuku" }}
        />
      </ResponsiveGrid>
    </PageContainer>
  );
}
