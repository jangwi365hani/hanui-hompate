"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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

  useEffect(() => {
    // 닫기(세션) / 오늘 하루 보지 않기(로컬)는 모든 팝업 공통
    if (sessionStorage.getItem("popup-dismissed")) return;
    const until = localStorage.getItem("popup-dismissed-until");
    if (until && new Date() < new Date(until)) return;

    fetch("/api/popup")
      .then((r) => r.json())
      .then((data) => {
        // { popups: [...] } 우선, 레거시 단일 객체/배열도 호환
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

  const multi = popups.length > 1;
  const cur = popups[Math.min(idx, popups.length - 1)];
  const go = (d: number) => setIdx((i) => (i + d + popups.length) % popups.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <button
          onClick={dismiss}
          aria-label="팝업 닫기"
          className="absolute top-3 right-3 z-20 bg-white/80 rounded-full p-1 hover:bg-gray-100"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* 좌·우 이동 (팝업이 여러 개일 때만) */}
        {multi && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="이전 팝업"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 rounded-full p-1.5 shadow hover:bg-white"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="다음 팝업"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 rounded-full p-1.5 shadow hover:bg-white"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}

        {cur.imageUrl &&
          (cur.linkUrl ? (
            <a href={cur.linkUrl} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cur.imageUrl} alt={cur.title || "팝업 이미지"} className="w-full h-auto block" />
            </a>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={cur.imageUrl} alt={cur.title || "팝업 이미지"} className="w-full h-auto block" />
          ))}

        <div className="p-5">
          {cur.title && <h2 className="text-xl font-bold text-gray-900 mb-2">{cur.title}</h2>}
          {cur.content && (
            <p className="text-gray-600 text-sm whitespace-pre-line mb-4">{cur.content}</p>
          )}

          {/* 인디케이터 점 */}
          {multi && (
            <div className="flex justify-center gap-1.5 mb-4">
              {popups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`${i + 1}번째 팝업 보기`}
                  className={`w-2 h-2 rounded-full transition ${i === idx ? "bg-[#8B1A2B]" : "bg-gray-300"}`}
                />
              ))}
            </div>
          )}

          <div className="flex gap-2 items-center">
            {cur.linkUrl && (
              <a
                href={cur.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#8B1A2B] text-white text-sm font-medium py-2 rounded-lg text-center hover:bg-[#7a1626] transition"
              >
                {cur.buttonText || "자세히 보기"}
              </a>
            )}
            <button
              onClick={dismissToday}
              className="text-gray-400 text-xs py-2 px-3 hover:text-gray-600"
            >
              오늘 하루 보지 않기
            </button>
            <button
              onClick={dismiss}
              className="text-gray-400 text-xs py-2 px-3 hover:text-gray-600"
            >
              닫기
            </button>
          </div>

          {multi && (
            <p className="text-center text-[11px] text-gray-400 mt-2">
              {idx + 1} / {popups.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
