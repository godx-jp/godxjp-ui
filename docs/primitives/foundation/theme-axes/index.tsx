import { Badge, Badge } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Inline, Stack } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <Stack gap="md" className="max-w-2xl">
      <Stack gap="xs">
        <p className="text-sm font-medium">Theme axes specimen</p>
        <p className="text-muted-foreground text-sm">
          Density, font size, primary color, and semantic status tones flow through primitive
          tokens.
        </p>
      </Stack>

      <Inline gap="sm">
        <Button>Tạo đơn hàng</Button>
        <Button variant="outline">Xuất CSV</Button>
        <Button variant="ghost">Hủy</Button>
      </Inline>

      <Inline gap="sm">
        <Badge>Batch #0524</Badge>
        <Badge variant="secondary">VIP</Badge>
        <Badge status="pending" />
      </Inline>
    </Stack>
  );
}
