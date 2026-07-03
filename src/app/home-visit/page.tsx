import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Phone, FileText, Accessibility, Brain, Bed, Bone, HeartPulse, Home,
  Stethoscope, Syringe, Flame, CheckCircle2, MapPin, MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "방문진료센터 · 장위365경희한의원",
  description:
    "거동이 불편해 내원이 어려운 분들을 위해 한의사가 직접 방문하여 침·뜸·한약 등 맞춤 한의 진료를 제공하는 장위365경희한의원 방문진료센터입니다. 성북구 장위동 인근 방문, 건강보험(시범수가) 적용.",
};

const HERO_POINTS = [
  { big: "한의사", small: "직접 방문 진료" },
  { big: "건강보험", small: "시범수가 적용" },
  { big: "침·뜸·한약", small: "가정 내 처치" },
  { big: "성북구", small: "장위동 인근 방문" },
];

const TARGETS = [
  { Icon: Accessibility, title: "거동이 불편한 어르신", desc: "노쇠·관절 질환 등으로 혼자 병원 방문이 어려운 고령 환자" },
  { Icon: Brain, title: "중풍·마비 후유증", desc: "뇌졸중 후유증, 안면마비 등으로 지속 재활·관리가 필요한 분" },
  { Icon: Bed, title: "수술 후 회복기", desc: "수술·입원 후 자택 요양 중 통증·기력 회복 관리가 필요한 분" },
  { Icon: Bone, title: "만성 통증·근골격", desc: "허리·무릎·어깨 등 만성 통증으로 이동이 힘든 재가 환자" },
  { Icon: HeartPulse, title: "만성질환 관리", desc: "거동 제한과 함께 지속적인 건강 상태 확인이 필요한 분" },
  { Icon: Home, title: "재택 요양 환자", desc: "장기요양·재택 돌봄 중 한의 진료가 필요한 가정" },
];

const CARES = [
  { Icon: Stethoscope, title: "진찰·건강 상태 평가", desc: "증상 확인, 맥진·복진 등 한의 진찰과 경과 관찰" },
  { Icon: Syringe, title: "침·약침 치료", desc: "통증·마비·순환 개선을 위한 침 및 약침 시술" },
  { Icon: Flame, title: "뜸·부항", desc: "냉증·근긴장 완화를 위한 뜸과 부항 처치" },
  { Icon: Bed, title: "창상 및 욕창관리", desc: "욕창·상처 부위 소독과 드레싱 등 창상 관리" },
];

const STEPS = [
  { n: 1, title: "전화 상담·신청", desc: "환자 상태와 주소를 확인하고 방문 가능 여부를 안내드립니다" },
  { n: 2, title: "방문 일정 조율", desc: "보호자와 협의하여 방문 날짜·시간을 예약합니다" },
  { n: 3, title: "가정 방문 진료", desc: "한의사가 직접 방문해 진찰과 침·뜸·한약 처치를 진행합니다" },
  { n: 4, title: "지속 관리", desc: "경과에 따라 정기 방문 및 복약·재활 관리를 이어갑니다" },
];

const AREAS = ["장위동", "석관동", "월곡동", "인근 협의"];

