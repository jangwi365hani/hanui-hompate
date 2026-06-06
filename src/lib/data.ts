import { list } from "@vercel/blob";

export interface Event {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;     // 작성자(닉네임)
  content: string;    // 후기 내용
  rating: number;     // 별점 1~5
  imageUrl: string;   // 캡처 이미지(선택)
  isActive: boolean;
  createdAt: string;
}

export async function getReviews(): Promise<Review[]> {
  try {
    const data = await fetchLatestBlob("hanui-reviews");
    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}

export interface Popup {
  isActive: boolean;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
}

async function fetchLatestBlob(prefix: string) {
  const { blobs } = await list({ prefix });
  if (blobs.length === 0) return null;
  const latest = blobs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )[0];
  const bust = new Date(latest.uploadedAt).getTime();
  const res = await fetch(`${latest.url}?v=${bust}`, { cache: "no-store" });
  return res.json();
}

export async function getEvents(): Promise<Event[]> {
  try {
    const data = await fetchLatestBlob("hanui-events");
    return data ?? [];
  } catch {
    return [];
  }
}

export interface Column {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  views?: number;
}

export async function getColumns(): Promise<Column[]> {
  try {
    const data = await fetchLatestBlob("hanui-columns");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getPopup(): Promise<Popup> {
  const defaultPopup: Popup = {
    isActive: false,
    title: "",
    content: "",
    imageUrl: "",
    linkUrl: "",
    buttonText: "자세히 보기",
  };
  try {
    const data = await fetchLatestBlob("hanui-popup");
    return data ?? defaultPopup;
  } catch {
    return defaultPopup;
  }
}

export interface HandoverAccount {
  id: string;
  name: string;
  role: "doc" | "staff";
  since: string;
  memo: string;
}

export interface HandoverItem {
  memo: string;
  checked: boolean;
  date: string;
}

export interface HandoverData {
  accounts: HandoverAccount[];
  items: Record<string, Record<string, HandoverItem[]>>;
}

export interface WikiArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export async function getWiki(): Promise<WikiArticle[]> {
  try {
    const data = await fetchLatestBlob("hanui-wiki");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getHandover(): Promise<HandoverData> {
  const def: HandoverData = { accounts: [], items: {} };
  try {
    const data = await fetchLatestBlob("hanui-handover");
    return data ?? def;
  } catch {
    return def;
  }
}

export type Holidays = Record<string, number>;

export async function getHolidays(): Promise<Holidays> {
  const defaults: Holidays = {
    "2026-05-01": 17,
    "2026-05-05": 17,
    "2026-05-25": 17,
    "2026-06-06": 17,
    "2026-08-15": 17,
    "2026-10-03": 17,
    "2026-10-09": 17,
  };
  try {
    const data = await fetchLatestBlob("hanui-holidays");
    return data ?? defaults;
  } catch {
    return defaults;
  }
}
