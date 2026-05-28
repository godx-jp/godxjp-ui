import { Globe2, Plus } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";

export default function Demo() {
  return (
    <Card className="max-w-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>IdP federation</CardTitle>
        <CardAction>
          <Button size="sm">
            <Plus className="mr-1.5 size-4" aria-hidden="true" />
            Add IdP
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Globe2}
          title="Chưa cấu hình IdP"
          description="Thêm Google Workspace, Azure AD hoặc OIDC generic."
          action={
            <Button size="sm">
              <Plus className="mr-1.5 size-4" aria-hidden="true" />
              Add IdP
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
