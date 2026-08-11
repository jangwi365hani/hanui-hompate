import type { Metadata } from "next";
import {
  Wind, Droplets, Moon, Brain, Thermometer, CloudFog, Leaf, Waves,
  ShieldCheck, Activity, Sparkles, CalendarDays,
} from "lucide-react";
import JsonLd, { breadcrumb, SITE_URL, CLINIC_ID } from "@/components/JsonLd";
import {
  ClinicHeader, ClinicIntro, Section, CardGrid, FeatureList,
  NumberedSteps, NoticeBox, WarningBox, ClinicCTA, OtherClinics, ClinicDisclaimer,
} from "@/components/clinic/ClinicUI";

export const metadata: Metadata = {
  title: "비염 클리닉 · 장위365경희한의원",
  description:
    "알레르기 비염, 만성 비염, 축농증(부비동염)을 코 증상 억제에 그치지 않고 점막 기능 회복과 면역·자율신경 균형까지 함께 관리하는 장위365경희한의원 비염 클리닉입니다. 성북구 장위동.",
};

/* 증상 유형 */
const SYMPTOMS = [
  {
    Icon: Wind,
    title: "코막힘이 계속됩니다",
    desc: "한쪽씩 번갈아 막히거나, 누우면 더 심해집니다. 입으로 숨 쉬는 습관이 굳어지기도 합니다.",
  },
  {
    Icon: Droplets,
    title: "맑은 콧물과 재채기",
    desc: "아침에 일어날 때, 찬 공기를 만날 때 발작적으로 시작됩니다. 알레르기 비염에서 흔합니다.",
  },
  {
    Icon: CloudFog,
    title: "누런 콧물과 후비루",
    desc: "콧물이 목뒤로 넘어가 자꾸 킁킁대고 헛기침을 합니다. 축농증이 함께 있는 경우가 많습니다.",
  },
  {
    Icon: Moon,
    title: "잠을 설칩니다",
    desc: "코가 막혀 자다 깨거나 코를 골고, 자고 일어나도 개운하지 않습니다. 아이는 성장에도 영향을 받습니다.",
  },
  {
    Icon: Brain,
    title: "머리가 무겁고 집중이 안 됩니다",
    desc: "이마·광대 부위가 묵직하고 멍한 느낌이 이어집니다. 학습·업무 능률이 떨어집니다.",
  },
  {
    Icon: Thermometer,
    title: "환절기마다 되풀이됩니다",
    desc: "약을 먹으면 잦아들었다가 계절이 바뀌면 다시 시작되는 패턴이 해마다 반복됩니다.",
  },
];

/* 자가 점검 — ssoom의 자가진단 블록에 해당. 진단이 아니라 '확인해 볼 신호' 수준으로 쓴다 */
const SELF_CHECK = [
  "코막힘이나 콧물이 4주 이상 이어지고 있다",
  "약을 먹을 때만 괜찮고, 끊으면 곧 돌아온다",
  "자다가 입으로 숨 쉬거나 코를 곤다",
  "냄새를 잘 못 맡는 때가 있다",
  "환절기마다 같은 증상이 반복된다",
  "코 증상과 함께 늘 피곤하고 컨디션이 처진다",
];

/* 원인 */
const CAUSES = [
  {
    Icon: ShieldCheck,
    title: "과민해진 면역 반응",
    desc: "먼지·꽃가루·온도 변화처럼 대단치 않은 자극에도 몸이 과하게 반응하면서 점막이 붓고 콧물이 쏟아집니다.",
  },
  {
    Icon: Activity,
    title: "자율신경의 불균형",
    desc: "수면 부족과 스트레스가 이어지면 혈관 수축·이완 조절이 흐트러져 코막힘이 하루 중에도 오르내립니다.",
  },
  {
    Icon: CloudFog,
    title: "회복되지 않은 점막",
    desc: "염증이 반복되면 점막이 두꺼워지고 섬모 기능이 떨어져, 자극을 걸러내지 못하는 상태가 굳어집니다.",
  },
  {
    Icon: Sparkles,
    title: "떨어진 전신 컨디션",
    desc: "소화 기능 저하, 만성 피로, 잦은 감염이 겹치면 코만 치료해도 금세 원래대로 돌아갑니다.",
  },
];

/* 치료 */
const TREATMENTS = [
  {
    Icon: Waves,
    title: "비강 국소 치료",
    desc: "부어 있는 코 점막의 순환을 돕고 분비물 배출을 유도해, 막힌 코를 트는 데 우선 집중합니다.",
  },
  {
    Icon: Leaf,
    title: "체질 맞춤 한약",
    desc: "같은 비염이어도 냉해서 생긴 경우와 열이 뭉쳐 생긴 경우의 처방이 다릅니다. 급성기와 관리기의 처방도 나눕니다.",
  },
  {
    Icon: Wind,
    title: "침 · 약침 치료",
    desc: "코 주변 혈자리와 함께 자율신경 조절에 관여하는 부위를 다뤄 코막힘과 재채기 반응을 낮춥니다.",
  },
  {
    Icon: ShieldCheck,
    title: "면역·체력 관리",
    desc: "증상이 잦아든 뒤에는 재발 간격을 늘리는 데 중점을 둡니다. 소화 기능과 기력 회복을 함께 봅니다.",
  },
  {
    Icon: CalendarDays,
    title: "환절기 선제 관리",
    desc: "매년 같은 시기에 재발한다면, 그 전에 미리 관리해 증상의 강도를 낮추는 방법을 안내합니다.",
  },
  {
    Icon: Activity,
    title: "생활 환경 지도",
    desc: "실내 습도, 침구 관리, 코 세척 방법처럼 집에서 이어갈 수 있는 관리법을 함께 알려드립니다.",
  },
];

