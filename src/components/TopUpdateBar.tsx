"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ChevronRight } from "lucide-react";

/**
 * 최상단 고정 띠배너 — 커뮤니티(치료후기·상담문의)로 보내는 상시 입구.
 *
 * 높이는 globals.css 의 --topbar-h 하나로 관리한다.
 * body 의 padding-top 과 각 페이지 sticky 헤더의 top 이 모두 이 값을 따라가므로,
 * 높이를 바꾸고 싶으면 globals.css 의 변수만 고치면 된다.
 */

/** 환자용 화면에만 띄운다. 내부 운영 화면에는 노출하지 않는다. */
const HIDDEN_PREFIXES = ["/admin", "/system", "/dashboard", "/login", "/manage", "/tangjeon"];

export default function TopUpdateBar() {
  const pathname = usePathname() || "/";
  const hidden = HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // 숨기는 화면에서는 자리(여백)까지 없앤다.
  useEffect(() => {
    const root = document.documentElement;
    if (hidden) root.style.setProperty("--topbar-h", "0px");
    else root.style.removeProperty("--topbar-h");
  }, [hidden]);

  if (hidden) return null;

  return (
    <Link
      href="/community"
      aria-label="누적 치료건수 14만 건 — 상담문의 및 치료후기 확인하러 가기"
      className="fixed inset-x-0 top-0 z-40 flex h-[var(--topbar-h)] items-center justify-center gap-2 bg-[#8B1A2B] px-3 text-[12px] text-white transition-colors hover:bg-[#7A1626] sm:gap-3 sm:text-sm"
    >
      <span className="shrink-0 rounded-full border border-white/60 px-2 py-[2px] text-[10px] font-bold tracking-[0.12em] sm:text-[11px]">
        UPDATE
      </span>
      <span className="truncate">
        누적 치료건수 <b className="font-bold">14만 건</b>
        <span className="hidden sm:inline">, 상담문의 및 치료후기</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-white/15 px-2.5 py-[3px] font-semibold">
        확인하러 가기
        <ChevronRight size={13} />
      </span>
    </Link>
  );
}
