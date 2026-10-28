import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent } from "@godxjp/ui/data-display";
import { Button, Text, Heading } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";
import "./notice-bar.css";

/**
 * Composition, gh#1463. C1 PASS; C2 FAIL (ordinary region + native Tab order);
 * C3 FAIL (Card + Flex + Button + fixed section); C4/C5/C6 PASS; C7 FAIL
 * (persistent non-modal consent is not a named primitive in two reference libraries).
 * Consent policy/storage belongs to the application. No focus trap, live role or auto focus.
 * Portal to body avoids paint/transform ancestors turning fixed into a local pin.
 */
export default function Demo() {
  const { t } = useTranslation();
  const [decision, setDecision] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const region = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState("ltr");
  useEffect(() => {
    setDirection(host.current ? getComputedStyle(host.current).direction : "ltr");
    setMounted(true);
  }, []);
  useEffect(() => {
    const node = region.current;
    if (!mounted || decision !== null || !node) return;
    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--toast-offset-bottom");
    const priority = root.style.getPropertyPriority("--toast-offset-bottom");
    const base = getComputedStyle(root).getPropertyValue("--toast-offset-bottom").trim() || "0px";
    const publish = () =>
      root.style.setProperty("--toast-offset-bottom", `calc(${base} + ${node.offsetHeight}px)`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (previous) root.style.setProperty("--toast-offset-bottom", previous, priority);
      else root.style.removeProperty("--toast-offset-bottom");
    };
  }, [mounted, decision]);
  return (
    <>
      <div ref={host}>
        <PageContainer title={t("noticeBarDocs.page")}>
          <Text as="p">{t("noticeBarDocs.body")}</Text>
          <Button variant="outline" onClick={() => setDecision(null)}>
            {t("noticeBarDocs.reopen")}
          </Button>
          {decision !== null && <Text as="p">{t(decision)}</Text>}
          <section id="privacy">
            <Heading level={2}>{t("noticeBarDocs.privacy")}</Heading>
            <Text as="p">{t("noticeBarDocs.policy")}</Text>
          </section>
        </PageContainer>
      </div>
      {mounted &&
        decision === null &&
        createPortal(
          <section
            ref={region}
            dir={direction}
            className="notice-bar-recipe"
            role="region"
            aria-label={t("noticeBarDocs.title")}
          >
            <Card>
              <CardContent>
                <Flex align="center" justify="between" gap="lg" wrap>
                  <Flex direction="col" gap="xs" className="notice-bar-recipe-copy">
                    <Text weight="medium">{t("noticeBarDocs.title")}</Text>
                    <Text as="p">
                      {t("noticeBarDocs.description")}{" "}
                      <a href="#privacy">{t("noticeBarDocs.privacy")}</a>
                    </Text>
                  </Flex>
                  <Flex gap="sm" wrap>
                    <Button variant="outline" onClick={() => setDecision("noticeBarDocs.declined")}>
                      {t("noticeBarDocs.decline")}
                    </Button>
                    <Button onClick={() => setDecision("noticeBarDocs.accepted")}>
                      {t("noticeBarDocs.accept")}
                    </Button>
                  </Flex>
                </Flex>
              </CardContent>
            </Card>
          </section>,
          document.body,
        )}
    </>
  );
}
