import { neon } from "@neondatabase/serverless";

/**
 * 커뮤니티 전용 DB (Neon Postgres).
 *
 * 이 저장소의 나머지 데이터(이벤트·칼럼·의료진 등)는 Vercel Blob에 JSON 배열을 통째로
 * 덮어쓰는 방식이다. 그 방식은 "관리자 한 명이 순서대로 저장"할 때만 안전하고,
 * 여러 환자가 동시에 글을 쓰는 커뮤니티에서는 나중 저장이 앞 저장을 통째로 날린다.
 * 그래서 커뮤니티만 별도 DB를 쓴다. 기존 Blob 코드는 건드리지 않는다.
 */

const CONNECTION_STRING =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  "";

/** DATABASE_URL이 아직 안 꽂혔는지 — 화면에서 "준비 중" 안내를 띄우는 데 쓴다. */
export const isDbConfigured = Boolean(CONNECTION_STRING);

/** DB 미설정 상태에서 호출됐을 때 던지는 에러. API가 503으로 변환한다. */
export class DbNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL이 설정되지 않았습니다.");
    this.name = "DbNotConfiguredError";
  }
}

let _sql: ReturnType<typeof neon> | null = null;

function client() {
  if (!CONNECTION_STRING) throw new DbNotConfiguredError();
  if (!_sql) _sql = neon(CONNECTION_STRING);
  return _sql;
}

/**
 * 파라미터 바인딩 쿼리. 반드시 태그드 템플릿으로만 쓴다.
 *   await sql`select * from community_posts where id = ${id}`
 * 값을 문자열로 이어붙이면 SQL 인젝션이 되므로 절대 금지.
 */
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  return client()(strings, ...values) as Promise<Record<string, unknown>[]>;
}

/* ────────────────────────────────────────────────────────────
   마이그레이션
   별도 마이그레이션 도구가 없는 저장소라, 첫 쿼리 전에 한 번만
   CREATE TABLE IF NOT EXISTS를 돌린다. 멱등이라 여러 번 불려도 안전하다.
   ──────────────────────────────────────────────────────────── */

let migrated: Promise<void> | null = null;

async function runMigrations() {
  const q = client();

  // 회원 — 수집 항목을 닉네임 하나로 묶는다.
  //   provider_uid_hash: 카카오/네이버 회원번호를 그대로 두지 않고 HMAC 해시로만 보관한다.
  //     같은 사람은 항상 같은 해시가 나와 재로그인 매칭에는 문제가 없고,
  //     DB가 통째로 유출돼도 원본 회원번호는 복원되지 않는다.
  await q`
    CREATE TABLE IF NOT EXISTS community_users (
      id                BIGSERIAL PRIMARY KEY,
      provider          TEXT NOT NULL CHECK (provider IN ('kakao','naver')),
      provider_uid_hash TEXT NOT NULL,
      nickname          TEXT NOT NULL DEFAULT '',
      is_blocked        BOOLEAN NOT NULL DEFAULT FALSE,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_login_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (provider, provider_uid_hash)
    )
  `;

  // 글 — 후기(review)와 상담문의(inquiry)를 한 테이블에 kind로 구분해 담는다.
  //   review  : status='pending'으로 들어가 관리자가 승인해야 'published'가 된다.
  //   inquiry : 비공개 1:1. 작성자 본인과 관리자만 읽는다(is_private=TRUE 고정).
  await q`
    CREATE TABLE IF NOT EXISTS community_posts (
      id          BIGSERIAL PRIMARY KEY,
      kind        TEXT NOT NULL CHECK (kind IN ('review','inquiry')),
      user_id     BIGINT NOT NULL REFERENCES community_users(id) ON DELETE CASCADE,
      title       TEXT NOT NULL DEFAULT '',
      content     TEXT NOT NULL,
      rating      SMALLINT,
      status      TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','published','rejected','hidden')),
      is_private  BOOLEAN NOT NULL DEFAULT FALSE,
      reject_memo TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at  TIMESTAMPTZ
    )
  `;
  await q`CREATE INDEX IF NOT EXISTS community_posts_list_idx
            ON community_posts (kind, status, created_at DESC)`;
  await q`CREATE INDEX IF NOT EXISTS community_posts_user_idx
            ON community_posts (user_id, created_at DESC)`;

  // 답변 — 병원(관리자)이 다는 답변만 저장한다. 환자끼리의 댓글은 두지 않는다.
  await q`
    CREATE TABLE IF NOT EXISTS community_replies (
      id          BIGSERIAL PRIMARY KEY,
      post_id     BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      body        TEXT NOT NULL,
      author_name TEXT NOT NULL DEFAULT '장위365경희한의원',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await q`CREATE INDEX IF NOT EXISTS community_replies_post_idx
            ON community_replies (post_id, created_at)`;

  // 상담신청 — 화면 하단 고정 폼으로 들어온다.
  //   커뮤니티와 달리 로그인 없이 **이름·연락처를 직접 받는다.** 그래서
  //   ① 개인정보처리방침(src/app/privacy/page.tsx)에 수집 항목이 적혀 있어야 하고
  //   ② 회신이 끝나면 지체 없이 지운다(관리자 화면의 삭제 버튼 = 실제 DELETE).
  //   상태를 'done'으로 바꾸는 것만으로는 개인정보가 남아 있으니 파기가 아니다.
  await q`
    CREATE TABLE IF NOT EXISTS consult_requests (
      id         BIGSERIAL PRIMARY KEY,
      subject    TEXT NOT NULL DEFAULT '',
      name       TEXT NOT NULL,
      phone      TEXT NOT NULL,
      message    TEXT NOT NULL DEFAULT '',
      status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','done','spam')),
      memo       TEXT NOT NULL DEFAULT '',
      source     TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      handled_at TIMESTAMPTZ
    )
  `;
  await q`CREATE INDEX IF NOT EXISTS consult_requests_list_idx
            ON consult_requests (status, created_at DESC)`;
}

/** 모든 커뮤니티 API가 쿼리 전에 한 번 호출한다. 프로세스당 1회만 실제로 실행된다. */
export function ensureSchema(): Promise<void> {
  if (!CONNECTION_STRING) return Promise.reject(new DbNotConfiguredError());
  if (!migrated) {
    migrated = runMigrations().catch((e) => {
      migrated = null; // 실패하면 다음 요청에서 다시 시도한다
      throw e;
    });
  }
  return migrated;
}
