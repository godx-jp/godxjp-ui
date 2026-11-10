import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Form, Field, FormField, RadioGroup, RadioItem, SearchInput } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";
import { useTranslation } from "@godxjp/ui/i18n";

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

/** 組織を選択 · optionType="card" と見出し付きセクションの実データ。 */
const ORGANIZATIONS = [
  { value: "acme", name: "株式会社アクメ", role: "owner", members: 12, lastUsed: true },
  { value: "globex", name: "グロービクス合同会社", role: "member", members: 4, lastUsed: false },
  { value: "initech", name: "イニテック", role: "viewer", members: 31, lastUsed: false },
] as const;

/** The signed-in person, whose initial marks the personal workspace. */
const VIEWER_NAME = "田中 さくら";

/**
 * RadioGroup — 2–4 mutually-exclusive choices, all visible at once (use Select
 * when the list is long or must collapse). Data-driven via an options array.
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const { t, locale } = useTranslation();
  const yen = new Intl.NumberFormat(locale, { style: "currency", currency: "JPY" });
  const [controlled, setControlled] = useState("email");
  const [plan, setPlan] = useState("business");
  const [context, setContext] = useState<string | null>(null);
  const [orgQuery, setOrgQuery] = useState("");
  // Filtering is the consumer's: match however the product needs, and keep the chosen option in
  // the list so the selection never disappears while the user types.
  const visibleOrgs = ORGANIZATIONS.filter(
    (org) => org.value === context || org.name.includes(orgQuery.trim()),
  );

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
            <CardTitle level={2}>{t("radioGroupDocs.plan.title")}</CardTitle>
            <CardDescription>{t("radioGroupDocs.plan.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              name="plan"
              value={plan}
              onValueChange={setPlan}
              options={[
                {
                  value: "standard",
                  label: t("radioGroupDocs.plan.standard"),
                  description: t("radioGroupDocs.plan.standardDescription", {
                    price: yen.format(4800),
                    users: 5,
                  }),
                },
                {
                  value: "business",
                  label: (
                    <>
                      {t("radioGroupDocs.plan.business")}
                      <Badge as="span" tone="info">
                        {t("radioGroupDocs.plan.recommended")}
                      </Badge>
                    </>
                  ),
                  description: t("radioGroupDocs.plan.businessDescription", {
                    price: yen.format(12000),
                    users: 30,
                  }),
                },
                {
                  value: "enterprise",
                  label: t("radioGroupDocs.plan.enterprise"),
                  description: t("radioGroupDocs.plan.enterpriseDescription"),
                },
                {
                  value: "legacy",
                  label: t("radioGroupDocs.plan.legacy"),
                  disabled: true,
                  description: t("radioGroupDocs.plan.legacyDescription"),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("radioGroupDocs.org.title")}</CardTitle>
            <CardDescription>{t("radioGroupDocs.org.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <SearchInput
                aria-label={t("radioGroupDocs.org.filterLabel")}
                placeholder={t("radioGroupDocs.org.filterPlaceholder")}
                value={orgQuery}
                onValueChange={setOrgQuery}
              />
              <RadioGroup
                aria-label={t("radioGroupDocs.org.choose")}
                name="context"
                optionType="card"
                value={context}
                onValueChange={setContext}
                options={[
                  {
                    label: t("radioGroupDocs.org.section", { count: visibleOrgs.length }),
                    options: visibleOrgs.map((org) => ({
                      value: org.value,
                      label: org.name,
                      description: `${t(`radioGroupDocs.org.role.${org.role}`)} · ${t(
                        "radioGroupDocs.org.members",
                        { count: org.members },
                      )}`,
                      leading: (
                        <Avatar shape="square">
                          <AvatarFallback>{org.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                      ),
                      extra: org.lastUsed ? (
                        <Badge as="span">{t("radioGroupDocs.org.lastUsed")}</Badge>
                      ) : undefined,
                    })),
                  },
                  {
                    label: t("radioGroupDocs.org.personal"),
                    appearance: "muted",
                    options: [
                      {
                        value: "personal",
                        label: t("radioGroupDocs.org.personalWorkspace"),
                        description: t("radioGroupDocs.org.personalDescription"),
                        leading: (
                          <Avatar>
                            <AvatarFallback>{VIEWER_NAME.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        ),
                      },
                    ],
                  },
                ]}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>{t("radioGroupDocs.accordion.title")}</CardTitle>
            <CardDescription>{t("radioGroupDocs.accordion.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" defaultValue="shipping">
              <AccordionItem value="shipping">
                <AccordionTrigger>{t("radioGroupDocs.accordion.shipping")}</AccordionTrigger>
                <AccordionContent>
                  <RadioGroup
                    aria-label={t("radioGroupDocs.accordion.shipping")}
                    optionType="card"
                    defaultValue="air"
                    options={[
                      {
                        value: "air",
                        label: t("radioGroupDocs.accordion.air"),
                        description: t("radioGroupDocs.accordion.days", { min: 3, max: 5 }),
                      },
                      {
                        value: "sea",
                        label: t("radioGroupDocs.accordion.sea"),
                        description: t("radioGroupDocs.accordion.days", { min: 14, max: 21 }),
                      },
                      {
                        value: "express",
                        label: t("radioGroupDocs.accordion.express"),
                        description: t("radioGroupDocs.accordion.nextDay"),
                        disabled: true,
                      },
                    ]}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
              箱を横に溶接して選ばせる描画。カード型の行は optionType=&quot;card&quot; で、
              どちらも別コンポーネントではない。role は radiogroup / radio
              のままなので、矢印キーの移動も name での送信も 変わらない。buttonStyle
              は選択中の塗りだけを決める。
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
            <Form>
              <Flex direction="col" gap="md">
                <FormField
                  id="closing-day"
                  label="締め日"
                  required
                  error="締め日を選択してください"
                >
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
            </Form>
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
