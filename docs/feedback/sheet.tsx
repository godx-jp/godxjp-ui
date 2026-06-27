import { useState } from "react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import {
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { SlidersHorizontal } from "lucide-react";

/**
 * Sheet · side-panel drawer (Radix Dialog). Slides in from an edge. Compose
 * Sheet > SheetTrigger (asChild) > SheetContent(side) > SheetHeader >
 * SheetTitle (a11y required) > scrollable body > SheetFooter.
 *
 * SheetFooter is an Ant-Design-style PINNED action bar: it sticks to the bottom
 * via mt-auto, draws a full-bleed top border, and right-aligns its actions with
 * the PRIMARY button rightmost. A destructive / clear / reset action goes
 * far-LEFT · give THAT button className="me-auto". Never stack footer buttons
 * full-width or center them. See cardinal rule #41 "Drawer & dialog footer layout".
 *
 * Fields are real FormField + Input + Select primitives · never faked with
 * styled <span>/<div>. Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  // Card 1 · pre-opened so the pinned footer + clear-left/apply-right layout is visible at rest.
  const [filterOpen, setFilterOpen] = useState(true);
  const [account, setAccount] = useState("all");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Card 2 · quick-edit form: Cancel + Save, both right-aligned (primary rightmost).
  const [editOpen, setEditOpen] = useState(false);
  const [companyName, setCompanyName] = useState("株式会社サンプル");
  const [registration, setRegistration] = useState("T1234567890123");

  // Card 3 · edit with a destructive action: 削除 far-left (mr-auto), Cancel + Save right.
  const [recordOpen, setRecordOpen] = useState(false);
  const [memo, setMemo] = useState("4月度 経費精算");

  return (
    <PageContainer
      title="Sheet"
      subtitle="side-panel drawer · filters, quick-edit, detail peek (NOT a Dialog replacement)"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Advanced filter (pre-opened, side=right)</CardTitle>
            <CardDescription>
              The defining footer pattern: actions are end-aligned, the primary 適用 is last,
              and the clear/reset action クリア moves to the leading edge via className=&quot;me-auto&quot;.
              The footer is pinned to the bottom with a full-bleed top border; the body scrolls
              between a fixed header and footer (header inset == footer inset). Fields are real
              FormField + Select + Input.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal />
                  詳細検索
                </Button>
              </SheetTrigger>
              <SheetContent side="right" width={420}>
                <SheetHeader
                  tone="info"
                  title="詳細検索"
                  subtitle="条件を組み合わせて仕訳を絞り込みます。"
                  extra={<Badge tone="info">3 条件</Badge>}
                />
                <SheetBody className="flex flex-col gap-4">
                  <FormField id="filter-account" label="勘定科目">
                    <Select value={account} onValueChange={setAccount}>
                      <SelectTrigger id="filter-account">
                        <SelectValue placeholder="すべての勘定科目" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべての勘定科目</SelectItem>
                        <SelectItem value="cash">現金</SelectItem>
                        <SelectItem value="sales">売上高</SelectItem>
                        <SelectItem value="expense">旅費交通費</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField id="filter-status" label="ステータス">
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="filter-status">
                        <SelectValue placeholder="すべてのステータス" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべてのステータス</SelectItem>
                        <SelectItem value="draft">下書き</SelectItem>
                        <SelectItem value="approved">承認済み</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField id="filter-source" label="ソース">
                    <Select value={source} onValueChange={setSource}>
                      <SelectTrigger id="filter-source">
                        <SelectValue placeholder="すべてのソース" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべてのソース</SelectItem>
                        <SelectItem value="manual">手入力</SelectItem>
                        <SelectItem value="import">インポート</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField id="filter-amount-min" label="金額">
                    <Flex direction="row" gap="sm" align="center">
                      <Input
                        id="filter-amount-min"
                        className="min-w-0 flex-1"
                        inputMode="numeric"
                        placeholder="最小"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                      />
                      <Text tone="muted" aria-hidden="true">
                        –
                      </Text>
                      <Input
                        id="filter-amount-max"
                        aria-label="最大金額"
                        className="min-w-0 flex-1"
                        inputMode="numeric"
                        placeholder="最大"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                      />
                    </Flex>
                  </FormField>
                </SheetBody>
                <SheetFooter>
                  <Button
                    variant="outline"
                    className="me-auto"
                    onClick={() => {
                      setAccount("all");
                      setStatus("all");
                      setSource("all");
                      setMinAmount("");
                      setMaxAmount("");
                    }}
                  >
                    クリア
                  </Button>
                  <Button onClick={() => setFilterOpen(false)}>適用</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick-edit form (Cancel + Save, right-aligned)</CardTitle>
            <CardDescription>
              No destructive action, so both buttons sit on the right: キャンセル (secondary) to the
              left of 保存 (primary). Close programmatically on submit success.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  取引先を編集
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>取引先編集 · 株式会社サンプル</SheetTitle>
                  <SheetDescription>取引先の基本情報を編集します。</SheetDescription>
                </SheetHeader>
                <SheetBody className="flex flex-col gap-4">
                  <FormField id="edit-company" label="会社名" required>
                    <Input
                      id="edit-company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </FormField>
                  <FormField id="edit-registration" label="登録番号" helper="T + 13桁">
                    <Input
                      id="edit-registration"
                      value={registration}
                      onChange={(e) => setRegistration(e.target.value)}
                    />
                  </FormField>
                </SheetBody>
                <SheetFooter>
                  <Button variant="outline" onClick={() => setEditOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={() => setEditOpen(false)}>保存</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit with destructive action (削除 far-left)</CardTitle>
            <CardDescription>
              A destructive / clear / reset action goes to the leading edge via className=&quot;me-auto&quot;
              with variant=&quot;destructive&quot;, while キャンセル + 保存 stay grouped at the
              end. This is the same me-auto slot the filter&apos;s クリア uses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Sheet open={recordOpen} onOpenChange={setRecordOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  仕訳を編集
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>仕訳編集 · #2024-0412</SheetTitle>
                  <SheetDescription>摘要を編集します。削除は元に戻せません。</SheetDescription>
                </SheetHeader>
                <SheetBody className="flex flex-col gap-4">
                  <FormField id="record-memo" label="摘要">
                    <Input
                      id="record-memo"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                    />
                  </FormField>
                </SheetBody>
                <SheetFooter>
                  <Button
                    variant="destructive"
                    className="me-auto"
                    onClick={() => setRecordOpen(false)}
                  >
                    削除
                  </Button>
                  <Button variant="outline" onClick={() => setRecordOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={() => setRecordOpen(false)}>保存</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
