import {
  Avatar,
  AvatarFallback,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * HoverCard — a rich popover shown on hover/focus of a trigger (sighted-pointer
 * affordance; not a replacement for Tooltip). Composed only from real
 * @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer
      title="HoverCard"
      subtitle="Rich preview on hover/focus — entity peek, user card"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Hover a reference</CardTitle>
            <CardDescription>
              Hover the link to preview the partner without leaving the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">株式会社ベトヤ</Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <Flex direction="row" gap="md" align="center">
                  <Avatar>
                    <AvatarFallback>VB</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">株式会社ベトヤ</div>
                    <div className="text-muted-foreground text-xs">
                      取引先 · BTY-0012 · 売掛 ¥482,000
                    </div>
                  </div>
                </Flex>
              </HoverCardContent>
            </HoverCard>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
