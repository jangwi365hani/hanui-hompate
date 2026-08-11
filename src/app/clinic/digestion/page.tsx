import type { Metadata } from "next";
import {
  Utensils, Wind, Flame, Moon, Frown, Activity, Leaf, Waves,
  ScanLine, HeartPulse, Coffee, Soup,
} from "lucide-react";
import JsonLd, { breadcrumb, SITE_URL, CLINIC_ID } from "@/components/JsonLd";
import {
  ClinicHeader, ClinicIntro, Section, CardGrid, FeatureList,
  NumberedSteps, NoticeBox, WarningBox, ClinicCTA, OtherClinics, ClinicDisclaimer,
} from "@/components/clinic/ClinicUI";

export const metadata: Metadata = {
  title: "만성 소화불량 클리닉 · 장위365경희한의원",
  description:
    "내시경에서는 이상이 없다는데 더부룩함과 명치 통증이 계속되는 기능성 소화불량을 위장 운동 기능과 체질, 생활습관 관점에서 관리하는 장위365경희한의원 만성 소화불량 클리닉입니다. 성북구 장위동.",
};

/* 증상 */
const SYMPTOMS = [
  {
    Icon: Soup,
    title: "조금만 먹어도 부릅니다",
    desc: "몇 숟가락 뜨면 배가 차고, 식사를 끝내지 못합니다. 먹고 나면 한참 동안 그대로 남아 있는 느낌입니다.",
  },
  {
    Icon: Flame,
    title: "명치가 쓰리거나 아픕니다",
    desc: "빈속에 쓰리거나, 먹고 나면 명치 부위가 뻐근하게 아픕니다.",
  },
  {
    Icon: Wind,
    title: "트림과 가스가 많습니다",
    desc: "트림이 잦고 배에 가스가 차 더부룩합니다. 배가 자주 꾸르륵거립니다.",
  },
  {
    Icon: Frown,
    title: "속이 메스껍습니다",
    desc: "울렁거림이 이어지고, 심하면 냄새만 맡아도 입맛이 떨어집니다.",
  },
  {
    Icon: Moon,
    title: "잠자리에 들면 더 불편합니다",
    desc: "누우면 신물이 올라오거나 속이 답답해 잠들기 어렵습니다.",
  },
  {
    Icon: HeartPulse,
    title: "소화 문제인데 온몸이 힘듭니다",
    desc: "두통, 어깨 결림, 만성 피로가 함께 옵니다. 먹지 못하니 기력도 떨어집니다.",
  },
];

/* 자가 점검 */
const SELF_CHECK = [
  "내시경에서 특별한 이상이 없다는 말을 들었다",
  "소화제를 먹을 때만 잠깐 괜찮다",
  "증상이 3개월 이상 이어지고 있다",
  "스트레스를 받거나 신경 쓰는 일이 있으면 반드시 심해진다",
  "식사량이 줄어 체중이 빠지고 기운이 없다",
  "변비와 설사가 번갈아 나타난다",
];

/* 왜 생기나 — 위담의 브랜드 개념을 쓰지 않고 일반적인 한의학·기능적 설명으로 쓴다 */
const CAUSES = [
  {
    Icon: Activity,
    title: "위장 운동 기능의 저하",
    desc: "위가 음식을 아래로 내려보내는 힘과 리듬이 떨어지면, 염증이 없어도 음식이 오래 머물러 더부룩함이 생깁니다.",
  },
  {
    Icon: Waves,
    title: "예민해진 내장 감각",
    desc: "같은 양을 먹어도 남들보다 더 부르고 아프게 느껴집니다. 위장이 보내는 신호에 과민해진 상태입니다.",
  },
  {
    Icon: Coffee,
    title: "스트레스와 자율신경",
    desc: "긴장이 이어지면 소화 기능은 뒤로 밀립니다. 신경 쓰는 일이 있을 때마다 증상이 심해지는 이유입니다.",
  },
  {
    Icon: Utensils,
    title: "굳어진 식생활",
    desc: "불규칙한 식사, 급하게 먹는 습관, 늦은 야식이 오래되면 위장이 회복할 틈을 갖지 못합니다.",
  },
];

