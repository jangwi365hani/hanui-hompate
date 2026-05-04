import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";

const PREFIX      = "hanui-reservation-status";
const PUSH_SECRET = process.env.PUSH_SECRET || "hanui-push-2026";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: PREFIX });
    if (blobs.length === 0) return NextResponse.json(null);
    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];
    const res  = await fetch(latest.url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.secret !== PUSH_SECRET)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { secret: _, ...data } = body;

    await put(`${PREFIX}.json`, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      cacheControlMaxAge: 0,
      allowOverwrite: true,
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
