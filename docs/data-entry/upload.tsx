import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  Form,
  Upload,
  type UploadFileItem,
  type UploadRequestContext,
} from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Upload — drag-and-drop / button / avatar / picture file uploader (6 variants).
 * Wire onUpload to your media-service; call collectUploadCommitActions on submit.
 * UploadCropDialog is embedded internally by variant="avatar-crop" — not a public import.
 * Composed only from real @godxjp/ui components.
 */

/** Simulated transport: progress, abort, and retry remain observable in the preview. */
async function demoUpload(file: File, _item: UploadFileItem, context: UploadRequestContext) {
  for (let percent = 0; percent <= 100; percent += 20) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    context.signal.throwIfAborted();
    context.onProgress(percent);
  }
  if (file.name.startsWith("fail")) throw new Error("アップロードに失敗しました。再試行できます。");
  return { mediaId: crypto.randomUUID() };
}

export default function Demo() {
  const [submittedFiles, setSubmittedFiles] = useState<string[]>([]);
  const [dropzoneItems, setDropzoneItems] = useState<UploadFileItem[]>([]);
  const [buttonItems, setButtonItems] = useState<UploadFileItem[]>([]);
  const [pictureCardItems, setPictureCardItems] = useState<UploadFileItem[]>([]);
  const [pictureItem, setPictureItem] = useState<UploadFileItem[]>([]);
  const [avatarItem, setAvatarItem] = useState<UploadFileItem[]>([]);
  const [avatarCropItem, setAvatarCropItem] = useState<UploadFileItem[]>([]);
  const failedItems: UploadFileItem[] = [
    {
      uid: "failed-invoice",
      name: "invoice-too-large.pdf",
      size: 25 * 1024 * 1024,
      mimeType: "application/pdf",
      status: "error",
      error: "20 MB 以下のファイルを選択してください",
    },
  ];

  return (
    <PageContainer
      title="Upload"
      subtitle="ファイルアップロード · 6バリアント（dropzone / button / picture-card / picture / avatar / avatar-crop）"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Multipart form</CardTitle>
            <CardDescription>
              選択・ドロップ・貼り付けしたファイルをフォームでまとめて送信します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              onReset={() => setSubmittedFiles([])}
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSubmittedFiles(
                  data
                    .getAll("attachments[]")
                    .filter((value): value is File => value instanceof File)
                    .map((value) => value.name),
                );
              }}
            >
              <Upload name="attachments[]" pastable maxCount={3} />
              <Button type="submit">添付ファイルを確認</Button>
              <Button type="reset" variant="outline">
                リセット
              </Button>
              <Text>{submittedFiles.join("、")}</Text>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Dropzone</CardTitle>
            <CardDescription>
              ドラッグ＆ドロップエリア · PDF・Excel などの書類添付に使用。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Upload
              variant="dropzone"
              value={dropzoneItems}
              onValueChange={setDropzoneItems}
              accept=".pdf,.xlsx,.csv"
              pastable
              maxCount={5}
              maxSizeBytes={20 * 1024 * 1024}
              onUpload={demoUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Error and recovery</CardTitle>
            <CardDescription>
              失敗したファイルは再試行できます。処理中のファイルはキャンセルできます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Upload variant="button" value={failedItems} onValueChange={() => {}} removable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Disabled · populated</CardTitle>
            <CardDescription>
              権限不足時も既存ファイル名を保ったまま操作を無効化する。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Upload variant="button" value={failedItems} onValueChange={() => {}} disabled />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Button</CardTitle>
            <CardDescription>
              コンパクトなボタン形式 · CSVインポートなどの管理画面向け。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Upload
              variant="button"
              value={buttonItems}
              onValueChange={setButtonItems}
              accept=".csv"
              onUpload={demoUpload}
            >
              CSVをインポート
            </Upload>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Picture Card</CardTitle>
            <CardDescription>
              96×96 サムネイルグリッド · 商品ギャラリーや画像一覧に使用。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Upload
              variant="picture-card"
              value={pictureCardItems}
              onValueChange={setPictureCardItems}
              accept="image/*"
              maxCount={6}
              onUpload={demoUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Picture</CardTitle>
            <CardDescription>
              単一画像プレビュー · コンテンツのカバー画像選択に使用。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Upload
              variant="picture"
              value={pictureItem}
              onValueChange={setPictureItem}
              accept="image/*"
              maxCount={1}
              onUpload={demoUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Avatar</CardTitle>
            <CardDescription>円形の単一画像ピッカー · ユーザーアイコン変更に使用。</CardDescription>
          </CardHeader>
          <CardContent>
            <Upload
              variant="avatar"
              value={avatarItem}
              onValueChange={setAvatarItem}
              accept="image/*"
              onUpload={demoUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Avatar Crop</CardTitle>
            <CardDescription>
              アバター選択後にトリミングダイアログを開く。UploadCropDialog は
              内部モーダルとして自動で埋め込まれるため、個別インポート不要。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Upload
              variant="avatar-crop"
              value={avatarCropItem}
              onValueChange={setAvatarCropItem}
              accept="image/*"
              maxSizeBytes={5 * 1024 * 1024}
              onUpload={demoUpload}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
