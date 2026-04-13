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
  const res = await fetch(latest.url, { cache: "no-store" });
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
