import { AppProvider } from "@godxjp/ui/app";
import { Inline } from "@godxjp/ui/layout";
import { LocalePicker, TimezonePicker } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <AppProvider
      defaultLocale="ja"
      fallbackLocale="en"
      defaultTimezone="system"
      systemTimezone="Asia/Tokyo"
    >
      <Inline gap="sm">
        <LocalePicker />
        <TimezonePicker />
      </Inline>
    </AppProvider>
  );
}
