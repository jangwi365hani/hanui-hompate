import type { Metadata } from "next";
import {
  Sparkles, BatteryLow, Moon, Brain, ShieldCheck, HeartPulse, Wind,
  Leaf, FlaskConical, Droplets, Activity, Scale, Sun,
} from "lucide-react";
import JsonLd, { breadcrumb, SITE_URL, CLINIC_ID } from "@/components/JsonLd";
import {
  ClinicHeader, ClinicIntro, Section, CardGrid, FeatureList,
  NumberedSteps, NoticeBox, ClinicCTA, OtherClinics, ClinicDisclaimer,
} from "@/components/clinic/ClinicUI";

export const metadata: Metadata = {
  title: "항노화 클리닉 · 장위365경희한의원",
  description:
    "만성 피로, 기력 저하, 면역력 감소 등 노화로 인한 몸의 변화를 혈액검사와 체성분 분석으로 확인하고 공진단·경옥고 등 맞춤 보약으로 관리하는 장위365경희한의원 항노화 클리닉입니다. 성북구 장위동.",
};

/* 이런 변화를 느낀다면 */
const SIGNS = [
  {
    Icon: BatteryLow,
    title: "쉬어도 풀리지 않는 피로",
    desc: "예전 같으면 하룻밤 자면 회복되던 것이, 이제는 주말을 통째로 쉬어도 개운하지 않습니다.",
  },
  {
    Icon: Moon,
    title: "얕아진 잠",
    desc: "잠드는 데 오래 걸리거나 새벽에 자주 깹니다. 자는 시간은 비슷한데 회복이 되지 않습니다.",
  },
  {
    Icon: Brain,
    title: "떨어진 집중력과 의욕",
    desc: "말이 잘 떠오르지 않고, 하던 일도 예전만큼 몰입되지 않습니다.",
  },
  {
    Icon: ShieldCheck,
    title: "잦아진 잔병치레",
    desc: "감기에 자주 걸리고 한 번 걸리면 오래 갑니다. 입안이 자주 헐거나 대상포진을 겪기도 합니다.",
  },
  {
    Icon: Scale,
    title: "달라진 체형과 체력",
    desc: "먹는 양은 비슷한데 살이 붙고, 근력과 지구력이 눈에 띄게 줄었습니다.",
  },
  {
    Icon: Sun,
    title: "회복 속도의 변화",
    desc: "무리한 다음 날 회복이 더디고, 술이나 야근 뒤 후유증이 길게 갑니다.",
  },
];

/* 무엇을 확인하나 — 근거 기반이라는 우리 강점 */
const EXAMS = [
  {
    Icon: FlaskConical,
    title: "혈액검사",
    desc: "빈혈, 염증 수치, 간·신장 기능, 갑상선, 혈당·지질 등을 확인합니다. 피로의 원인이 다른 데 있는지 먼저 가려냅니다.",
  },
  {
    Icon: Activity,
    title: "체성분 분석",
    desc: "근육량과 체지방, 부위별 균형을 봅니다. 나이가 들며 줄어드는 근육량은 회복력과 직결됩니다.",
  },
  {
    Icon: HeartPulse,
    title: "한의학적 진찰",
    desc: "맥진·복진과 함께 수면, 소화, 땀, 체온 조절 상태를 살펴 어느 쪽이 먼저 무너졌는지 판단합니다.",
  },
  {
    Icon: Droplets,
    title: "생활 요인 점검",
    desc: "수면 시간, 음주, 카페인, 업무 강도, 운동량을 함께 확인합니다. 처방만으로는 되돌아오지 않습니다.",
  },
];

/* 관리 방법 */
const TREATMENTS = [
  {
    Icon: Leaf,
    title: "공진단",
    desc: "기력 저하와 만성 피로에 오래 쓰여 온 처방입니다. 체질과 현재 상태를 확인한 뒤 필요한 분께 권해 드립니다.",
  },
  {
    Icon: Sparkles,
    title: "경옥고",
    desc: "건조하고 마른 체질, 회복이 더딘 분께 활용합니다. 꾸준히 복용하는 형태라 생활 관리와 함께 안내합니다.",
  },
  {
    Icon: Leaf,
    title: "맞춤 보약",
    desc: "정해진 한 가지 처방을 권하지 않습니다. 진찰과 검사 결과에 따라 처방을 구성하고 계절에 맞춰 조정합니다.",
  },
  {
    Icon: Wind,
    title: "약침 · 침 치료",
    desc: "만성 피로와 함께 오는 어깨·목 결림, 두통, 소화 불편을 함께 다뤄 컨디션의 바닥을 올립니다.",
  },
  {
    Icon: ShieldCheck,
    title: "면역 관리",
    desc: "환절기나 과로가 예상되는 시기에 미리 관리해, 잔병치레로 이어지는 흐름을 끊는 데 중점을 둡니다.",
  },
  {
    Icon: Activity,
    title: "생활 처방",
    desc: "수면 위생, 근력 유지, 식사 간격처럼 실제로 바꿀 수 있는 것부터 구체적으로 안내합니다.",
  },
];

