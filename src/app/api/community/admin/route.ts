import { NextResponse } from "next/server";
import { isAdminPassword, listAllForAdmin } from "@/lib/community";
import { sql, ensureSchema, DbNotConfiguredError } from "@/lib/db";
import { checkAdRisk } from "@/lib/medical-ad-check";
import type { PostKind } from "@/lib/community-types";

/**
 * 커뮤니티 관리 API.
 * 저장소의 다른 관리 API와 같이 비밀번호를 요청 본문/헤더로 받는다.
 * (관리자 페이지가 세션 없이 비밀번호를 들고 다니는 기존 구조를 그대로 따른다)
 */

function dbError(e: unknown) {
  if (e instanceof DbNotConfiguredError) {
    return NextResponse.json({ error: "커뮤니티 준비 중입니다. (DATABASE_URL 미설정)" }, { status: 503 });
  }
  console.error("[community/admin]", e);
  return NextResponse.json({ error: "처리 중 오류가 발생했습니다." }, { status: 500 });
}

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/** 목록 — 검토 대기 글이 위로 온다. 각 글에 의료광고 위험 표현을 함께 실어 보낸다. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  // GET은 본문을 못 실으므로 헤더로 받는다(주소창·로그에 비밀번호가 남지 않게)
  if (!isAdminPassword(req.headers.get("x-admin-password"))) return unauthorized();

  const kindParam = url.searchParams.get("kind") || "all";
  const kind = (["review", "inquiry"].includes(kindParam) ? kindParam : "all") as PostKind | "all";

  try {
    const posts = await listAllForAdmin(kind);
    const withRisk = posts.map((p) => ({ ...p, adRisk: checkAdRisk(`${p.title}\n${p.content}`) }));
    return NextResponse.json(
      { posts: withRisk, pendingCount: posts.filter((p) => p.status === "pending").length },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return dbError(e);
  }
}

/** 상태 변경 — 승인(published)/보류(rejected)/숨김(hidden). */
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
  const memo = String(body.memo || "").slice(0, 500);
  if (!Number.isInteger(id) || !["published", "rejected", "hidden", "pending"].includes(status)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const rows = await sql`
      UPDATE community_posts
         SET status = ${status}, reject_memo = ${memo}, updated_at = now()
       WHERE id = ${id} AND deleted_at IS NULL
       RETURNING id, status
    `;
    if (!rows.length) return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ ok: true, status: rows[0].status });
  } catch (e) {
    return dbError(e);
  }
}

/** 답변 등록 — 상담문의 답변, 후기에 대한 감사 인사 모두 이 경로를 쓴다. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!isAdminPassword(body.password)) return unauthorized();

  const postId = Number(body.postId);
  const text = String(body.body || "").trim().slice(0, 3000);
  const authorName = String(body.authorName || "").trim().slice(0, 40) || "장위365경희한의원";
  if (!Number.isInteger(postId) || text.length < 2) {
    return NextResponse.json({ error: "답변 내용을 입력해 주세요." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const target = await sql`
      SELECT id FROM community_posts WHERE id = ${postId} AND deleted_at IS NULL LIMIT 1
    `;
    if (!target.length) return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });

    const rows = await sql`
      INSERT INTO community_replies (post_id, body, author_name)
           VALUES (${postId}, ${text}, ${authorName})
        RETURNING id
    `;
    return NextResponse.json({ ok: true, id: Number(rows[0].id) });
  } catch (e) {
    return dbError(e);
  }
}

/** 답변 삭제. */
export async function DELETE(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!isAdminPassword(body.password)) return unauthorized();

  const replyId = Number(body.replyId);
  if (!Number.isInteger(replyId)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    await ensureSchema();
    await sql`DELETE FROM community_replies WHERE id = ${replyId}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return dbError(e);
  }
}
