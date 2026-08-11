import type { Metadata } from "next";
import {
  TrendingDown, Activity, Scale, Utensils, Moon, Leaf, Syringe,
  FlaskConical, Repeat, HeartPulse, Pill, ExternalLink, Target,
} from "lucide-react";
import JsonLd, { breadcrumb, SITE_URL, CLINIC_ID } from "@/components/JsonLd";
import {
  ClinicHeader, ClinicIntro, Section, CardGrid, FeatureList,
  NumberedSteps, NoticeBox, WarningBox, ClinicCTA, OtherClinics, ClinicDisclaimer,
} from "@/components/clinic/ClinicUI";

export const metadata: Metadata = {
  title: "다이어트 클리닉 · 장위365경희한의원",
  description:
    "체중 숫자가 아니라 체지방과 근육량의 변화를 기준으로 관리하는 장위365경희한의원 다이어트 클리닉입니다. 체성분 분석과 혈액검사로 상태를 확인하고, 한약·약침과 생활 관리를 병행해 요요를 줄이는 방향으로 진행합니다. 성북구 장위동.",
};

/* 이런 분께 */
const TARGETS = [
  {
    Icon: Repeat,
    title: "빼면 다시 찌는 분",
    desc: "굶어서 뺀 적이 있고, 그때마다 더 쉽게 다시 쪘습니다. 매번 같은 방법을 반복하고 계십니다.",
  },
  {
    Icon: Scale,
    title: "체중은 그대로인데 체형이 변한 분",
    desc: "몸무게는 비슷한데 옷이 맞지 않습니다. 근육이 줄고 체지방이 늘어난 상태일 수 있습니다.",
  },
  {
    Icon: Utensils,
    title: "식욕 조절이 어려운 분",
    desc: "배가 고프지 않은데도 먹게 되거나, 저녁 이후 폭식이 반복됩니다.",
  },
  {
    Icon: HeartPulse,
    title: "건강 수치가 걸리는 분",
    desc: "건강검진에서 혈당·지질·간 수치를 지적받으셨거나, 관절에 부담을 느끼고 계십니다.",
  },
  {
    Icon: Moon,
    title: "몸이 잘 붓는 분",
    desc: "아침마다 붓고, 조금만 짜게 먹어도 체중이 오르내립니다. 순환 문제가 함께 있는 경우입니다.",
  },
  {
    Icon: Target,
    title: "기한이 있는 분",
    desc: "결혼·행사 등 목표 시점이 있어 무리한 방법을 택하기 쉬운 상황입니다. 안전한 속도를 함께 정합니다.",
  },
];

/* 무엇을 확인하나 */
const EXAMS = [
  {
    Icon: Activity,
    title: "체성분 분석",
    desc: "체지방량·근육량·부위별 균형·기초대사량을 확인합니다. 감량의 성패는 '무엇이 줄었는가'로 판단합니다.",
  },
  {
    Icon: FlaskConical,
    title: "혈액검사",
    desc: "필요 시 갑상선·간 기능·혈당·지질·빈혈을 확인합니다. 살이 잘 빠지지 않는 원인이 여기 있는 경우가 있습니다.",
  },
  {
    Icon: Utensils,
    title: "식생활 점검",
    desc: "무엇을 먹는지보다 언제·어떤 상황에서 먹는지를 봅니다. 반복되는 패턴을 찾아야 바꿀 수 있습니다.",
  },
  {
    Icon: Leaf,
    title: "체질과 컨디션 진찰",
    desc: "소화 기능, 수면, 부종, 피로도를 함께 살펴 감량 과정에서 무너지기 쉬운 부분을 미리 잡습니다.",
  },
];

/* 관리 방법 */
const TREATMENTS = [
  {
    Icon: Leaf,
    title: "체질 맞춤 한약",
    desc: "식욕 조절이 필요한 경우, 순환과 부종이 문제인 경우, 기력 저하가 먼저인 경우의 처방이 다릅니다.",
  },
  {
    Icon: Syringe,
    title: "약침 치료",
    desc: "국소 부위 관리와 순환을 돕는 목적으로 병행합니다. 진행 상황에 따라 부위와 빈도를 조정합니다.",
  },
  {
    Icon: Activity,
    title: "정기 체성분 확인",
    desc: "회차마다 체성분을 다시 측정해 근육 손실 없이 체지방이 줄고 있는지 확인하고 계획을 조정합니다.",
  },
  {
    Icon: Utensils,
    title: "식단 코칭",
    desc: "굶는 방식은 권하지 않습니다. 유지 가능한 식사량과 구성으로 조정해 감량 후에도 이어갈 수 있게 합니다.",
  },
  {
    Icon: TrendingDown,
    title: "정체기 관리",
    desc: "누구에게나 오는 구간입니다. 이때 방법을 바꾸는 것이 포기하지 않고 넘어가는 열쇠입니다.",
  },
  {
    Icon: Repeat,
    title: "유지기 관리",
    desc: "목표에 도달한 뒤가 진짜입니다. 감량 속도를 늦추며 체중이 유지되는 습관을 만드는 기간을 둡니다.",
  },
];

