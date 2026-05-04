import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getPopup } from "@/lib/data";
import type { Popup } from "@/lib/data";

const POPUP_PREFIX = "hanui-popup";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.admin_password || "jw5416200227!";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || process.env.staff_password || "admin1234";
const isValidPassword = (pw: string) => pw === ADMIN_PASSWORD || pw === STAFF_PASSWORD;

export async function GET() {
  const popup = await getPopup();
  return NextResponse.json(popup, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, ...popupData } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const current = await getPopup();
  const updated: Popup = { ...current, ...popupData };

  await put(`${POPUP_PREFIX}.json`, JSON.stringify(updated), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
    allowOverwrite: true,
    addRandomSuffix: false,
  });

  return NextResponse.json(updated);
}
