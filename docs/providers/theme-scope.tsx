import { ThemeScope, tenantTheme } from "@godxjp/ui/app";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@godxjp/ui/data-display";
import { Select } from "@godxjp/ui/data-entry";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Toaster,
  toast,
} from "@godxjp/ui/feedback";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * ThemeScope · the region whose overlays keep the region's tokens (gh#877).
 *
 * The screen is a review queue handled on behalf of two customers at once — the case that makes
 * the defect visible, because both regions are on the page together and every overlay they open
 * used to come back in the package's own violet.
 *
 * Each region is themed a DIFFERENT way on purpose: the first from `tenantTheme(hex).vars`, the
 * second from a `.dark` class. ThemeScope has no theme prop and reads neither — it reads the
 * COMPUTED tokens at its own element, which is why both work and why a `[data-tenant]` rule in a
 * consumer's own stylesheet works too. Open a Dialog, a Select listbox, a Popover or a toast from
 * either region: all of them are painted by that region.
 *
 * Composed only from real @godxjp/ui components.
 */

const REVIEWERS = [
  { value: "sato", label: "Sakura Sato" },
  { value: "tran", label: "Trần Minh" },
  { value: "novak", label: "Ana Novák" },
];

function ReviewRegion({ name }: { name: string }) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle level={2}>{name}</CardTitle>
        <CardDescription>{t("themeScopeDocs.region.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Flex direction="col" gap="md">
          <Flex gap="sm" align="center" wrap>
            <Badge>{t("themeScopeDocs.region.pending")}</Badge>
            <Text tone="muted">{t("themeScopeDocs.region.queue")}</Text>
          </Flex>

          <Select
            aria-label={t("themeScopeDocs.region.reviewerLabel")}
            placeholder={t("themeScopeDocs.region.reviewerPlaceholder")}
            options={REVIEWERS}
          />

          <Flex gap="sm" wrap>
            <Dialog>
              <DialogTrigger asChild>
                <Button>{t("themeScopeDocs.region.approve")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("themeScopeDocs.dialog.title")}</DialogTitle>
                  <DialogDescription>{t("themeScopeDocs.dialog.description")}</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <Text>{t("themeScopeDocs.dialog.body")}</Text>
                </DialogBody>
                <DialogFooter>
                  <Button onClick={() => toast.success(t("themeScopeDocs.toast.approved"))}>
                    {t("themeScopeDocs.dialog.confirm")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">{t("themeScopeDocs.region.history")}</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Text>{t("themeScopeDocs.popover.body")}</Text>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" onClick={() => toast(t("themeScopeDocs.toast.saved"))}>
              {t("themeScopeDocs.region.notify")}
            </Button>
          </Flex>
        </Flex>
      </CardContent>
    </Card>
  );
}

export default function Demo() {
  const { t } = useTranslation();
  const acme = tenantTheme("#0076bd");

  return (
    <PageContainer
      title={t("themeScopeDocs.page.title")}
      subtitle={t("themeScopeDocs.page.subtitle")}
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("themeScopeDocs.intro.title")}</CardTitle>
            <CardDescription>{t("themeScopeDocs.intro.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Text as="p" tone="muted">
              {t("themeScopeDocs.intro.body")}
            </Text>
          </CardContent>
        </Card>

        {/* Themed from a customer hex. The Toaster lives inside the region, so its toasts do too. */}
        <ThemeScope style={acme.vars} data-tenant="acme">
          <ReviewRegion name={t("themeScopeDocs.acme.name")} />
          <Toaster />

          {/*
            NESTED, and themed by a CLASS rather than a style: the night-shift console stays dark
            whatever the page does. The INNER scope wins for its overlays — measured, its Dialog
            reads --card 48 8% 12% (dark) where the outer region reads 60 33% 99%.

            `acme.vars` is repeated here on purpose, and that is worth knowing: `.dark` RESTATES the
            whole brand ramp, so an inner scope that only adds the class would hand its overlays the
            package's dark violet rather than the customer's blue. Inheritance carries what the
            inner scope does not redeclare; `.dark` redeclares this.
          */}
          <ThemeScope className="dark" style={acme.vars}>
            <ReviewRegion name={t("themeScopeDocs.night.name")} />
          </ThemeScope>
        </ThemeScope>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("themeScopeDocs.without.title")}</CardTitle>
            <CardDescription>{t("themeScopeDocs.without.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* No ThemeScope: the region is themed, its overlays are not. This is the defect. */}
            <div style={acme.vars} data-tenant="acme-unscoped">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>{t("themeScopeDocs.without.open")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("themeScopeDocs.without.dialogTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("themeScopeDocs.without.dialogDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <Text>{t("themeScopeDocs.without.dialogBody")}</Text>
                  </DialogBody>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
