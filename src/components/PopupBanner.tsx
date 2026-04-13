"use client";

import { useState, useEffect } from "react";
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
  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("popup-dismissed");
    if (dismissed) return;

    fetch("/api/popup")
      .then((r) => r.json())
      .then((data: Popup) => {
        if (data.isActive) {
          setPopup(data);
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

  useEffect(() => {
    const until = localStorage.getItem("popup-dismissed-until");
    if (until && new Date() < new Date(until)) {
      setVisible(false);
    }
  }, []);

  if (!visible || !popup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-1 hover:bg-gray-100"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {popup.imageUrl && (
          <img
            src={popup.imageUrl}
            alt={popup.title}
            className="w-full object-cover max-h-64"
          />
        )}

        <div className="p-5">
          {popup.title && (
            <h2 className="text-xl font-bold text-gray-900 mb-2">{popup.title}</h2>
          )}
          {popup.content && (
            <p className="text-gray-600 text-sm whitespace-pre-line mb-4">{popup.content}</p>
          )}

          <div className="flex gap-2">
            {popup.linkUrl && (
              <a
                href={popup.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#8B1A2B] text-white text-sm font-medium py-2 rounded-lg text-center hover:bg-[#7a1626] transition"
              >
                {popup.buttonText || "자세히 보기"}
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
        </div>
      </div>
    </div>
  );
}
