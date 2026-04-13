import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

const EVENTS_PREFIX = "hanui-events";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

export interface Event {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: string;
}

async function getEvents(): Promise<Event[]> {
  try {
    const { blobs } = await list({ prefix: EVENTS_PREFIX });
    if (blobs.length === 0) return [];
    // 가장 최근 blob 선택
    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];
    const res = await fetch(latest.url, { cache: "no-store" });
    return await res.json();
  } catch {
    return [];
  }
}

async function saveEvents(events: Event[]) {
  // 이전 blob 모두 삭제
  const { blobs } = await list({ prefix: EVENTS_PREFIX });
  if (blobs.length > 0) {
    await del(blobs.map((b) => b.url));
  }
  // 새 blob 생성 (랜덤 suffix → 항상 새 URL)
  await put(`${EVENTS_PREFIX}.json`, JSON.stringify(events), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, ...eventData } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await getEvents();
  const newEvent: Event = {
    id: Date.now().toString(),
    title: eventData.title || "",
    content: eventData.content || "",
    imageUrl: eventData.imageUrl || "",
    linkUrl: eventData.linkUrl || "",
    isActive: eventData.isActive ?? true,
    createdAt: new Date().toISOString(),
  };
  events.unshift(newEvent);
  await saveEvents(events);

  return NextResponse.json(newEvent);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, id, ...updateData } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await getEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  events[idx] = { ...events[idx], ...updateData };
  await saveEvents(events);

  return NextResponse.json(events[idx]);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { password, id } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await getEvents();
  const filtered = events.filter((e) => e.id !== id);
  await saveEvents(filtered);

  return NextResponse.json({ success: true });
}
