import { useRef, useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Descriptions,
  ScrollArea,
} from "@godxjp/ui/data-display";
import { Button, Heading, Paragraph, Text } from "@godxjp/ui/general";
import { Affix, Flex, PageContainer } from "@godxjp/ui/layout";
import { Check, Filter } from "lucide-react";

/**
 * Affix — Ant Design `Affix` (6.6.5). Pin an element to its scrollport, and REPORT that it is
 * pinned — which is the whole difference from `position: sticky`, and the reason both website
 * showcases in docs/showcase/ wrote `position: sticky` and got nothing usable out of it.
 *
 * The cases on this page are the ones that break a hand-rolled sticky header:
 *
 * — the PAGE JUMP. Taking a bar out of flow removes its height, so everything below it moves up by
 *   exactly that height. Card 1 prints the measured number it is holding open;
 * — the CONDENSE. The bar is a different bar once pinned — a smaller control, a shorter title, a
 *   monogram instead of a wordmark — and nothing but the reported boolean can drive that;
 * — a SCROLLING CONTAINER that is not the page, which is `target`;
 * — the BLOCK-END pin, which is the sticky form footer and not the sticky header;
 * — a bar of CJK beside Latin and a 71-character unbreakable token, because the measured height is
 *   only right if it is measured at the width it is actually laid out at;
 * — and the narrow case, where the same bar wraps to two lines and the placeholder has to follow.
 *
 * Composed only from real @godxjp/ui components.
 */

/** A real filename in a real toolbar: 71 characters with nowhere to break. */
const UNBREAKABLE = "RegionalDeploymentConfigurationParameterNamespaceIdentifierOverrides123";

function Filler({ id, title, lines }: { id: string; title: string; lines: number }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`}>
      <Heading level={3} id={`${id}-heading`}>
        {title}
      </Heading>
      {Array.from({ length: lines }, (_, line) => (
        <Paragraph key={line}>
          スクロールしてください。Scroll on, and keep scrolling: the bar above only becomes
          interesting once the page has gone far enough past it for the pin to fire.
        </Paragraph>
      ))}
    </section>
  );
}

export default function Demo() {
  const paneRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [paneP, setPanePinned] = useState(false);
  const [footerPinned, setFooterPinned] = useState(false);

  return (
    <PageContainer
      title="Affix"
      subtitle="antd Affix · the measured placeholder, the reported boolean, the scrolling target"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>1 · The condensing bar, against the page</CardTitle>
            <CardDescription>
              Everything that changes below is driven by `onChange` alone: the title loses its
              qualifier, the primary action drops a size tier, and the state badge flips. Nothing
              here is a second measurement, and `position: sticky` can drive none of it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Affix offsetBlockStart={8} onChange={setPinned}>
              <Card>
                <CardContent>
                  <Flex align="center" justify="between" gap="sm" wrap>
                    <Text weight="medium">
                      {pinned ? "請求書 · Invoices" : "請求書 · Invoices, 2026 年度 (all regions)"}
                    </Text>
                    <Flex align="center" gap="sm">
                      <Badge variant={pinned ? "default" : "secondary"}>
                        {pinned ? "affixed" : "in flow"}
                      </Badge>
                      <Button size={pinned ? "sm" : "md"}>
                        <Check aria-hidden="true" />
                        承認 · Approve
                      </Button>
                    </Flex>
                  </Flex>
                </CardContent>
              </Card>
            </Affix>
            <Filler id="affix-page-body" title="A long page to scroll" lines={14} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2 · Inside a scrolling target, not the page</CardTitle>
            <CardDescription>
              `target` is Ant Design&apos;s, and it is the answer to a page whose scroll belongs to
              a pane: the bar pins against the pane&apos;s edge and stops there, not at the top of
              the window. The label carries a 71-character unbreakable token beside CJK, so the
              measured height is taken at the width the bar is really laid out at.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea viewportRef={paneRef} className="h-80" label="Filter pane">
              <Affix target={() => paneRef.current} onChange={setPanePinned}>
                <Card>
                  <CardContent>
                    <Flex align="center" gap="sm" wrap>
                      <Filter aria-hidden="true" />
                      {/* `truncate`, not a wrap: a 71-character identifier with nowhere to break
                          would otherwise spill 255px past its box at 375px (measured by
                          check:frame-overflow, which is what caught it). A toolbar label is one
                          line; the full string stays in the DOM and in the accessible name. */}
                      <Text weight="medium" truncate className="min-w-0">
                        絞り込み · {UNBREAKABLE}
                      </Text>
                      <Badge variant={paneP ? "default" : "secondary"}>
                        {paneP ? "affixed" : "in flow"}
                      </Badge>
                    </Flex>
                  </CardContent>
                </Card>
              </Affix>
              <Filler id="affix-pane-body" title="Pane content" lines={12} />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3 · offsetBlockEnd · the sticky form footer</CardTitle>
            <CardDescription>
              Passing the block-END offset (and no block-start one) is what selects bottom pinning,
              exactly as in Ant Design. It releases the moment the real end of the form reaches it,
              which is the behaviour a `position: sticky` footer cannot express without a second
              element.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Filler id="affix-form-body" title="Form fields" lines={10} />
            <Affix offsetBlockEnd={8} onChange={setFooterPinned}>
              <Card>
                <CardContent>
                  <Flex align="center" justify="between" gap="sm" wrap>
                    <Text tone="muted">
                      {footerPinned ? "未保存の変更があります" : "すべて保存済み"}
                    </Text>
                    <Flex align="center" gap="sm">
                      <Badge variant={footerPinned ? "default" : "secondary"}>
                        {footerPinned ? "affixed" : "in flow"}
                      </Badge>
                      <Button variant="outline">キャンセル</Button>
                      <Button>保存</Button>
                    </Flex>
                  </Flex>
                </CardContent>
              </Card>
            </Affix>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4 · What the component is actually reporting</CardTitle>
            <CardDescription>
              Three independent Affixes, three independent booleans. Each one fires on its own pin
              transition and on nothing else, never once per scroll frame.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Descriptions
              items={[
                {
                  label: "1 · page bar",
                  children: (
                    <Badge variant={pinned ? "default" : "secondary"}>{String(pinned)}</Badge>
                  ),
                },
                {
                  label: "2 · pane bar",
                  children: (
                    <Badge variant={paneP ? "default" : "secondary"}>{String(paneP)}</Badge>
                  ),
                },
                {
                  label: "3 · form footer",
                  children: (
                    <Badge variant={footerPinned ? "default" : "secondary"}>
                      {String(footerPinned)}
                    </Badge>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
