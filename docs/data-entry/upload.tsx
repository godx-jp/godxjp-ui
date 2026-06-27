import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Upload, type UploadFileItem } from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * Upload — drag-and-drop / button / avatar / picture file uploader (6 variants).
 * Wire onUpload to your media-service; call collectUploadCommitActions on submit.
 * UploadCropDialog is embedded internally by variant="avatar-crop" — not a public import.
 * Composed only from real @godxjp/ui components.
 */

/** No-op uploader: resolves immediately with a fake mediaId for preview purposes. */
async function noopUpload(_file: File, _item: UploadFileItem) {
  return { mediaId: "preview-media-id" };
}

export default function Demo() {
  const [dropzoneItems, setDropzoneItems] = useState<UploadFileItem[]>([]);
  const [buttonItems, setButtonItems] = useState<UploadFileItem[]>([]);
  const [pictureCardItems, setPictureCardItems] = useState<UploadFileItem[]>([]);
  const [pictureItem, setPictureItem] = useState<UploadFileItem[]>([]);
  const [avatarItem, setAvatarItem] = useState<UploadFileItem[]>([]);
  const [avatarCropItem, setAvatarCropItem] = useState<UploadFileItem[]>([]);

  return (
    <PageContainer
      title="Upload"
      subtitle="ファイルアップロード · 6バリアント（dropzone / button / picture-card / picture / avatar / avatar-crop）"
    >
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle>Dropzone</CardTitle>
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
              maxCount={5}
              maxSizeBytes={20 * 1024 * 1024}
              onUpload={noopUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Button</CardTitle>
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
              onUpload={noopUpload}
            >
              CSVをインポート
            </Upload>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Picture Card</CardTitle>
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
              onUpload={noopUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Picture</CardTitle>
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
              onUpload={noopUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>円形の単一画像ピッカー · ユーザーアイコン変更に使用。</CardDescription>
          </CardHeader>
          <CardContent>
            <Upload
              variant="avatar"
              value={avatarItem}
              onValueChange={setAvatarItem}
              accept="image/*"
              onUpload={noopUpload}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avatar Crop</CardTitle>
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
              onUpload={noopUpload}
            />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
