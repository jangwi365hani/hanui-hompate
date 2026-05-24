import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getHolidays } from "@/lib/data";
import type { Holidays } from "@/lib/data";

const PREFIX = "hanui-holidays";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.admin_password || "jw5416200227!";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || process.env.staff_password || "admin1234";
const isValidPassword = (pw: string) => pw === ADMIN_PASSWORD || pw === STAFF_PASSWORD;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  const holidays = await getHolidays();
  return NextResponse.json(holidays, {
    headers: { ...CORS_HEADERS, "Cache-Control": "no-store" },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, holidays } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!holidays || typeof holidays !== "object" || Array.isArray(holidays))
    return NextResponse.json({ error: "Invalid holidays payload" }, { status: 400 });

  const sanitized: Holidays = {};
  for (const [date, hour] of Object.entries(holidays as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const h = Number(hour);
    if (!Number.isFinite(h) || h < 0 || h > 23) continue;
    sanitized[date] = Math.floor(h);
  }

  await put(`${PREFIX}/${Date.now()}.json`, JSON.stringify(sanitized), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
    addRandomSuffix: false,
  });

  try {
    const { blobs } = await list({ prefix: `${PREFIX}/` });
    const old = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(3);
    if (old.length) await del(old.map((b) => b.url));
  } catch {}

  return NextResponse.json(sanitized);
}