export default function HomeVisitPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition"><ArrowLeft size={22} /></Link>
            <span className="text-lg font-extrabold">장위<span className="text-[#8B1A2B]">365</span>경희한의원</span>
            <span className="hidden sm:inline text-[11px] font-bold text-white bg-[#8B1A2B] px-2 py-0.5 rounded-full">방문진료센터</span>
          </div>
          <a href="tel:0269522800" className="flex items-center gap-2 bg-[#03C75A] hover:bg-[#02b350] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm">
            <Phone className="w-4 h-4" /> 방문 신청 02-6952-2800
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8B1A2B] to-[#a0293a] text-white">
        <div className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs font-bold bg-white/15 px-3 py-1.5 rounded-full mb-5">보건복지부 일차의료 한의 방문진료 수가 시범사업 참여기관</span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">병원에 오기 어려우시면,<br />저희가 찾아뵙겠습니다</h1>
            <p className="text-white/85 text-lg leading-relaxed mb-8">거동이 불편해 내원이 어려운 분들을 위해<br />한의사가 직접 댁으로 방문하여 침·뜸·한약 등<br />맞춤 한의 진료를 제공하는 <b className="text-white">장위365 방문진료센터</b>입니다.</p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:0269522800" className="inline-flex items-center gap-2 bg-white text-[#8B1A2B] font-bold px-8 py-3.5 rounded-full shadow-md hover:bg-[#fdf3f4] transition-colors"><Phone className="w-5 h-5" /> 방문 상담·신청</a>
              <a href="#cost" className="inline-flex items-center gap-2 bg-white/15 text-white font-bold px-8 py-3.5 rounded-full border border-white/30 hover:bg-white/25 transition-colors"><FileText className="w-5 h-5" /> 시범사업 안내</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {HERO_POINTS.map((p) => (
              <div key={p.big} className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur">
                <div className="text-3xl font-extrabold">{p.big}</div>
                <div className="text-white/80 text-sm mt-1">{p.small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 방문 대상 */}
      <section id="target" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <span className="text-sm font-bold text-[#8B1A2B]">WHO</span>
          <h2 className="text-3xl font-extrabold mt-2">이런 분께 권해드립니다</h2>
          <p className="text-gray-500 mt-3">스스로 의료기관 방문이 어려운 재가 환자를 위한 서비스입니다</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TARGETS.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-[#e8b4bb] hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <Icon className="w-8 h-8 text-[#8B1A2B] mb-4" />
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 진료 내용 */}
      <section id="care" className="bg-[#fdf3f4]">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-[#8B1A2B]">CARE</span>
            <h2 className="text-3xl font-extrabold mt-2">방문 시 제공되는 진료</h2>
            <p className="text-gray-500 mt-3">진료실과 동일한 한의 치료를 가정에서 안전하게 받으실 수 있습니다</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CARES.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <Icon className="w-8 h-8 text-[#8B1A2B] mb-4" />
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이용 절차 */}
      <section id="steps" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <span className="text-sm font-bold text-[#8B1A2B]">PROCESS</span>
          <h2 className="text-3xl font-extrabold mt-2">이용 절차</h2>
          <p className="text-gray-500 mt-3">전화 한 통이면 방문 진료 일정을 잡아드립니다</p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#8B1A2B] text-white font-bold flex items-center justify-center mb-4">{n}</div>
              <h3 className="font-bold mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 비용 안내 */}
      <section id="cost" className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-sm font-bold text-[#8B1A2B]">COST</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-5">건강보험이 적용됩니다</h2>
            <p className="text-gray-600 leading-relaxed mb-4">본원은 보건복지부 <b>일차의료 한의 방문진료 수가 시범사업</b> 참여기관으로, 방문 1회 진료비는 <b>방문당 단일 수가(포괄수가)</b>입니다. 진찰·침·부항·뜸·한약제제·교통비 등이 모두 포함되어 별도로 추가되지 않습니다.</p>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[#8B1A2B] shrink-0" /> 방문당 정해진 단일 수가 — 진료 시간·내용과 무관하게 동일합니다</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[#8B1A2B] shrink-0" /> 건강보험 일반 기준 본인부담 30%</li>
              <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[#8B1A2B] shrink-0" /> 의료급여·차상위·장기요양(와상) 대상자는 부담이 경감됩니다</li>
            </ul>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="text-sm text-gray-500 mb-2">방문 1회 · 건강보험 일반(본인부담 30%)</div>
            <div className="text-4xl font-extrabold text-[#8B1A2B] mb-1">32,400<span className="text-2xl">원</span></div>
            <p className="text-gray-500 text-sm mb-6">방문진료료 108,260원(2026년 기준)의 본인부담 30% · 건강보험 적용</p>
            <div className="border-t border-gray-100 pt-5 text-sm text-gray-600 space-y-2">
              <div className="flex justify-between"><span>건강보험 일반 (30%)</span><span className="font-semibold">32,400원</span></div>
              <div className="flex justify-between"><span>장기요양 와상 등 (15%)</span><span className="font-semibold">16,200원</span></div>
              <div className="flex justify-between"><span>의료급여·차상위 (5%)</span><span className="font-semibold">약 5,400원</span></div>
              <div className="flex justify-between"><span>거동 가능 시 요청 방문</span><span className="font-semibold">108,260원</span></div>
            </div>
            <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">※ 2026년 수가 기준. 자격·지침에 따라 달라질 수 있어 방문 전 데스크에서 확인해 드립니다.</p>
          </div>
        </div>
      </section>

      {/* 진료 지역 */}
      <section id="area" className="max-w-6xl mx-auto px-5 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-3" />
              <p className="font-semibold">지도 영역 (성북구 장위동 중심)</p>
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-[#8B1A2B]">AREA</span>
            <h2 className="text-3xl font-extrabold mt-2 mb-5">방문 가능 지역</h2>
            <p className="text-gray-600 leading-relaxed mb-6">서울 <b>성북구 장위동</b>을 중심으로 인근 지역에 방문합니다. 지역·일정에 따라 방문 가능 여부가 달라질 수 있어, 먼저 전화로 확인해 주세요.</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {AREAS.map((a) => (
                <span key={a} className="text-sm bg-[#fdf3f4] text-[#8B1A2B] font-semibold px-3 py-1.5 rounded-full border border-[#f5cdd1]">{a}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-gray-600 text-sm"><MapPin className="w-5 h-5 text-[#8B1A2B]" /> 서울 성북구 장월로38길 4, 타워39 3층</div>
          </div>
        </div>
      </section>

      {/* 문의 CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className="bg-gradient-to-r from-[#8B1A2B] to-[#a0293a] rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-4">방문 진료가 필요하신가요?</h2>
          <p className="text-white/85 mb-8 leading-relaxed">거동이 불편한 가족을 위한 한의 방문진료, 지금 전화로 상담하세요.<br />환자 상태를 확인한 뒤 방문 일정을 안내해 드립니다.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="tel:0269522800" className="inline-flex items-center gap-2 bg-white text-[#8B1A2B] font-bold px-8 py-3.5 rounded-full shadow-md hover:bg-[#fdf3f4] transition-colors"><Phone className="w-5 h-5" /> 02-6952-2800</a>
            <a href="tel:0269522800" className="inline-flex items-center gap-2 bg-[#03C75A] hover:bg-[#02b350] text-white font-bold px-8 py-3.5 rounded-full shadow-md transition-colors"><MessageCircle className="w-5 h-5" /> 온라인 방문 신청</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        장위365경희한의원 방문진료센터 · 서울 성북구 장월로38길 4 타워39 3층 · 02-6952-2800
      </footer>
    </div>
  );
}
