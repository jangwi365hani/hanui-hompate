import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getColumns } from "@/lib/data";
import type { Column } from "@/lib/data";

const COLUMNS_PREFIX = "hanui-columns";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jw5416200227!";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || "admin1234";
const isValidPassword = (pw: string) => pw === ADMIN_PASSWORD || pw === STAFF_PASSWORD;

async function saveColumns(columns: Column[]) {
  const { blobs } = await list({ prefix: COLUMNS_PREFIX });
  if (blobs.length > 0) await del(blobs.map((b) => b.url));
  await put(`${COLUMNS_PREFIX}.json`, JSON.stringify(columns), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function GET() {
  const columns = await getColumns();
  return NextResponse.json(columns, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, ...data } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const columns = await getColumns();
  const newColumn: Column = {
    id: Date.now().toString(),
    title: data.title || "",
    content: data.content || "",
    imageUrl: data.imageUrl || "",
    author: data.author || "",
    category: data.category || "",
    isActive: data.isActive ?? true,
    createdAt: new Date().toISOString(),
  };
  columns.unshift(newColumn);
  await saveColumns(columns);
  return NextResponse.json(newColumn);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, id, ...updateData } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const columns = await getColumns();
  const idx = columns.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  columns[idx] = { ...columns[idx], ...updateData };
  await saveColumns(columns);
  return NextResponse.json(columns[idx]);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { password, id } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const columns = await getColumns();
  await saveColumns(columns.filter((c) => c.id !== id));
  return NextResponse.json({ success: true });
}
