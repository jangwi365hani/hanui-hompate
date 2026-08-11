import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";
import { checkAdRisk } from "./medical-ad-check";

/**
 * 상담문의 자동 1차 안내.
 *
 * 환자가 상담문의를 올리면 곧바로 안내 답변을 달아 준다. 목적은 **내원 유도**지만,
 * 그 전에 지켜야 할 선이 있다.
 *
 *  1) 진단·처방을 하지 않는다. 글만 보고 병명을 말하거나 치료법을 확정하지 않는다.
 *  2) 효과를 보장하지 않는다(의료법 제56조). 생성된 답변은 medical-ad-check 로 한 번 더
 *     걸러, 위험 표현이 있으면 안전한 기본 문구로 대체한다.
 *  3) **자동 안내임을 밝힌다.** 작성자 이름을 "장위365경희한의원 (자동 안내)" 로 두는 이유다.
 *     환자가 원장이 직접 답한 것으로 오해하면 그 자체가 문제가 된다.
 *  4) 응급 징후(가슴 통증, 마비, 실신 등)가 보이면 내원 권유 대신 응급실·119 안내를 우선한다.
 *
 * ANTHROPIC_API_KEY 가 없거나 호출이 실패하면 기본 문구로 답변한다(답변이 아예 없는 것보다 낫다).
 */

export const AUTO_REPLY_AUTHOR = "장위365경희한의원 (자동 안내)";

const SYSTEM = `당신은 서울 성북구 장위동 '장위365경희한의원'의 상담 안내 담당자입니다.
홈페이지 상담문의에 다는 **1차 안내 답변**을 작성합니다.

[병원 정보]
- 평일 10:00~13:00 / 14:00~21:00, 토·일·공휴일 10:00~13:00 / 14:00~17:00 (연중무휴)
- 6호선 돌곶이역 도보 5분, 주차 가능, 한의사 5인 진료
- 전화 02-6952-2800, 네이버 예약 가능
- 클리닉: 디스크·협착증, 다이어트, 여성, 비염, 항노화, 소아 성장, 만성 소화불량, 안면마비·중풍
- 원내 검사: 초음파(알피니언 XC90E), 체성분, 혈액검사, 체형측정, 성장판 확인
- 치료 수단은 한약·침·약침·추나·뜸입니다. **성장호르몬 주사는 하지 않습니다.**

[반드시 지킬 것]
- 진단하지 마세요. 병명을 단정하거나 "~입니다"라고 확정하지 마세요.
- 치료 효과를 보장하거나 기간을 단정하지 마세요. "완치", "100%", "부작용 없음", "최고/최상/유일" 같은 표현 금지.
- 다른 병원을 비교하거나 언급하지 마세요.
- 비용은 "검사 항목과 상태에 따라 달라 내원 시 안내드립니다" 수준으로만 답하세요.
- 가슴 통증, 갑작스러운 마비·언어장애, 실신, 심한 외상, 고열 등 응급이 의심되면
  내원 권유보다 **119·응급실 안내를 먼저** 하세요.

[답변 방식]
- 목표는 내원(또는 전화 예약)으로 이어지는 것입니다. 다만 억지로 끌지 말고,
  "왜 내원이 필요한지"를 납득되게 설명하세요 — 글만으로는 확인할 수 없는 것이 무엇인지,
  내원하면 무엇을 확인해 드리는지(검사·진찰 항목)를 구체적으로 적으세요.
- 문의 내용에 실제로 반응하세요. 일반론만 늘어놓지 말고 환자가 쓴 상황을 다시 짚어 주세요.
- 3~5문장, 존댓말, 한 문단 또는 두 문단. 인사로 시작해 안내로 끝냅니다.
- 마지막에 예약 방법(전화 02-6952-2800 또는 네이버 예약)과 진료시간 중 필요한 것만 덧붙이세요.
- 머리말·꼬리말 없이 답변 본문만 출력하세요.`;

/** 호출 실패·표현 위험 시 쓰는 안전한 기본 답변 */
function fallbackReply(): string {
  return [
    "안녕하세요, 장위365경희한의원입니다. 문의 주셔서 감사합니다.",
    "글에 적어주신 내용만으로는 원인을 확인하기 어려워, 진료실에서 직접 살펴보는 것이 정확합니다.",
    "내원하시면 상태에 따라 초음파·체성분 등 필요한 검사를 함께 보고 원장이 직접 안내해 드립니다.",
    "예약은 전화(02-6952-2800) 또는 네이버 예약으로 가능하며, 평일은 21시까지, 주말·공휴일에도 진료합니다.",
  ].join(" ");
}

async function generate(title: string, content: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackReply();

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 1024,
    // 짧은 안내문이라 깊은 추론이 필요 없다. 비용·응답시간을 낮춘다.
    output_config: { effort: "low" },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `환자가 남긴 상담문의입니다.\n\n제목: ${title || "(제목 없음)"}\n내용: ${content}`,
      },
    ],
  });

  // 안전 분류기가 거절하면 content 가 비어 있을 수 있다. 먼저 확인한다.
  if (response.stop_reason === "refusal") return fallbackReply();

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (text.length < 20) return fallbackReply();

  // 생성된 문장을 의료광고 기준으로 한 번 더 검사한다. 고위험 표현이 있으면 쓰지 않는다.
  const risky = checkAdRisk(text).some((h) => h.level === "high");
  return risky ? fallbackReply() : text;
}

/**
 * 상담문의에 자동 답변을 단다.
 * 글 등록 응답을 늦추지 않도록 호출부에서 await 하지 않아도 되게 만들었고,
 * 어떤 실패도 밖으로 던지지 않는다.
 */
export async function autoReplyToInquiry(
  postId: number,
  title: string,
  content: string
): Promise<void> {
  try {
    const body = await generate(title, content).catch(() => fallbackReply());
    await sql`
      INSERT INTO community_replies (post_id, body, author_name)
           VALUES (${postId}, ${body}, ${AUTO_REPLY_AUTHOR})
    `;
  } catch (e) {
    console.error("[auto-reply]", e);
  }
}
