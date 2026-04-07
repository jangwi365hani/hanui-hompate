"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone, MapPin, Train, Bus, ParkingCircle, Clock, ChevronRight,
  Bone, Leaf, Heart, Wind, Sparkles, Baby, Brain, TrendingDown, Utensils, Menu, X
} from "lucide-react";

const NAV_LINKS = [
  { label: "한의원 소개", href: "#about" },
  { label: "의료진", href: "#doctors" },
  { label: "진료과목", href: "#services" },
  { label: "진료안내", href: "#info" },
  { label: "오시는 길", href: "#location" },
];

const STATS = [
  { num: "10+", label: "년 진료 경력" },
  { num: "5,000+", label: "누적 환자" },
  { num: "365일", label: "연중 진료" },
  { num: "100%", label: "맞춤 치료" },
];

const DOCTORS = [
  { file: "doctork", name: "김현규", title: "대표원장", slug: "kim",  tags: ["초음파 진단", "통증 치료"] },
  { file: "doctora", name: "안익균", title: "원장",    slug: "ahn",  tags: ["통증 치료", "비염"] },
  { file: "doctorp", name: "박종성", title: "원장",    slug: "park", tags: ["종합적 치료", "한약·추나"] },
  { file: "doctors", name: "신지훈", title: "원장",    slug: "shin", tags: ["스포츠 손상", "재활"] },
];

const SERVICES = [
  { Icon: Bone,         title: "디스크·협착증 클리닉",  desc: "수술 없이 신경 자극을 줄이고 척추 주변 구조를 안정화합니다. 급성부터 만성까지 단계별 맞춤 치료를 제공합니다." },
  { Icon: TrendingDown, title: "다이어트 클리닉",       desc: "체중 감량뿐 아니라 체지방 감소와 체질 개선을 함께 목표로 합니다. 3개월 맞춤 프로그램으로 요요 없는 감량을 도와드립니다." },
  { Icon: Heart,        title: "여성 클리닉",           desc: "난임·월경통·생리불순 등 호르몬 균형과 자궁·골반 순환을 함께 관리합니다. 왕뜸 치료를 통한 심층 케어를 제공합니다." },
  { Icon: Wind,         title: "비염 클리닉",           desc: "코 증상 억제에 그치지 않고 비강 점막 기능 회복과 면역·자율신경 균형을 함께 조절해 재발을 줄입니다." },
  { Icon: Sparkles,     title: "항노화 클리닉",         desc: "기력 저하, 만성 피로, 면역력 감소 등 노화로 인한 몸의 변화를 관리하고 회복력을 유지합니다." },
  { Icon: Baby,         title: "성장 클리닉",           desc: "아이의 성장 발달을 체계적으로 관리합니다. 체질 분석을 바탕으로 성장에 도움이 되는 맞춤 치료를 제공합니다." },
  { Icon: Utensils,     title: "만성 소화불량 클리닉",  desc: "위장 기능 저하, 더부룩함, 식욕 부진 등 소화기 문제를 체질과 생활습관 관점에서 근본적으로 개선합니다." },
  { Icon: Brain,        title: "안면마비·중풍 클리닉",  desc: "안면마비 및 중풍 후유증 치료를 전문으로 합니다. 신경 회복을 촉진하는 침·약침 치료로 기능 회복을 도모합니다." },
];

const HOURS = [
  { day: "월 · 화 · 수 · 목 · 금", time: "10:00 – 21:00", note: "평일" },
  { day: "토 · 일 · 공휴일",        time: "10:00 – 17:00", note: "주말·공휴일" },
  { day: "점심시간",                 time: "13:00 – 14:00", note: "휴게" },
];

const LOCATION_INFO = [
  { Icon: MapPin,        label: "주소",   value: "서울 성북구 장월로38길 4\n타워39 3층" },
  { Icon: Phone,         label: "전화",   value: "02-6952-2800" },
  { Icon: Train,         label: "지하철", value: "6호선 돌곶이역 도보 5분" },
  { Icon: Bus,           label: "버스",   value: "장위동 정류장 하차" },
  { Icon: ParkingCircle, label: "주차",   value: "건물 뒷편 주차타워 이용" },
];

