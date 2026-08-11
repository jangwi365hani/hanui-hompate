import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * 커뮤니티 로그인 세션.
 *
 * 세션 테이블을 두지 않고 서명한 쿠키 하나로 끝낸다. 담는 값은 회원 id와 닉네임뿐이라
 * 쿠키가 커질 일이 없고, 서버가 상태를 들고 있지 않아 Vercel 함수 어디에 붙어도 동작한다.
 * 위조는 HMAC 서명으로 막고, 탈취는 httpOnly + secure + sameSite=lax로 줄인다.
 */

export const SESSION_COOKIE = "jw_community";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30일

export interface CommunitySession {
  uid: number;
  nick: string;
  exp: number; // epoch seconds
}

/** 서명·해시에 쓰는 비밀키. 없으면 로그인 기능 자체를 열지 않는다. */
export function getSecret(): string | null {
  return process.env.COMMUNITY_SESSION_SECRET || null;
}

function requireSecret(): string {
  const s = getSecret();
  if (!s) throw new Error("COMMUNITY_SESSION_SECRET 환경변수가 필요합니다.");
  return s;
}

const b64url = (buf: Buffer | string) =>
  Buffer.from(buf).toString("base64url");

function sign(data: string): string {
  return createHmac("sha256", requireSecret()).update(data).digest("base64url");
}

/**
 * 카카오/네이버 회원번호를 그대로 저장하지 않기 위한 단방향 해시.
 * provider를 같이 섞어 서로 다른 제공자의 같은 번호가 한 사람으로 합쳐지지 않게 한다.
 *
 * ⚠️ COMMUNITY_SESSION_SECRET을 바꾸면 이 해시값도 전부 달라진다.
 *    기존 회원이 다시 로그인해도 같은 사람으로 인식되지 않아 예전 글과 연결이 끊긴다.
 *    유출 등으로 반드시 교체해야 하는 상황이 아니라면 이 값은 고정해 둘 것.
 */
export function hashProviderUid(provider: string, uid: string): string {
  return createHmac("sha256", requireSecret())
    .update(`${provider}:${uid}`)
    .digest("hex");
}

export function createSessionToken(uid: number, nick: string): string {
  const payload: CommunitySession = {
    uid,
    nick,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): CommunitySession | null {
  if (!token || !getSecret()) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const want = Buffer.from(sign(body));
  // 길이가 다르면 timingSafeEqual이 던지므로 먼저 거른다
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as CommunitySession;
    if (!parsed?.uid || typeof parsed.exp !== "number") return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** 라우트 핸들러/서버 컴포넌트에서 현재 로그인 사용자를 읽는다. 비로그인이면 null. */
export async function getSession(): Promise<CommunitySession | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** OAuth state(CSRF 방어용 난수)를 서명해 왕복시킨다. */
export const STATE_COOKIE = "jw_community_state";

export function signState(nonce: string, redirect: string): string {
  const body = b64url(JSON.stringify({ n: nonce, r: redirect }));
  return `${body}.${sign(body)}`;
}

export function readState(token: string | undefined): { n: string; r: string } | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const want = Buffer.from(sign(body));
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
}
