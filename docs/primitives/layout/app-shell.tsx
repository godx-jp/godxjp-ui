import { AppShell } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <AppShell
      sidebar={<aside>Sidebar slot</aside>}
      topbar={<header>Topbar slot</header>}
      breadcrumb={<span>Breadcrumb slot</span>}
    >
      AppShell children
    </AppShell>
  );
}
