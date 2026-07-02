"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface Popup {
  isActive: boolean;
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
}

export default function PopupBanner() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);
  const hoverRef = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem("popup-dismissed")) return;
    const until = localStorage.getItem("popup-dismissed-until");
    if (until && new Date() < new Date(until)) return;

    fetch("/api/popup")
      .then((r) => r.json())
      .then((data) => {
        const list: Popup[] = Array.isArray(data?.popups)
          ? data.popups
          : Array.isArray(data)
          ? data
          : data && (data.title || data.imageUrl || typeof data.isActive === "boolean")
          ? [data]
          : [];
        const active = list.filter((p) => p && p.isActive && (p.imageUrl || p.title || p.content));
        if (active.length) {
          setPopups(active);
          setVisible(true);
        }
      })
      .catch(() => {});
  }, []);

  // 자동 회전 (2개 이상, 호버 시 정지)
  useEffect(() => {
    if (!visible || popups.length < 2) return;
    const t = setInterval(() => {
      if (!hoverRef.current) setIdx((i) => (i + 1) % popups.length);
    }, 4500);
    return () => clearInterval(t);
  }, [visible, popups.length]);

  const dismiss = () => {
    sessionStorage.setItem("popup-dismissed", "1");
    setVisible(false);
  };
  const dismissToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("popup-dismissed-until", tomorrow.toISOString());
    setVisible(false);
  };

  if (!visible || popups.length === 0) return null;

  const n = popups.length;
  // 현재 기준 상대 위치(-1, 0, +1 …) — 원형
  const rel = (i: number) => {
    let d = i - idx;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm overflow-hidden px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className="relative w-full max-w-md"
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
      >
        {/* 코버플로우 스테이지 */}
        <div className="relative h-[440px]">
          {popups.map((p, i) => {
            const d = rel(i);
            if (Math.abs(d) > 1) return null; // 현재 + 양옆만
            const active = d === 0;
            const style: React.CSSProperties = {
              transform: `translateX(${d * 56}%) scale(${active ? 1 : 0.82})`,
              opacity: active ? 1 : 0.5,
              filter: active ? "none" : "blur(2px)",
              zIndex: active ? 30 : 20,
            };
            return (
              <div
                key={i}
                onClick={() => !active && setIdx(i)}
                aria-hidden={!active}
                className={`absolute top-0 left-1/2 -ml-36 w-72 transition-all duration-500 ease-out ${
                  active ? "" : "cursor-pointer"
                }`}
                style={style}
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  {active && (
                    <button
                      onClick={dismiss}
                      aria-label="팝업 닫기"
                      className="absolute top-3 right-3 z-10 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 backdrop-blur-sm"
                    >
                      <X size={18} />
                    </button>
                  )}
                  {p.imageUrl &&
                    (active && p.linkUrl ? (
                      <a href={p.linkUrl} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrl} alt={p.title || "팝업 이미지"} className="w-full h-52 object-cover" />
                      </a>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.imageUrl} alt={p.title || "팝업 이미지"} className="w-full h-52 object-cover" />
                    ))}
                  <div className="p-5">
                    {p.title && <h2 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-1">{p.title}</h2>}
                    {p.content && (
                      <p className="text-gray-600 text-sm whitespace-pre-line line-clamp-3">{p.content}</p>
                    )}
                    {active && p.linkUrl && (
                      <a
                        href={p.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 block bg-[#8B1A2B] text-white text-sm font-bold py-2.5 rounded-full text-center hover:bg-[#7a1626] transition"
                      >
                        {p.buttonText || "자세히 보기"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 인디케이터 + 오늘 하루 보지 않기 */}
        <div className="mt-5 flex flex-col items-center gap-3">
          {n > 1 && (
            <div className="flex gap-2">
              {popups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`${i + 1}번째 팝업 보기`}
                  className={`h-2 rounded-full transition-all ${i === idx ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}
                />
              ))}
            </div>
          )}
          <button onClick={dismissToday} className="text-white/70 text-xs hover:text-white transition-colors">
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
