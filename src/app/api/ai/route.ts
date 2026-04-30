import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jw5416200227!";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `당신은 장위365경희한의원의 건강 칼럼 작성을 돕는 전문 의료 콘텐츠 작가입니다.
한의원 원장님들이 환자와 독자들을 위해 쓰는 건강 칼럼을 작성합니다.

작성 원칙:
- 전문적이지만 읽기 쉬운 친근한 문체로 작성
- 한의학적 관점과 현대적 이해를 균형 있게 서술
- 독자가 직접 실천할 수 있는 내용 포함
- 과도한 의학적 주장이나 치료 보장 표현 지양
- 자연스러운 단락 구분, 줄바꿈으로 가독성 확보
- 한국어로 작성`;

export async function POST(req: Request) {
  const body = await req.json();
  const { password, mode, topic, currentContent, title } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  let userPrompt = "";

  if (mode === "draft") {
    userPrompt = `다음 주제로 한의원 건강 칼럼 초안을 작성해주세요.

제목: ${title || topic}
주제/키워드: ${topic}

800~1200자 분량으로, 도입부 → 본론(2~3단락) → 마무리 구조로 작성해주세요.`;
  } else if (mode === "expand") {
    userPrompt = `다음 칼럼 내용을 더 풍부하게 보완해주세요.

제목: ${title || ""}
현재 내용:
${currentContent}

내용을 자연스럽게 확장하고, 구체적인 예시나 한의학적 설명을 추가해주세요.`;
  } else if (mode === "polish") {
    userPrompt = `다음 칼럼 내용의 문체와 표현을 다듬어 주세요.

제목: ${title || ""}
현재 내용:
${currentContent}

내용은 그대로 유지하면서 더 자연스럽고 전문적인 문체로 다듬어주세요.`;
  } else if (mode === "summary") {
    userPrompt = `다음 칼럼 내용을 3~4문장으로 요약해주세요.

${currentContent}`;
  }

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
