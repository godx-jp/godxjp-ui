import {
  BookOpen,
  Boxes,
  Calendar,
  Clock3,
  Database,
  FileText,
  LayoutGrid,
  Mail,
  PlugZap,
  ReceiptText,
  Server,
  ShieldCheck,
} from "lucide-react";

import {
  ServiceCatalogCta,
  ServiceLauncherCard,
  ServiceLauncherCardSkeleton,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/* Committed SVGs, imported so the bundler rewrites each URL against PREVIEW_BASE. A docs page must
 * never fetch a third-party image: offline it cannot render, and on CI the request never settles,
 * `networkidle` never fires and `page.goto` times out. */
import serviceMarkRose from "../assets/service-mark-rose.svg";
import serviceMarkTeal from "../assets/service-mark-teal.svg";

/* A URL that is GUARANTEED to fail, with no network round-trip to hang on: the bytes are not an
 * image, so the browser's decode fails locally. That is the production case this section exists to
 * show — `logo_path` in the database outlives the file on disk. */
const BROKEN_LOGO_URL = "data:image/svg+xml,not-an-image";

/**
 * ServiceLauncherCard — one tile for one application in an organization's launcher.
 *
 * WHY THIS PAGE IS GENERIC. It used to render this product's own service catalogue —
 * `attendance.godx.jp`, plans `Standard/Enterprise/Free`, a 「カタログを見る」 link — which made a
 * reader ask whether the component belonged in a UI framework at all. A fair question: a page that
 * demonstrates a product cannot demonstrate a component. The data here is therefore ANY
 * organization's internal tools, on RFC 2606 reserved domains, with no plan names of ours.
 *
 * WHAT IS NOT NEGOTIABLE is the state set — available / restricted / suspended / archived /
 * loading / catalog entry. Those ARE the component's API surface, because the component infers
 * nothing: `statusLabel`, `statusTone`, `disabledReason` and `action` all come from the consumer's
 * own entitlement contract. There is no `href`, no `available`, no `entitlement` prop to find.
 *
 * ResponsiveGrid owns the 3 → 2 → 1 ladder. The page writes no grid tracks and no page-local CSS.
 *
 * All copy is localized through useTranslation() — see docs/showcase/table-pagination.tsx for the
 * pattern this follows. `metadata` (hostnames, version strings, pixel dimensions) is domain DATA
 * and stays literal; it is what the gate does not scan and what localizing would be wrong for.
 */

/** A section heading. Headings are headings, not Cards — a Card here would nest borders. */
function Section({
  title,
  why,
  children,
}: {
  title: string;
  why: string;
  children: React.ReactNode;
}) {
  return (
    <Flex direction="col" gap="sm">
      <Text as="div" weight="medium">
        {title}
      </Text>
      <Text as="div" size="sm" tone="muted">
        {why}
      </Text>
      {children}
    </Flex>
  );
}

export default function Demo() {
  const { t } = useTranslation();

  // Status-tone labels are consumer copy, not the component's — shared across the tiles that
  // reuse the same real-world status (e.g. "stopped" appears on both the data-sync and analytics
  // tiles). `attentionRequired` / `openServiceEnglish` stay identical across locales on purpose:
  // section 5's third tile is deliberately an English-named service in a JP admin portal.
  const status = {
    available: t("serviceLauncherShowcase.status.available"),
    active: t("serviceLauncherShowcase.status.active"),
    maintenance: t("serviceLauncherShowcase.status.maintenance"),
    stopped: t("serviceLauncherShowcase.status.stopped"),
    adminOnly: t("serviceLauncherShowcase.status.adminOnly"),
    preparing: t("serviceLauncherShowcase.status.preparing"),
    archived: t("serviceLauncherShowcase.status.archived"),
    unapplied: t("serviceLauncherShowcase.status.unapplied"),
    noPermission: t("serviceLauncherShowcase.status.noPermission"),
    attentionRequired: t("serviceLauncherShowcase.status.attentionRequired"),
  };

  const action = {
    openService: t("serviceLauncherShowcase.action.openService"),
    open: t("serviceLauncherShowcase.action.open"),
    viewStatus: t("serviceLauncherShowcase.action.viewStatus"),
    viewHistory: t("serviceLauncherShowcase.action.viewHistory"),
    checkPermissions: t("serviceLauncherShowcase.action.checkPermissions"),
    openSettings: t("serviceLauncherShowcase.action.openSettings"),
    viewArchive: t("serviceLauncherShowcase.action.viewArchive"),
    openRequestForm: t("serviceLauncherShowcase.action.openRequestForm"),
    openList: t("serviceLauncherShowcase.action.openList"),
    openServiceEnglish: t("serviceLauncherShowcase.action.openServiceEnglish"),
  };

  return (
    <PageContainer
      title={t("serviceLauncherShowcase.page.title")}
      subtitle={t("serviceLauncherShowcase.page.subtitle")}
    >
      <Flex direction="col" gap="lg">
        <Section
          title={t("serviceLauncherShowcase.sections.basics.heading")}
          why={t("serviceLauncherShowcase.sections.basics.why")}
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={Clock3}
              title={t("serviceLauncherShowcase.sections.basics.attendance.title")}
              statusLabel={status.available}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.basics.attendance.description")}
              metadata="attend.corp.example.jp · v4.2"
              action={<Button>{action.openService}</Button>}
            />
            <ServiceLauncherCard
              icon={ReceiptText}
              title={t("serviceLauncherShowcase.sections.basics.expense.title")}
              statusLabel={status.available}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.basics.expense.description")}
              metadata="keihi.corp.example.jp · v2.8"
              action={<Button>{action.openService}</Button>}
            />
            <ServiceLauncherCard
              icon={Calendar}
              title={t("serviceLauncherShowcase.sections.basics.meetingRoom.title")}
              statusLabel={status.available}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.basics.meetingRoom.description")}
              metadata="rooms.corp.example.jp · v1.9"
              action={<Button>{action.openService}</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title={t("serviceLauncherShowcase.sections.statusTones.heading")}
          why={t("serviceLauncherShowcase.sections.statusTones.why")}
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={Mail}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.statusTones.mail.title")}
              statusLabel={status.active}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.statusTones.mail.description")}
              metadata="mail.corp.example.jp"
              action={<Button>{action.openService}</Button>}
            />
            <ServiceLauncherCard
              icon={Server}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.statusTones.fileShare.title")}
              statusLabel={status.maintenance}
              statusTone="warning"
              description={t("serviceLauncherShowcase.sections.statusTones.fileShare.description")}
              metadata="files.corp.example.jp"
              action={<Button variant="outline">{action.viewStatus}</Button>}
            />
            <ServiceLauncherCard
              icon={Database}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.statusTones.dataSync.title")}
              statusLabel={status.stopped}
              statusTone="destructive"
              description={t("serviceLauncherShowcase.sections.statusTones.dataSync.description")}
              metadata="sync.corp.example.jp"
              action={<Button variant="outline">{action.viewHistory}</Button>}
            />
            <ServiceLauncherCard
              icon={ShieldCheck}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.statusTones.iam.title")}
              statusLabel={status.adminOnly}
              statusTone="info"
              description={t("serviceLauncherShowcase.sections.statusTones.iam.description")}
              metadata="iam.corp.example.jp"
              action={<Button variant="outline">{action.checkPermissions}</Button>}
            />
            <ServiceLauncherCard
              icon={PlugZap}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.statusTones.integrations.title")}
              statusLabel={status.preparing}
              statusTone="neutral"
              description={t(
                "serviceLauncherShowcase.sections.statusTones.integrations.description",
              )}
              metadata="connect.corp.example.jp"
              action={<Button variant="outline">{action.openSettings}</Button>}
            />
            <ServiceLauncherCard
              icon={BookOpen}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.statusTones.legacyKb.title")}
              statusLabel={status.archived}
              statusTone="muted"
              description={t("serviceLauncherShowcase.sections.statusTones.legacyKb.description")}
              metadata="kb-archive.corp.example.jp"
              action={<Button variant="outline">{action.viewArchive}</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title={t("serviceLauncherShowcase.sections.disabledReason.heading")}
          why={t("serviceLauncherShowcase.sections.disabledReason.why")}
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={Boxes}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.disabledReason.inventory.title")}
              statusLabel={status.unapplied}
              statusTone="warning"
              description={t(
                "serviceLauncherShowcase.sections.disabledReason.inventory.description",
              )}
              metadata="zaiko.corp.example.jp"
              disabledReason={t("serviceLauncherShowcase.sections.disabledReason.inventory.reason")}
              action={<Button disabled>{action.openService}</Button>}
            />
            <ServiceLauncherCard
              icon={FileText}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.disabledReason.contracts.title")}
              statusLabel={status.noPermission}
              statusTone="info"
              description={t(
                "serviceLauncherShowcase.sections.disabledReason.contracts.description",
              )}
              metadata="keiyaku.corp.example.jp"
              disabledReason={t("serviceLauncherShowcase.sections.disabledReason.contracts.reason")}
              action={<Button disabled>{action.openService}</Button>}
            />
            <ServiceLauncherCard
              icon={Database}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.disabledReason.analytics.title")}
              statusLabel={status.stopped}
              statusTone="destructive"
              description={t(
                "serviceLauncherShowcase.sections.disabledReason.analytics.description",
              )}
              metadata="bi.corp.example.jp"
              disabledReason={t("serviceLauncherShowcase.sections.disabledReason.analytics.reason")}
              action={<Button disabled>{action.openService}</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title={t("serviceLauncherShowcase.sections.loadingCatalog.heading")}
          why={t("serviceLauncherShowcase.sections.loadingCatalog.why")}
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCardSkeleton
              label={t("serviceLauncherShowcase.sections.loadingCatalog.skeletonLabel")}
            />
            <ServiceCatalogCta
              title={t("serviceLauncherShowcase.sections.loadingCatalog.addApp.title")}
              action={<Button variant="outline">{action.openRequestForm}</Button>}
            />
            <ServiceCatalogCta
              icon={LayoutGrid}
              title={t("serviceLauncherShowcase.sections.loadingCatalog.allApps.title")}
              action={<Button variant="ghost">{action.openList}</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title={t("serviceLauncherShowcase.sections.edgeCases.heading")}
          why={t("serviceLauncherShowcase.sections.edgeCases.why")}
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={ShieldCheck}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.edgeCases.hrPortal.title")}
              statusLabel={status.available}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.edgeCases.hrPortal.description")}
              metadata="workforce-identity-administration.ap-northeast-1.corp.example.jp · v11.0"
              action={<Button>{action.openService}</Button>}
            />
            <ServiceLauncherCard
              icon={Clock3}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.edgeCases.dailyReport.title")}
              statusLabel={status.available}
              statusTone="success"
              metadata="nippo.corp.example.jp"
              action={<Button>{action.openService}</Button>}
            />
            <ServiceLauncherCard
              icon={Server}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.edgeCases.warningConsole.title")}
              statusLabel={status.attentionRequired}
              statusTone="warning"
              description={t(
                "serviceLauncherShowcase.sections.edgeCases.warningConsole.description",
              )}
              metadata="workforce-identity-administration.ap-southeast-1.corp.example.com"
              disabledReason={t("serviceLauncherShowcase.sections.edgeCases.warningConsole.reason")}
              action={<Button disabled>{action.openServiceEnglish}</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title={t("serviceLauncherShowcase.sections.minimalTiles.heading")}
          why={t("serviceLauncherShowcase.sections.minimalTiles.why")}
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            <ServiceLauncherCard
              icon={BookOpen}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.minimalTiles.wiki.title")}
              action={<Button variant="outline">{action.open}</Button>}
            />
            <ServiceLauncherCard
              icon={Mail}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.minimalTiles.contact.title")}
              description={t("serviceLauncherShowcase.sections.minimalTiles.contact.description")}
              action={<Button variant="outline">{action.open}</Button>}
            />
            <ServiceLauncherCard
              icon={Calendar}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.minimalTiles.calendar.title")}
              statusLabel={status.available}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.minimalTiles.calendar.description")}
              metadata="calendar.corp.example.jp · v3.1"
              disabledReason={t("serviceLauncherShowcase.sections.minimalTiles.calendar.reason")}
              action={<Button variant="outline">{action.open}</Button>}
            />
          </ResponsiveGrid>
        </Section>

        <Section
          title={t("serviceLauncherShowcase.sections.logo.heading")}
          why={t("serviceLauncherShowcase.sections.logo.why")}
        >
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3 }}>
            {/* 1 · a real uploaded mark, square */}
            <ServiceLauncherCard
              icon={Clock3}
              logo={serviceMarkTeal}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.logo.uploaded.title")}
              statusLabel={status.available}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.logo.uploaded.description")}
              metadata="attend.corp.example.jp · v4.2"
              action={<Button>{action.openService}</Button>}
            />
            {/* 2 · the SAME tile with no upload yet — the fallback, side by side */}
            <ServiceLauncherCard
              icon={Clock3}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.logo.missing.title")}
              statusLabel={status.available}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.logo.missing.description")}
              metadata="attend.corp.example.jp · v4.2"
              action={<Button>{action.openService}</Button>}
            />
            {/* 3 · the URL is set but the file is gone — the state that reaches production */}
            <ServiceLauncherCard
              icon={Database}
              logo={BROKEN_LOGO_URL}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.logo.broken.title")}
              statusLabel={status.available}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.logo.broken.description")}
              metadata="sync.corp.example.jp"
              action={<Button>{action.openService}</Button>}
            />
            {/* 4 · a WIDE wordmark — contain letterboxes it, never crops it */}
            <ServiceLauncherCard
              icon={ReceiptText}
              logo={serviceMarkRose}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.logo.wideMark.title")}
              statusLabel={status.available}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.logo.wideMark.description")}
              metadata="keihi.corp.example.jp · v2.8"
              action={<Button>{action.openService}</Button>}
            />
            {/* 5 · logo + disabledReason — the medallion mutes, the mark stays the mark */}
            <ServiceLauncherCard
              icon={ShieldCheck}
              logo={serviceMarkTeal}
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.logo.withReason.title")}
              statusLabel={status.noPermission}
              statusTone="info"
              description={t("serviceLauncherShowcase.sections.logo.withReason.description")}
              metadata="iam.corp.example.jp"
              disabledReason={t("serviceLauncherShowcase.sections.logo.withReason.reason")}
              action={<Button disabled>{action.openService}</Button>}
            />
            {/* 6 · logo="" — an empty projection value is the same as no logo */}
            <ServiceLauncherCard
              icon={Mail}
              logo=""
              titleLevel={3}
              title={t("serviceLauncherShowcase.sections.logo.emptyString.title")}
              statusLabel={status.active}
              statusTone="success"
              description={t("serviceLauncherShowcase.sections.logo.emptyString.description")}
              metadata="mail.corp.example.jp"
              action={<Button>{action.openService}</Button>}
            />
          </ResponsiveGrid>
        </Section>
      </Flex>
    </PageContainer>
  );
}
