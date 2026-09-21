import { useState } from "react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Field, FormField, RadioGroup, RadioItem } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/** 配送時間帯 · 選択肢が2〜4個を超えたときの見え方を確かめるための実データ。 */
const DELIVERY_SLOTS = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
  "18:00-20:00",
  "20:00-21:00",
];

const CLOSING_DAYS = ["5日", "10日", "15日", "20日", "25日", "月末"];

/**
 * RadioGroup — 2–4 mutually-exclusive choices, all visible at once (use Select
 * when the list is long or must collapse). Data-driven via an options array.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [controlled, setControlled] = useState("email");
  const [plan, setPlan] = useState("business");

  return (
    <PageContainer
      title="RadioGroup"
      subtitle="Mutually-exclusive choices, all visible · options array"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Vertical</CardTitle>
            <CardDescription>The default stacked layout.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="taxed"
              options={[
                { value: "taxed", label: "税抜" },
                { value: "included", label: "税込" },
                { value: "exempt", label: "非課税" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>選択肢ごとの説明 · プラン選択</CardTitle>
            <CardDescription>
              options[].description が各行に付く。料金や条件を選択肢の外に書くと、どの行の
              説明なのかが読み手側の推測になる。末尾の Badge は label を ReactNode にして
              入れる。Badge は押せないのでラベルのクリック判定を壊さない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              name="plan"
              value={plan}
              onValueChange={setPlan}
              options={[
                {
                  value: "standard",
                  label: "スタンダード",
                  description: "月額 4,800 円 · 5ユーザーまで · メールサポート",
                },
                {
                  value: "business",
                  label: (
                    <>
                      ビジネス
                      <Badge as="span" tone="info">
                        推奨
                      </Badge>
                    </>
                  ),
                  description: "月額 12,000 円 · 30ユーザーまで · 監査ログと権限テンプレート",
                },
                {
                  value: "enterprise",
                  label: "エンタープライズ",
                  description: "個別見積 · SAML SSO · 専任担当とSLA",
                },
                {
                  value: "legacy",
                  label: "ライト (新規受付終了)",
                  disabled: true,
                  description: "既存契約のみ継続。移行先はスタンダードです",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ラベルの長さ · 2文字と3行が同じ群に並ぶ</CardTitle>
            <CardDescription>
              短いラベルと折り返す長いラベルが同居する。丸は1行目の中心に留まり、2行目以降は
              ラベル列の中で折り返す。ここが崩れると、長い選択肢だけ丸が沈んで列が波打つ。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="short"
              options={[
                { value: "short", label: "税" },
                { value: "mid", label: "手数料を按分する" },
                {
                  value: "long",
                  label:
                    "取引先ごとに設定された端数処理の規則を優先し、規則が未設定の取引先についてのみ、この画面で選んだ既定の規則を適用する",
                  description: "規則の上書きは監査ログに残ります",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>optionType=&quot;button&quot; · 箱型の選択</CardTitle>
            <CardDescription>
              箱で選ばせたいときはこれが唯一の描画。カード型ラジオという別コンポーネントは
              無い。role は radiogroup / radio のままなので、矢印キーの移動も name での送信も
              変わらない。buttonStyle は選択中の塗りだけを決める。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <RadioGroup
                defaultValue="month"
                optionType="button"
                options={[
                  { value: "day", label: "日次" },
                  { value: "week", label: "週次" },
                  { value: "month", label: "月次" },
                ]}
              />
              <RadioGroup
                defaultValue="pdf"
                optionType="button"
                buttonStyle="solid"
                options={[
                  { value: "pdf", label: "PDF" },
                  { value: "csv", label: "CSV" },
                  { value: "xlsx", label: "Excel" },
                  { value: "print", label: "印刷", disabled: true },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>選択肢が多いとき</CardTitle>
            <CardDescription>
              13件を横並びにした形。全件が見えるので比較はできるが、この量になると走査に時間が
              かかり、Select のほうが速い。RadioGroup は「全部見せる価値がある2〜4件」が本来の
              間合い。限界の見え方を置いておかないと、どこで乗り換えるべきか判断できない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              name="delivery_slot"
              defaultValue="10:00-12:00"
              orientation="horizontal"
              options={[
                ...DELIVERY_SLOTS.map((slot) => ({ value: slot, label: slot })),
                ...CLOSING_DAYS.map((day) => ({ value: day, label: `${day}締め` })),
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>選択肢が1つだけ</CardTitle>
            <CardDescription>
              一度選ぶと解除できない。選択の取り消しが要るなら Checkbox、即時に効く オン・オフなら
              Switch が正しい。1件のラジオを置いてしまう事故は、この見え方を 知らないまま起きる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              name="verification"
              options={[
                {
                  value: "verified",
                  label: "本人確認済みとして登録する",
                  description: "解除するには管理者への申請が必要です",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>FormField · 必須とエラー</CardTitle>
            <CardDescription>
              radiogroup は widget なので、aria-invalid / aria-errormessage / aria-required
              まで含めた検証の配線を FormField がそのまま渡せる。エラー文は role=alert で
              読み上げられる。readOnly は RadioGroup に無く、変更させない群は disabled で表す。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="closing-day" label="締め日" required error="締め日を選択してください">
                <RadioGroup
                  id="closing-day"
                  name="closing_day"
                  orientation="horizontal"
                  options={CLOSING_DAYS.map((day) => ({ value: day, label: day }))}
                />
              </FormField>
              <FormField
                id="tax-rounding"
                label="消費税の端数処理"
                helper="取引先との契約に合わせて選びます"
              >
                <RadioGroup
                  id="tax-rounding"
                  name="tax_rounding"
                  defaultValue="floor"
                  orientation="horizontal"
                  options={[
                    { value: "round", label: "四捨五入" },
                    { value: "floor", label: "切り捨て" },
                    { value: "ceil", label: "切り上げ" },
                  ]}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Controlled · named · disabled</CardTitle>
            <CardDescription>
              Controlled callback and native form name with disabled options.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              className="contract-radio-group"
              name="notification_channel"
              value={controlled}
              onValueChange={setControlled}
              options={[
                { value: "email", label: "メール" },
                { value: "sms", label: "SMS" },
                { value: "push", label: "プッシュ", disabled: true },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Disabled group · custom children</CardTitle>
            <CardDescription>
              The children composition remains labelled and non-interactive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup disabled defaultValue="locked">
              <Field id="radio-locked" label="確定済み">
                <RadioItem id="radio-locked" value="locked" />
              </Field>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Horizontal</CardTitle>
            <CardDescription>orientation=“horizontal” for compact rows.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue="round"
              orientation="horizontal"
              options={[
                { value: "round", label: "四捨五入" },
                { value: "floor", label: "切り捨て" },
                { value: "ceil", label: "切り上げ" },
              ]}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
