import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import {
  Form,
  FormField,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@godxjp/ui/data-entry";
import { Flex, PageContainer } from "@godxjp/ui/layout";

const REGIONS = [
  { value: "tokyo", label: "東京都千代田区丸の内第一営業本部" },
  { value: "hcm", label: "Thành phố Hồ Chí Minh – Văn phòng điều hành khu vực phía Nam" },
  { value: "danang", label: "Đà Nẵng", disabled: true },
];

/** Exhaustive supported Select states. Async loading/empty/error live in the main Select frame. */
export default function Demo() {
  const [controlled, setControlled] = useState("tokyo");
  const [searchable, setSearchable] = useState("hcm");

  return (
    <PageContainer title="Select matrix" subtitle="Primitive · data API · state · locale · layout">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>Compound primitive · complete anatomy</CardTitle>
            <CardDescription>
              Group, label, separator, disabled item, controlled value, sm/md trigger and portalled
              content. Radix owns keyboard focus and collision handling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <FormField
                id="compound-controlled"
                label="Controlled priority"
                helper="Arrow keys move between enabled options"
              >
                <Select value={controlled} onValueChange={setControlled}>
                  <SelectTrigger id="compound-controlled" size="sm">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent collisionPadding={16}>
                    <SelectGroup>
                      <SelectLabel>日本</SelectLabel>
                      <SelectItem value="tokyo">東京</SelectItem>
                      <SelectItem value="osaka">大阪</SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Việt Nam</SelectLabel>
                      <SelectItem value="hcm">Thành phố Hồ Chí Minh</SelectItem>
                      <SelectItem value="danang" disabled>
                        Đà Nẵng（利用不可）
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="compound-uncontrolled" label="Uncontrolled default">
                <Select defaultValue="osaka">
                  <SelectTrigger id="compound-uncontrolled" size="md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={8} collisionPadding={24}>
                    <SelectItem value="tokyo">東京</SelectItem>
                    <SelectItem value="osaka">大阪</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="compound-disabled" label="Disabled control">
                <Select defaultValue="tokyo" disabled>
                  <SelectTrigger id="compound-disabled">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokyo">東京</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </Flex>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Non-search / search API boundary</CardTitle>
            <CardDescription>
              Without showSearch/loadOptions the data API delegates to Radix Select: grouping,
              disabled options, renderOption, name and controlled/uncontrolled values are supported.
              clearable, search/loading/empty/error messages and selected-value renderers belong to
              the searchable engine; this frame does not imply parity where the implementation has
              none. SearchSelect itself is internal and is not a package-barrel component export.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Data-driven · long JA/VI and disabled option</CardTitle>
            <CardDescription>
              Long labels truncate without widening the page. The disabled option remains visible
              but cannot be selected; name creates a native hidden form value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form columns={2} density="compact">
              <FormField id="long-controlled" label="Controlled" helper="日本語・Tiếng Việt の長文">
                <Select
                  id="long-controlled"
                  name="region"
                  value={controlled}
                  onValueChange={setControlled}
                  options={REGIONS}
                />
              </FormField>
              <FormField id="long-uncontrolled" label="Uncontrolled" required>
                <Select
                  id="long-uncontrolled"
                  name="region_default"
                  defaultValue="hcm"
                  options={REGIONS}
                />
              </FormField>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Searchable · FormField validation contract</CardTitle>
            <CardDescription>
              The searchable trigger receives FormField label, helper, required, invalid and error
              references. The internal search textbox has its own visible-purpose accessible name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              id="searchable-invalid"
              label="担当拠点"
              required
              helper="名称で検索できます"
              error="担当拠点を確認してください"
            >
              <Select
                id="searchable-invalid"
                name="searchable_region"
                value={searchable}
                onValueChange={setSearchable}
                showSearch
                searchPlaceholder="拠点を検索 / Tìm văn phòng"
                clearLabel="選択をクリア"
                options={REGIONS}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>RTL and collision boundary</CardTitle>
            <CardDescription>
              Logical spacing mirrors under dir=rtl. The portalled panel uses Radix collision
              padding near the inline edge instead of overflowing the viewport.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div dir="rtl" className="ms-auto w-full max-w-sm">
              <FormField id="rtl-select" label="المنطقة" helper="اختر منطقة التشغيل">
                <Select
                  id="rtl-select"
                  defaultValue="riyadh"
                  options={[
                    { value: "riyadh", label: "الرياض" },
                    { value: "jeddah", label: "جدة" },
                  ]}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle level={2}>Supported async boundary</CardTitle>
            <CardDescription>
              The main Select frame demonstrates loading, resolved-empty and rejected loaders.
              Re-querying or reopening retries the loader; there is currently no explicit
              retry-button prop, so this matrix does not invent one.
            </CardDescription>
          </CardHeader>
        </Card>
      </Flex>
    </PageContainer>
  );
}
