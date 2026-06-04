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
              A missing image falls back to initials — never a blank circle.
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
            <CardTitle>Sizes</CardTitle>
            <CardDescription>
              Set the size with a className utility (size-8 / size-10 / size-12).
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
