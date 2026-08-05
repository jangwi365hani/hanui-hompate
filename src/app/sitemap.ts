import type { MetadataRoute } from "next";
import { getColumns, getDoctors } from "@/lib/data";

const SITE_URL = "https://jangwi365.com";

// 칼럼·원장 페이지가 늘어나도 사이트맵에 자동으로 실리도록 매 시간 다시 만든다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/home-visit`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/columns`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  // 개별 칼럼·원장 페이지 — 검색·챗봇이 인용할 실제 본문이 있는 주소들이라 색인이 중요하다.
  // 데이터 조회가 실패해도 사이트맵 자체는 나가야 하므로 개별로 감싼다.
  try {
    for (const c of (await getColumns()).filter((c) => c.isActive)) {
      routes.push({
        url: `${SITE_URL}/columns/${c.id}`,
        lastModified: c.createdAt ? new Date(c.createdAt) : now,
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  } catch { /* 칼럼 조회 실패 시 정적 경로만 내보낸다 */ }

  try {
    for (const d of (await getDoctors()).filter((d) => d.isActive)) {
      routes.push({
        url: `${SITE_URL}/doctors/${d.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch { /* 의료진 조회 실패 시 정적 경로만 내보낸다 */ }

  return routes;
}
