import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const PREFIX      = "hanui-weekly-data";
const PUSH_SECRET = process.env.PUSH_SECRET || "hanui-push-2026";

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
