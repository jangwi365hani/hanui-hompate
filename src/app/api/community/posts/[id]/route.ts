import { NextResponse } from "next/server";
import { getSession } from "@/lib/community-session";
import { getPost } from "@/lib/community";
import { sql, ensureSchema, DbNotConfiguredError } from "@/lib/db";

function dbError(e: unknown) {
  if (e instanceof DbNotConfiguredError) {
    return NextResponse.json({ error: "커뮤니티 준비 중입니다." }, { status: 503 });
  }
  console.error("[community/posts/:id]", e);
  return NextResponse.json({ error: "처리 중 오류가 발생했습니다." }, { status: 500 });
}

/** 상세 — 비공개 문의는 작성자 본인만 열린다. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const session = await getSession();
    const post = await getPost(postId, session?.uid ?? null);
    if (!post) return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(post, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return dbError(e);
  }
}

/**
 * 삭제 — 작성자 본인만. 실제로 지우지 않고 deleted_at을 찍는다.
 * 병원이 답변한 문의까지 물리 삭제되면 응대 이력이 사라지기 때문이다.
 */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  try {
    await ensureSchema();
    const rows = await sql`
      UPDATE community_posts
         SET deleted_at = now(), updated_at = now()
       WHERE id = ${postId} AND user_id = ${session.uid} AND deleted_at IS NULL
       RETURNING id
    `;
    if (!rows.length) {
      return NextResponse.json({ error: "삭제할 수 없는 글입니다." }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return dbError(e);
  }
}
