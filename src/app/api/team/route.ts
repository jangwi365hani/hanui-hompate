import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getDoctors } from "@/lib/data";
import type { Doctor } from "@/lib/data";

const DOCTORS_PREFIX = "hanui-doctors";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.admin_password || "jw5416200227!";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || process.env.staff_password || "admin1234";
const isValidPassword = (pw: string) => pw === ADMIN_PASSWORD || pw === STAFF_PASSWORD;

async function saveDoctors(doctors: Doctor[]) {
  await put(`${DOCTORS_PREFIX}/${Date.now()}.json`, JSON.stringify(doctors), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
    addRandomSuffix: false,
  });
  try {
    const { blobs } = await list({ prefix: `${DOCTORS_PREFIX}/` });
    const old = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(3);
    if (old.length) await del(old.map((b) => b.url));
  } catch {}
}

// 입력값을 Doctor 형태로 정규화 (태그/인사말은 문자열로 와도 배열로 변환)
function normalize(data: Partial<Doctor> & { tags?: unknown; bio?: unknown }): Omit<Doctor, "id"> {
  const toArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
    if (typeof v === "string")
      return v
        .split(/\r?\n|,/)
        .map((x) => x.trim())
        .filter(Boolean);
    return [];
  };
  const toBio = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
    if (typeof v === "string")
      return v
        .split(/\r?\n\s*\r?\n|\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean);
    return [];
  };
  return {
    slug: (data.slug || "").trim(),
    name: (data.name || "").trim(),
    title: (data.title || "").trim(),
    subtitle: (data.subtitle || "").trim(),
    tags: toArray(data.tags),
    bio: toBio(data.bio),
    imageUrl: (data.imageUrl || "").trim(),
    isActive: data.isActive ?? true,
  };
}

export async function GET() {
  const doctors = await getDoctors();
  return NextResponse.json(doctors, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, ...data } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doctors = await getDoctors();
  const fields = normalize(data);
  if (!fields.name) return NextResponse.json({ error: "이름은 필수입니다." }, { status: 400 });

  // slug 미입력 시 타임스탬프로 자동 생성, 중복 방지
  let slug = fields.slug || `dr${Date.now()}`;
  if (doctors.some((d) => d.slug === slug)) slug = `${slug}-${Date.now()}`;

  const newDoctor: Doctor = { id: Date.now().toString(), ...fields, slug };
  doctors.push(newDoctor); // 정의된 순서를 유지하기 위해 끝에 추가
  await saveDoctors(doctors);
  return NextResponse.json(newDoctor);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, id, ...updateData } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doctors = await getDoctors();
  const idx = doctors.findIndex((d) => d.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 노출 토글만 보낼 때(isActive만 전달)는 나머지 필드를 유지
  const onlyToggle =
    Object.keys(updateData).length === 1 && Object.prototype.hasOwnProperty.call(updateData, "isActive");
  if (onlyToggle) {
    doctors[idx] = { ...doctors[idx], isActive: updateData.isActive };
  } else {
    const fields = normalize({ ...doctors[idx], ...updateData });
    // slug 변경 시 다른 의료진과 충돌하지 않도록 검증
    if (fields.slug && doctors.some((d, i) => i !== idx && d.slug === fields.slug))
      return NextResponse.json({ error: "이미 사용 중인 슬러그입니다." }, { status: 400 });
    doctors[idx] = { ...doctors[idx], ...fields, id: doctors[idx].id };
  }
  await saveDoctors(doctors);
  return NextResponse.json(doctors[idx]);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { password, id } = body;
  if (!isValidPassword(password))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doctors = await getDoctors();
  await saveDoctors(doctors.filter((d) => d.id !== id));
  return NextResponse.json({ success: true });
}
