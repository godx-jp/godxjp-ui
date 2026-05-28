import { Download, Share2, Star, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";

const actions = [
  { icon: Download, label: "Download" },
  { icon: Share2, label: "Share" },
  { icon: Star, label: "Promote" },
  { icon: Trash2, label: "Delete" },
];

export default function Demo() {
  return (
    <Card className="max-w-md overflow-hidden">
      <CardHeader>
        <CardTitle>invoice_8842.pdf</CardTitle>
        <CardDescription>Temp · expires 6h</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Icon row full-width giống card actions.
      </CardContent>
      <CardFooter separated flush>
        <div className="flex w-full divide-x">
          {actions.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="ui-card-footer-action-y text-muted-foreground hover:bg-muted/50 hover:text-foreground flex flex-1 flex-col items-center gap-1 text-xs"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
