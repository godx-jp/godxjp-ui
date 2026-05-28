import { Search } from "lucide-react";

import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <>
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Search">
        <Search aria-hidden="true" />
      </Button>
      <Button disabled>Disabled</Button>
    </>
  );
}
