import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getColumns } from "@/lib/data";
import type { Column } from "@/lib/data";

const COLUMNS_PREFIX = "hanui-columns";

async function saveColumns(columns: Column[]) {
  await put(`${COLUMNS_PREFIX}/${Date.now()}.json`, JSON.stringify(columns), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
    addRandomSuffix: false,
  });
  try {
    const { blobs } = await list({ prefix: `${COLUMNS_PREFIX}/` });
    const old = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(3);
    if (old.length) await del(old.map((b) => b.url));
  } catch {}
}

// 칼럼 조회수 +1 (비밀번호 불필요 — 단순 카운터)
export async function POST(req: Request) {
  let id = "";
  try {
    ({ id } = await req.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const columns = await getColumns();
  const idx = columns.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ ok: false }, { status: 404 });

  columns[idx].views = (columns[idx].views || 0) + 1;
  await saveColumns(columns);
  return NextResponse.json({ ok: true, views: columns[idx].views });
}
