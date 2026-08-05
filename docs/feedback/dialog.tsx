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
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/** Every branch of DialogHeader's `tone`, in the order the vocabulary declares them. */
const headerTones = [
  "default",
  "success",
  "warning",
  "destructive",
  "info",
  "muted",
  "neutral",
] as const;

/**
 * Dialog · compound controlled modal for form-style flows. Always control via
 * open + onOpenChange. Include DialogHeader > DialogTitle (required for a11y).
 * Use DialogFooter for primary/cancel actions.
 */
export default function Demo() {
  const [createOpen, setCreateOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [toneOpen, setToneOpen] = useState(false);
  const [headerTone, setHeaderTone] = useState<(typeof headerTones)[number]>("default");

  return (
    <PageContainer
      title="Dialog"
      subtitle="compound modal · form flows, detail pop-ups, multi-step wizards"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Form-style modal (pre-opened)</CardTitle>
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
                    <Text tone="muted" className="w-20 shrink-0">
                      借方科目
                    </Text>
                    <Text>売掛金</Text>
                  </Flex>
                  <Flex direction="row" gap="sm" align="center">
                    <Text tone="muted" className="w-20 shrink-0">
                      貸方科目
                    </Text>
                    <Text>売上高</Text>
                  </Flex>
                  <Flex direction="row" gap="sm" align="center">
                    <Text tone="muted" className="w-20 shrink-0">
                      金額
                    </Text>
                    <Text>¥ 120,000</Text>
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
            <CardTitle level={2}>Read-only detail pop-up</CardTitle>
            <CardDescription>
              No footer action buttons needed, just a close trigger. Suitable for audit trail,
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
                  <DialogDescription>2024年3月31日 · 月次決算仕訳</DialogDescription>
                </DialogHeader>
                <Flex direction="col" gap="sm">
                  <Flex direction="row" justify="between">
                    <Text tone="muted">借方</Text>
                    <Text>売掛金 ¥ 240,000</Text>
                  </Flex>
                  <Flex direction="row" justify="between">
                    <Text tone="muted">貸方</Text>
                    <Text>売上高 ¥ 240,000</Text>
                  </Flex>
                  <Flex direction="row" justify="between">
                    <Text tone="muted">摘要</Text>
                    <Text>3月売上計上</Text>
                  </Flex>
                </Flex>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>DialogHeader tone band (every branch)</CardTitle>
            <CardDescription>
              DialogHeader also takes a prop-driven form: title, subtitle and an extra slot, plus
              tone. tone tints only the header band and leaves the text at the foreground colour, so
              the dialog never turns into a loud solid fill. default paints no band at all; muted
              and neutral deliberately share the same quiet band. Close the pre-opened dialog above
              with Escape, then pick a branch: the same dialog re-opens with that header.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" gap="sm" wrap>
                {headerTones.map((tone) => (
                  <Button
                    key={tone}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setHeaderTone(tone);
                      setToneOpen(true);
                    }}
                  >
                    {tone}
                  </Button>
                ))}
              </Flex>
              <Dialog open={toneOpen} onOpenChange={setToneOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader
                    tone={headerTone}
                    title="仕訳の取り込み結果"
                    subtitle={`見出し帯は tone="${headerTone}" で描画しています。`}
                    extra={<Badge tone={headerTone}>{headerTone}</Badge>}
                  />
                  <Text size="sm">
                    帯の色だけが tone に追従し、見出しと本文の文字色は変わりません。extra
                    スロットは帯の右端に固定され、閉じるボタンとは重なりません。
                  </Text>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setToneOpen(false)}>
                      閉じる
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
