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

/**
 * Open locales (v32, gh#1219) · British English, registered with NO date-fns pack: month and
 * weekday names, long patterns, `dd/MM/yyyy`, 24h and a Monday week all come from `Intl`.
 */
registerLocale({ code: "en-GB" });

const LOCALE = "en-GB";
const TIME_ZONE = "Europe/London";
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
        title="Locale · en-GB"
        subtitle="registerLocale with only a tag: everything from Intl"
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