const NAVER_BOOKING = "https://m.booking.naver.com/booking/13/bizes/567280?theme=place&service-target=map-pc&lang=ko&area=bmp&map-search=1";

const NaverBadge = () => (
  <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-[#03C75A] rounded-sm text-xs font-black leading-none">N</span>
);

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>

      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="장위365경희한의원 로고" width={240} height={80} className="object-contain h-20 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-[#8B1A2B] transition-colors duration-200">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={NAVER_BOOKING}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-[#03C75A] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#02b350] transition-colors duration-200 shadow-sm"
            >
              <NaverBadge /> 네이버 예약
            </a>
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="메뉴"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4 text-sm font-medium text-gray-600">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="hover:text-[#8B1A2B]">
                {l.label}
              </a>
            ))}
            <a href={NAVER_BOOKING} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#03C75A] font-bold">
              <NaverBadge /> 네이버 예약
            </a>
          </div>
        )}
      </header>

      {/* 히어로 */}
      <section className="relative overflow-hidden h-[600px] md:h-[700px]">
        <Image src="/images/main2.jpg" alt="장위365경희한의원" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-transparent" />
        <div className="relative h-full flex items-center px-6">
          <div className="max-w-6xl mx-auto w-full">
            <div className="max-w-xl">
              <span className="inline-block bg-[#8B1A2B]/80 text-white text-xs tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6 font-medium backdrop-blur-sm">
                한의사 4인 진료
              </span>
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
                왜 반복되는지<br />
                <span className="text-[#c97080]">함께 고민합니다</span>
              </h2>
              <p className="text-gray-300 text-base md:text-lg mb-10 leading-relaxed">
                지금 아픈 것만 해결하지 않습니다.<br className="hidden md:block" />
                오래 편할 수 있도록, 근본부터 함께 관리합니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={NAVER_BOOKING} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#03C75A] hover:bg-[#02b350] text-white font-bold px-10 py-4 rounded-full text-base transition-all duration-200 shadow-lg">
                  <NaverBadge /> 네이버 예약하기
                </a>
                <a href="#doctors" className="flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-10 py-4 rounded-full text-base transition-all duration-200">
                  의료진 소개 <ChevronRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 배너 */}
      <section className="bg-[#8B1A2B] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold mb-1">{s.num}</p>
              <p className="text-[#f5cdd1] text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 한의원 소개 */}
      <section id="about" className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-xs tracking-[0.2em] text-[#a0293a] font-semibold uppercase">About Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-6 leading-snug">
              치료는 과하지 않게,<br />관리는 오래 가도록
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                저희는 <strong className="text-gray-800">"지금 이 증상을 어떻게 덜 아프게 할 것인가"</strong>에서 그치지 않습니다.
                왜 반복되는지, 어떻게 관리해야 오래 편해질 수 있는지를 함께 고민합니다.
              </p>
              <p>
                약침·추나·침 치료를 기반으로 성장, 다이어트, 여성질환, 디스크·협착증, 만성소화불량, 항노화까지
                각 분야를 세분화한 <strong className="text-gray-800">클리닉 중심 진료 시스템</strong>으로
                환자 한 분 한 분의 상태에 맞는 치료를 제공합니다.
              </p>
            </div>
            <div className="mt-8 flex gap-3 flex-wrap">
              <span className="bg-[#fdf3f4] text-[#8B1A2B] text-sm font-medium px-4 py-2 rounded-full border border-[#f5e0e3]"># 클리닉 중심 진료</span>
              <span className="bg-[#fdf3f4] text-[#8B1A2B] text-sm font-medium px-4 py-2 rounded-full border border-[#f5e0e3]"># 재발 방지 관리</span>
              <span className="bg-[#fdf3f4] text-[#8B1A2B] text-sm font-medium px-4 py-2 rounded-full border border-[#f5e0e3]"># 365일 진료</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { q: "통증이 없어도 방문할 수 있나요?", a: "네, 만성 피로·소화불량·수면 문제·면역 저하·다이어트·항노화 등 통증 외 모든 건강 고민으로 방문하실 수 있습니다." },
              { q: "어떤 클리닉을 선택해야 할지 모르겠어요.", a: "걱정 마세요. 첫 방문 시 원장이 직접 상담하며 증상에 맞는 치료 방향을 안내해 드립니다." },
              { q: "치료 후 재발하지 않나요?", a: "재발을 줄이는 것이 저희의 목표입니다. 증상 완화뿐 아니라 생활 관리까지 함께 안내해 드립니다." },
            ].map((item) => (
              <div key={item.q} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-sm font-bold text-gray-800 mb-2">Q. {item.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">A. {item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 의료진 소개 */}
      <section id="doctors" className="py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] text-[#a0293a] font-semibold uppercase">Medical Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">의료진 소개</h2>
            <p className="text-gray-500 mt-4 text-sm">다양한 임상 경험을 갖춘 4인의 전문 원장이 함께합니다.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {DOCTORS.map((doc) => (
              <Link key={doc.file} href={`/doctors/${doc.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 hover:border-[#8B1A2B]/30 transition-all duration-300 w-52">
                <div className="relative h-64 w-full bg-gray-100">
                  <Image src={`/images/${doc.file}.png`} alt={`${doc.name} ${doc.title}`} fill className="object-cover object-top" />
                </div>
                <div className="p-5 text-center">
                  <p className="text-xs text-[#a0293a] font-semibold mb-1">{doc.title}</p>
                  <p className="text-lg font-bold text-gray-900">{doc.name}</p>
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {doc.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-[#fdf3f4] text-[#8B1A2B] px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <p className="text-xs text-[#8B1A2B] mt-3 font-medium group-hover:underline">자세히 보기 →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 진료과목 */}
      <section id="services" className="py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] text-[#a0293a] font-semibold uppercase">Services</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">주요 진료과목</h2>
            <p className="text-gray-500 mt-4 max-w-md mx-auto text-sm leading-relaxed">
              통증부터 내과적 건강 관리까지, 몸 전체를 아우르는 한방 치료를 제공합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map(({ Icon, title, desc }) => (
              <div key={title} className="group bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-[#e8b4bb] hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="w-12 h-12 bg-[#fdf3f4] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#fae6e8] transition-colors">
                  <Icon size={22} className="text-[#8B1A2B]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#8B1A2B] transition-colors">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 진료안내 */}
      <section id="info" className="py-28 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] text-[#a0293a] font-semibold uppercase">Information</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">진료 안내</h2>
          </div>
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            {HOURS.map((row, i) => (
              <div key={row.day} className={`flex items-center justify-between px-8 py-5 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${row.note === "휴게" ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3">
                  <Clock size={15} className="text-[#a0293a] shrink-0" />
                  <span className="font-semibold text-gray-800 text-sm">{row.day}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 text-sm font-medium">{row.time}</span>
                  {row.note && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${row.note === "휴게" ? "bg-gray-100 text-gray-500" : "bg-[#fae6e8] text-[#8B1A2B]"}`}>
                      {row.note}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-5">
            점심시간 13:00 – 14:00 &nbsp;|&nbsp; 예약 후 방문을 권장드립니다
          </p>

          {/* 예약 CTA */}
          <div className="mt-12 bg-gradient-to-r from-[#8B1A2B] to-[#a0293a] rounded-3xl p-10 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">건강한 일상, 지금 시작하세요</h3>
            <p className="text-[#f5cdd1] text-sm mb-6">네이버 예약으로 간편하게 예약하실 수 있습니다</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={NAVER_BOOKING} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#03C75A] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#02b350] transition-colors text-base shadow-md">
                <NaverBadge /> 네이버 예약하기
              </a>
              <a href="tel:02-6952-2800" className="inline-flex items-center justify-center gap-2 bg-white text-[#8B1A2B] font-bold px-8 py-3.5 rounded-full hover:bg-[#fdf3f4] transition-colors text-base shadow-md">
                <Phone size={16} /> 02-6952-2800
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 오시는 길 */}
      <section id="location" className="py-28 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] text-[#a0293a] font-semibold uppercase">Location</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">오시는 길</h2>
          </div>

          {/* 지도 + 정보 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 grid md:grid-cols-2 mb-6">
            <div className="relative h-72 md:h-auto min-h-[320px] bg-gray-100">
              <iframe
                src="https://maps.google.com/maps?q=장위365경희한의원&output=embed&hl=ko&z=17"
                className="w-full h-full border-0"
                title="장위365경희한의원 지도"
                loading="lazy"
                allowFullScreen
              />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <a href="https://maps.google.com/?q=장위365경희한의원" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white text-gray-700 text-xs font-bold px-3 py-2 rounded-xl shadow-md hover:bg-gray-50 transition-colors border border-gray-200">
                  <MapPin size={12} className="text-[#4285F4]" /> Google Maps
                </a>
                <a href="https://map.naver.com/p/search/장위365경희한의원" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-[#03C75A] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md hover:bg-[#02b350] transition-colors">
                  <MapPin size={12} /> 네이버 지도
                </a>
              </div>
            </div>

            <div className="p-10 space-y-6">
              {LOCATION_INFO.map(({ Icon, label, value }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-8 h-8 bg-[#fdf3f4] rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#8B1A2B]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-0.5">{label}</p>
                    <p className="text-gray-700 text-sm font-medium whitespace-pre-line">{value}</p>
                  </div>
                </div>
              ))}
              <a href="https://maps.google.com/?q=장위365경희한의원" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 bg-[#4285F4] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#3367d6] transition-colors shadow-sm">
                <MapPin size={16} /> Google Maps에서 길찾기
              </a>
            </div>
          </div>

          {/* 주차 안내 */}
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="bg-gray-800 text-white px-8 py-4 flex items-center gap-2">
              <ParkingCircle size={18} />
              <span className="font-bold">주차 안내</span>
            </div>
            <div className="grid md:grid-cols-2 bg-gray-50">
              <div className="relative h-80 bg-white">
                <Image src="/images/parkingmap.jpg" alt="주차장 위치 지도" fill className="object-contain p-2" />
              </div>
              <div className="relative h-80 bg-white border-t md:border-t-0 md:border-l border-gray-100">
                <Image src="/images/parkingexplain.jpg" alt="주차 이용 안내" fill className="object-contain p-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 카카오 플로팅 버튼 */}
      <a
        href="http://pf.kakao.com/_EkrXs"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#FEE500] text-[#3A1D1D] text-sm font-bold px-4 py-3 rounded-full shadow-lg hover:bg-[#f5dc00] hover:scale-105 transition-all duration-200"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#3A1D1D">
          <path d="M12 3C7.03 3 3 6.36 3 10.5c0 2.7 1.7 5.05 4.25 6.4L6.1 21l4.6-2.9c.42.05.86.08 1.3.08 4.97 0 9-3.36 9-7.5S16.97 3 12 3z"/>
        </svg>
        카카오 문의
      </a>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-500 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div>
            <p className="text-white font-bold text-base mb-2">장위365경희한의원</p>
            <p>서울 성북구 장월로38길 4 타워39 3층&nbsp;&nbsp;|&nbsp;&nbsp;대표전화: 02-6952-2800</p>
            <p className="mt-1">사업자등록번호: 187-09-02837</p>
          </div>
          <div className="text-center md:text-right">
            <nav className="flex gap-5 text-gray-500 text-xs mb-3 justify-center md:justify-end">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="hover:text-white transition-colors">{l.label}</a>
              ))}
            </nav>
            <p className="text-xs">© 2026 장위365경희한의원. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
