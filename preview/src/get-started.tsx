import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Badge } from "@godxjp/ui/data-display";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

import { SHOWCASES } from "./showcase-catalog";

/**
 * Get Started landing — the entry surface of the :6008 preview. It lists the
 * standalone SHOWCASES (full application pages) so they can be opened on their own
 * URL `/showcase/<id>` in a new tab, separate from the component catalog.
 */
export function GetStartedPage() {
  return (
    <div className="preview-stage">
      <PageContainer
        title="Bắt đầu"
        subtitle="godxjp-ui · showcase & component preview"
      >
        <Flex direction="col" gap="xl">
          <Card>
            <CardContent>
              <Flex direction="col" gap="md">
                <p className="doc-page-intro">
                  Preview này gồm hai phần. <strong>Component catalog</strong> (thanh bên trái) trình
                  bày từng primitive với mọi prop, state và tone. <strong>Showcase</strong> bên dưới
                  là các trang ứng dụng hoàn chỉnh dựng <em>chỉ bằng</em> real @godxjp/ui primitives —
                  mở ở URL riêng <code>/showcase/&lt;id&gt;</code> để tham khảo cách ghép một màn hình
                  thật.
                </p>
              </Flex>
            </CardContent>
          </Card>

          <section>
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="whitespace-nowrap text-base font-bold">
                Showcase ({SHOWCASES.length})
              </h2>
              <span className="text-xs text-muted-foreground">
                Trang độc lập · mở tab mới · không nằm trong catalog
              </span>
            </div>
            <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 2 }}>
              {SHOWCASES.map((s) => (
                <a
                  key={s.id}
                  href={`/showcase/${s.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block no-underline"
                >
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardHeader className="flex flex-row items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="flex items-center gap-1.5">
                          {s.title}
                          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                        </CardTitle>
                        <CardDescription>{s.description}</CardDescription>
                      </div>
                      <Badge variant="outline" tone="info">
                        {s.tag}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-muted-foreground">/showcase/{s.id}</code>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </ResponsiveGrid>
          </section>
        </Flex>
      </PageContainer>
    </div>
  );
}
