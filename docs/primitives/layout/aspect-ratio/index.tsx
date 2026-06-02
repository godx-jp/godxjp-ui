import { AspectRatio } from "@godxjp/ui/layout";

export default function AspectRatioDemo() {
  return (
    <AspectRatio ratio={16 / 9}>
      <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">16:9</div>
    </AspectRatio>
  );
}
