import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSession, getSecret } from "@/lib/community-session";
import { isProviderReady } from "@/lib/oauth-providers";
import { isDbConfigured } from "@/lib/db";

/** 현재 로그인 상태 + 어떤 소셜 로그인 버튼을 띄울 수 있는지 알려준다. */
export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    {
      loggedIn: Boolean(session),
      nickname: session?.nick ?? "",
      ready: {
        // 셋 다 갖춰져야 커뮤니티가 정상 동작한다. 화면은 이 값으로 안내문을 띄운다.
        db: isDbConfigured,
        secret: Boolean(getSecret()),
        kakao: isProviderReady("kakao"),
        naver: isProviderReady("naver"),
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/** 로그아웃 — 쿠키만 지우면 된다(서버에 세션 상태가 없다). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
