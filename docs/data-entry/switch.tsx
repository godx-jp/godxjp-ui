import { useState } from "react";
import { CircleHelp } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ListRow,
} from "@godxjp/ui/data-display";
import { Field, Label, Switch } from "@godxjp/ui/data-entry";
import { Tooltip, TooltipContent, TooltipTrigger } from "@godxjp/ui/feedback";
import { Button, Icon } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Switch — a boolean toggle. Wrap in Field (NOT FormField) for a labelled row
 * with the hidden form input + description; put it in ListRow's `trailing` when
 * the settings row wants the toggle at the END of the line. Composed only from
 * real @godxjp/ui components.
 */
export default function Demo() {
  // 公開設定は保存に往復が要る。loading 中のトグルは値を変えずに要求だけを拒否する。
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const savePublished = (next: boolean) => {
    setSaving(true);
    window.setTimeout(() => {
      setPublished(next);
      setSaving(false);
    }, 1200);
  };

  return (
    <PageContainer title="Switch" subtitle="Boolean toggle · wrap in Field for a labelled row">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Labelled rows (Field)</CardTitle>
            <CardDescription>Field owns the label, description, and form input.</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field
                id="invoice-mail"
                label="請求書をメール送信"
                description="発行時に取引先へ自動送信します"
              >
                <Switch id="invoice-mail" defaultChecked />
              </Field>
              <Field id="reminder" label="支払期日リマインダー" description="期日3日前に通知します">
                <Switch id="reminder" />
              </Field>
              <Field id="locked" label="期間ロック" description="確定済みのため変更できません">
                <Switch id="locked" disabled defaultChecked />
              </Field>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>設定セクション · ListRow の trailing に置く</CardTitle>
            <CardDescription>
              設定画面の1行は「見出しと説明が左、トグルが右端」。Field は制御を先頭に置くので
              この並びにはならない。ListRow の trailing に Switch を入れ、title を Label htmlFor
              にして紐づける。これが無いと、行ごとにトグル位置が揃わず目で追えなくなる。
            </CardDescription>
          </CardHeader>
          <CardContent flush>
            <ListRow
              align="start"
              overflow="wrap"
              title={<Label htmlFor="set-2fa">二要素認証</Label>}
              description="ログイン時にワンタイムコードの入力を求めます。"
              trailing={<Switch id="set-2fa" defaultChecked />}
            />
            <ListRow
              align="start"
              overflow="wrap"
              title={
                <Label htmlFor="set-ocr">
                  レシート OCR
                  <Badge as="span" tone="info">
                    ベータ
                  </Badge>
                </Label>
              }
              description="添付画像から金額と日付を読み取って仕訳の下書きを作ります。"
              trailing={<Switch id="set-ocr" />}
            />
            <ListRow
              align="start"
              overflow="wrap"
              title={<Label htmlFor="set-publish">取引先ポータルへの公開</Label>}
              description="保存に数秒かかります。通信中は loading のまま操作を受け付けません。"
              trailing={
                <Switch
                  id="set-publish"
                  checked={published}
                  onCheckedChange={savePublished}
                  loading={saving}
                />
              }
            />
            <ListRow
              align="start"
              overflow="wrap"
              title={<Label htmlFor="set-lock">会計期間のロック</Label>}
              description="決算確定済みのため解除できません。管理者に依頼してください。"
              trailing={<Switch id="set-lock" disabled defaultChecked />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ラベルの長さ · 2文字と3行が同じ列に並ぶ</CardTitle>
            <CardDescription>
              同じ設定群に2文字の見出しと3行に折り返す見出しが混ざる。つまみが1行目の中心に
              留まるかはここでしか分からない。揃っていないと、長い行だけトグルが沈んで見える。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field id="sw-len-short" label="税" description="一覧の金額を税抜で表示します">
                <Switch id="sw-len-short" defaultChecked />
              </Field>
              <Field
                id="sw-len-long"
                label="請求書の発行時に、取引先の経理担当窓口へ PDF を自動送付し、送付ログを電子帳簿保存法の要件に従って7年間保管する"
                description="送付先が未登録の取引先はスキップし、月次レポートに一覧で残します"
              >
                <Switch id="sw-len-long" />
              </Field>
              <Field id="sw-len-mid" label="自動保存" description="30秒ごとに下書きを保存します">
                <Switch id="sw-len-mid" defaultChecked />
              </Field>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>状態の一覧</CardTitle>
            <CardDescription>
              オフ / オン / 無効 / 無効かつオン / 保存中 / 不正。readOnly と indeterminate は Switch
              に存在しない。読み取り専用は disabled で表し、中間状態が要るなら Checkbox の
              indeterminate を使う。どれが操作できる行なのか、並べないと判別できない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field id="sw-state-off" label="オフ" description="既定値">
                <Switch id="sw-state-off" />
              </Field>
              <Field id="sw-state-on" label="オン" description="defaultChecked">
                <Switch id="sw-state-on" defaultChecked />
              </Field>
              <Field id="sw-state-disabled" label="無効" description="権限がありません">
                <Switch id="sw-state-disabled" disabled />
              </Field>
              <Field
                id="sw-state-disabled-on"
                label="無効かつオン"
                description="上位の設定で固定されています"
              >
                <Switch id="sw-state-disabled-on" disabled defaultChecked />
              </Field>
              <Field id="sw-state-loading" label="保存中" description="aria-busy / aria-disabled">
                <Switch id="sw-state-loading" loading defaultChecked />
              </Field>
              {/* 不正状態は Field の error スロットが持つ。role=alert のメッセージを出し、
                  制御に aria-invalid / aria-errormessage / aria-describedby を配線する。
                  description と error は競合せず、上下に積む。 */}
              <Field
                id="sw-state-invalid"
                label="電子帳簿保存に対応する"
                description="保存先を設定すると有効にできます"
                error="保存先のストレージが未設定のため有効にできません。"
              >
                <Switch id="sw-state-invalid" />
              </Field>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ラベル脇の補助 · labelAddon</CardTitle>
            <CardDescription>
              Badge のような非対話の印は label に直接置ける。押せる補助は labelAddon に渡す。 label
              は制御を指す本物の &lt;label htmlFor&gt; なので、その中に入れたボタンは
              押した瞬間にトグルを反転させる。labelAddon は label の外の兄弟として行内に並ぶ。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              {/* 非対話の addon は label の中で足りる。Label は ui-label の gap を持つ。 */}
              <Field
                id="sw-addon-badge"
                label={
                  <>
                    自動仕訳
                    <Badge as="span" tone="info">
                      ベータ
                    </Badge>
                  </>
                }
                description="学習済みの仕訳パターンから勘定科目を推定します"
              >
                <Switch id="sw-addon-badge" defaultChecked />
              </Field>
              {/* 押せる補助は labelAddon。label の外にあるので押してもトグルは動かない。 */}
              <Field
                id="sw-addon-help"
                label="源泉徴収の自動計算"
                description="報酬の支払時に源泉徴収額を自動で行に足します"
                labelAddon={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="源泉徴収の自動計算について"
                      >
                        <Icon as={CircleHelp} size="sm" tone="muted" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      税率は支払先の区分と支払額から決まります。確定値は請求書の明細に残ります。
                    </TooltipContent>
                  </Tooltip>
                }
              >
                <Switch id="sw-addon-help" />
              </Field>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>size · sm / md</CardTitle>
            <CardDescription>
              sm は一覧行やツールバーなど密度の高い場所、md (既定) は設定画面の行に使う。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field
                id="sw-size-sm"
                label="自動保存 (sm)"
                description="行の高さを抑えた一覧向けのサイズ"
              >
                <Switch id="sw-size-sm" size="sm" defaultChecked />
              </Field>
              <Field
                id="sw-size-md"
                label="自動保存 (md · 既定)"
                description="設定画面の標準サイズ"
              >
                <Switch id="sw-size-md" size="md" defaultChecked />
              </Field>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Ant Design axes · loading, checkedChildren</CardTitle>
            <CardDescription>
              loading は通信中の状態です。disabled ではなく aria-busy / aria-disabled
              を使います。disabled はタブ順から外れるため、保存中にキーボードの
              フォーカスが次の項目へ飛んでしまうからです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Field
                id="sw-loading"
                label="公開設定 (保存中)"
                description="通信が終わるまで操作を受け付けません"
              >
                <Switch id="sw-loading" loading defaultChecked />
              </Field>
              <Field
                id="sw-words-off"
                label="ラベル付き (オフ)"
                description="トラックの中に状態の語を表示します"
              >
                <Switch id="sw-words-off" checkedChildren="有効" unCheckedChildren="無効" />
              </Field>
              <Field
                id="sw-words-on"
                label="ラベル付き (オン)"
                description="語が入ってもつまみは端まで届きます"
              >
                <Switch
                  id="sw-words-on"
                  checkedChildren="有効"
                  unCheckedChildren="無効"
                  defaultChecked
                />
              </Field>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
