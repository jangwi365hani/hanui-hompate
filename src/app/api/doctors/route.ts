import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

const PREFIX = "hanui-weekly-data";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: PREFIX });
    if (blobs.length === 0) return NextResponse.json([]);

    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    const res  = await fetch(latest.url, { cache: "no-store" });
    const data = await res.json();

    return NextResponse.json(
      data.doctors ?? [],
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json([]);
  }
}
