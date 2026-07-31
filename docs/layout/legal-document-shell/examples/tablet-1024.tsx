import { useState } from "react";
import { CenteredShell, Flex, LegalDocumentShell, Topbar } from "@godxjp/ui/layout";
import { Button, Logo, Text } from "@godxjp/ui/general";
import { AppSettingPicker } from "@godxjp/ui/navigation";

import { TERMS_JA } from "../_data";

/**
 * Viewport fixture — 1024×900 (tablet / small laptop).
 *
 * Still above the 56rem container threshold, so the sticky rail is kept and only the document
 * column narrows: the rail track is fixed (`--legal-document-toc-width`) while the measure track is
 * `minmax(0, 46rem)`. Nothing overflows horizontally, and no consumer CSS changes between 1440 and
 * 1024 — the shell's own container query does the work.
 */
export default function Demo() {
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
        activeSection={activeSection}
        onActiveSectionChange={setActiveSection}
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
        documentNavigation={
          <Flex direction="col" gap="xs" role="group" aria-label="法的文書">
            <Button variant="secondary" size="sm" fullWidth aria-current="page">
              利用規約
            </Button>
            <Button variant="ghost" size="sm" fullWidth>
              プライバシーポリシー
            </Button>
            <Button variant="ghost" size="sm" fullWidth>
              Cookie ポリシー
            </Button>
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
