import { NextResponse } from "next/server";
import { getProvider, isProviderReady, callbackUrl } from "@/lib/oauth-providers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  STATE_COOKIE,
  createSessionToken,
  hashProviderUid,
  readState,
} from "@/lib/community-session";
import { upsertUser } from "@/lib/community";

/**
 * 소셜 로그인 콜백.
 * code → 액세스 토큰 → 프로필(닉네임) → 회원 upsert → 세션 쿠키 발급 → 원래 페이지로 복귀.
 */
export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider: name } = await ctx.params;
  const provider = getProvider(name);
  const url = new URL(req.url);

  const fail = (msg: string, back = "/community") =>
    NextResponse.redirect(new URL(`${back}?error=${encodeURIComponent(msg)}`, req.url));

  if (!provider || !isProviderReady(provider.name)) return fail("로그인 설정이 올바르지 않습니다.");

  // 사용자가 동의 화면에서 취소한 경우
  if (url.searchParams.get("error")) return fail("로그인이 취소되었습니다.");

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  if (!code) return fail("로그인 응답이 올바르지 않습니다.");

  const stateCookie = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.slice(STATE_COOKIE.length + 1);

  const state = readState(stateCookie ? decodeURIComponent(stateCookie) : undefined);
  if (!state || state.n !== returnedState) {
    return fail("로그인 요청이 만료되었습니다. 다시 시도해 주세요.");
  }

  try {
    // 1) 액세스 토큰 교환
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: provider.clientId,
      redirect_uri: callbackUrl(req, provider.name),
      code,
    });
    if (provider.clientSecret) body.set("client_secret", provider.clientSecret);
    if (provider.name === "naver" && returnedState) body.set("state", returnedState);

    const tokenRes = await fetch(provider.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
      body,
      cache: "no-store",
    });
    const tokenJson = (await tokenRes.json()) as Record<string, unknown>;
    const accessToken = typeof tokenJson.access_token === "string" ? tokenJson.access_token : "";
    if (!accessToken) return fail("로그인 토큰을 받지 못했습니다.", state.r);

    // 2) 프로필 조회 — 닉네임만 쓴다
    const profileRes = await fetch(provider.profileUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const profileJson = (await profileRes.json()) as Record<string, unknown>;
    const profile = provider.normalize(profileJson);
    if (!profile) return fail("회원 정보를 확인하지 못했습니다.", state.r);

    // 3) 회원 저장 — 제공자 회원번호는 원문 대신 해시만 남긴다
    const user = await upsertUser(
      provider.name,
      hashProviderUid(provider.name, profile.uid),
      profile.nickname.slice(0, 40)
    );
    if (user.isBlocked) return fail("이용이 제한된 계정입니다.", state.r);

    const res = NextResponse.redirect(new URL(state.r, req.url));
    res.cookies.set(SESSION_COOKIE, createSessionToken(user.id, user.nickname), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (e) {
    console.error("[community/oauth]", e);
    return fail("로그인 처리 중 오류가 발생했습니다.", state.r);
  }
}
