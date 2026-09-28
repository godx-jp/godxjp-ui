import { chromium } from "playwright";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppProvider } from "../../../app/app-provider";
import { CheckboxGroup } from "../checkbox-group";
import { Form } from "../form";
import { FormField } from "../form-field";
import { Input } from "../input";
import { RadioGroup } from "../radio";
import { Select } from "../select";
import { Switch } from "../switch";
import { Textarea } from "../textarea";
import { compileRealCss } from "./compile-real-css";

const COPY = {
  vi: {
    input: "Tên",
    select: "Nhóm",
    textarea: "Ghi chú",
    note: "Chữ ký",
    sw: "Nhận thư",
    swHelp: "Gửi thông báo khi có thư mới",
    radio: "Ngôn ngữ",
    one: "Kênh",
    check: "Quyền",
    body: "Dòng một\nDòng hai",
  },
  ja: {
    input: "氏名",
    select: "グループ",
    textarea: "備考",
    note: "署名",
    sw: "受信",
    swHelp: "新着メールを通知します",
    radio: "言語",
    one: "経路",
    check: "権限",
    body: "一行目\n二行目",
  },
} as const;

function formMarkup(locale: "vi" | "ja") {
  const c = COPY[locale];
  return renderToStaticMarkup(
    <AppProvider defaultLocale={locale} persist={false}>
      <Form layout="horizontal" labelWidth="10rem" controlWidth="36rem">
        <FormField id="f-input" label={c.input}>
          <Input defaultValue="Nguyễn Văn A" />
        </FormField>
        <FormField id="f-select" label={c.select}>
          <Select
            value="a"
            onValueChange={() => {}}
            options={[{ value: "a", label: "Khách hàng" }]}
          />
        </FormField>
        <FormField id="f-textarea" label={c.textarea}>
          <Textarea rows={4} defaultValue={c.body} />
        </FormField>
        {/* allowClear wraps the textarea in its affix span — the same first line. */}
        <FormField id="f-textarea-clear" label={c.note}>
          <Textarea rows={3} allowClear defaultValue={c.body} />
        </FormField>
        <FormField id="f-switch" label={c.sw}>
          <Switch defaultChecked />
        </FormField>
        {/* The reported case: a helper makes the control column taller than the band. */}
        <FormField id="f-switch-helper" label={c.sw} helper={c.swHelp}>
          <Switch defaultChecked />
        </FormField>
        <FormField id="f-radio" label={c.radio}>
          <RadioGroup
            orientation="vertical"
            defaultValue="vi"
            options={[
              { value: "vi", label: "Tiếng Việt", description: "Mặc định cho tài khoản mới" },
              { value: "ja", label: "日本語", description: "Dùng cho khách hàng Nhật" },
            ]}
          />
        </FormField>
        {/* One short option is SHORTER than the band — it must land on the same line too. */}
        <FormField id="f-radio-one" label={c.one}>
          <RadioGroup orientation="vertical" options={[{ value: "mail", label: "Email" }]} />
        </FormField>
        <FormField id="f-checkbox-group" label={c.check}>
          <CheckboxGroup
            orientation="vertical"
            options={[
              { value: "read", label: "Read" },
              { value: "write", label: "Write" },
            ]}
          />
        </FormField>
      </Form>
    </AppProvider>,
  );
}

async function measure(locale: "vi" | "ja") {
  const markup = formMarkup(locale);
  const css = await compileRealCss(markup);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1142, height: 805 } });
    await page.setContent(
      `<!doctype html><html lang="${locale}"><head><style>${css}</style></head><body>${markup}</body></html>`,
    );
    return await page.evaluate(() => {
      const textCenter = (el: Element) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) => (n.textContent!.trim() ? 1 : 3),
        });
        const node = walker.nextNode();
        if (!node) return NaN;
        const range = document.createRange();
        range.setStart(node, 0);
        range.setEnd(node, 1);
        const r = range.getClientRects()[0]!;
        return r.top + r.height / 2;
      };
      const boxCenter = (el: Element) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      };
      const out: Record<string, { label: number; control: number }> = {};
      for (const field of document.querySelectorAll<HTMLElement>(".ui-form-field")) {
        const label = textCenter(field.querySelector(".ui-form-field-label")!);
        const ctl = field.querySelector(".ui-form-field-control")!;
        let control: number;
        const ta = ctl.querySelector("textarea");
        const sw = ctl.querySelector('[data-slot="switch"]');
        const input = ctl.querySelector("input:not([type=hidden]):not([type=radio])");
        const group = ctl.querySelector(".ui-choice-group");
        if (ta) {
          const cs = getComputedStyle(ta);
          control =
            ta.getBoundingClientRect().top +
            parseFloat(cs.borderTopWidth) +
            parseFloat(cs.paddingTop) +
            parseFloat(cs.lineHeight) / 2;
        } else if (sw) control = boxCenter(sw);
        else if (group) control = textCenter(group);
        else if (input) control = boxCenter(input);
        else control = textCenter(ctl);
        out[field.querySelector(".ui-form-field-label [id]")!.id] = { label, control };
      }
      return out;
    });
  } finally {
    await browser.close();
  }
}

describe("FormField horizontal — label first line = control first line (gh#1024, Chromium)", () => {
  for (const locale of ["vi", "ja"] as const) {
    it(`every control, locale ${locale}`, async () => {
      const m = await measure(locale);
      expect(Object.keys(m)).toHaveLength(9);
      for (const [id, { label, control }] of Object.entries(m)) {
        expect(
          Math.abs(label - control),
          `${id}: label ${label} vs control ${control}`,
        ).toBeLessThanOrEqual(1);
      }
    });
  }
});