const STEPS = [
  { title: "증상 확인", desc: "증상의 양상과 기간, 계절성 여부, 지금까지 쓴 약을 확인합니다." },
  { title: "코와 전신 상태 진찰", desc: "코 점막 상태와 함께 소화·수면·체력 등 전신 컨디션을 살핍니다." },
  { title: "급성기 치료", desc: "막힌 코와 콧물을 먼저 다뤄 일상이 가능한 수준으로 낮춥니다." },
  { title: "재발 관리", desc: "치료 간격을 늘려가며 환절기 대비와 생활 관리를 이어갑니다." },
];

const REFER = [
  "한쪽 코에서만 피가 섞인 콧물이 반복되는 경우",
  "냄새를 전혀 맡지 못하는 상태가 갑자기 생긴 경우",
  "얼굴 통증과 함께 고열이 나는 경우",
  "코 증상과 함께 시야 이상이나 심한 두통이 있는 경우",
];

export default function RhinitisClinicPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          breadcrumb([
            { name: "진료과목", path: "/#services" },
            { name: "비염 클리닉", path: "/clinic/rhinitis" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "@id": `${SITE_URL}/clinic/rhinitis#page`,
            name: "비염 클리닉",
            description:
              "알레르기 비염과 만성 비염, 축농증을 점막 기능 회복과 면역 균형 관점에서 관리하는 한의원 비염 클리닉입니다.",
            about: { "@type": "MedicalCondition", name: "알레르기 비염, 만성 비염, 부비동염" },
            provider: { "@id": CLINIC_ID },
          },
        ]}
      />

      <ClinicHeader title="비염 클리닉" />

      <ClinicIntro
        eyebrow="Rhinitis Clinic"
        headline={
          <>
            약을 끊으면 돌아온다면
            <br className="md:hidden" /> <span className="text-[#8B1A2B]">코만의 문제</span>가
            아닙니다
          </>
        }
        lead="코막힘과 콧물을 잠시 눌러두는 것은 어렵지 않습니다. 문제는 끊으면 곧 돌아온다는 점입니다. 저희는 부어 있는 점막을 가라앉히는 것과 함께, 왜 그 점막이 계속 과민하게 반응하는지를 같이 다룹니다."
      />

      <Section
        title="이런 증상이 있다면"
        desc="비염은 사람마다 주로 나타나는 증상이 다릅니다. 어느 쪽에 가까우신가요."
      >
        <CardGrid items={SYMPTOMS} />
      </Section>

      {/* 자가 점검 */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-xl font-bold text-gray-900 mb-1">이 중 몇 가지에 해당하시나요</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            진단은 진료를 통해 이루어집니다. 아래는 한 번 확인해 보시길 권하는 신호입니다.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3">
            {SELF_CHECK.map((t, i) => (
              <li
                key={t}
                className="flex items-start gap-3 bg-gray-50 rounded-xl px-5 py-4 text-sm text-gray-700 leading-relaxed"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#8B1A2B]/10 text-[#8B1A2B] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-5 leading-relaxed">
            3가지 이상 해당된다면 단순한 계절성 증상이 아닐 수 있습니다. 한 번 진료로 상태를 확인해
            보시길 권합니다.
          </p>
        </div>
      </section>

      <Section title="왜 반복될까요" desc="코 증상이 되풀이되는 배경은 대개 아래가 겹쳐 있습니다.">
        <CardGrid items={CAUSES} cols={2} />
      </Section>

      <Section
        title="이렇게 치료합니다"
        desc="지금 막힌 코를 트는 것과, 다시 막히지 않게 하는 것을 나눠서 접근합니다."
        tone="white"
      >
        <FeatureList items={TREATMENTS} />
      </Section>

      <Section title="진료 절차">
        <NumberedSteps steps={STEPS} />

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <NoticeBox
            title="내원 전 알려주세요"
            items={[
              "지금까지 복용했던 비염약·항히스타민제 종류를 알려주시면 도움이 됩니다.",
              "알레르기 검사를 받으신 적이 있다면 결과지를 지참해 주세요.",
              "증상이 심해지는 시기와 장소(계절·아침·특정 공간)를 기억해 오세요.",
              "아이의 경우 수면 중 코골이나 입 호흡 여부를 함께 알려주세요.",
            ]}
          />
          <WarningBox
            title="이런 경우에는 이비인후과 진료를 먼저 받으세요"
            items={REFER}
          />
        </div>

        <div className="mt-10">
          <ClinicCTA />
        </div>
      </Section>

      <OtherClinics currentSlug="rhinitis" />

      <ClinicDisclaimer>
        증상의 호전 정도와 재발 여부는 개인의 체질, 환경, 유병 기간에 따라 다르며 특정한 결과를
        보장하지 않습니다. 구조적 이상이나 다른 질환이 의심되는 경우에는 이비인후과 진료를 함께 권해
        드립니다.
      </ClinicDisclaimer>
    </div>
  );
}
