import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

const EVENTS_KEY = "hanui-events.json";
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
    const { blobs } = await list({ prefix: EVENTS_KEY });
    if (blobs.length === 0) return [];
    const res = await fetch(blobs[0].url + "?t=" + Date.now());
    return await res.json();
  } catch {
    return [];
  }
}

async function saveEvents(events: Event[]) {
  await put(EVENTS_KEY, JSON.stringify(events), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
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
