import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@godxjp/ui/feedback";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Button } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Dialog — compound controlled modal for form-style flows. Always control via
 * open + onOpenChange. Include DialogHeader > DialogTitle (required for a11y).
 * Use DialogFooter for primary/cancel actions.
 */
export default function Demo() {
  const [createOpen, setCreateOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <PageContainer
      title="Dialog"
      subtitle="compound modal — form flows, detail pop-ups, multi-step wizards"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Form-style modal (pre-opened)</CardTitle>
            <CardDescription>
              Controlled via open + onOpenChange. DialogTitle is required for screen-reader
              accessibility. Hold open while pending to prevent double-submit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">仕訳新規作成</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>新規仕訳を作成</DialogTitle>
                  <DialogDescription>
                    借方・貸方科目と金額を入力して保存してください。
                  </DialogDescription>
                </DialogHeader>
                <Flex direction="col" gap="md">
                  <Flex direction="row" gap="sm" align="center">
                    <span className="text-muted-foreground w-20 shrink-0 text-sm">借方科目</span>
                    <span className="text-sm">売掛金</span>
                  </Flex>
                  <Flex direction="row" gap="sm" align="center">
                    <span className="text-muted-foreground w-20 shrink-0 text-sm">貸方科目</span>
                    <span className="text-sm">売上高</span>
                  </Flex>
                  <Flex direction="row" gap="sm" align="center">
                    <span className="text-muted-foreground w-20 shrink-0 text-sm">金額</span>
                    <span className="text-sm">¥ 120,000</span>
                  </Flex>
                </Flex>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={() => setCreateOpen(false)}>保存</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Read-only detail pop-up</CardTitle>
            <CardDescription>
              No footer action buttons needed — just a close trigger. Suitable for audit trail,
              attachment preview, or approval history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  取引詳細を見る
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>取引 #JE-2024-0042</DialogTitle>
                  <DialogDescription>2024年3月31日 — 月次決算仕訳</DialogDescription>
                </DialogHeader>
                <Flex direction="col" gap="sm">
                  <Flex direction="row" justify="between">
                    <span className="text-muted-foreground text-sm">借方</span>
                    <span className="text-sm">売掛金 ¥ 240,000</span>
                  </Flex>
                  <Flex direction="row" justify="between">
                    <span className="text-muted-foreground text-sm">貸方</span>
                    <span className="text-sm">売上高 ¥ 240,000</span>
                  </Flex>
                  <Flex direction="row" justify="between">
                    <span className="text-muted-foreground text-sm">摘要</span>
                    <span className="text-sm">3月売上計上</span>
                  </Flex>
                </Flex>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
