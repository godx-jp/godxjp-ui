import { useRef, useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Upload, UploadCropDialog } from "@godxjp/ui/data-entry";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, PageContainer } from "@godxjp/ui/layout";

/**
 * UploadCropDialog — the square-crop step of an avatar flow, on its own.
 *
 * MOST SCREENS SHOULD NOT REACH FOR THIS. `<Upload variant="avatar-crop">` already embeds this
 * dialog and owns the picker, the object URL and the commit; mounting both double-mounts the
 * dialog. The standalone component exists for the case where the FILE ARRIVES FROM SOMEWHERE ELSE
 * — a drag-drop zone you already own, a paste handler, a file already on the server — and only the
 * crop step is wanted. That is the case this frame shows, beside the composed one for contrast.
 *
 * It is fully controlled: `open`, `file` and `onConfirm` are all required, and the dialog never
 * opens itself. It creates and revokes its own object URL, so a caller passes the raw `File` and
 * does NOT pre-create one. The result is always a 256×256 image/jpeg.
 */
export default function Demo() {
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  return (
    <PageContainer title="UploadCropDialog" subtitle="切り抜きだけを単体で使う場合">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>単体で使う</CardTitle>
            <CardDescription>
              ファイルの取得は呼び出し側の責任です。ここではブラウザのピッカーから受け取り、
              切り抜き結果だけをこのダイアログから受け取ります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Flex direction="row" gap="md" align="center" wrap>
                <Avatar size="lg">
                  {avatar ? <AvatarImage src={avatar} alt="切り抜いたプロフィール写真" /> : null}
                  <AvatarFallback>田</AvatarFallback>
                </Avatar>
                <Button onClick={() => pickerRef.current?.click()}>写真を選ぶ</Button>
              </Flex>

              {/* The picker is the CONSUMER's, not the dialog's — that is the whole point of using
                  this component standalone. It is hidden because the Button above is the affordance;
                  a visible raw control beside a godx Button would be two controls for one job. */}
              <input
                ref={pickerRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setCropFile(file);
                  // Clear the input so re-picking the SAME file fires change again.
                  event.target.value = "";
                }}
              />

              <Text size="sm" tone="muted" aria-live="polite">
                {lastResult ?? "まだ切り抜いていません。"}
              </Text>

              <UploadCropDialog
                open={cropFile !== null}
                // Always clear the held File on close, or the next open shows a stale image.
                onOpenChange={(open) => !open && setCropFile(null)}
                file={cropFile}
                onConfirm={(cropped) => {
                  setAvatar(URL.createObjectURL(cropped));
                  setLastResult(
                    `${cropped.name} · ${cropped.type} · ${Math.round(cropped.size / 1024)} KB`,
                  );
                }}
              />
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>通常はこちら</CardTitle>
            <CardDescription>
              `Upload variant="avatar-crop"` は同じダイアログを内部に持ち、ピッカーも
              オブジェクトURLも引き受けます。両方を同時に置いてはいけません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Upload variant="avatar-crop" accept="image/*" />
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
