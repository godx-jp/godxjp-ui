import { useState } from "react";
import { CenteredShell, Flex, LegalDocumentShell, Topbar } from "@godxjp/ui/layout";
import { Button, Logo, Text } from "@godxjp/ui/general";
import { AppSettingPicker } from "@godxjp/ui/navigation";

import { TERMS_JA } from "./_data";

/**
 * LegalDocumentShell — the long-form legal/policy document surface (terms, privacy, DPA, cookie
 * policy, SLA) with a table of contents.
 *
 * This is the canonical hosted legal screen: a `CenteredShell` (brand bar + locale picker + page
 * footer) whose column holds the document. The shell owns the geometry AND the behaviour — sticky
 * contents rail at ≥56rem, scroll-spy `aria-current`, hash deep links with a token-driven scroll
 * offset, focus handoff into the target section, reduced-motion-aware scrolling. All legal text is
 * consumer-owned and arrives through `sections`.
 *
 * Shown here: controlled `activeSection` / `onActiveSectionChange`, `version` + ISO `effectiveDate`
 * (formatted with `Intl.DateTimeFormat`), `summary`, `contentsLabel`, the `documentNavigation` rail
 * slot and the `footerAction` slot. Composed only from real @godxjp/ui components — zero custom CSS.
 */

const DOCUMENTS = [
  { id: "terms", label: "利用規約" },
  { id: "privacy", label: "プライバシーポリシー" },
  { id: "cookies", label: "Cookie ポリシー" },
];

export default function Demo() {
  const [documentId, setDocumentId] = useState("terms");
  const [activeSection, setActiveSection] = useState("acceptance");

  return (
    <CenteredShell
      width="lg"
      topbar={
        <Topbar
          start={
            <Flex align="center" gap="sm">
              <Logo glyph="G" />
              <Text weight="medium">GodX ID</Text>
            </Flex>
          }
          end={<AppSettingPicker kind="locale" />}
        />
      }
      footer={
        <Text size="xs" tone="muted">
          2026 GodX 株式会社
        </Text>
      }
    >
      <LegalDocumentShell
        title="利用規約"
        version="2.4"
        effectiveDate="2026-04-01"
        summary="本規約は、GodX ID および連携する各サービスの利用条件を定めるものです。ご利用の前に必ずお読みください。"
        contentsLabel="目次"
        sections={TERMS_JA.map((section) => ({
          id: section.id,
          title: section.title,
          content: (
            <Flex direction="col" gap="sm">
              {section.paragraphs.map((paragraph) => (
                <Text as="p" key={paragraph}>
                  {paragraph}
                </Text>
              ))}
            </Flex>
          ),
        }))}
        activeSection={activeSection}
        onActiveSectionChange={setActiveSection}
        documentNavigation={
          <Flex direction="col" gap="xs" role="group" aria-label="法的文書">
            {DOCUMENTS.map((document) => (
              <Button
                key={document.id}
                variant={document.id === documentId ? "secondary" : "ghost"}
                size="sm"
                fullWidth
                aria-current={document.id === documentId ? "page" : undefined}
                onClick={() => setDocumentId(document.id)}
              >
                {document.label}
              </Button>
            ))}
          </Flex>
        }
        footerAction={
          <Flex gap="sm" wrap>
            <Button size="sm">同意する</Button>
            <Button size="sm" variant="outline">
              PDF をダウンロード
            </Button>
          </Flex>
        }
      />
    </CenteredShell>
  );
}
