import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { PageContainer } from "@godxjp/ui/layout";

/** Dedicated closed-state coarse-pointer journey: trigger → action → close. */
export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <PageContainer title="Popover touch journey">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button>フィルターを開く</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="フィルター操作">
          <PopoverDescription>タッチ操作の確認用パネルです。</PopoverDescription>
          <Button onClick={() => setOpen(false)}>適用して閉じる</Button>
        </PopoverContent>
      </Popover>
    </PageContainer>
  );
}
