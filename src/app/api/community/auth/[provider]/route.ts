import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getProvider, isProviderReady, callbackUrl } from "@/lib/oauth-providers";
import { STATE_COOKIE, getSecret, signState } from "@/lib/community-session";

/**
 * 소셜 로그인 시작 — /api/community/auth/kakao (또는 naver)
 * 제공자 인가 화면으로 302 시킨다.
 */
export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider: name } = await ctx.params;
  const provider = getProvider(name);

  const fail = (msg: string) =>
    NextResponse.redirect(new URL(`/community?error=${encodeURIComponent(msg)}`, req.url));

  if (!provider) return fail("지원하지 않는 로그인 방식입니다.");
  if (!getSecret()) return fail("로그인 설정이 아직 완료되지 않았습니다. (COMMUNITY_SESSION_SECRET)");
  if (!isProviderReady(provider.name)) {
    return fail(`${provider.label} 로그인 설정이 아직 완료되지 않았습니다.`);
  }

  // 로그인 후 돌아갈 곳. 외부 도메인으로 튕기지 않게 내부 경로만 허용한다.
  const raw = new URL(req.url).searchParams.get("redirect") || "/community";
  const redirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/community";

  const nonce = randomUUID();
  const authorize = new URL(provider.authorizeUrl);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", provider.clientId);
  authorize.searchParams.set("redirect_uri", callbackUrl(req, provider.name));
  authorize.searchParams.set("state", nonce);
  for (const [k, v] of Object.entries(provider.authorizeExtra)) {
    authorize.searchParams.set(k, v);
  }

  const res = NextResponse.redirect(authorize.toString());
  // state는 쿠키에 서명해 담아두고, 콜백에서 제공자가 돌려준 값과 대조한다(CSRF 방어).
  res.cookies.set(STATE_COOKIE, signState(nonce, redirect), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10분
  });
  return res;
}
