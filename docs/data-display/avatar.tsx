import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Avatar — identity image with a readable fallback (users, teams, entities).
 * Always compose AvatarImage + AvatarFallback so broken/missing images degrade
 * gracefully. Size via className. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Avatar" subtitle="Identity image with a readable fallback">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Image + fallback</CardTitle>
            <CardDescription>
              Compose AvatarImage with AvatarFallback: a loaded photo shows the
              image, an avatar with no image shows initials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/godxjp-a/96/96" alt="担当者" />
                <AvatarFallback>NA</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/godxjp-b/96/96" alt="担当者" />
                <AvatarFallback>TK</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>VB</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>経理</AvatarFallback>
              </Avatar>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fallback on a broken image</CardTitle>
            <CardDescription>
              When the src fails to load, AvatarImage swaps in the AvatarFallback
              automatically, never a blank circle. delayMs holds the fallback
              back briefly so it does not flash before a slow image arrives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Avatar>
                <AvatarImage src="/__missing-avatar.png" alt="退職済みの担当者" />
                <AvatarFallback>YM</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="/__missing-avatar.png" alt="未設定の担当者" />
                <AvatarFallback delayMs={600}>HS</AvatarFallback>
              </Avatar>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sizes</CardTitle>
            <CardDescription>
              Default is var(--control-height); override with a size-* utility
              (size-8 / size-10 / size-12).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="row" wrap align="center" gap="md">
              <Avatar className="size-8">
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <Avatar className="size-10">
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>D</AvatarFallback>
              </Avatar>
              <Avatar className="size-12">
                <AvatarFallback>L</AvatarFallback>
              </Avatar>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
