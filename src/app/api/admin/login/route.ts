import { NextResponse } from "next/server";

const DOCTOR_PASSWORD = process.env.ADMIN_PASSWORD || process.env.admin_password || "jw5416200227!";
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || process.env.staff_password || "admin1234";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password === DOCTOR_PASSWORD) return NextResponse.json({ ok: true, role: "doc" });
  if (password === STAFF_PASSWORD) return NextResponse.json({ ok: true, role: "staff" });
  return NextResponse.json({ ok: false }, { status: 401 });
}
