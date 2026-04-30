import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

const PREFIX = "hanui-weekly-data";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") || "";
  try {
    const { blobs } = await list({ prefix: PREFIX });
    if (blobs.length === 0)
      return NextResponse.json({ date, count: 0, reservations: [] });

    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    const res  = await fetch(latest.url, { cache: "no-store" });
    const data = await res.json();

    const reservations = data.byDate?.[date] ?? [];
    return NextResponse.json(
      { date, count: reservations.length, reservations },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ date, count: 0, reservations: [] });
  }
}
