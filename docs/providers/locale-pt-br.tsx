import { AppProvider, getLocaleDatePattern, registerLocale, useFormatting } from "@godxjp/ui/app";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
} from "@godxjp/ui/data-display";
import { Calendar, DatePicker } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { ptBR } from "date-fns/locale";
import { ptBR as ptBRDayPicker } from "react-day-picker/locale";

/**
 * Open locales (v32, gh#1219) · Brazilian Portuguese. The date pattern (`dd/MM/yyyy`), the clock
 * (24h) and the week start (Sunday) all come from `Intl` for `pt-BR`.
 */
registerLocale({ code: "pt-BR", dateFns: ptBR, dayPicker: ptBRDayPicker });

const LOCALE = "pt-BR";
const TIME_ZONE = "America/Sao_Paulo";
const INSTANT = "2026-10-08T12:00:00Z";
const DAY = new Date(2026, 9, 8);

function Readout() {
  const { locale, timezone, dateFormat, timeFormat, formatDate } = useFormatting();
  return (
    <Descriptions columns={2}>
      <Descriptions.Item label="locale" mono>
        {locale}
      </Descriptions.Item>
      <Descriptions.Item label="timezone" mono>
        {timezone}
      </Descriptions.Item>
      <Descriptions.Item label="dateFormat" mono>
        {dateFormat}
      </Descriptions.Item>
      <Descriptions.Item label="timeFormat" mono>
        {timeFormat}
      </Descriptions.Item>
      <Descriptions.Item label="formatDate(date)" mono>
        {formatDate(INSTANT, { kind: "date" })}
      </Descriptions.Item>
      <Descriptions.Item label="formatDate(datetime)" mono>
        {formatDate(INSTANT, { kind: "datetime" })}
      </Descriptions.Item>
      <Descriptions.Item label="formatDate(long)" mono span={2}>
        {formatDate(INSTANT, { kind: "long" })}
      </Descriptions.Item>
    </Descriptions>
  );
}

export default function Demo() {
  return (
    <AppProvider defaultLocale={LOCALE} defaultTimezone={TIME_ZONE} persist={false}>
      <PageContainer
        title="Locale · pt-BR"
        subtitle="registerLocale with date-fns and react-day-picker packs"
      >
        <Flex direction="col" gap="lg">
          <Card>
            <CardHeader>
              <CardTitle level={2}>Formatting</CardTitle>
              <CardDescription>
                Pattern, clock and week start are derived from Intl for the registered tag.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Readout />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle level={2}>DatePicker</CardTitle>
              <CardDescription>
                The field shows the locale pattern from getLocaleDatePattern; it still submits ISO.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatePicker
                aria-label="Date"
                defaultValue={DAY}
                format={getLocaleDatePattern(LOCALE)}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle level={2}>Calendar</CardTitle>
              <CardDescription>
                The first column is the locale&apos;s first day of the week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" defaultMonth={DAY} selected={DAY} />
            </CardContent>
          </Card>
        </Flex>
      </PageContainer>
    </AppProvider>
  );
}
