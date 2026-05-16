import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

// 네이버 예약 스케줄(원장별 근무 가능 시간) 캐시
// - GET 호출 시 blob 나이가 1시간 이상이면 네이버 GraphQL에서 다시 가져와 저장
// - board.html 이 클릭 시 원장 비활성화 판단에 사용
const PREFIX = "hanui-naver-schedule";
const REFRESH_MS = 60 * 60 * 1000; // 1시간

const DOCTORS = [
  { id: "5729528", name: "김현규" },
  { id: "6131733", name: "안익균" },
  { id: "6170514", name: "박종성" },
  { id: "7207730", name: "신지훈" },
  { id: "7639099", name: "김경민" },
];

const HOURLY_QUERY = `query hourlySchedule($scheduleParams: ScheduleParams) {
  schedule(input: $scheduleParams) {
    bizItemSchedule {
      hourly {
        unitStartDateTime
        unitBookingCount
        unitStock
        isUnitSaleDay
      }
    }
  }
}`;

type NaverSlot = {
  unitStartDateTime: string;
  unitBookingCount: number | null;
  unitStock: number | null;
  isUnitSaleDay: boolean;
};

async function fetchDoctor(id: string, startDate: string, endDate: string) {
  const payload = {
    operationName: "hourlySchedule",
    variables: {
      scheduleParams: {
        businessTypeId: 13,
        businessId: "567280",
        bizItemId: id,
        startDateTime: `${startDate}T00:00:00`,
        endDateTime: `${endDate}T23:59:59`,
        fixedTime: true,
        includesHolidaySchedules: true,
      },
    },
    query: HOURLY_QUERY,
  };
  const r = await fetch("https://booking.naver.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://booking.naver.com",
      Referer: `https://booking.naver.com/booking/13/bizes/567280/items/${id}`,
      "User-Agent": "Mozilla/5.0",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`Naver HTTP ${r.status}`);
  const data = await r.json();
  const slots: NaverSlot[] = data?.data?.schedule?.bizItemSchedule?.hourly || [];

  // {date: Set<hour>} — 예약 가능한 슬롯이 1개라도 있는 시간만 수집
  const available: Record<string, Set<number>> = {};
  for (const s of slots) {
    if (!s.isUnitSaleDay) continue;
    const book = s.unitBookingCount || 0;
    const stock = s.unitStock || 0;
    if (book >= stock) continue;
    // unitStartDateTime은 UTC ("2026-05-16T01:00:00Z") → KST(+9)
    const dt = new Date(s.unitStartDateTime);
    const kstMs = dt.getTime() + 9 * 3600 * 1000;
    const kst = new Date(kstMs);
    const y = kst.getUTCFullYear();
    const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(kst.getUTCDate()).padStart(2, "0");
    const date = `${y}-${m}-${d}`;
    const hour = kst.getUTCHours();
    if (!available[date]) available[date] = new Set();
    available[date].add(hour);
  }

  const out: Record<string, number[]> = {};
  for (const [k, v] of Object.entries(available)) {
    out[k] = [...v].sort((a, b) => a - b);
  }
  return out;
}

async function fetchNaverSchedule() {
  const today = new Date();
  // KST 기준 오늘 ~ +21일
  const kstToday = new Date(today.getTime() + 9 * 3600 * 1000);
  const startDate = kstToday.toISOString().slice(0, 10);
  const end = new Date(today.getTime() + 21 * 86400 * 1000);
  const kstEnd = new Date(end.getTime() + 9 * 3600 * 1000);
  const endDate = kstEnd.toISOString().slice(0, 10);

  const results = await Promise.all(
    DOCTORS.map(async (d) => ({
      id: d.id,
      name: d.name,
      available: await fetchDoctor(d.id, startDate, endDate),
    }))
  );

  return {
    updatedAt: new Date().toISOString(),
    range: { start: startDate, end: endDate },
    doctors: results,
  };
}

async function trimOldBlobs() {
  try {
    const { blobs } = await list({ prefix: `${PREFIX}/` });
    const old = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(3);
    if (old.length) await del(old.map((b) => b.url));
  } catch {}
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: PREFIX });
    if (blobs.length > 0) {
      const latest = blobs.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )[0];
      const age = Date.now() - new Date(latest.uploadedAt).getTime();
      if (age < REFRESH_MS) {
        const res = await fetch(`${latest.url}?v=${new Date(latest.uploadedAt).getTime()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        return NextResponse.json(data, { headers: { "Cache-Control": "max-age=300" } });
      }
    }
    // blob 없음 또는 1시간 이상 오래됨 → 새로 가져와 저장
    const fresh = await fetchNaverSchedule();
    await put(`${PREFIX}/${Date.now()}.json`, JSON.stringify(fresh), {
      access: "public",
      contentType: "application/json",
      cacheControlMaxAge: 0,
      addRandomSuffix: false,
    });
    trimOldBlobs();
    return NextResponse.json(fresh, { headers: { "Cache-Control": "max-age=300" } });
  } catch (e) {
    return NextResponse.json({ error: String(e), doctors: [] }, { status: 500 });
  }
}
