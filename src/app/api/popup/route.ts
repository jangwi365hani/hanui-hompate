import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const POPUP_KEY = "hanui-popup.json";
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
    const { blobs } = await list({ prefix: POPUP_KEY });
    if (blobs.length === 0) return defaultPopup;
    const res = await fetch(blobs[0].url + "?t=" + Date.now());
    return await res.json();
  } catch {
    return defaultPopup;
  }
}

export async function GET() {
  const popup = await getPopup();
  return NextResponse.json(popup);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, ...popupData } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await getPopup();
  const updated: Popup = { ...current, ...popupData };

  await put(POPUP_KEY, JSON.stringify(updated), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });

  return NextResponse.json(updated);
}
