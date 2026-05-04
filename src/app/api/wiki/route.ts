import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getWiki } from "@/lib/data";
import type { WikiArticle } from "@/lib/data";

const WIKI_PREFIX = "hanui-wiki";
const DOCTOR_PASSWORD = process.env.ADMIN_PASSWORD || "jw5416200227!";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || "admin1234";
const isValidPassword = (pw: string) => pw === DOCTOR_PASSWORD || pw === STAFF_PASSWORD;

async function saveWiki(articles: WikiArticle[]) {
  await put(`${WIKI_PREFIX}.json`, JSON.stringify(articles), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
    allowOverwrite: true,
    addRandomSuffix: false,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pw = url.searchParams.get("pw");
  if (!pw || !isValidPassword(pw))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const articles = await getWiki();
  return NextResponse.json(articles, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, ...data } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await getWiki();
  const now = new Date().toISOString();
  const article: WikiArticle = {
    id: Date.now().toString(),
    title: data.title || "",
    content: data.content || "",
    category: data.category || "일반",
    createdAt: now,
    updatedAt: now,
  };
  articles.unshift(article);
  await saveWiki(articles);
  return NextResponse.json(article);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, id, ...updateData } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await getWiki();
  const idx = articles.findIndex((a) => a.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  articles[idx] = { ...articles[idx], ...updateData, updatedAt: new Date().toISOString() };
  await saveWiki(articles);
  return NextResponse.json(articles[idx]);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { password, id } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await getWiki();
  await saveWiki(articles.filter((a) => a.id !== id));
  return NextResponse.json({ success: true });
}
