import type { Metadata } from "next";
import {
  Ruler, Waves, Activity, Leaf, FileText, ExternalLink, CalendarClock,
  Moon, Utensils, TrendingDown, Target, HeartPulse, DoorClosed,
} from "lucide-react";
import JsonLd, { breadcrumb, SITE_URL, CLINIC_ID } from "@/components/JsonLd";
import {
  ClinicHeader, ClinicIntro, Section, CardGrid, FeatureList,
  NumberedSteps, NoticeBox, ClinicCTA, OtherClinics, ClinicDisclaimer,
} from "@/components/clinic/ClinicUI";

export const metadata: Metadata = {
  title: "성장 클리닉 · 장위365경희한의원",
  description:
    "초음파 골성숙도(뼈나이) 검사와 체성분 분석, 한의학적 변증으로 아이의 남은 성장 여력과 예상 키를 확인하는 장위365경희한의원 성장 클리닉입니다. 실제 성장보고서 견본을 미리 확인하실 수 있습니다. 성북구 장위동.",
};

/** 성장보고서 견본 — /system(장위스케줄)의 실제 보고서 서식을 그대로 띄운다.
 *  파라미터를 주지 않으면 익명 견본 데이터로 렌더되므로 환자 정보는 오가지 않는다. */
const SAMPLE_REPORT_URL = "/system/growth/sample";

/* 점검이 필요한 아이 — 증상(desc)과 왜 봐야 하는지(note)를 한 카드에 같이 둔다 */
const TARGETS = [
  {
    Icon: Ruler,
    title: "또래보다 작은 아이",
    desc: "반에서 늘 앞번호이거나, 키 백분위가 하위 구간으로 확인되는 경우입니다.",
    note: "지금 작은 것이 문제인지, 늦게 크는 체질인지는 뼈 나이를 봐야 구분됩니다.",
  },
  {
    Icon: TrendingDown,
    title: "성장 속도가 느려진 아이",
    desc: "1년에 4cm 남짓밖에 자라지 않거나, 작년보다 성장 폭이 눈에 띄게 줄어든 경우입니다.",
    note: "키 자체보다 '속도의 변화'가 먼저 신호를 줍니다. 원인을 찾을 시점입니다.",
  },
  {
    Icon: CalendarClock,
    title: "사춘기가 빨라 보이는 아이",
    desc: "또래보다 이른 신체 변화가 나타나거나, 갑자기 키가 훌쩍 큰 뒤 성장이 더뎌진 경우입니다.",
    note: "사춘기가 시작되면 남은 성장 기간이 정해집니다. 시기를 확인하는 것이 중요합니다.",
  },
  {
    Icon: HeartPulse,
    title: "건강 문제로 성장이 밀린 아이",
    desc: "비염·아토피·잦은 감염, 혹은 만성적인 피로로 컨디션이 늘 좋지 않은 경우입니다.",
    note: "몸이 회복에 에너지를 쓰면 성장은 뒤로 밀립니다. 성장만 따로 볼 수 없는 이유입니다.",
  },
  {
    Icon: Utensils,
    title: "잘 먹지 않는 아이",
    desc: "식욕부진·편식이 오래됐거나, 자주 배가 아프다고 하는 경우입니다.",
    note: "먹는 양보다 소화·흡수가 문제인 경우가 많아 소화기 상태를 함께 봅니다.",
  },
  {
    Icon: Target,
    title: "목표 키가 있는 아이",
    desc: "운동선수를 준비하거나, 부모님과 아이가 원하는 키가 분명한 경우입니다.",
    note: "남은 성장 여력을 알아야 목표가 현실적인지, 무엇을 조정할지 정할 수 있습니다.",
  },
];

/* 왜 지금 점검해야 하는가 */
const WHY_NOW = [
  {
    Icon: DoorClosed,
    title: "성장판은 닫히면 되돌릴 수 없습니다",
    desc: "키가 자라는 기간은 정해져 있습니다. 성장판이 닫힌 뒤에는 어떤 방법으로도 키를 늘릴 수 없어, 남은 기간이 얼마인지 아는 것이 관리의 출발점입니다.",
  },
  {
    Icon: Waves,
    title: "만 나이가 아니라 뼈 나이가 기준입니다",
    desc: "같은 나이, 같은 키여도 뼈 나이가 앞서 있으면 남은 성장 기간이 짧습니다. 반대로 뼈 나이가 어리면 지금 작아도 여력이 남아 있습니다.",
  },
  {
    Icon: CalendarClock,
    title: "사춘기 시작 시점이 최종 키를 좌우합니다",
    desc: "사춘기에는 급격히 크지만 그만큼 성장판도 빠르게 성숙합니다. 시작이 이르면 총 성장 기간이 줄어들 수 있습니다.",
  },
  {
    Icon: Moon,
    title: "바꿀 수 있는 요인이 아직 남아 있을 때",
    desc: "수면 시간, 식습관, 체지방, 운동량은 지금 조정할 수 있는 요인입니다. 늦게 확인할수록 조정할 수 있는 폭이 줄어듭니다.",
  },
];

/* 검사 항목 */
const EXAMS = [
  {
    Icon: Waves,
    title: "초음파 골성숙도 검사",
    desc: "손목 성장판을 초음파로 관찰해 뼈 나이를 확인합니다. 방사선 노출이 없어 아이에게 부담이 적고, 반복 측정으로 변화를 추적할 수 있습니다.",
  },
  {
    Icon: Activity,
    title: "체성분(인바디) 분석",
    desc: "근육량·체지방률·기초대사량과 부위별 균형을 확인합니다. 체중이 아니라 '무엇이 늘었는지'를 봐야 관리 방향이 잡힙니다.",
  },
  {
    Icon: Ruler,
    title: "예상 키 산출",
    desc: "뼈 나이를 반영한 예측 키와 부모님 키로 계산한 유전적 예상 키를 함께 제시해, 지금 아이가 어느 구간에 있는지 확인합니다.",
  },
  {
    Icon: Leaf,
    title: "한의학적 변증",
    desc: "수면·소화·식욕·체질을 함께 살펴 성장을 방해하는 요인을 찾습니다. 필요 시 성장 한약·약침·추나로 관리합니다.",
  },
];

