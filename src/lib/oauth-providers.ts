/**
 * 카카오·네이버 OAuth 제공자 정의.
 *
 * 수집 항목을 의도적으로 최소화했다.
 *  - 카카오: scope에 profile_nickname만 요청한다(이메일·전화·생일·성별 전부 미요청).
 *  - 네이버: 개발자센터에서 '별명'만 필수 제공 항목으로 설정해야 한다. 코드는 nickname만 읽는다.
 * 응답에 다른 필드가 섞여 오더라도 아래 normalize에서 버려지고 DB에 닿지 않는다.
 */

export type ProviderName = "kakao" | "naver";

export interface ProviderProfile {
  /** 제공자가 준 회원 식별번호(원문). 저장 전에 반드시 HMAC 해시로 바꾼다. */
  uid: string;
  nickname: string;
}

export interface ProviderConfig {
  name: ProviderName;
  label: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  profileUrl: string;
  /** 인가 URL에 붙일 추가 파라미터 (동의 항목 최소화) */
  authorizeExtra: Record<string, string>;
  normalize: (json: Record<string, unknown>) => ProviderProfile | null;
}

const asObj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};

export function getProvider(name: string): ProviderConfig | null {
  if (name === "kakao") {
    return {
      name: "kakao",
      label: "카카오",
      clientId: process.env.KAKAO_REST_API_KEY || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
      authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
      tokenUrl: "https://kauth.kakao.com/oauth/token",
      profileUrl: "https://kapi.kakao.com/v2/user/me",
      authorizeExtra: { scope: "profile_nickname" },
      normalize: (json) => {
        const id = json.id;
        if (id == null) return null;
        const account = asObj(json.kakao_account);
        const profile = asObj(account.profile);
        return {
          uid: String(id),
          nickname: typeof profile.nickname === "string" ? profile.nickname : "",
        };
      },
    };
  }

  if (name === "naver") {
    return {
      name: "naver",
      label: "네이버",
      clientId: process.env.NAVER_CLIENT_ID || "",
      clientSecret: process.env.NAVER_CLIENT_SECRET || "",
      authorizeUrl: "https://nid.naver.com/oauth2.0/authorize",
      tokenUrl: "https://nid.naver.com/oauth2.0/token",
      profileUrl: "https://openapi.naver.com/v1/nid/me",
      authorizeExtra: {},
      normalize: (json) => {
        const res = asObj(json.response);
        const id = res.id;
        if (id == null) return null;
        return {
          uid: String(id),
          nickname: typeof res.nickname === "string" ? res.nickname : "",
        };
      },
    };
  }

  return null;
}

/** 설정이 다 채워졌는지 — 로그인 버튼 노출 여부를 화면에 알려주는 데 쓴다. */
export function isProviderReady(name: ProviderName): boolean {
  const p = getProvider(name);
  if (!p) return false;
  // 네이버는 client_secret이 필수, 카카오는 보안설정에서 켠 경우에만 필요하다
  return Boolean(p.clientId) && (name === "kakao" || Boolean(p.clientSecret));
}

/**
 * 콜백 주소. 카카오/네이버 개발자센터에 등록한 값과 문자 하나까지 같아야 한다.
 * 배포 도메인이 여러 개(vercel 미리보기 등)일 수 있어 요청 origin을 우선 쓰고,
 * COMMUNITY_OAUTH_ORIGIN이 있으면 그걸로 고정한다.
 */
export function callbackUrl(req: Request, provider: string): string {
  const fixed = process.env.COMMUNITY_OAUTH_ORIGIN;
  const origin = fixed ? fixed.replace(/\/+$/, "") : new URL(req.url).origin;
  return `${origin}/api/community/auth/${provider}/callback`;
}
