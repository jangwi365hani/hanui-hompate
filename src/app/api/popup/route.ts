import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

const POPUP_PREFIX = "hanui-popup";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

export interface Popup {
  isActive: boolean;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
}

const defaultPopup: Popup = {
  isActive: false,
  title: "",
  content: "",
  imageUrl: "",
  linkUrl: "",
  buttonText: "자세히 보기",
};

async function getPopup(): Promise<Popup> {
  try {
    const { blobs } = await list({ prefix: POPUP_PREFIX });
    if (blobs.length === 0) return defaultPopup;
    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];
    const res = await fetch(latest.url, { cache: "no-store" });
    return await res.json();
  } catch {
    return defaultPopup;
  }
}

export async function GET() {
  const popup = await getPopup();
  return NextResponse.json(popup, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, ...popupData } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await getPopup();
  const updated: Popup = { ...current, ...popupData };

  // 이전 blob 삭제 후 새로 저장
  const { blobs } = await list({ prefix: POPUP_PREFIX });
  if (blobs.length > 0) {
    await del(blobs.map((b) => b.url));
  }
  await put(`${POPUP_PREFIX}.json`, JSON.stringify(updated), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });

  return NextResponse.json(updated);
}
