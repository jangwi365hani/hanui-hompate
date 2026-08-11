import { sql, ensureSchema } from "./db";
import type { Post, PostKind, Reply } from "./community-types";

/** 관리자 비밀번호 — 저장소의 다른 관리 API와 같은 규칙을 쓴다. */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.admin_password || "";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || process.env.staff_password || "";

/**
 * 커뮤니티 관리(승인·답변·숨김)는 대표/원장 비밀번호만 허용한다.
 * 다른 탭과 달리 STAFF_PASSWORD로는 열지 않는다 — 게시 승인은 의료광고 책임이 걸린 판단이다.
 */
export function isAdminPassword(pw: unknown): boolean {
  if (typeof pw !== "string" || !pw) return false;
  if (ADMIN_PASSWORD && pw === ADMIN_PASSWORD) return true;
  // 환경변수가 하나도 없는 로컬 개발 환경에서만 기존 기본값을 인정한다
  if (!ADMIN_PASSWORD && !STAFF_PASSWORD && pw === "admin1234") return true;
  return false;
}

type Row = Record<string, unknown>;

const str = (v: unknown) => (v == null ? "" : String(v));
const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : str(v));

function mapReply(r: Row): Reply {
  return {
    id: Number(r.id),
    body: str(r.body),
    authorName: str(r.author_name),
    createdAt: iso(r.created_at),
  };
}

function mapPost(r: Row, viewerId: number | null): Post {
  return {
    id: Number(r.id),
    kind: str(r.kind) as PostKind,
    title: str(r.title),
    content: str(r.content),
    rating: r.rating == null ? null : Number(r.rating),
    status: str(r.status) as Post["status"],
    isPrivate: Boolean(r.is_private),
    rejectMemo: str(r.reject_memo),
    nickname: str(r.nickname) || "익명",
    createdAt: iso(r.created_at),
    isMine: viewerId != null && Number(r.user_id) === viewerId,
    replies: [],
  };
}

/** 글 목록에 답변을 한 번의 쿼리로 붙인다 (글마다 조회하면 N+1이 된다). */
async function attachReplies(posts: Post[]): Promise<Post[]> {
  if (!posts.length) return posts;
  const ids = posts.map((p) => p.id);
  const rows = await sql`
    SELECT * FROM community_replies
     WHERE post_id = ANY(${ids}::bigint[])
     ORDER BY created_at ASC
  `;
  const byPost = new Map<number, Reply[]>();
  for (const r of rows) {
    const pid = Number(r.post_id);
    if (!byPost.has(pid)) byPost.set(pid, []);
    byPost.get(pid)!.push(mapReply(r));
  }
  for (const p of posts) p.replies = byPost.get(p.id) ?? [];
  return posts;
}

/**
 * 공개 목록.
 * - review  : 승인(published)된 것만 누구에게나 보인다.
 * - inquiry : 비공개 1:1이라 로그인한 본인 글만 보인다. 비로그인이면 빈 목록.
 */
export async function listPosts(
  kind: PostKind,
  viewerId: number | null,
  limit = 50,
  offset = 0
): Promise<Post[]> {
  await ensureSchema();

  if (kind === "inquiry") {
    if (viewerId == null) return [];
    const rows = await sql`
      SELECT p.*, u.nickname
        FROM community_posts p
        JOIN community_users u ON u.id = p.user_id
       WHERE p.kind = 'inquiry'
         AND p.user_id = ${viewerId}
         AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC
       LIMIT ${limit} OFFSET ${offset}
    `;
    return attachReplies(rows.map((r) => mapPost(r, viewerId)));
  }

  // 후기: 게시된 글 + (로그인했다면) 본인의 검토 중·보류 글도 함께 보여준다.
  // 본인 글이 어디 갔는지 몰라 다시 쓰는 일을 막기 위한 것이다.
  const rows = await sql`
    SELECT p.*, u.nickname
      FROM community_posts p
      JOIN community_users u ON u.id = p.user_id
     WHERE p.kind = 'review'
       AND p.deleted_at IS NULL
       AND (p.status = 'published' OR p.user_id = ${viewerId ?? -1})
       AND p.status <> 'hidden'
     ORDER BY p.created_at DESC
     LIMIT ${limit} OFFSET ${offset}
  `;
  return attachReplies(rows.map((r) => mapPost(r, viewerId)));
}

/** 상세 조회. 볼 권한이 없으면 null. */
export async function getPost(
  id: number,
  viewerId: number | null,
  isAdmin = false
): Promise<Post | null> {
  await ensureSchema();
  const rows = await sql`
    SELECT p.*, u.nickname
      FROM community_posts p
      JOIN community_users u ON u.id = p.user_id
     WHERE p.id = ${id} AND p.deleted_at IS NULL
     LIMIT 1
  `;
  if (!rows.length) return null;

  const post = mapPost(rows[0], viewerId);
  const canRead =
    isAdmin ||
    post.isMine ||
    (post.kind === "review" && post.status === "published");
  if (!canRead) return null;

  const [withReplies] = await attachReplies([post]);
  return withReplies;
}

/** 관리자 화면용 — 상태 필터 없이 전부(삭제분 제외). */
export async function listAllForAdmin(kind: PostKind | "all", limit = 200): Promise<Post[]> {
  await ensureSchema();
  const rows =
    kind === "all"
      ? await sql`
          SELECT p.*, u.nickname
            FROM community_posts p
            JOIN community_users u ON u.id = p.user_id
           WHERE p.deleted_at IS NULL
           ORDER BY (p.status = 'pending') DESC, p.created_at DESC
           LIMIT ${limit}
        `
      : await sql`
          SELECT p.*, u.nickname
            FROM community_posts p
            JOIN community_users u ON u.id = p.user_id
           WHERE p.deleted_at IS NULL AND p.kind = ${kind}
           ORDER BY (p.status = 'pending') DESC, p.created_at DESC
           LIMIT ${limit}
        `;
  return attachReplies(rows.map((r) => mapPost(r, null)));
}

/** 소셜 로그인 성공 시 회원을 만들거나 닉네임/로그인시각을 갱신한다. */
export async function upsertUser(
  provider: "kakao" | "naver",
  uidHash: string,
  nickname: string
): Promise<{ id: number; nickname: string; isBlocked: boolean }> {
  await ensureSchema();
  const rows = await sql`
    INSERT INTO community_users (provider, provider_uid_hash, nickname)
         VALUES (${provider}, ${uidHash}, ${nickname})
    ON CONFLICT (provider, provider_uid_hash)
      -- 제공자가 닉네임을 안 넘겨준 경우(동의 항목 미승낙 등) 기존 닉네임을 지우지 않는다
      DO UPDATE SET nickname      = COALESCE(NULLIF(EXCLUDED.nickname, ''), community_users.nickname),
                    last_login_at = now()
      RETURNING id, nickname, is_blocked
  `;
  const r = rows[0];
  return { id: Number(r.id), nickname: str(r.nickname), isBlocked: Boolean(r.is_blocked) };
}
