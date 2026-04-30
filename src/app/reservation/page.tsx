"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface Slot { time: string; count: number; }
interface Day  { date: string; dayName: string; totalCount: number; }
interface StatusData {
  updatedAt: string;
  today: { date: string; slots: Slot[]; totalCount: number };
  week:  { days: Day[] };
}

function formatDate(dateStr: string) {
  const y = dateStr.slice(0, 4);
  const m = parseInt(dateStr.slice(4, 6));
  const d = parseInt(dateStr.slice(6, 8));
  return `${y}년 ${m}월 ${d}일`;
}

function formatUpdated(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export default function ReservationPage() {
  const [data, setData]       = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reservation-status", { cache: "no-store" });
      const json = await res.json();
      setData(json);
      setLastFetch(new Date());
    } catch {
      // keep stale data
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
              : "데이터를 불러오는 중..."}
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

        {!data && !loading && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            현황 데이터를 불러올 수 없습니다.
          </div>
        )}

        {data && (
          <>
            {/* 오늘 예약 현황 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">오늘 예약 현황</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(data.today.date)}</p>
                </div>
                <span className="text-2xl font-bold text-[#8B1A2B]">
                  {data.today.totalCount}
                  <span className="text-sm font-normal text-gray-400 ml-1">명</span>
                </span>
              </div>

              {data.today.slots.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  오늘 예약이 없습니다.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.today.slots.map((slot) => (
                    <div key={slot.time} className="px-5 py-3 flex items-center justify-between">
                      <span className="text-sm font-mono font-medium text-gray-700">
                        {slot.time}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {Array.from({ length: slot.count }).map((_, i) => (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full bg-[#8B1A2B] opacity-70"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {slot.count}명
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 이번 주 예약 현황 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">이번 주 예약 현황</h2>
              <div className="space-y-2.5">
                {data.week.days.map((day, i) => {
                  const isToday = day.date === data.today.date;
                  const pct     = Math.round((day.totalCount / maxWeekCount) * 100);
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
                        ) : (
                          `${day.totalCount}명`
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 안내 */}
            <p className="text-xs text-gray-400 text-center pb-4">
              예약 현황은 약 5분마다 자동으로 업데이트됩니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
