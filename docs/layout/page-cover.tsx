import * as React from "react";
import { Prose } from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { useTranslation } from "@godxjp/ui/i18n";
import { PageContainer } from "@godxjp/ui/layout";

import shot from "../assets/shot-landscape.svg";
import { EmojiPicker, PageCover } from "@godxjp/ui/lab";

/**
 * PageCover + PageContainer `icon` / headerScale="display" (gh#1160) — a Notion / note.com page:
 * a banner cover you can reposition (drag, or the arrow keys while repositioning), the page icon
 * over its edge (chosen with EmojiPicker), and the article's display-size title.
 */
export default function Demo() {
  const { t } = useTranslation();
  const [y, setY] = React.useState(40);
  const [moving, setMoving] = React.useState(false);
  const [icon, setIcon] = React.useState<string | null>("📘");
  return (
    <PageContainer
      title={t("pageCoverDocs.title")}
      headerScale="display"
      icon={
        <EmojiPicker
          value={icon}
          onValueChange={setIcon}
          size="lg"
          aria-label={t("pageCoverDocs.icon")}
        />
      }
      cover={
        <PageCover
          src={shot}
          alt=""
          positionY={y}
          onPositionChange={setY}
          repositioning={moving}
          onRepositioningChange={setMoving}
          actions={
            <Button size="sm" variant="secondary" onClick={() => setMoving((m) => !m)}>
              {moving ? t("pageCoverDocs.done") : t("pageCoverDocs.reposition")}
            </Button>
          }
        />
      }
    >
      <Prose measure="medium">
        <p>{t("pageCoverDocs.body")}</p>
      </Prose>
      <Text size="sm" tone="muted">
        {t("pageCoverDocs.position", { value: y })}
      </Text>
    </PageContainer>
  );
}
