import "./editorial-examples.css";
import cover from "../assets/cover-terrain.svg";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useTranslation } from "@godxjp/ui/i18n";
import { Image } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import {
  CenteredShell,
  EditorialSection,
  CatalogDetail,
  EditorialCard,
  CatalogDetailTag,
  CatalogDetailSection,
  PriceSummary,
  EditorialPrompt,
  Eyebrow,
} from "@godxjp/ui/layout";

/** A reference's detail screen, with a saved toggle, facts and an anchored price module. */
export default function Demo() {
  const { t, locale } = useTranslation();
  const [saved, setSaved] = useState(false);
  const price = new Intl.NumberFormat(locale, { style: "currency", currency: "JPY" }).format(2400);
  return (
    <CenteredShell flow="sections" className="editorial-example">
      <EditorialSection spacing="section">
        <CatalogDetail
          title={t("editorialExamples.item")}
          overline={<Eyebrow>{t("editorialExamples.category")}</Eyebrow>}
          image={{ src: cover, alt: t("editorialExamples.item"), priority: true }}
          mediaCaption={t("editorialExamples.source")}
          favorite={{
            pressed: saved,
            onPressedChange: setSaved,
            label: t("editorialExamples.save"),
          }}
          meta={<CatalogDetailTag>{t("editorialExamples.category")}</CatalogDetailTag>}
          summary={{
            label: t("editorialExamples.price"),
            price,
            note: t("editorialExamples.source"),
          }}
          actions={
            <Button asChild>
              <a href="#reference-price">{t("editorialExamples.price")}</a>
            </Button>
          }
          facts={[
            {
              key: "edition",
              label: t("editorialExamples.category"),
              value: t("editorialExamples.item"),
            },
          ]}
        />
        <CatalogDetailSection
          id="reference-price"
          variant="module"
          title={t("editorialExamples.price")}
        >
          <PriceSummary
            items={[
              {
                key: "price",
                label: t("editorialExamples.price"),
                value: price,
                caption: t("editorialExamples.source"),
              },
            ]}
            context={{ label: t("editorialExamples.category"), value: t("editorialExamples.item") }}
          />
        </CatalogDetailSection>
        <CatalogDetailSection
          title={t("editorialExamples.details")}
          description={t("editorialExamples.note")}
        >
          <EditorialPrompt
            icon={<Bookmark aria-hidden="true" />}
            title={t("editorialExamples.account")}
            description={t("editorialExamples.emptyDesc")}
            action={
              <Button onClick={() => setSaved(!saved)} aria-pressed={saved}>
                {t("editorialExamples.save")}
              </Button>
            }
          />
        </CatalogDetailSection>
        <EditorialCard
          variant="spotlight"
          link={<a href="#reference-price" />}
          title={t("editorialExamples.item")}
          description={t("editorialExamples.note")}
          media={<Image src={cover} alt="" preview={false} placeholder fallback={cover} />}
        />
      </EditorialSection>
    </CenteredShell>
  );
}
