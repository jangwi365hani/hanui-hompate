import { NextResponse } from "next/server";
import { getSession } from "@/lib/community-session";
import { listPosts } from "@/lib/community";
import { sql, ensureSchema, DbNotConfiguredError } from "@/lib/db";
import type { PostKind } from "@/lib/community-types";

const KINDS: PostKind[] = ["review", "inquiry"];

function dbError(e: unknown) {
  if (e instanceof DbNotConfiguredError) {
    return NextResponse.json(
      { error: "커뮤니티 준비 중입니다. (DATABASE_URL 미설정)" },
      { status: 503 }
    );
  }
  console.error("[community/posts]", e);
  return NextResponse.json({ error: "처리 중 오류가 발생했습니다." }, { status: 500 });
}

/** 목록 — /api/community/posts?kind=review&page=0 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") as PostKind;
  if (!KINDS.includes(kind)) {
    return NextResponse.json({ error: "kind가 올바르지 않습니다." }, { status: 400 });
  }

  const page = Math.max(0, Number(url.searchParams.get("page") || 0));
  const limit = 20;

  try {
    const session = await getSession();
    const posts = await listPosts(kind, session?.uid ?? null, limit, page * limit);
    return NextResponse.json(
      { posts, hasMore: posts.length === limit },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return dbError(e);
  }
}

/** 작성 — 로그인 필수. 후기는 검토 대기로, 문의는 바로 비공개 등록된다. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const kind = String(body.kind || "") as PostKind;
  if (!KINDS.includes(kind)) {
    return NextResponse.json({ error: "kind가 올바르지 않습니다." }, { status: 400 });
  }

  const title = String(body.title || "").trim().slice(0, 100);
  const content = String(body.content || "").trim();
  if (content.length < 5) {
    return NextResponse.json({ error: "내용을 5자 이상 입력해 주세요." }, { status: 400 });
  }
  if (content.length > 5000) {
    return NextResponse.json({ error: "내용은 5000자까지 입력할 수 있습니다." }, { status: 400 });
  }

  // 후기만 별점을 받는다. 범위를 벗어나면 5로 맞춘다.
  let rating: number | null = null;
  if (kind === "review") {
    const n = Math.round(Number(body.rating));
    rating = Number.isFinite(n) && n >= 1 && n <= 5 ? n : 5;
  }

  // 후기는 관리자 승인 후 공개(의료광고 검수), 문의는 비공개 1:1이라 승인 절차가 없다.
  const status = kind === "review" ? "pending" : "published";
  const isPrivate = kind === "inquiry";

  try {
    await ensureSchema();

    // 도배 방지 — 같은 사람이 1분 안에 연달아 올리는 것만 막는다.
    const recent = await sql`
      SELECT 1 FROM community_posts
       WHERE user_id = ${session.uid} AND created_at > now() - interval '1 minute'
       LIMIT 1
    `;
    if (recent.length) {
      return NextResponse.json(
        { error: "잠시 후 다시 시도해 주세요. (연속 등록 제한)" },
        { status: 429 }
      );
    }

    const rows = await sql`
      INSERT INTO community_posts (kind, user_id, title, content, rating, status, is_private)
           VALUES (${kind}, ${session.uid}, ${title}, ${content}, ${rating}, ${status}, ${isPrivate})
        RETURNING id
    `;
    return NextResponse.json({ id: Number(rows[0].id), status });
  } catch (e) {
    return dbError(e);
  }
}
