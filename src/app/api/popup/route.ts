import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getPopup } from "@/lib/data";
import type { Popup } from "@/lib/data";

const POPUP_PREFIX = "hanui-popup";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

export async function GET() {
  const popup = await getPopup();
  return NextResponse.json(popup, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, ...popupData } = body;
  if (password !== ADMIN_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const current = await getPopup();
  const updated: Popup = { ...current, ...popupData };

  const { blobs } = await list({ prefix: POPUP_PREFIX });
  if (blobs.length > 0) await del(blobs.map((b) => b.url));
  await put(`${POPUP_PREFIX}.json`, JSON.stringify(updated), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });

  return NextResponse.json(updated);
}
