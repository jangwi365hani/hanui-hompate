import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import type { Event } from "@/lib/data";
import { getEvents } from "@/lib/data";

const EVENTS_PREFIX = "hanui-events";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

async function saveEvents(events: Event[]) {
  const { blobs } = await list({ prefix: EVENTS_PREFIX });
  if (blobs.length > 0) await del(blobs.map((b) => b.url));
  await put(`${EVENTS_PREFIX}.json`, JSON.stringify(events), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, ...eventData } = body;
  if (password !== ADMIN_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  if (password !== ADMIN_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await getEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  events[idx] = { ...events[idx], ...updateData };
  await saveEvents(events);
  return NextResponse.json(events[idx]);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { password, id } = body;
  if (password !== ADMIN_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await getEvents();
  await saveEvents(events.filter((e) => e.id !== id));
  return NextResponse.json({ success: true });
}
