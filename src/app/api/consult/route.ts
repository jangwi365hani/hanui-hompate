import { NextResponse } from "next/server";
import { sql, ensureSchema, DbNotConfiguredError } from "@/lib/db";
import { isAdminPassword } from "@/lib/community";
import { postToMessenger, formatPhone } from "@/lib/messenger";

/**
 * 상담신청 — 화면 하단 고정 폼.
 *
 * 커뮤니티와 달리 로그인 없이 이름·연락처를 받는다. 그래서
 *  - 동의(agree)를 받지 않으면 저장하지 않는다.
 *  - 목록·수정·삭제는 대표원장 비밀번호로만 연다(직원 비밀번호로는 안 열린다).
 *  - 삭제는 실제 DELETE 다. 회신이 끝난 건은 지워서 개인정보를 남기지 않는다.
 */

export const SUBJECTS = [
  "성장", "디스크·통증", "다이어트", "여성", "비염", "소화", "피로·항노화",
  "안면마비·중풍", "방문진료", "기타",
] as const;

function dbError(e: unknown) {
  if (e instanceof DbNotConfiguredError) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
  console.error("[consult]", e);
  return NextResponse.json({ error: "처리 중 오류가 발생했습니다." }, { status: 500 });
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/** 숫자만 남긴 전화번호. 010으로 시작하는 10~11자리, 또는 지역번호 9~11자리를 받는다. */
function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.length < 9 || d.length > 11) return null;
  if (!/^0/.test(d)) return null;
  return d;
}

/** 신청 접수 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (body.agree !== true) {
    return NextResponse.json(
      { error: "개인정보 수집·이용에 동의해 주세요." },
      { status: 400 }
    );
  }

  const name = String(body.name || "").trim().slice(0, 20);
  const phone = normalizePhone(String(body.phone || ""));
  const subject = SUBJECTS.includes(String(body.subject) as (typeof SUBJECTS)[number])
    ? String(body.subject)
    : "";
  const message = String(body.message || "").trim().slice(0, 1000);
  const source = String(body.source || "").trim().slice(0, 120);

  if (name.length < 2) {
    return NextResponse.json({ error: "이름을 입력해 주세요." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "연락처를 정확히 입력해 주세요." }, { status: 400 });
  }

  try {
    await ensureSchema();

    // 도배 방지 — 같은 번호로 1분 안에 다시 넣는 것만 막는다.
    const recent = await sql`
      SELECT 1 FROM consult_requests
       WHERE phone = ${phone} AND created_at > now() - interval '1 minute'
       LIMIT 1
    `;
    if (recent.length) {
      return NextResponse.json(
        { error: "방금 신청이 접수되었습니다. 잠시만 기다려 주세요." },
        { status: 429 }
      );
    }

    await sql`
      INSERT INTO consult_requests (subject, name, phone, message, source)
           VALUES (${subject}, ${name}, ${phone}, ${message}, ${source})
    `;

    // 팀 메신저 알림 — 실패해도 환자에게는 접수 성공으로 응답한다(이미 저장됐으므로).
    await postToMessenger(
      [
        "🖐 홈페이지 상담신청이 접수되었습니다.",
        `· 이름: ${name}`,
        `· 연락처: ${formatPhone(phone)}`,
        `· 과목: ${subject || "미선택"}`,
        message ? `· 내용: ${message.slice(0, 200)}` : "· 내용: (없음)",
        "",
        "확인·처리: jangwi365.com/admin → 상담신청",
      ].join("\n")
    ).catch(() => false);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return dbError(e);
  }
}

/** 관리자 목록 */
export async function GET(req: Request) {
  if (!isAdminPassword(req.headers.get("x-admin-password"))) return unauthorized();

  try {
    await ensureSchema();
    const rows = await sql`
      SELECT id, subject, name, phone, message, status, memo, source, created_at, handled_at
        FROM consult_requests
       ORDER BY (status = 'new') DESC, created_at DESC
       LIMIT 300
    `;
    return NextResponse.json(
      {
        items: rows.map((r) => ({
          id: Number(r.id),
          subject: String(r.subject ?? ""),
          name: String(r.name ?? ""),
          phone: String(r.phone ?? ""),
          message: String(r.message ?? ""),
          status: String(r.status ?? "new"),
          memo: String(r.memo ?? ""),
          source: String(r.source ?? ""),
          createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
        })),
        newCount: rows.filter((r) => r.status === "new").length,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return dbError(e);
  }
}

/** 처리 상태·메모 변경 */
export async function PATCH(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!isAdminPassword(body.password)) return unauthorized();

  const id = Number(body.id);
  const status = String(body.status || "");
  const memo = String(body.memo ?? "").slice(0, 500);
  if (!Number.isInteger(id) || !["new", "done", "spam"].includes(status)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const rows = await sql`
      UPDATE consult_requests
         SET status = ${status},
             memo = ${memo},
             handled_at = CASE WHEN ${status} = 'new' THEN NULL ELSE now() END
       WHERE id = ${id}
       RETURNING id
    `;
    if (!rows.length) return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return dbError(e);
  }
}

/** 파기 — 상태 변경이 아니라 실제 삭제다. 회신이 끝나면 눌러서 개인정보를 남기지 않는다. */
export async function DELETE(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!isAdminPassword(body.password)) return unauthorized();

  const id = Number(body.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    await ensureSchema();
    await sql`DELETE FROM consult_requests WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return dbError(e);
  }
}
