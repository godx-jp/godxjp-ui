import { describe, expect, it } from "vitest";

import { SKILLS, findSkill, isConsumerSkill, routeTask } from "./data/skills-index.js";

/*
 * Hợp đồng cứng chỉ có tác dụng nếu agent THẬT SỰ nhận được nó.
 *
 * Kho này có 22 tài liệu và 85 mục skill — thừa hướng dẫn, không thiếu. Vấn đề
 * đo được là agent hỏi router MỘT lần rồi làm theo thứ đầu tiên nó nhận, và
 * thứ đó xưa nay là một skill về gu thẩm mỹ. Mã ra đẹp mà sai hợp đồng, audit
 * đỏ, không ai hiểu vì sao.
 *
 * Bộ test này canh đường ĐI của hướng dẫn, không canh nội dung của nó.
 */
describe("hợp đồng cứng — agent phải nhận được nó", () => {
  it("là skill dành cho người tiêu dùng", () => {
    const contract = findSkill("contract");

    expect(contract).toBeDefined();
    expect(isConsumerSkill(contract!)).toBe(true);
  });

  it("đứng ĐẦU danh sách, nên list_consumer_skills trả nó trước", () => {
    expect(SKILLS.filter(isConsumerSkill)[0]?.id).toBe("contract");
  });

  it.each([
    ["khoảng cách giữa hai thẻ", "spacing"],
    ["how do i build a page", "bố cục"],
    ["gap 20px", "bậc số"],
    ["dựng form đăng nhập", "form"],
    ["màu chữ phụ", "màu"],
  ])("định tuyến %j tới hợp đồng TRƯỚC mọi skill về gu", (task) => {
    const hits = routeTask(task, { consumerOnly: true });

    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.skill).toBe("contract");
  });

  it("mục quy trình đưa ra LỆNH chạy được", () => {
    /*
     * `loop` là mục duy nhất không phải một luật — nó là quy trình. Thứ nó nợ
     * agent không phải một cặp SAI/ĐÚNG mà là một lệnh gõ được, vì bỏ đúng
     * bước audit là cách mọi lệch design lọt tới review.
     */
    expect(findSkill("contract")!.sections[0]!.id).toBe("loop");
    expect(findSkill("contract")!.sections[0]!.body).toContain("ui-audit.mjs");
  });

  it("mỗi mục LUẬT nêu cổng sẽ đỏ, và chỉ ra nước đi hợp lệ", () => {
    /*
     * Một luật không nói ra hậu quả thì là một lời khuyên, và lời khuyên thì
     * agent bỏ qua khi nó vướng. Mỗi mục luật phải nêu tên cổng CI VÀ đưa một
     * cặp SAI/ĐÚNG chạy được — không phải một trong hai.
     */
    const rules = findSkill("contract")!.sections.filter((s) => s.id !== "loop");

    expect(rules.length).toBeGreaterThan(3);

    for (const section of rules) {
      expect(
        /Cổng đỏ nếu sai:|cửa thoát|ĐỪNG dùng/.test(section.body),
        `cổng — "${section.id}"`,
      ).toBe(true);
      expect(/ĐÚNG[:\s]/.test(section.body), `ví dụ — "${section.id}"`).toBe(true);
    }
  });
});
