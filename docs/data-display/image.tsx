import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Image,
  ImagePreviewGroup,
  Prose,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

import coverTerrain from "../assets/cover-terrain.svg";
import portraitIris from "../assets/portrait-iris.svg";
import shotLandscape from "../assets/shot-landscape.svg";
import shotPortrait from "../assets/shot-portrait.svg";

/* Committed SVG files under docs/assets — a docs page never fetches a third-party image. */

/**
 * Image + ImagePreviewGroup — antd `Image` / `Image.PreviewGroup` (gh#1077).
 *
 * Click (or Enter on) a picture: it opens full-viewport with zoom in/out (buttons, wheel,
 * double-click), rotate, flip and reset; drag pans a zoomed picture. Inside a group, ←/→ and the
 * side buttons page every picture of the group with a "2 / 3" counter. Esc closes and focus goes
 * back to the picture.
 *
 * Deviations from antd, on purpose: the thumbnail is a real button (keyboard-openable); the
 * preview traps focus and restores it; ←/→ follow the reading direction (RTL: ← is next); with
 * `items`, a clicked child opens at its own src (antd opens 0); `alt` is required; the
 * `toolbarRender` / `imageRender` / `countRender` render props, `movable` and `getContainer` are
 * not ported.
 */
export default function Demo() {
  const [current, setCurrent] = React.useState(0);
  const [visible, setVisible] = React.useState(false);

  return (
    <PageContainer title="Image" subtitle="Click to preview large · ←/→ page through a group">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Every screenshot of a Markdown body in one preview</CardTitle>
            <CardDescription>
              Every Image under an ImagePreviewGroup, however deep, joins one gallery in document
              order. Mapping a Markdown renderer&apos;s img to Image is enough to page through the
              article&apos;s screenshots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImagePreviewGroup>
              <Prose>
                <h3>Test result</h3>
                <p>Before the fix:</p>
                <p>
                  <Image src={shotPortrait} width={180} alt="List screen before the fix" />
                </p>
                <p>After the fix:</p>
                <p>
                  <Image src={shotLandscape} width={320} alt="Dashboard after the fix" />
                </p>
                <p>
                  The logo leaves the group with preview=&#123;false&#125;:{" "}
                  <Image src={portraitIris} width={48} alt="App icon" preview={false} />
                </p>
              </Prose>
            </ImagePreviewGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>items and controlled preview.current / visible</CardTitle>
            <CardDescription>
              `items` lists the gallery explicitly; `preview` controls current / onChange and
              visible / onVisibleChange with antd&apos;s (next, prev) argument order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Text tone="muted">
                Showing {current + 1} / 3 · {visible ? "open" : "closed"}
              </Text>
              <Flex gap="sm" wrap>
                <Button onClick={() => setVisible(true)}>Open the gallery</Button>
              </Flex>
              <ImagePreviewGroup
                items={[
                  { src: shotPortrait, alt: "List screen" },
                  { src: shotLandscape, alt: "Dashboard" },
                  { src: coverTerrain, alt: "Cover image" },
                ]}
                preview={{
                  current,
                  visible,
                  onChange: (next) => setCurrent(next),
                  onVisibleChange: (next) => setVisible(next),
                }}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Standalone · fallback · placeholder</CardTitle>
            <CardDescription>
              An Image outside a group previews only itself. A picture that fails to load shows its
              fallback and does not open a preview (as in antd).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex gap="md" wrap align="start">
              <Image src={coverTerrain} width={240} alt="Cover image" placeholder />
              <Image
                src="/missing-screenshot.png"
                fallback={portraitIris}
                width={96}
                alt="A picture that failed to load"
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Thumbnail size · fit · caption</CardTitle>
            <CardDescription>
              size puts the frame on the Thumbnail height scale (sm 64px, md 96px, lg 160px) at 4:3,
              cropped to fill; fit=&quot;contain&quot; letterboxes instead. caption keeps a long
              file name under the picture, truncated at the picture&apos;s width.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImagePreviewGroup>
              <Flex gap="sm" wrap align="start">
                <Image
                  src={shotLandscape}
                  size="md"
                  alt="Dashboard"
                  caption={
                    <Text size="xs" truncate>
                      dashboard-after-the-fix-2026-09-30-full-resolution.png
                    </Text>
                  }
                />
                <Image
                  src={shotPortrait}
                  size="md"
                  fit="contain"
                  alt="List screen"
                  caption={
                    <Text size="xs" truncate>
                      list-screen.png
                    </Text>
                  }
                />
                <Image src={coverTerrain} size="sm" alt="Cover image" />
                <Image src={portraitIris} size="lg" alt="Portrait" />
              </Flex>
            </ImagePreviewGroup>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
