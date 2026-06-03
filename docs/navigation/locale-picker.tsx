import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { LocalePicker } from "@godxjp/ui/navigation";
import type { AppLocale } from "@godxjp/ui/app";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * LocalePicker — 言語セレクター。AppProvider なしで使う場合は controlled
 * モード (value + onValueChange) が必須。AppLocale は "vi" | "en" | "ja"。
 * 言語アイコン付き Select として構成済み — 手書き <select> 不要。
 * Composed only from real @godxjp/ui components.
 */
export default function Demo() {
  const [locale, setLocale] = useState<AppLocale>("ja");
  const [formLocale, setFormLocale] = useState<AppLocale>("en");

  return (
    <PageContainer
      title="LocalePicker"
      subtitle="言語セレクター — AppProvider なしで controlled モードで動作"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>言語切り替え（コントロール済み）</CardTitle>
            <CardDescription>
              value + onValueChange で制御。AppProvider なしで単独レンダリング可能。 選択中:{" "}
              {locale}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="locale-picker-main" className="text-sm font-medium">
                表示言語
              </label>
              <LocalePicker id="locale-picker-main" value={locale} onValueChange={setLocale} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ユーザープロフィール設定フォーム</CardTitle>
            <CardDescription>
              設定フォーム内でサーバーに送信する言語設定を選択する例。 選択中: {formLocale}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-w-xs flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="locale-picker-form" className="text-sm font-medium">
                  インターフェース言語
                </label>
                <LocalePicker
                  id="locale-picker-form"
                  value={formLocale}
                  onValueChange={setFormLocale}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                選択した言語はアカウントに保存され、次回ログイン時にも反映されます。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>無効状態</CardTitle>
            <CardDescription>disabled プロパティで操作を無効化できます。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="locale-picker-disabled"
                className="text-muted-foreground text-sm font-medium"
              >
                表示言語（読み取り専用）
              </label>
              <LocalePicker
                id="locale-picker-disabled"
                value="ja"
                onValueChange={() => {}}
                disabled
              />
            </div>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
