import { Topbar } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Topbar
      product={{ name: "GodX", color: "hsl(var(--attention))" }}
      project={{ name: "Japan to SEA lanes" }}
      onSearchOpen={() => undefined}
      onNotificationsOpen={() => undefined}
      unread
    />
  );
}