const STEPS = [
  { title: "상담", desc: "언제부터 어떻게 달라졌는지, 생활 패턴과 함께 확인합니다." },
  { title: "검사", desc: "필요에 따라 혈액검사와 체성분 분석을 진행합니다." },
  { title: "결과 설명과 처방", desc: "검사 결과를 함께 보며 지금 무엇을 먼저 다뤄야 하는지 정합니다." },
  { title: "경과 확인", desc: "복용 중 컨디션 변화를 확인하고 처방과 생활 관리를 조정합니다." },
];

export default function AntiagingClinicPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          breadcrumb([
            { name: "진료과목", path: "/#services" },
            { name: "항노화 클리닉", path: "/clinic/antiaging" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "@id": `${SITE_URL}/clinic/antiaging#page`,
            name: "항노화 클리닉",
            description:
              "만성 피로와 기력 저하, 면역력 감소를 혈액검사·체성분 분석과 한의학적 진찰로 확인하고 맞춤 보약으로 관리하는 클리닉입니다.",
            about: { "@type": "MedicalProcedure", name: "항노화 클리닉" },
            provider: { "@id": CLINIC_ID },
          },
        ]}
      />

      <ClinicHeader title="항노화 클리닉" />

      <ClinicIntro
        eyebrow="Anti-aging Clinic"
        headline={
          <>
            나이 탓으로 넘기기 전에
            <br className="md:hidden" /> <span className="text-[#8B1A2B]">무엇이 줄었는지</span>{" "}
            확인합니다
          </>
        }
        lead="피로가 오래간다고 해서 모두 노화는 아닙니다. 빈혈, 갑상선 기능, 염증, 근육량 감소처럼 확인하면 바로잡을 수 있는 요인이 섞여 있는 경우가 많습니다. 저희는 보약을 권하기 전에 검사로 원인을 먼저 가려냅니다."
      />

      <Section
        title="이런 변화를 느끼신다면"
        desc="한두 가지는 누구에게나 있습니다. 다만 여러 개가 겹쳐 몇 달째 이어진다면 확인해 볼 시점입니다."
      >
        <CardGrid items={SIGNS} />
      </Section>

      <Section
        title="무엇을 확인하나요"
        desc="근거 없이 보약부터 권하지 않습니다. 지금 몸에서 무엇이 부족한지 먼저 봅니다."
        tone="white"
      >
        <FeatureList items={EXAMS} />
      </Section>

      <Section
        title="이렇게 관리합니다"
        desc="같은 피로여도 원인이 다르면 처방이 달라집니다. 진찰과 검사 결과에 따라 구성합니다."
      >
        <FeatureList items={TREATMENTS} />
      </Section>

      <Section title="진료 절차" tone="white">
        <NumberedSteps steps={STEPS} />

        <div className="mt-10">
          <NoticeBox
            title="상담 전 알려주세요"
            items={[
              "최근 1년 이내 건강검진 결과지가 있다면 지참해 주세요. 중복 검사를 줄일 수 있습니다.",
              "복용 중인 약과 건강기능식품을 함께 알려주세요.",
              "고혈압·당뇨 등 관리 중인 질환이 있다면 미리 말씀해 주세요.",
              "임신 중이거나 계획 중이시라면 반드시 알려주세요.",
            ]}
          />
        </div>

        <div className="mt-10">
          <ClinicCTA />
        </div>
      </Section>

      <OtherClinics currentSlug="antiaging" />

      <ClinicDisclaimer>
        한약 복용의 효과와 체감 정도는 개인의 상태와 체질에 따라 다르며 특정한 결과를 보장하지
        않습니다. 복용 중인 약이 있거나 만성 질환을 관리 중인 경우, 임신·수유 중인 경우에는 반드시
        진료 시 알려주셔야 합니다. 검사에서 다른 질환이 의심되면 관련 전문 진료를 함께 권해 드립니다.
      </ClinicDisclaimer>
    </div>
  );
}
