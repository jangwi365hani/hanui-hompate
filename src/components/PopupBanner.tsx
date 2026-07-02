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
  const go = (d: number) => setIdx((i) => (i + d + n) % n);
  const cur = popups[idx];
  const prev = popups[(idx - 1 + n) % n];
  const next = popups[(idx + 1) % n];

  // 양옆 흐릿한 미리보기(peek) — 눌러서 앞으로. 이미지는 살짝 잘려도 되는 티저.
  const Peek = ({ p, side }: { p: Popup; side: "l" | "r" }) => (
    <div
      onClick={() => go(side === "l" ? -1 : 1)}
      role="button"
      aria-label={side === "l" ? "이전 팝업" : "다음 팝업"}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-52 cursor-pointer opacity-50 blur-[2px] scale-95 transition hover:opacity-70 ${
        side === "l" ? "right-full mr-[-64px]" : "left-full ml-[-64px]"
      }`}
    >
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {p.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.imageUrl} alt="" className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-gray-100" />
        )}
        {p.title && <div className="p-3 text-sm font-bold text-gray-800 truncate">{p.title}</div>}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm overflow-hidden px-4 py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className="relative w-full max-w-md"
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
      >
        {/* 카드 무대: 활성 카드가 흐름에 있어 높이를 결정(이미지 전체 노출), peek은 양옆 절대배치 */}
        <div className="relative flex justify-center">
          {n > 1 && <Peek p={prev} side="l" />}
          {n > 1 && <Peek p={next} side="r" />}

          <div className="relative z-30 w-72 max-h-[80vh] overflow-y-auto rounded-3xl">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <button
                onClick={dismiss}
                aria-label="팝업 닫기"
                className="absolute top-3 right-3 z-10 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 backdrop-blur-sm"
              >
                <X size={18} />
              </button>
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
                {cur.title && <h2 className="text-lg font-bold text-gray-900 mb-1.5">{cur.title}</h2>}
                {cur.content && (
                  <p className="text-gray-600 text-sm whitespace-pre-line">{cur.content}</p>
                )}
                {cur.linkUrl && (
                  <a
                    href={cur.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block bg-[#8B1A2B] text-white text-sm font-bold py-2.5 rounded-full text-center hover:bg-[#7a1626] transition"
                  >
                    {cur.buttonText || "자세히 보기"}
                  </a>
                )}
              </div>
            </div>
          </div>
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
