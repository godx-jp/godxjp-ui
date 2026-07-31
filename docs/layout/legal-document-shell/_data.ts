/**
 * Legal copy fixtures for the LegalDocumentShell pages.
 *
 * DATA ONLY (a `.ts` module, never a `.tsx` "kit") — the pages compose the real
 * `@godxjp/ui` primitives themselves, so a consumer can copy any page verbatim.
 * All legal text is CONSUMER-owned; the shell only receives it through `sections`.
 */

export type LegalSectionFixture = {
  id: string;
  title: string;
  paragraphs: string[];
};

/** Canonical JA terms-of-service document (SCR-005 shape). */
export const TERMS_JA: LegalSectionFixture[] = [
  {
    id: "acceptance",
    title: "第1条(本規約への同意)",
    paragraphs: [
      "本規約は、GodX 株式会社(以下「当社」といいます)が提供する各種サービス(以下「本サービス」といいます)の利用条件を定めるものです。利用者は、本サービスを利用することにより、本規約のすべての条項に同意したものとみなされます。",
      "当社は、必要と判断した場合には、利用者に事前に通知することなく本規約を変更することがあります。変更後の本規約は、当社所定のウェブサイトに掲示された時点から効力を生じるものとします。",
    ],
  },
  {
    id: "accounts",
    title: "第2条(アカウントの管理)",
    paragraphs: [
      "利用者は、自己の責任において、本サービスのアカウント情報を適切に管理するものとします。利用者は、いかなる場合にも、アカウントを第三者に譲渡または貸与することはできません。",
      "アカウント情報が第三者によって使用されたことによって生じた損害について、当社に故意または重大な過失がある場合を除き、当社は一切の責任を負いません。",
    ],
  },
  {
    id: "prohibited",
    title: "第3条(禁止事項)",
    paragraphs: [
      "利用者は、本サービスの利用にあたり、法令または公序良俗に違反する行為、当社もしくは第三者の知的財産権を侵害する行為、本サービスの運営を妨害するおそれのある行為を行ってはなりません。",
      "当社は、利用者が前項に違反したと判断した場合、事前の通知なく、当該利用者に対して本サービスの全部または一部の利用を停止することができます。",
    ],
  },
  {
    id: "data-retention",
    title: "第4条(データの保持期間)",
    paragraphs: [
      "当社は、会計関連法令および犯罪収益移転防止法に基づき、取引記録を取引終了日から7年間保持します。保持期間の経過後、当社は速やかに当該記録を削除または匿名化します。",
      "利用者は、いつでも自己の個人データの開示、訂正または削除を請求することができます。ただし、法令上の保持義務が優先する場合はこの限りではありません。",
    ],
  },
  {
    id: "third-party",
    title: "第5条(第三者サービスの利用)",
    paragraphs: [
      "本サービスは、決済、本人確認、通知配信などの目的で第三者のサービスを利用することがあります。当該第三者サービスの利用にあたっては、当該第三者が定める利用条件が別途適用されます。",
    ],
  },
  {
    id: "disclaimer",
    title: "第6条(免責事項)",
    paragraphs: [
      "当社は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。当社は、本サービスに起因して利用者に生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。",
    ],
  },
  {
    id: "governing-law",
    title: "第7条(準拠法および管轄裁判所)",
    paragraphs: [
      "本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。",
    ],
  },
  {
    id: "contact",
    title: "第8条(お問い合わせ窓口)",
    paragraphs: [
      "本規約に関するお問い合わせは、当社所定のお問い合わせフォームまたは legal@example.com までご連絡ください。",
    ],
  },
];

/**
 * Mixed-script wrapping fixture: the same document rendered with deliberately hostile
 * line-breaking material in JA (no spaces / kinsoku), EN (long compounds + a very long URL)
 * and VI (diacritic-heavy words that must never break mid-word).
 */
export const WRAPPING_MIXED: LegalSectionFixture[] = [
  {
    id: "ja-kinsoku",
    title: "日本語の長文セクション(禁則処理・行分割の確認)",
    paragraphs: [
      "当社は、個人情報の保護に関する法律その他の関係法令等を遵守し、利用者の個人情報を適正に取り扱うとともに、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じるものとします。",
      "「特定個人情報等」「要配慮個人情報」「仮名加工情報」「匿名加工情報」——これらの用語は、いずれも個人情報保護法に定義される意味を有し、句読点や括弧が行頭に来ないよう禁則処理が適用されます。",
    ],
  },
  {
    id: "en-long-compounds",
    title:
      "2. Cross-border data transfers, sub-processor notifications and telecommunications-infrastructure obligations",
    paragraphs: [
      "The Controller acknowledges that the Processor may engage sub-processors established outside the European Economic Area, provided that an adequacy decision, standard contractual clauses, or another transfer mechanism recognised under Chapter V of the General Data Protection Regulation is in place.",
      "The current sub-processor register is published at https://example.com/legal/sub-processors/register?revision=2026-04-01&format=machine-readable and is updated at least thirty calendar days before any addition takes effect.",
    ],
  },
  {
    id: "vi-dau-thanh",
    title: "3. Quyền riêng tư và nghĩa vụ bảo mật thông tin của người dùng",
    paragraphs: [
      "Chúng tôi chỉ thu thập những thông tin thực sự cần thiết để cung cấp dịch vụ, và tuyệt đối không chia sẻ dữ liệu cá nhân của bạn với bên thứ ba khi chưa nhận được sự đồng ý rõ ràng bằng văn bản.",
      "Người dùng có quyền yêu cầu truy cập, chỉnh sửa hoặc xoá dữ liệu cá nhân của mình bất cứ lúc nào, trừ trường hợp pháp luật hiện hành quy định nghĩa vụ lưu trữ bắt buộc đối với dữ liệu đó.",
    ],
  },
];