const STEPS = [
  { title: "상담 및 계측", desc: "키·체중 계측과 함께 성장 이력, 부모님 키, 생활 습관을 확인합니다." },
  { title: "검사", desc: "초음파 골성숙도 검사와 체성분 분석을 진행합니다." },
  { title: "성장보고서 설명", desc: "뼈 나이·예상 키·체성분 결과를 보고서로 정리해 보호자께 설명드립니다." },
  { title: "관리 및 재평가", desc: "치료와 생활 관리를 병행하고, 보통 6개월 후 재검사로 변화를 확인합니다." },
];

export default function GrowthClinicPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          breadcrumb([
            { name: "진료과목", path: "/#services" },
            { name: "성장 클리닉", path: "/clinic/growth" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "@id": `${SITE_URL}/clinic/growth#page`,
            name: "성장 클리닉",
            description:
              "초음파 골성숙도 검사와 체성분 분석, 한의학적 변증을 바탕으로 아이의 성장 상태를 평가하고 관리하는 클리닉입니다.",
            about: { "@type": "MedicalProcedure", name: "소아 성장 클리닉" },
            provider: { "@id": CLINIC_ID },
          },
        ]}
      />

      <ClinicHeader title="성장 클리닉" />

      <ClinicIntro
        eyebrow="Growth Clinic"
        headline={
          <>
            지금 키가 아니라
            <br className="md:hidden" /> <span className="text-[#8B1A2B]">남은 성장 여력</span>을
            봅니다
          </>
        }
        lead="같은 키여도 뼈 나이가 앞서 있으면 남은 성장 기간이 짧습니다. 그래서 저희는 키 백분위와 함께 초음파로 성장판의 성숙 정도를 확인하고, 체성분과 생활 습관까지 묶어 아이가 지금 어느 구간에 있는지부터 확인합니다."
      />

      <Section
        title="이런 아이라면 한 번 확인해 보세요"
        desc="아래 중 하나라도 해당된다면, 성장판이 닫히기 전에 상태를 확인해 보시길 권합니다."
      >
        <CardGrid items={TARGETS} />
      </Section>

      <Section
        title="왜 지금 점검해야 할까요"
        desc="성장 관리에서 가장 아쉬운 경우는 '조금 더 일찍 알았더라면'입니다."
        tone="white"
      >
        <CardGrid items={WHY_NOW} cols={2} />
      </Section>

      <Section
        title="무엇을 확인하나요"
        desc="아래 네 가지를 한 번에 정리해 보고서로 만들어 드립니다."
      >
        <FeatureList items={EXAMS} />
      </Section>

      {/* 성장보고서 견본 */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <FileText size={20} className="text-[#8B1A2B]" />
                성장보고서 예시
              </h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                검사 후 실제로 받아보시는 보고서입니다. 아래는 익명 견본 데이터로 만든 예시입니다.
              </p>
            </div>
            <a
              href={SAMPLE_REPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#8B1A2B] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#7a1626] transition"
            >
              새 창에서 크게 보기 <ExternalLink size={14} />
            </a>
          </div>

          {/*
            A4(210mm ≈ 794px) 서식이라 폰에서 그대로 두면 가로로 넘친다.
            바깥 상자를 고정 크기로 잡고 iframe 자체를 축소해 어느 화면에서도 한 장이 통째로 보이게 한다.
            (357 ≈ 794 × 0.45, 500 ≈ 1111 × 0.45)
          */}
          <div className="overflow-x-auto">
            <div className="mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm w-[357px] h-[500px] md:w-[794px] md:h-[780px]">
              <iframe
                src={SAMPLE_REPORT_URL}
                title="성장보고서 견본"
                loading="lazy"
                className="border-0 origin-top-left scale-[0.45] md:scale-100 w-[794px] h-[1111px] md:h-[780px]"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed text-center">
            견본에 표시된 수치는 서식을 보여드리기 위한 예시이며 실제 환자의 기록이 아닙니다. 예상
            키는 검사 시점의 자료로 산출한 참고치로, 이후 영양·수면·질환·호르몬 등 여러 요인에 따라
            달라질 수 있습니다.
          </p>
        </div>
      </section>

      <Section title="진료 절차">
        <NumberedSteps steps={STEPS} />

        <div className="mt-10">
          <NoticeBox
            title="검사 전 준비해 주세요"
            items={[
              "아버지·어머니의 키를 알고 오시면 유전적 예상 키를 함께 산출해 드립니다.",
              "이전에 받으신 성장 검사 결과지가 있다면 지참해 주세요.",
              "체성분 검사는 식사 직후를 피하는 편이 정확합니다.",
              "아이가 최근 1년 사이 얼마나 자랐는지 기록이 있으면 큰 도움이 됩니다.",
            ]}
          />
        </div>

        <div className="mt-10">
          <ClinicCTA />
        </div>
      </Section>

      <OtherClinics currentSlug="growth" />

      <ClinicDisclaimer>
        성장 정도와 치료 반응은 개인에 따라 다르며 특정한 결과를 보장하지 않습니다. 예상 키는 검사
        시점의 자료로 산출한 참고치입니다. 성조숙증 등 내분비 질환이 의심되는 경우에는 관련 전문
        진료를 함께 권해 드립니다.
      </ClinicDisclaimer>
    </div>
  );
}
