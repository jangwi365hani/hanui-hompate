# 커뮤니티 기능 설정 가이드

병원후기 + 상담문의 커뮤니티를 실제로 켜려면 아래 3가지를 한 번만 설정하면 됩니다.
**설정 전에도 홈페이지는 정상 동작합니다** — 커뮤니티 화면에 "준비 중" 안내만 뜹니다.

---

## 1. 데이터베이스 (Neon Postgres) — ✅ 완료 (2026-08-11)

Vercel Storage에 Neon이 연결되어 `DATABASE_URL`이 Production/Preview/Development 전부에
자동 등록되어 있습니다. 표(테이블) 3개(`community_users` / `community_posts` /
`community_replies`)도 코드가 첫 요청 때 자동 생성했습니다. 따로 SQL을 실행할 필요 없습니다.

> 새 환경에 다시 붙일 때: Vercel → 프로젝트 → **Storage** → **Create Database** →
> **Neon** → **Connect Project**. 그러면 `DATABASE_URL`이 알아서 꽂힙니다.

---

## 2. 세션 비밀키 — ✅ 완료 (2026-08-11)

`COMMUNITY_SESSION_SECRET`이 Production/Preview/Development에 등록되어 있습니다.

> ⚠️ **이 값은 절대 바꾸지 마세요.** 로그인 세션 서명과 회원 식별 해시에 함께 쓰이기 때문에,
> 값이 바뀌면 기존 회원이 다시 로그인해도 다른 사람으로 인식되어 예전 글과 연결이 끊깁니다.
> 값 확인은 Vercel → **Settings → Environment Variables**, 또는 `npx vercel env pull`.

새로 만들어야 한다면:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. 소셜 로그인 — ⬜ 남은 작업

### 카카오 (검수 없이 바로 사용 가능)

1. [Kakao Developers](https://developers.kakao.com) → 내 애플리케이션 → 애플리케이션 추가
2. **앱 설정 → 플랫폼 → Web** 에 사이트 도메인 등록: `https://jangwi365.com`
3. **제품 설정 → 카카오 로그인** → 활성화 **ON**
4. **Redirect URI** 등록 (문자 하나까지 정확히):
   ```
   https://jangwi365.com/api/community/auth/kakao/callback
   ```
5. **제품 설정 → 카카오 로그인 → 동의항목** 에서 **닉네임만** 필수 동의로 설정
   (프로필 사진·이메일·전화번호·생일·성별은 전부 **사용 안 함**으로 두세요. 최소 수집 원칙)
6. **앱 설정 → 앱 키** 의 **REST API 키** 를 복사

Vercel 환경변수에 추가:

| 이름 | 값 |
|---|---|
| `KAKAO_REST_API_KEY` | 위에서 복사한 REST API 키 |
| `KAKAO_CLIENT_SECRET` | (선택) 보안 설정에서 Client Secret을 켠 경우에만 |

### 네이버 (검수 1~2일 소요)

1. [네이버 개발자센터](https://developers.naver.com/apps) → 애플리케이션 등록
2. 사용 API: **네이버 로그인** 선택
3. **제공 정보 선택**: **별명(닉네임)만** 필수로 체크
   (이메일·이름·휴대전화번호·생일·성별·연령대는 체크하지 마세요)
4. 서비스 URL: `https://jangwi365.com`
5. **Callback URL**:
   ```
   https://jangwi365.com/api/community/auth/naver/callback
   ```
6. 등록 후 **Client ID / Client Secret** 복사
7. 애플리케이션이 "개발 중" 상태이면 본인 계정만 로그인됩니다.
   전체 공개하려면 **검수 요청** 을 넣어야 합니다 (보통 1~2일).

Vercel 환경변수에 추가:

| 이름 | 값 |
|---|---|
| `NAVER_CLIENT_ID` | Client ID |
| `NAVER_CLIENT_SECRET` | Client Secret |

> 둘 중 하나만 설정해도 됩니다. 설정된 것만 로그인 버튼이 뜹니다.

---

## 4. (선택) 콜백 도메인 고정

Vercel 미리보기 배포(`*.vercel.app`)에서도 로그인을 테스트하고 싶지 않다면,
콜백 주소를 운영 도메인으로 못 박아 둘 수 있습니다.

| 이름 | 값 |
|---|---|
| `COMMUNITY_OAUTH_ORIGIN` | `https://jangwi365.com` |

설정하지 않으면 접속한 도메인을 그대로 콜백 주소로 씁니다.

---

## 관리 방법

- **위치**: `jangwi365.com/admin` → **커뮤니티** 탭
- **권한**: 대표원장 비밀번호(`ADMIN_PASSWORD`)로만 열립니다.
  직원 비밀번호로는 보이지 않습니다 — 후기 게시 승인은 의료광고 책임이 걸린 판단이기 때문입니다.
- **병원후기**: 환자가 쓰면 `검토 중` 상태로 대기 → 승인해야 홈페이지에 게시됩니다.
- **상담문의**: 비공개 1:1. 작성자 본인과 관리자만 볼 수 있고 승인 절차가 없습니다.
- **표현 주의 배지**: 치료 효과를 단정하는 표현(완치·100%·부작용 없음 등)이나 최상급 표현이
  들어 있으면 자동으로 표시됩니다. 차단이 아니라 알림이며, 게시 여부 판단은 사람이 합니다.
  판단 기준을 고치려면 `src/lib/medical-ad-check.ts` 를 수정하세요.

---

## 수집하는 개인정보

| 항목 | 저장 형태 |
|---|---|
| 별명(닉네임) | 평문 |
| 로그인 제공자 (kakao / naver) | 평문 |
| 제공자 회원번호 | **HMAC-SHA256 해시** (원본 저장 안 함) |
| 작성 글 내용·별점·작성 일시 | 평문 |

이름·이메일·전화번호·생년월일·성별·프로필 사진은 **요청하지도, 저장하지도 않습니다.**

수집 항목을 늘리거나 줄일 때는 반드시 `src/app/privacy/page.tsx`(개인정보처리방침)도
함께 고쳐야 합니다. 방침과 실제가 어긋나면 허위 고지가 됩니다.
