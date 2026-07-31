import { useState } from "react";
import { CenteredShell, Flex, LegalDocumentShell, Topbar } from "@godxjp/ui/layout";
import { Button, Logo, Text } from "@godxjp/ui/general";

import { TERMS_JA } from "../_data";

/**
 * Viewport fixture — 390×844 (mobile).
 *
 * Below the 56rem container threshold the shell collapses to ONE column and the DOM order is what
 * you read: document header → contents → sections → footer actions.
 *
 * The contents rail is deliberately **static** here — not sticky and not height-capped — so a phone
 * never loses vertical space to pinned chrome. The entries are still real anchors with the same
 * scroll offset and focus handoff, so tapping one jumps to (and focuses) the section.
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
        summary="本規約は、GodX ID および連携する各サービスの利用条件を定めるものです。"
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
        footerAction={
          <Flex gap="sm" wrap>
            <Button size="sm" fullWidth>
              同意する
            </Button>
          </Flex>
        }
      />
    </CenteredShell>
  );
}
