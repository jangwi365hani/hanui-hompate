import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import type { HandoverData, HandoverAccount, HandoverItem } from "@/lib/data";
import { getHandover } from "@/lib/data";

const PREFIX = "hanui-handover";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

const STAFF_PARTS: Record<string, string[]> = {
  데스크: ["전화 응대", "EMR 접수/수납", "보험 청구", "문진표 관리", "대기실 안내"],
  행정: ["물품 발주", "청구서 처리", "일정 관리", "공지 관리", "서류 발급"],
  탕전: ["탕전기 사용", "처방 확인", "약재 보관", "위생 관리", "포장/라벨"],
  치료실: ["침 시술 준비", "약침 준비", "부항 시술", "뜸 시술", "소독/정리"],
};

const DOC_PARTS: Record<string, string[]> = {
  진료: ["초진 문진", "변증 적용", "처방 작성", "침 취혈", "약침 적응증/금기", "재진 관리"],
  스터디: ["케이스 리뷰", "논문 세미나", "학회 일정", "스터디 방식", "증례 기록"],
  행정: ["지시 체계", "직원 평가", "회의 진행", "민원 처리", "원내 규정"],
  경영: ["매출/지출 보고", "마케팅 채널", "환자 유입 분석", "원가 구조", "원장 권한 범위"],
};

async function saveHandover(data: HandoverData) {
  const { blobs } = await list({ prefix: PREFIX });
  if (blobs.length > 0) await del(blobs.map((b) => b.url));
  await put(`${PREFIX}.json`, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("pw") !== ADMIN_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getHandover();
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, action } = body;
  if (password !== ADMIN_PASSWORD)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getHandover();

  if (action === "add_account") {
    const { name, role, since } = body as { name: string; role: "doc" | "staff"; since: string };
    const id = Date.now().toString();
    const account: HandoverAccount = { id, name, role, since: since || "", memo: "" };
    data.accounts.push(account);
    const parts = role === "doc" ? DOC_PARTS : STAFF_PARTS;
    data.items[id] = {};
    for (const [part, defaults] of Object.entries(parts)) {
      data.items[id][part] = defaults.map((memo) => ({ memo, checked: false, date: "" }));
    }
    await saveHandover(data);
    return NextResponse.json(account);
  }

  if (action === "delete_account") {
    const { id } = body as { id: string };
    data.accounts = data.accounts.filter((a) => a.id !== id);
    delete data.items[id];
    await saveHandover(data);
    return NextResponse.json({ success: true });
  }

  if (action === "add_item") {
    const { accountId, part } = body as { accountId: string; part: string };
    if (!data.items[accountId]) data.items[accountId] = {};
    if (!data.items[accountId][part]) data.items[accountId][part] = [];
    data.items[accountId][part].push({ memo: "", checked: false, date: "" });
    await saveHandover(data);
    return NextResponse.json({ success: true });
  }

  if (action === "update_item") {
    const { accountId, part, idx, memo, checked, date } = body as {
      accountId: string; part: string; idx: number;
      memo: string; checked: boolean; date: string;
    };
    const item: HandoverItem = { memo, checked, date: date || "" };
    if (data.items[accountId]?.[part] !== undefined) {
      data.items[accountId][part][idx] = item;
      await saveHandover(data);
    }
    return NextResponse.json({ success: true });
  }

  if (action === "update_memo") {
    const { id, memo } = body as { id: string; memo: string };
    const acc = data.accounts.find((a) => a.id === id);
    if (acc) { acc.memo = memo; await saveHandover(data); }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
