import { useState } from "react";

import { Building2, CalendarDays, Hash, Link2, Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { FormField, Input, NumberInput, PasswordInput, SearchInput } from "@godxjp/ui/data-entry";
import { Icon, Text } from "@godxjp/ui/general";
import { Flex, PageContainer, ResponsiveGrid } from "@godxjp/ui/layout";

/**
 * Input — styled wrapper around the native input. Always pair with FormField for
 * a labelled, a11y-wired field. Never a raw <input>. Composed only from real
 * @godxjp/ui components.
 *
 * This page is deliberately long: a text field is trivial with a short placeholder
 * and an empty box, so every section below puts something in it that a real
 * enterprise form puts in it — a 40-character machine id, a three-line Japanese
 * label, an address that overflows the box, zero versus empty, Arabic.
 */
export default function Demo() {
  const [contractValue, setContractValue] = useState("制御値");
  const [emptyText, setEmptyText] = useState("");
  const [zeroText, setZeroText] = useState("0");
  const [emptyNumber, setEmptyNumber] = useState<number | null>(null);
  const [zeroNumber, setZeroNumber] = useState<number | null>(0);
  const [overflow, setOverflow] = useState(
    "東京都港区芝公園四丁目2番8号 東京タワーフットタウン3階 株式会社ゴドー商事 経理部 請求管理課",
  );
  const [partnerQuery, setPartnerQuery] = useState("ゴドー");

  return (
    <PageContainer
      title="Input"
      subtitle="Text field · pair with FormField for label / helper / error"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>サイズ · 高さラダー</CardTitle>
            <CardDescription>
              WHY: 一行に複数のコントロールが並ぶツールバーやフィルタ行では、高さが 1px
              でもずれると行が波打つ。横に並べて初めて段差が見える。Input の size は sm / md / lg
              の3段で、既定は md。NumberInput・Select・Button にある xs 段は Input
              の型にはまだ無い（末尾の「既知のギャップ」参照）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" gap="sm" align="center" wrap>
                <Flex width={140}>
                  <Input aria-label="小 (sm)" size="sm" defaultValue="sm · 小" />
                </Flex>
                <Flex width={140}>
                  <Input aria-label="標準 (md)" size="md" defaultValue="md · 標準" />
                </Flex>
                <Flex width={140}>
                  <Input aria-label="大 (lg)" size="lg" defaultValue="lg · 大" />
                </Flex>
              </Flex>
              <Text size="sm" tone="muted">
                同じ段をアフィックス付きでも揃える。prefix / addon
                は箱の高さを継承するので、段が変わっても行は揃ったまま。
              </Text>
              <Flex direction="row" gap="sm" align="center" wrap>
                <Flex width={180}>
                  <Input aria-label="小 (sm) 金額" size="sm" prefix="¥" defaultValue="12,000" />
                </Flex>
                <Flex width={180}>
                  <Input aria-label="標準 (md) 金額" size="md" prefix="¥" defaultValue="12,000" />
                </Flex>
                <Flex width={180}>
                  <Input aria-label="大 (lg) 金額" size="lg" prefix="¥" defaultValue="12,000" />
                </Flex>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>状態 · 既定 / 入力済み / disabled / readOnly</CardTitle>
            <CardDescription>
              WHY: disabled と readOnly を取り違えると、送信されるはずの値が消える。disabled
              は操作もフォーカスも送信もしない。readOnly
              はフォーカスでき、選択・コピーでき、値はそのまま送信される。空のフィールドに Tab
              で入るとフォーカスリングが出る（静的な画面では再現できないので自分で試すこと）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input aria-label="プレースホルダー状態" placeholder="株式会社ゴドー商事" />
              <Input aria-label="入力済み状態" defaultValue="株式会社ゴドー商事" />
              <Input aria-label="無効状態" disabled defaultValue="無効 (disabled) · 送信されない" />
              <Input
                aria-label="読み取り専用状態"
                readOnly
                defaultValue="読み取り専用 (readOnly) · 送信される"
              />
              <Input
                aria-label="不正な値の状態"
                aria-invalid
                defaultValue="不正な値 (aria-invalid)"
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>検証状態 · error / warning / success / validating</CardTitle>
            <CardDescription>
              WHY: 赤い枠だけでは「何が悪いのか」は伝わらない。error は枠と文言の両方が要る。success
              と validating（サーバー照会中）は Input の status には無く、FormField の
              validateStatus + hasFeedback
              が持つ。理由は非対称ではなく分担で、アイコン付きフィードバックの欄は FormField
              の持ち物だから。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField
                id="state-error"
                label="メールアドレス"
                required
                error="メールアドレスの形式が正しくありません"
              >
                <Input id="state-error" type="email" defaultValue="keiri@godo-shoji" />
              </FormField>
              <FormField
                id="state-warning"
                label="請求先メールアドレス"
                validateStatus="warning"
                hasFeedback
                helper="フリーメールは請求書の到達率が下がる場合がある"
              >
                <Input id="state-warning" type="email" defaultValue="godo.keiri@example.com" />
              </FormField>
              <FormField
                id="state-success"
                label="法人番号"
                validateStatus="success"
                hasFeedback
                helper="国税庁の法人番号システムと照合済み"
              >
                <Input id="state-success" defaultValue="7010001008844" inputMode="numeric" />
              </FormField>
              <FormField
                id="state-validating"
                label="サブドメイン"
                validateStatus="validating"
                hasFeedback
                helper="使用可能かどうかを照会中"
              >
                <Input id="state-validating" addonAfter=".godx.jp" defaultValue="godo-shoji" />
              </FormField>
              <Text size="sm" tone="muted">
                status は Input が自分で塗る2値（error / warning）。error だけが aria-invalid
                も立てるので、赤い枠とスクリーンリーダーが聞く内容が一致する。
              </Text>
              <Input aria-label="status=error" status="error" defaultValue="status=error" />
              <Input aria-label="status=warning" status="warning" defaultValue="status=warning" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>アフィックス · 箱の内側 (prefix / suffix)</CardTitle>
            <CardDescription>
              WHY: 単位のない数字は読み手に単位を推測させる。prefix / suffix
              は箱のパディングの内側に入るので、値と同じ一つの塊に見える。prefix は aria-hidden
              ではない（単位は意味であって装飾ではない）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input aria-label="金額 (prefix)" prefix="¥" defaultValue="1,234,567" />
              <Input aria-label="割引率 (suffix)" suffix="%" defaultValue="15" />
              <Input
                aria-label="税込金額 (prefix + suffix)"
                prefix="¥"
                suffix="円"
                defaultValue="12,000"
              />
              <Input aria-label="重量" suffix="kg" defaultValue="18.5" />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>アドオン · 箱の外側 (addonBefore / addonAfter)</CardTitle>
            <CardDescription>
              WHY: プロトコルやドメイン接尾辞はユーザーが打つ値ではない。addon
              は独立した面として境界の外側に溶接され、接合側の角を閉じる。つまり「打つ場所」と「打たない場所」が形で分かれる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input
                aria-label="サイトURL"
                addonBefore="https://"
                addonAfter=".co.jp"
                defaultValue="godo-shoji"
              />
              <Input
                aria-label="社内ポータル"
                addonBefore="https://"
                defaultValue="portal.godx.jp/invoice"
              />
              <Input
                aria-label="メール (ドメイン固定)"
                addonAfter="@godo-shoji.co.jp"
                defaultValue="keiri"
              />
              <Input
                aria-label="単価 (アドオンとアフィックスの併用)"
                addonBefore="¥"
                addonAfter="/ 件"
                prefix={<Icon as={Hash} size="sm" tone="muted" />}
                defaultValue="480"
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>アイコンとクリア · 先頭・末尾は1つずつ</CardTitle>
            <CardDescription>
              WHY: 末尾のスロットは1つしかない。allowClear に値があるとき、クリアの✕は設定した
              trailingIcon
              を「置き換える」。両方が同時に出ることはない。これを知らずに自前の✕を重ねると二重になる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input
                aria-label="先頭アイコンのみ"
                leadingIcon={<Icon as={Building2} size="sm" tone="muted" />}
                placeholder="取引先名で絞り込む"
              />
              <Input
                aria-label="末尾アイコンのみ"
                trailingIcon={<Icon as={CalendarDays} size="sm" tone="muted" />}
                defaultValue="2026-09-30"
                readOnly
              />
              <Input
                aria-label="先頭と末尾の両方"
                leadingIcon={<Icon as={Mail} size="sm" tone="muted" />}
                trailingIcon={<Icon as={Hash} size="sm" tone="muted" />}
                defaultValue="keiri@godo-shoji.co.jp"
              />
              <Input
                aria-label="制御されたクリア可能入力"
                value={contractValue}
                onValueChange={setContractValue}
                allowClear
                onClear={() => setContractValue("")}
                leadingIcon={<Icon as={Building2} size="sm" tone="muted" />}
              />
              <Input
                aria-label="非制御のクリア可能入力"
                defaultValue="INV-2026-0912-0031"
                allowClear
                trailingIcon={<Icon as={Hash} size="sm" tone="muted" />}
              />
              <Text size="sm" tone="muted">
                すぐ上の2つは値を持っているので、設定した trailingIcon ではなく✕が出ている。✕
                で空にすると trailingIcon が戻る。
              </Text>
              <Input
                aria-label="文字数カウンタ"
                count={{ max: 20 }}
                defaultValue="東京都の請求書"
                placeholder="件名"
              />
              <Input aria-label="文字数超過" count={{ max: 5 }} defaultValue="長すぎる件名です" />
              <Text size="sm" tone="muted">
                カウンタは超過を「報告」するだけで、値を切らない。入力中の IME
                変換を途中で刈り取らないための判断。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>実データの型 · メール / 電話 / 郵便番号 / URL / 機械ID</CardTitle>
            <CardDescription>
              WHY: type と inputMode
              はモバイルのキーボードと自動入力を決める。既定の文字キーボードで電話番号を打たせるのは設計の放棄。40
              文字の機械 ID は箱より長いので、ここで初めて「はみ出したらどうなるか」が見える。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="ct-email" label="担当者メールアドレス" required>
                <Input
                  id="ct-email"
                  type="email"
                  name="contact_email"
                  autoComplete="email"
                  leadingIcon={<Icon as={Mail} size="sm" tone="muted" />}
                  defaultValue="keiri@godo-shoji.co.jp"
                />
              </FormField>
              <FormField id="ct-tel" label="代表電話番号" helper="市外局番から半角で入力">
                <Input
                  id="ct-tel"
                  type="tel"
                  name="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  leadingIcon={<Icon as={Phone} size="sm" tone="muted" />}
                  defaultValue="03-6205-3371"
                />
              </FormField>
              <FormField id="ct-postal" label="郵便番号" helper="ハイフンなし7桁でも可">
                <Input
                  id="ct-postal"
                  name="postal_code"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  leadingIcon={<Icon as={MapPin} size="sm" tone="muted" />}
                  addonBefore="〒"
                  defaultValue="105-0011"
                />
              </FormField>
              <FormField id="ct-url" label="会社サイト">
                <Input
                  id="ct-url"
                  type="url"
                  name="website"
                  autoComplete="url"
                  leadingIcon={<Icon as={Link2} size="sm" tone="muted" />}
                  addonBefore="https://"
                  defaultValue="www.godo-shoji.co.jp"
                />
              </FormField>
              <FormField
                id="ct-machine"
                label="連携キー"
                helper="40文字。箱より長い値は折り返さず、箱の中で横スクロールする"
              >
                <Input
                  id="ct-machine"
                  name="integration_key"
                  readOnly
                  allowClear={false}
                  className="font-mono"
                  defaultValue="a3f9c1e07b2d4856ab10ef93cd77420159be8d36"
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>数値と金額 · 桁が動かないこと</CardTitle>
            <CardDescription>
              WHY:
              金額を縦に並べたとき、プロポーショナル数字だと桁の位置が1行ごとにずれて比較できない。Input
              には tabular
              プロップが無いので等幅数字はクラスで足している（既知のギャップ）。刻み・クランプ・ロケール整形が要るなら
              Input ではなく NumberInput が正解。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  Input · 等幅数字なし（桁が揃わない）
                </Text>
                <Input aria-label="金額 (等幅なし) 1" prefix="¥" defaultValue="1,234,567" />
                <Input aria-label="金額 (等幅なし) 2" prefix="¥" defaultValue="9,888,111" />
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  Input · 等幅数字あり（桁が揃う）
                </Text>
                <Input
                  aria-label="金額 (等幅あり) 1"
                  prefix="¥"
                  className="tabular-nums"
                  defaultValue="1,234,567"
                />
                <Input
                  aria-label="金額 (等幅あり) 2"
                  prefix="¥"
                  className="tabular-nums"
                  defaultValue="9,888,111"
                />
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  NumberInput · ステッパー・クランプ・Intl 整形つき
                </Text>
                <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md" align="start">
                  <FormField id="num-amount" label="請求金額">
                    <NumberInput
                      id="num-amount"
                      value={zeroNumber}
                      onValueChange={setZeroNumber}
                      min={0}
                      step={1000}
                      prefix="¥"
                    />
                  </FormField>
                  <FormField id="num-rate" label="割引率">
                    <NumberInput
                      id="num-rate"
                      value={emptyNumber}
                      onValueChange={setEmptyNumber}
                      min={0}
                      max={100}
                      step={5}
                      suffix="%"
                      placeholder="未設定"
                    />
                  </FormField>
                </ResponsiveGrid>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>専用コンポーネントに譲る場面</CardTitle>
            <CardDescription>
              WHY: Input
              で代用すると必ず何かが抜ける。パスワードなら表示切替・CapsLock・autocomplete
              契約、検索ならデバウンスとクリアと role=searchbox。3つとも自前実装では落ちる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField id="pw-current" label="現在のパスワード" required>
                <PasswordInput
                  id="pw-current"
                  name="current_password"
                  autoComplete="current-password"
                  placeholder="パスワードを入力"
                />
              </FormField>
              <FormField id="pw-api" label="APIシークレット" helper="発行後は再表示できない">
                <PasswordInput
                  id="pw-api"
                  name="api_secret"
                  autoComplete="new-password"
                  defaultValue="sk_live_9f2c41ab77de"
                />
              </FormField>
              <SearchInput
                label="取引先を検索"
                value={partnerQuery}
                onValueChange={setPartnerQuery}
                onSearch={setPartnerQuery}
                placeholder="取引先名・法人番号で検索"
              />
              <Text size="sm" tone="muted">
                逆に、フォーム送信で name を伴う検索欄なら SearchInput ではなく FormField + Input
                が正しい。SearchInput は値を送らないフィルタ用のウィジェット。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>幅の振る舞い · 箱は常に親の幅を埋める</CardTitle>
            <CardDescription>
              WHY: Input に width プロップは無い（既知のギャップ）。箱は必ず親を 100%
              埋めるので、幅を決めるのは常に外側のレイアウト。これを知らないと「なぜツールバーで巨大になるのか」が分からない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  フォームの中 · 全幅（FormField がそのまま親を埋める）
                </Text>
                <FormField id="w-full" label="取引先名" required helper="最大50文字">
                  <Input id="w-full" placeholder="株式会社ゴドー商事" />
                </FormField>
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  ツールバーの中 · 内容に合わせて親側で詰める
                </Text>
                <Flex direction="row" gap="sm" align="center" wrap>
                  <Flex width={220}>
                    <Input aria-label="請求番号で絞り込む" size="sm" placeholder="請求番号" />
                  </Flex>
                  <Flex width={120}>
                    <Input aria-label="年度" size="sm" defaultValue="2026" inputMode="numeric" />
                  </Flex>
                  <Flex width={160}>
                    <Input aria-label="担当者コード" size="sm" placeholder="担当者コード" />
                  </Flex>
                </Flex>
              </Flex>
              <Flex direction="col" gap="xs">
                <Text size="sm" tone="muted">
                  短い項目と長い項目を同じ行に · 比率は親のグリッドが決める
                </Text>
                <ResponsiveGrid columns={{ base: 1, md: 4 }} gap="md" align="start">
                  <FormField id="w-short" label="階数" helper="数字のみ">
                    <Input id="w-short" inputMode="numeric" defaultValue="3" />
                  </FormField>
                  <FormField id="w-long" label="建物名・部屋番号" colSpan={3}>
                    <Input id="w-long" defaultValue="東京タワーフットタウン 経理部 請求管理課" />
                  </FormField>
                </ResponsiveGrid>
              </Flex>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ストレス · 箱に収まらない値</CardTitle>
            <CardDescription>
              WHY: 実務の住所・部署名は必ず箱より長い。Input
              は単一行なので折り返さず、省略記号も付けず、箱の中で横スクロールする。フォーカスを抜けると先頭に戻る。長さが問題になるなら
              Textarea か、値を全部見せる Descriptions に譲る判断が要る。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField
                id="stress-overflow"
                label="請求書送付先"
                helper="46文字。末尾までキャレットを送ると先頭が隠れる"
              >
                <Input
                  id="stress-overflow"
                  value={overflow}
                  onValueChange={setOverflow}
                  allowClear
                  onClear={() => setOverflow("")}
                />
              </FormField>
              <FormField id="stress-overflow-sm" label="同じ値を sm の箱で">
                <Input id="stress-overflow-sm" size="sm" readOnly defaultValue={overflow} />
              </FormField>
              <FormField
                id="stress-overflow-addon"
                label="アドオンがあると箱はさらに狭くなる"
                helper="addon は固定幅を取り、残りが入力領域になる"
              >
                <Input
                  id="stress-overflow-addon"
                  addonBefore="送付先"
                  addonAfter="宛"
                  readOnly
                  defaultValue={overflow}
                />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ストレス · 空とゼロは別物</CardTitle>
            <CardDescription>
              WHY:
              「0」と「未入力」を同じものとして扱うと、値引き0円と値引き未定の区別が消える。テキストの
              Input では空文字が「未入力」、&quot;0&quot; は入力済み。NumberInput では null
              が「未入力」で、0 に置き換えてはいけない。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <ResponsiveGrid columns={{ base: 1, md: 2 }} gap="md" align="start">
                <FormField
                  id="empty-text"
                  label="値引き額（テキスト）"
                  helper={
                    emptyText === "" ? "現在の値: 空文字（未入力）" : `現在の値: ${emptyText}`
                  }
                >
                  <Input
                    id="empty-text"
                    value={emptyText}
                    onValueChange={setEmptyText}
                    prefix="¥"
                    placeholder="未入力"
                    allowClear
                  />
                </FormField>
                <FormField
                  id="zero-text"
                  label="値引き額（0が入っている）"
                  helper={zeroText === "" ? "現在の値: 空文字（未入力）" : `現在の値: ${zeroText}`}
                >
                  <Input
                    id="zero-text"
                    value={zeroText}
                    onValueChange={setZeroText}
                    prefix="¥"
                    placeholder="未入力"
                    allowClear
                  />
                </FormField>
              </ResponsiveGrid>
              <Text size="sm" tone="muted">
                プレースホルダーが見えている側が「未入力」。✕
                で空にすると、両者は見た目でも状態でも同じになる。
              </Text>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ストレス · ラベルの長さが揃わない行</CardTitle>
            <CardDescription>
              WHY:
              日本語のラベルは2文字にも3行にもなる。ラベル行が伸びても入力欄の上端が揃うのは、行の
              align が start で、各セルが独立して縦に伸びるから。center
              にすると短いラベルの箱が下がって崩れる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid columns={{ base: 1, md: 3 }} gap="md" align="start">
              <FormField id="label-short" label="都道" helper="2文字ラベル">
                <Input id="label-short" defaultValue="東京都" />
              </FormField>
              <FormField
                id="label-long"
                label="請求書の送付先として登録されている経理担当部署の正式名称"
                helper="3行になるラベル"
              >
                <Input id="label-long" defaultValue="経理部 請求管理課" />
              </FormField>
              <FormField id="label-mid" label="内線番号" helper="4桁">
                <Input id="label-mid" inputMode="numeric" defaultValue="4182" />
              </FormField>
            </ResponsiveGrid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>ストレス · RTL</CardTitle>
            <CardDescription>
              WHY: prefix / addonBefore
              は「開始側」であって「左」ではない。論理プロパティで書かれているので
              dir=&quot;rtl&quot;
              で自動的に右端へ移る。物理方向のクラスを1つでも混ぜると、ここで崩れる。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md" dir="rtl" lang="ar">
              <FormField id="rtl-name" label="اسم الشركة" required>
                <Input
                  id="rtl-name"
                  defaultValue="شركة غودو التجارية"
                  leadingIcon={<Icon as={Building2} size="sm" tone="muted" />}
                  allowClear
                />
              </FormField>
              <FormField id="rtl-site" label="الموقع الإلكتروني">
                <Input
                  id="rtl-site"
                  addonBefore="https://"
                  addonAfter=".sa"
                  defaultValue="godo-shoji"
                />
              </FormField>
              <FormField id="rtl-rate" label="نسبة الخصم">
                <Input id="rtl-rate" prefix="%" suffix="خصم" defaultValue="15" />
              </FormField>
              <FormField id="rtl-subject" label="الموضوع">
                <Input id="rtl-subject" count={{ max: 20 }} defaultValue="فاتورة سبتمبر" />
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>chrome の段 · variant</CardTitle>
            <CardDescription>
              WHY: 既に枠を描いている面（テーブルのセル、カードの中の小さな箱）に outlined
              を入れると線が二重になる。borderless はその場合の答えで、密なフォームでは filled
              が境界の数を減らす。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Input aria-label="枠線あり" variant="outlined" defaultValue="outlined · 既定" />
              <Input
                aria-label="塗りつぶし"
                variant="filled"
                defaultValue="filled · 密なフォーム"
              />
              <Input
                aria-label="枠線なし"
                variant="borderless"
                defaultValue="borderless · 既に枠のある面の中"
              />
              <Input
                aria-label="塗りつぶし・エラー"
                variant="filled"
                status="error"
                defaultValue="filled + status=error"
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>既知のギャップ</CardTitle>
            <CardDescription>
              このページを書いている途中で見つかった、Input 側の穴。回避策で隠さずここに書いておく。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="sm">
              <Text size="sm">
                1. size に xs 段が無い。NumberInput・Select・Button は xs を受けるのに InputProp は
                sm / md / lg だけ。CSS 側には .ui-control[data-size=&quot;xs&quot;] も
                --control-height-xs もあるので、塞がっているのは型だけ。
              </Text>
              <Text size="sm">
                2. tabular プロップが無い。Text と Badge は tabular を持つのに、金額を縦に並べる
                Input と NumberInput は等幅数字をクラスで足すしかない。
              </Text>
              <Text size="sm">
                3. width プロップが無い。箱は常に親を 100%
                埋めるので、ツールバーでは必ず外側に幅を持つ箱が要る。
              </Text>
              <Text size="sm">
                4. status に success / validating が無い。FormField の validateStatus + hasFeedback
                で足りてはいるが、ラベルの無い裸の Input では成功も照会中も表現できない。
              </Text>
            </Flex>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