/* 치료 */
const TREATMENTS = [
  {
    Icon: ScanLine,
    title: "상태 확인",
    desc: "복진으로 명치와 배의 긴장 정도를 확인하고, 필요 시 혈액검사로 빈혈·염증 등 다른 원인을 함께 살핍니다.",
  },
  {
    Icon: Leaf,
    title: "체질 맞춤 한약",
    desc: "위가 차서 못 내려가는 경우와 열이 뭉쳐 쓰린 경우의 처방이 다릅니다. 증상 조합에 맞춰 구성합니다.",
  },
  {
    Icon: Waves,
    title: "침 · 약침 치료",
    desc: "복부와 등의 굳은 부위를 풀고 위장 운동을 돕습니다. 명치 통증과 더부룩함에 함께 활용합니다.",
  },
  {
    Icon: Flame,
    title: "뜸 · 온열 치료",
    desc: "배가 차고 힘이 없는 경우 아랫배와 명치를 데워 순환을 돕습니다.",
  },
  {
    Icon: Activity,
    title: "긴장 완화",
    desc: "스트레스가 방아쇠인 경우가 많아, 목·어깨의 긴장과 수면 문제를 함께 다룹니다.",
  },
  {
    Icon: Utensils,
    title: "식생활 조정",
    desc: "무엇을 끊으라기보다, 식사 간격·속도·양처럼 지킬 수 있는 것부터 구체적으로 정합니다.",
  },
];

const STEPS = [
  { title: "증상과 식생활 확인", desc: "언제 심해지는지, 어떤 음식에서 그런지 패턴부터 정리합니다." },
  { title: "복진과 필요 검사", desc: "복부 상태를 진찰하고, 필요하면 혈액검사로 다른 원인을 배제합니다." },
  { title: "치료", desc: "한약과 침·뜸 치료를 병행해 위장 기능과 긴장을 함께 다룹니다." },
  { title: "식생활 관리와 재평가", desc: "식사 습관을 조정하며 경과를 확인하고 처방을 조정합니다." },
];

const REFER = [
  "체중이 의도치 않게 계속 줄어드는 경우",
  "삼킬 때 걸리거나 아픈 증상이 새로 생긴 경우",
  "검은 변이나 피가 섞인 변, 토혈이 있는 경우",
  "빈혈이 확인되었거나 지속적인 구토가 있는 경우",
  "50세 이후 처음으로 소화기 증상이 시작된 경우",
];

export default function DigestionClinicPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          breadcrumb([
            { name: "진료과목", path: "/#services" },
            { name: "만성 소화불량 클리닉", path: "/clinic/digestion" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "@id": `${SITE_URL}/clinic/digestion#page`,
            name: "만성 소화불량 클리닉",
            description:
              "내시경상 이상이 없는 기능성 소화불량을 위장 운동 기능과 체질, 생활습관 관점에서 관리하는 클리닉입니다.",
            about: { "@type": "MedicalCondition", name: "기능성 소화불량" },
            provider: { "@id": CLINIC_ID },
          },
        ]}
      />

      <ClinicHeader title="만성 소화불량 클리닉" />

      <ClinicIntro
        eyebrow="Digestive Clinic"
        headline={
          <>
            검사에는 이상이 없는데
            <br className="md:hidden" /> <span className="text-[#8B1A2B]">계속 불편하다면</span>
          </>
        }
        lead="내시경에서 이상이 없다는 말은 '괜찮다'는 뜻이 아니라 '눈에 보이는 병변은 없다'는 뜻입니다. 위장이 음식을 내려보내는 기능과 감각의 문제는 내시경에 잡히지 않습니다. 저희는 그 기능의 문제를 다룹니다."
      />

      <Section
        title="이런 증상이 있다면"
        desc="기능성 소화불량은 아래 증상이 조합으로 나타나는 경우가 많습니다."
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
        </div>
      </section>

      <Section title="왜 계속될까요" desc="염증이 없는데도 불편함이 이어지는 데는 이유가 있습니다.">
        <CardGrid items={CAUSES} cols={2} />
      </Section>

      <Section
        title="이렇게 치료합니다"
        desc="소화제로 그때그때 넘기기보다, 위장이 스스로 움직이는 힘을 되찾는 데 중점을 둡니다."
        tone="white"
      >
        <FeatureList items={TREATMENTS} />
      </Section>

      <Section title="진료 절차">
        <NumberedSteps steps={STEPS} />

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <NoticeBox
            title="내원 전 준비해 주세요"
            items={[
              "최근 받으신 위내시경·복부초음파 결과지가 있다면 지참해 주세요.",
              "복용 중인 위장약과 다른 약을 함께 알려주세요.",
              "며칠간이라도 식사 시간과 증상을 메모해 오시면 원인을 찾기 쉽습니다.",
              "증상이 심해지는 특정 음식이 있다면 기억해 오세요.",
            ]}
          />
          <WarningBox
            title="이런 경우에는 내과 검사를 먼저 받으세요"
            items={REFER}
          />
        </div>

        <div className="mt-10">
          <ClinicCTA />
        </div>
      </Section>

      <OtherClinics currentSlug="digestion" />

      <ClinicDisclaimer>
        치료 반응과 회복 기간은 개인의 상태와 유병 기간에 따라 다르며 특정한 결과를 보장하지 않습니다.
        한의 진료는 내시경 등 필요한 검사를 대신하지 않으며, 기질적 질환이 의심되는 경우 관련 전문
        진료를 함께 권해 드립니다.
      </ClinicDisclaimer>
    </div>
  );
}