const STEPS = [
  { title: "상담 및 체성분 측정", desc: "지금 상태와 지금까지 시도한 방법, 목표 시점을 함께 확인합니다." },
  { title: "필요 검사", desc: "감량이 어려운 원인이 의심되면 혈액검사로 확인합니다." },
  { title: "계획 수립", desc: "감량 속도와 방법, 회차 구성을 함께 정합니다. 무리한 목표는 조정해 드립니다." },
  { title: "회차별 관리", desc: "체성분을 다시 측정하며 처방과 식단을 조정하고, 유지기까지 이어갑니다." },
];

const CAUTION = [
  "임신 중이거나 임신을 준비 중인 경우",
  "갑상선 질환, 심장 질환, 신장 질환을 관리 중인 경우",
  "섭식 장애를 겪었거나 겪고 있는 경우",
  "복용 중인 약이 있는 경우 (상호작용 확인이 필요합니다)",
];

export default function DietClinicPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          breadcrumb([
            { name: "진료과목", path: "/#services" },
            { name: "다이어트 클리닉", path: "/clinic/diet" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "@id": `${SITE_URL}/clinic/diet#page`,
            name: "다이어트 클리닉",
            description:
              "체성분 분석과 혈액검사를 바탕으로 체지방 감소와 체질 개선을 함께 목표로 하는 한의원 다이어트 클리닉입니다.",
            about: { "@type": "MedicalProcedure", name: "다이어트 클리닉" },
            provider: { "@id": CLINIC_ID },
          },
        ]}
      />

      <ClinicHeader title="다이어트 클리닉" />

      <ClinicIntro
        eyebrow="Diet Clinic"
        headline={
          <>
            몸무게가 아니라
            <br className="md:hidden" /> <span className="text-[#8B1A2B]">무엇이 줄었는지</span>를
            봅니다
          </>
        }
        lead="굶어서 뺀 체중은 근육까지 함께 빠집니다. 그래서 기초대사량이 떨어지고, 같은 양을 먹어도 더 쉽게 찌는 몸이 됩니다. 저희는 회차마다 체성분을 확인하며 체지방이 줄고 근육은 지켜지는 방향인지 확인하면서 진행합니다."
      />

      <Section
        title="이런 분께 권해드립니다"
        desc="지금까지의 방법이 잘 되지 않았다면, 방법보다 방향을 먼저 점검해 보시는 편이 좋습니다."
      >
        <CardGrid items={TARGETS} />
      </Section>

      <Section
        title="무엇을 확인하나요"
        desc="체중계 숫자만으로는 알 수 없는 것들을 먼저 확인합니다."
        tone="white"
      >
        <FeatureList items={EXAMS} />
      </Section>

      <Section
        title="이렇게 관리합니다"
        desc="감량 기간뿐 아니라, 끝난 뒤 유지되는 데까지를 하나의 과정으로 봅니다."
      >
        <FeatureList items={TREATMENTS} />
      </Section>

      {/* 쏙쏙다이어트 — 별도 브랜드 사이트 안내 */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="bg-[#fdf6f2] border border-[#f0dccd] rounded-2xl p-7 md:p-9 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-[#B4552F] mb-2">
                <Pill size={16} /> 쏙쏙다이어트
              </p>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                프로그램 구성과 진행 방식이 궁금하시다면
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                저희 다이어트 프로그램은 별도 브랜드 사이트에서 회차 구성, 진행 방식, 관리 내용을
                자세히 안내하고 있습니다.
              </p>
            </div>
            <a
              href="https://ssoksokdiet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 bg-[#B4552F] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#9c4726] transition"
            >
              쏙쏙다이어트 보기 <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      <Section title="진료 절차">
        <NumberedSteps steps={STEPS} />

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <NoticeBox
            title="내원 전 준비해 주세요"
            items={[
              "체성분 검사는 식사 직후와 운동 직후를 피하는 편이 정확합니다.",
              "최근 건강검진 결과지가 있다면 지참해 주세요.",
              "지금까지 시도했던 방법과 그때의 결과를 알려주시면 계획을 세우는 데 도움이 됩니다.",
              "목표 시점이 있다면 미리 말씀해 주세요. 안전한 속도를 함께 정합니다.",
            ]}
          />
          <WarningBox
            title="이런 경우 반드시 미리 알려주세요"
            items={CAUTION}
          />
        </div>

        <div className="mt-10">
          <ClinicCTA />
        </div>
      </Section>

      <OtherClinics currentSlug="diet" />

      <ClinicDisclaimer>
        감량 정도와 속도는 개인의 체질, 생활 환경, 기저 질환에 따라 차이가 크며 특정한 결과를 보장하지
        않습니다. 한약 복용 중 나타날 수 있는 반응은 진료 시 안내해 드리며, 복용 중인 약이나 관리 중인
        질환이 있다면 반드시 알려주셔야 합니다.
      </ClinicDisclaimer>
    </div>
  );
}
