/**
 * 구조화데이터(JSON-LD) 삽입용 공용 컴포넌트.
 *
 * 왜 필요한가: 검색엔진과 챗봇은 페이지의 '문장'만으로 이게 무슨 글인지, 어느 병원 이야기인지
 * 확신하지 못한다. JSON-LD는 그 판단을 확정해 주는 기계용 요약이라, 답변에 인용될 확률을 올린다.
 *
 * 원칙: **화면에 없는 내용을 스키마에만 넣지 않는다.** (구글 구조화데이터 정책 위반)
 */
export const SITE_URL = "https://jangwi365.com";
export const CLINIC_ID = `${SITE_URL}/#clinic`;

export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** 탐색경로 — 이 페이지가 사이트 어디에 속한 글인지 알려준다. */
export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "홈", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
