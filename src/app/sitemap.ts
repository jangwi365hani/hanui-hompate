import type { MetadataRoute } from "next";

const SITE_URL = "https://jangwi365.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/home-visit", priority: 0.8, changeFrequency: "monthly" },
    { path: "/columns", priority: 0.7, changeFrequency: "weekly" },
    { path: "/events", priority: 0.7, changeFrequency: "weekly" },
  ];
  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
