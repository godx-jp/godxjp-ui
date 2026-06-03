import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@godxjp/ui/data-display";
import { Checkbox, FormField, Input } from "@godxjp/ui/data-entry";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { SlidersHorizontal } from "lucide-react";

/**
 * Popover — floating panel anchored to a trigger. Always compose
 * PopoverTrigger + PopoverContent; never a raw div overlay. Composed only from
 * real @godxjp/ui components.
 */
export default function Demo() {
  return (
    <PageContainer title="Popover" subtitle="Floating panel anchored to a trigger — click to open">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Trigger + content</CardTitle>
            <CardDescription>
              Common for compact filter / settings panels off a button.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <SlidersHorizontal />
                  絞り込み
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Flex direction="col" gap="md">
                  <FormField id="min" label="最小金額">
                    <Input id="min" type="number" placeholder="0" />
                  </FormField>
                  <Flex direction="row" wrap align="center" gap="xs">
                    <Checkbox id="unpaid" />
                    <label htmlFor="unpaid" className="text-sm">
                      未払いのみ
                    </label>
                  </Flex>
                  <Button size="sm">適用</Button>
                </Flex>
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
