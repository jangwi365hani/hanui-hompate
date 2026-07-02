export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, ChevronLeft, BadgeCheck, FileText, ExternalLink } from "lucide-react";
import { getColumns, getDoctors } from "@/lib/data";

export default async function DoctorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const DOCTORS = await getDoctors();
  const doctor = DOCTORS.find((d) => d.slug === slug && d.isActive);
  if (!doctor) notFound();

  // 이 원장이 작성한 건강 칼럼(작성자명에 원장 이름 포함, 게시중인 것만)
  const allColumns = await getColumns();
  const doctorColumns = allColumns
    .filter((c) => c.isActive && (c.author || "").includes(doctor.name))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#8B1A2B] transition-colors text-sm font-medium">
            <ChevronLeft size={16} /> 홈으로
          </Link>
          <Link href="/">
            <Image src="/images/logo.png" alt="장위365경희한의원" width={120} height={40} className="object-contain h-10 w-auto" />
          </Link>
          <a href="https://m.booking.naver.com/booking/13/bizes/567280?theme=place&service-target=map-pc&lang=ko&area=bmp&map-search=1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#03C75A] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#02b350] transition-colors">
            <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-[#03C75A] rounded-sm text-xs font-black leading-none">N</span> 네이버 예약
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* 프로필 상단 */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <span className="text-xs tracking-[0.2em] text-[#8B1A2B] font-semibold uppercase">Medical Team</span>
            <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-1">{doctor.name}</h1>
            <p className="text-[#8B1A2B] font-semibold mb-4">{doctor.title}</p>
            <p className="text-xl text-gray-700 font-medium leading-snug mb-6 border-l-4 border-[#8B1A2B] pl-4">
              {doctor.subtitle}
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {doctor.tags.map((tag) => (
                <span key={tag} className="bg-[#fdf3f4] text-[#8B1A2B] text-sm font-medium px-4 py-1.5 rounded-full border border-[#f5e0e3]">
                  {tag}
                </span>
              ))}
            </div>
            {/* 연구 논문 공동 저자 뱃지 (김현규 원장) */}
            {doctor.name === "김현규" && (
              <div className="flex items-start gap-2 mb-8 bg-[#fdf3f4] border border-[#f5e0e3] rounded-2xl px-4 py-3">
                <BadgeCheck size={18} className="text-[#8B1A2B] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-[#8B1A2B] font-semibold leading-snug">
                  국제 약리학 학술지 Frontiers in Pharmacology(IF 5.4, Q1) 게재 논문 공동 저자
                </p>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              <a href="https://m.booking.naver.com/booking/13/bizes/567280?theme=place&service-target=map-pc&lang=ko&area=bmp&map-search=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#03C75A] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#02b350] transition-colors shadow-sm">
                <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-[#03C75A] rounded-sm text-xs font-black leading-none">N</span> 네이버 예약하기
              </a>
              <a href="tel:02-6952-2800" className="inline-flex items-center gap-2 bg-[#8B1A2B] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#6e1522] transition-colors shadow-sm">
                <Phone size={15} /> 02-6952-2800
              </a>
            </div>
          </div>
        </div>

        {/* 인사말 */}
        <div className="bg-gray-50 rounded-3xl p-10 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#8B1A2B] rounded-full inline-block" />
            원장 인사말
          </h2>
          {doctor.bio.map((para, i) => (
            <p key={i} className="text-gray-600 leading-relaxed text-[15px]">{para}</p>
          ))}
        </div>

        {/* 연구·학술 (김현규 원장) — 원문 링크는 게시 전 수동 확인 필요 */}
        {doctor.name === "김현규" && (
          <div className="mt-16">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#8B1A2B] rounded-full inline-block" />
              연구·학술
            </h2>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-3">
              <FileText size={18} className="text-[#8B1A2B] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[15px] text-gray-800 font-medium leading-snug">
                  논문 공저 | Soyeom-Jetong mixture attenuates NLRP3 inflammasome-mediated inflammation, Frontiers in Pharmacology (2026)
                </p>
                {/* 원문 링크: 게시 전 수동 확인 필요 */}
                <a
                  href="https://www.frontiersin.org/articles/10.3389/fphar.2026.1836840/full"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#8B1A2B] font-semibold mt-2 hover:underline"
                >
                  원문 보기 (Open Access) <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 이 원장의 건강 칼럼 */}
        {doctorColumns.length > 0 && (
          <div className="mt-16">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#8B1A2B] rounded-full inline-block" />
              {doctor.name} 원장의 건강 칼럼
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {doctorColumns.map((c) => (
                <Link
                  key={c.id}
                  href={`/columns/${c.id}`}
                  className="flex gap-4 items-center bg-white border border-gray-100 rounded-2xl p-4 hover:border-[#8B1A2B] hover:shadow-sm transition-all"
                >
                  {c.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={c.imageUrl} alt="" className="rounded-xl object-cover flex-shrink-0" style={{ width: 72, height: 72 }} />
                  ) : (
                    <div className="rounded-xl bg-gray-100 flex-shrink-0" style={{ width: 72, height: 72 }} />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-[15px] truncate">{c.title}</p>
                    {c.category && <p className="text-xs text-[#8B1A2B] font-semibold mt-1">{c.category}</p>}
                    <p className="text-xs text-gray-400 mt-1">{(c.createdAt || "").slice(0, 10)} · 조회 {(c.views || 0).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 다른 의료진 */}
        <div className="mt-16">
          <h2 className="text-lg font-bold text-gray-900 mb-6">다른 의료진 보기</h2>
          <div className="flex flex-wrap gap-3">
            {DOCTORS.filter((d) => d.isActive && d.slug !== doctor.slug).map((d) => (
              <Link
                key={d.slug}
                href={`/doctors/${d.slug}`}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:border-[#8B1A2B] hover:shadow-sm transition-all"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.imageUrl} alt={d.name} className="absolute inset-0 w-full h-full object-cover object-top" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{d.name}</p>
                  <p className="text-xs text-[#8B1A2B]">{d.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-500 py-8 px-6 mt-16">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p className="text-white font-bold mb-1">장위365경희한의원</p>
          <p>서울 성북구 장월로38길 4 타워39 3층 · 02-6952-2800</p>
          <p className="mt-1 text-xs">© 2026 장위365경희한의원. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
