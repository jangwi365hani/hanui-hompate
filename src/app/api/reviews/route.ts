import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import type { Review } from "@/lib/data";
import { getReviews } from "@/lib/data";

const REVIEWS_PREFIX = "hanui-reviews";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.admin_password || "jw5416200227!";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || process.env.staff_password || "admin1234";
const isValidPassword = (pw: string) => pw === ADMIN_PASSWORD || pw === STAFF_PASSWORD;

async function saveReviews(reviews: Review[]) {
  await put(`${REVIEWS_PREFIX}/${Date.now()}.json`, JSON.stringify(reviews), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
    addRandomSuffix: false,
  });
  try {
    const { blobs } = await list({ prefix: `${REVIEWS_PREFIX}/` });
    const old = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(3);
    if (old.length) await del(old.map((b) => b.url));
  } catch {}
}

export async function GET() {
  const reviews = await getReviews();
  return NextResponse.json(reviews, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, ...data } = body;
  if (!isValidPassword(password)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await getReviews();
  const newReview: Review = {
    id: Date.now().toString(),
    author: data.author || "",
    content: data.content || "",
    rating: Number(data.rating) || 5,
    imageUrl: data.imageUrl || "",
    isActive: data.isActive ?? true,
    createdAt: new Date().toISOString(),
  };
  reviews.unshift(newReview);
  await saveReviews(reviews);
  return NextResponse.json(newReview);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, id, ...updateData } = body;
  if (!isValidPassword(password)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await getReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating) || 5;
  reviews[idx] = { ...reviews[idx], ...updateData };
  await saveReviews(reviews);
  return NextResponse.json(reviews[idx]);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { password, id } = body;
  if (!isValidPassword(password)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await getReviews();
  await saveReviews(reviews.filter((r) => r.id !== id));
  return NextResponse.json({ success: true });
}
