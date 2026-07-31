import { CenteredShell, Flex, LegalDocumentShell, Topbar } from "@godxjp/ui/layout";
import { Button, Logo, Text } from "@godxjp/ui/general";

import { WRAPPING_MIXED } from "../_data";

/**
 * Wrapping fixture — long JA / EN / VI sections.
 *
 * The same document rendered with deliberately hostile line-breaking material:
 *
 * - **JA** — no spaces at all; `line-break: strict` applies kinsoku so a 、。」 never starts a line.
 * - **EN** — very long compounds and a query-string URL; `overflow-wrap: break-word` breaks those
 *   (and only those) rather than pushing a horizontal scrollbar onto the page.
 * - **VI** — diacritic-heavy words; `word-break: normal` keeps them whole, so "nghĩa" is never split.
 *
 * Heading rhythm holds too: a very long `h2` wraps inside the measure and keeps the
 * `--legal-document-section-title-gap` to its body. Resize the frame to check every width.
 */
export default function Demo() {
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
        />
      }
    >
      <LegalDocumentShell
        title="Data Processing Agreement · データ処理契約 · Thoả thuận xử lý dữ liệu"
        version="1.12"
        effectiveDate="2026-04-01"
        summary="A single document carrying Japanese, English and Vietnamese sections. The wrapping, kinsoku and heading rhythm must hold in all three at every width."
        contentsLabel="Contents"
        sections={WRAPPING_MIXED.map((section) => ({
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
        footerAction={
          <Button size="sm" variant="outline">
            Download PDF
          </Button>
        }
      />
    </CenteredShell>
  );
}
