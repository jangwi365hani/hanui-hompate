"use client";
import { useEffect } from "react";

// 칼럼 상세 진입 시 조회수 +1 (같은 세션 중복 방지)
export default function ColumnView({ id }: { id: string }) {
  useEffect(() => {
    const key = "cv-" + id;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    fetch("/api/columns/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }, [id]);
  return null;
}
