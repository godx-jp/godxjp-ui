import * as React from "react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Steps } from "@godxjp/ui/navigation";

export default function Demo() {
  const [step, setStep] = React.useState(1);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Tạo lô đơn hàng mới</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Steps
          current={step}
          onValueChange={setStep}
          items={[
            { title: "Chọn chi nhánh", content: "Osaka Store" },
            { title: "Thêm đơn hàng", content: "Import CSV hoặc scan" },
            { title: "Xác nhận", content: "Review & submit" },
          ]}
        />
        <p className="text-muted-foreground text-sm">Bước {step + 1} — click step để navigate.</p>
      </CardContent>
      <CardFooter separated className="justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Quay lại
        </Button>
        <Button size="sm" disabled={step === 2} onClick={() => setStep((s) => s + 1)}>
          Tiếp tục
        </Button>
      </CardFooter>
    </Card>
  );
}
