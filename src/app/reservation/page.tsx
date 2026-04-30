"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, WifiOff } from "lucide-react";

type Status = "여유" | "다소혼잡" | "혼잡" | "불가";

interface HourStatus { hour: number; status: Status; }
interface Day        { date: string; dayName: string; totalCount: number; }
interface StatusData {
  updatedAt: string;
  date: string;
  hours: HourStatus[];
  week: { days: Day[] };
}

const BADGE: Record<Status, { bg: string; text: string; border: string }> = {
  여유:    { bg: "bg-[#EAF3DE]", text: "text-[#3B6D11]", border: "border-[#97C459]" },
  다소혼잡: { bg: "bg-[#FAEEDA]", text: "text-[#854F0B]", border: "border-[#FAC775]" },
  혼잡:    { bg: "bg-[#FDECEA]", text: "text-[#B03030]", border: "border-[#F5AAAA]" },
  불가:    { bg: "bg-[#F0EFE9]", text: "text-[#999]",    border: "border-[#ddd]"    },
};

function formatDate(dateStr: string) {
  const y = dateStr.slice(0, 4);
  const m = parseInt(dateStr.slice(4, 6));
  const d = parseInt(dateStr.slice(6, 8));
  return `${y}년 ${m}월 ${d}일`;
}

function formatUpdated(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function ReservationPage() {
  const [data, setData]       = useState<StatusData | null>(null);
  const [error, setError]     = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/reservation-status", { cache: "no-store" });
      const json = await res.json();
      if (json && json.hours) {
        setData(json);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchData]);

  const maxWeekCount = data
    ? Math.max(...data.week.days.map((d) => d.totalCount), 1)
    : 1;

  // 점심 구분선 삽입용 — 12시 다음 14시 앞에 구분선
  const hasAfternoon = data?.hours.some((h) => h.hour >= 14) ?? false;
  const hasMorning   = data?.hours.some((h) => h.hour < 13)  ?? false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#8B1A2B] text-white px-4 py-5">
        <p className="text-xs opacity-75 mb-0.5">장위365경희한의원</p>
        <h1 className="text-xl font-bold">예약 현황</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* 업데이트 시각 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {data
              ? `${formatUpdated(data.updatedAt)} 기준`
              : loading ? "불러오는 중…" : ""}
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#8B1A2B] transition"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            새로고침
          </button>
        </div>

        {/* 연결 실패 */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-10 flex flex-col items-center gap-3 text-center">
            <WifiOff size={32} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-500">현황을 불러올 수 없습니다</p>
            <p className="text-xs text-gray-400">잠시 후 다시 시도해주세요</p>
            <button
              onClick={fetchData}
              className="mt-1 text-xs text-[#8B1A2B] border border-[#8B1A2B]/30 rounded-full px-4 py-1.5 hover:bg-[#fdf3f4] transition"
            >
              다시 시도
            </button>
          </div>
        )}

        {data && !error && (
          <>
            {/* 오늘 예약 현황 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">오늘 예약 현황</h2>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(data.date)}</p>
              </div>

              {data.hours.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  오늘 예약 시간 정보가 없습니다.
                </div>
              ) : (
                <div className="px-5 py-4">
                  {/* 범례 */}
                  <div className="flex gap-3 mb-4 flex-wrap">
                    {(["여유", "다소혼잡", "혼잡", "불가"] as Status[]).map((s) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full border ${BADGE[s].bg} ${BADGE[s].border}`}
                        />
                        <span className="text-[11px] text-gray-500">{s}</span>
                      </div>
                    ))}
                  </div>

                  {/* 시간대 그리드 */}
                  <div className="grid grid-cols-2 gap-2">
                    {data.hours.map((h, idx) => {
                      const b = BADGE[h.status];
                      // 점심 구분선: 12→14시 사이에 오후 시작 표시
                      const prevHour = idx > 0 ? data.hours[idx - 1].hour : null;
                      const showLunch = prevHour !== null && prevHour < 13 && h.hour >= 14;
                      return (
                        <div key={h.hour}>
                          {showLunch && (
                            <div className="col-span-2 text-center text-[11px] text-gray-300 py-1 flex items-center gap-2 mb-1 -mx-2">
                              <div className="flex-1 h-px bg-gray-100" />
                              <span>점심 휴식</span>
                              <div className="flex-1 h-px bg-gray-100" />
                            </div>
                          )}
                          <div
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border ${b.bg} ${b.border}`}
                          >
                            <span className="text-sm font-semibold text-gray-700">{h.hour}시</span>
                            <span className={`text-sm font-bold ${b.text}`}>{h.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 이번 주 예약 현황 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">이번 주 예약 현황</h2>
              <div className="space-y-2.5">
                {data.week.days.map((day) => {
                  const isToday = day.date === data.date;
                  const pct = Math.round((day.totalCount / maxWeekCount) * 100);
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <div className={`text-center w-12 shrink-0 ${isToday ? "text-[#8B1A2B] font-bold" : "text-gray-500"}`}>
                        <div className="text-xs">{day.dayName}</div>
                        <div className="text-sm">{parseInt(day.date.slice(6, 8))}일</div>
                      </div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isToday ? "bg-[#8B1A2B]" : "bg-[#c87a87]"}`}
                            style={{ width: day.totalCount === 0 ? "0%" : `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-medium w-10 text-right shrink-0 ${isToday ? "text-[#8B1A2B]" : "text-gray-600"}`}>
                        {day.totalCount === 0 ? (
                          <span className="text-xs text-gray-300">-</span>
                        ) : `${day.totalCount}명`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center pb-4">
              예약 현황은 약 5분마다 자동으로 업데이트됩니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
