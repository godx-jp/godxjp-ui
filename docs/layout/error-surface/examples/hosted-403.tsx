import { Button, Logo } from "@godxjp/ui/general";
import { ErrorSurface, Topbar } from "@godxjp/ui/layout";
import { AppSettingPicker } from "@godxjp/ui/navigation";

/**
 * 403 on a hosted page — `mode="system" align="start"`. The page keeps its top bar (`topbar`), the
 * status code is a small mono line above a LARGE bold start-aligned title, the organization and the
 * missing permission sit in an inset grouped card ABOVE the action, the one recovery action spans
 * the column (`Button fullWidth size="lg"`), and a secondary navigation link sits under it.
 */
export default function Demo() {
  return (
    <ErrorSurface
      mode="system"
      status={403}
      align="start"
      topbar={
        <Topbar
          start={<Logo glyph="G" />}
          end={<AppSettingPicker kind="locale" appearance="labeled" compact />}
        />
      }
      title="You do not have access"
      description="This page needs an extra permission."
      organization="Sample Inc."
      permission="members.manage"
      action={
        <Button fullWidth size="lg">
          Request access
        </Button>
      }
      secondaryAction={<Button variant="link">Go to the dashboard</Button>}
    />
  );
}
