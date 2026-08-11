import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { CLINICS, clinicPath } from "@/lib/clinics";

/**
 * 클리닉 페이지 공용 조각.
 *
 * 클리닉 페이지 8개가 같은 골격(머리말 → 도입 → 증상 → 원인 → 치료 → 절차 → 안내 → 예약)을
 * 쓰기 때문에, 페이지마다 JSX를 다시 쓰지 않고 이 조각들을 조립한다.
 * 페이지별로 다른 것(성장보고서 견본 같은)은 children으로 끼워 넣는다.
 *
 * 전부 서버 컴포넌트다 — 상호작용이 없어 클라이언트 번들에 실을 이유가 없다.
 */

type Icon = ComponentType<{ size?: number; className?: string }>;

export interface CardItem {
  Icon?: Icon;
  title: string;
  desc: string;
  /** 왜 확인·치료가 필요한지 한 줄 더 붙이고 싶을 때 */
  note?: string;
}

/* ── 머리말 ─────────────────────────────────────────── */

export function ClinicHeader({ title, maxWidth = "max-w-5xl" }: { title: string; maxWidth?: string }) {
  return (
    <div className="bg-[#8B1A2B] text-white">
      <div className={`${maxWidth} mx-auto px-4 py-6 flex items-center gap-3`}>
        <Link href="/#services" className="hover:opacity-75 transition" aria-label="진료과목으로">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <p className="text-sm opacity-75">장위365경희한의원</p>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </div>
    </div>
  );
}

/* ── 도입부 ─────────────────────────────────────────── */

export function ClinicIntro({
  eyebrow,
  headline,
  lead,
}: {
  eyebrow: string;
  headline: ReactNode;
  lead: string;
}) {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-14 text-center">
        <span className="text-xs tracking-[0.2em] text-[#8B1A2B] font-semibold uppercase">
          {eyebrow}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 leading-snug">
          {headline}
        </h2>
        <p className="text-gray-500 mt-5 text-[15px] leading-relaxed max-w-2xl mx-auto">{lead}</p>
      </div>
    </section>
  );
}

/* ── 섹션 껍데기 ────────────────────────────────────── */

export function Section({
  title,
  desc,
  tone = "gray",
  children,
}: {
  title: string;
  desc?: string;
  tone?: "gray" | "white";
  children: ReactNode;
}) {
  const inner = (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
      {desc && <p className="text-sm text-gray-500 mb-8 leading-relaxed">{desc}</p>}
      {!desc && <div className="mb-8" />}
      {children}
    </div>
  );

  return tone === "white" ? (
    <section className="bg-white border-y border-gray-100">{inner}</section>
  ) : (
    <section>{inner}</section>
  );
}

/* ── 카드 묶음 ──────────────────────────────────────── */

export function CardGrid({ items, cols = 3 }: { items: CardItem[]; cols?: 2 | 3 }) {
  const grid = cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid ${grid} gap-4`}>
      {items.map(({ Icon, title, desc, note }) => (
        <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {Icon && <Icon size={22} className="text-[#8B1A2B] mb-3" />}
          <h3 className="font-bold text-gray-900 text-[15px] mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          {note && (
            <p className="text-sm text-[#8B1A2B] leading-relaxed mt-3 pt-3 border-t border-gray-100">
              {note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/** 카드보다 설명이 긴 항목(치료법 등)에 쓰는 가로형 배치. */
export function FeatureList({ items }: { items: CardItem[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {items.map(({ Icon, title, desc }) => (
        <div key={title} className="flex gap-4 bg-gray-50 rounded-2xl p-6">
          {Icon && (
            <div className="shrink-0 w-11 h-11 rounded-xl bg-[#8B1A2B]/10 flex items-center justify-center">
              <Icon size={20} className="text-[#8B1A2B]" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900 text-[15px] mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 번호가 붙은 절차 ───────────────────────────────── */

export function NumberedSteps({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {steps.map((s, i) => (
        <div key={s.title} className="relative bg-gray-50 rounded-2xl p-6">
          <span className="text-3xl font-bold text-[#8B1A2B]/15 absolute top-4 right-5">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="font-bold text-gray-900 text-[15px] mb-2 relative">{s.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed relative">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ── 안내 상자 ──────────────────────────────────────── */

export function NoticeBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-[#faf5f6] border border-[#e8d5d9] rounded-2xl p-6">
      <p className="flex items-center gap-2 font-bold text-[#8B1A2B] text-sm mb-3">
        <CheckCircle2 size={16} /> {title}
      </p>
      <ul className="text-sm text-gray-600 space-y-1.5 leading-relaxed">
        {items.map((t) => (
          <li key={t}>· {t}</li>
        ))}
      </ul>
    </div>
  );
}

/** 이럴 땐 바로 진료를 받으시라는 경고 — 색을 달리해 안내 상자와 구분한다. */
export function WarningBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
      <p className="font-bold text-amber-800 text-sm mb-3">{title}</p>
      <ul className="text-sm text-amber-900/80 space-y-1.5 leading-relaxed">
        {items.map((t) => (
          <li key={t}>· {t}</li>
        ))}
      </ul>
    </div>
  );
}

/* ── 예약 유도 ──────────────────────────────────────── */

export function ClinicCTA() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <a
        href="/reservation"
        className="flex items-center justify-center gap-2 bg-[#03C75A] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#02b350] transition text-sm"
      >
        <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-[#03C75A] rounded-sm text-[11px] font-black leading-none">
          N
        </span>
        네이버 예약하기
      </a>
      <a
        href="tel:02-6952-2800"
        className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-full hover:bg-gray-50 transition text-sm"
      >
        02-6952-2800 전화 문의
      </a>
    </div>
  );
}

/* ── 다른 클리닉 둘러보기 ───────────────────────────── */

export function OtherClinics({ currentSlug }: { currentSlug: string }) {
  const others = CLINICS.filter((c) => c.ready && c.slug !== currentSlug);
  if (!others.length) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-4">
      <p className="text-sm font-bold text-gray-900 mb-3">다른 클리닉</p>
      <div className="flex flex-wrap gap-2">
        {others.map((c) => (
          <Link
            key={c.slug}
            href={clinicPath(c.slug)}
            className="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full hover:border-[#8B1A2B] hover:text-[#8B1A2B] transition"
          >
            {c.title} <ChevronRight size={14} />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── 하단 고지 ──────────────────────────────────────── */

export function ClinicDisclaimer({ children }: { children: ReactNode }) {
  return (
    <footer className="max-w-5xl mx-auto px-4 py-10">
      <p className="text-[11px] text-gray-400 leading-relaxed text-center">{children}</p>
    </footer>
  );
}
