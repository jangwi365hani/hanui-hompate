import type { Metadata } from "next";
import {
  Brain, Eye, Droplets, Ear, Waves, Syringe, Leaf, Activity,
  Timer, HeartPulse, Hand, Flame, AlertTriangle,
} from "lucide-react";
import JsonLd, { breadcrumb, SITE_URL, CLINIC_ID } from "@/components/JsonLd";
import {
  ClinicHeader, ClinicIntro, Section, CardGrid, FeatureList,
  NumberedSteps, NoticeBox, WarningBox, ClinicCTA, OtherClinics, ClinicDisclaimer,
} from "@/components/clinic/ClinicUI";

export const metadata: Metadata = {
  title: "안면마비·중풍 클리닉 · 장위365경희한의원",
  description:
    "구안와사(안면마비)와 중풍 후유증의 회복기 관리를 침·약침·한약으로 돕는 장위365경희한의원 안면마비·중풍 클리닉입니다. 발병 초기의 집중 치료부터 후유증 관리까지 시기에 맞춰 진행합니다. 성북구 장위동.",
};

/* 증상 */
const SYMPTOMS = [
  {
    Icon: Brain,
    title: "한쪽 얼굴이 마음대로 움직이지 않습니다",
    desc: "이마 주름이 잡히지 않고, 웃을 때 한쪽 입꼬리만 올라갑니다. 볼에 음식이 고이기도 합니다.",
  },
  {
    Icon: Eye,
    title: "눈이 잘 감기지 않습니다",
    desc: "자려고 해도 한쪽 눈이 덜 감겨 뻑뻑하고 시립니다. 각막이 마르지 않게 관리가 필요합니다.",
  },
  {
    Icon: Droplets,
    title: "물이나 침이 샙니다",
    desc: "물을 마실 때 한쪽으로 흘러내리고, 발음이 새는 느낌이 듭니다.",
  },
  {
    Icon: Ear,
    title: "귀 뒤가 아프고 소리가 울립니다",
    desc: "마비가 오기 전후로 귀 뒤쪽 통증이 있는 경우가 많고, 소리가 크게 울려 불편합니다.",
  },
  {
    Icon: Hand,
    title: "중풍 후 손발이 불편합니다",
    desc: "힘이 덜 들어가거나 뻣뻣하게 굳고, 감각이 둔한 상태가 이어집니다.",
  },
  {
    Icon: HeartPulse,
    title: "회복이 더딘 후유증",
    desc: "급성기 치료를 마쳤지만 어눌한 발음, 저림, 근육 강직, 피로가 남아 일상이 불편합니다.",
  },
];

/* 시기별 접근 — 이 질환은 '언제 왔는가'가 가장 중요하다 */
const PHASES = [
  {
    Icon: Timer,
    title: "발병 직후 (급성기)",
    desc: "가장 중요한 시기입니다. 신경의 염증과 부종을 가라앉히는 데 집중하며, 필요한 경우 신경과·이비인후과 치료를 함께 받으시도록 안내합니다.",
    note: "안면마비는 발병 초기에 치료를 시작하는 것이 회복에 유리합니다. 미루지 마세요.",
  },
  {
    Icon: Activity,
    title: "회복기",
    desc: "신경 기능이 돌아오는 시기입니다. 굳은 안면 근육을 풀고 움직임을 되살리는 치료와 재활 운동을 병행합니다.",
    note: "이 시기의 관리가 후유증 정도를 좌우합니다.",
  },
  {
    Icon: Flame,
    title: "후유증 관리기",
    desc: "표정의 비대칭, 연합운동(눈을 감을 때 입이 같이 움직임), 뻣뻣함 등 남은 불편을 다룹니다.",
    note: "시간이 지난 뒤에도 관리로 개선할 수 있는 부분이 있습니다.",
  },
];

/* 치료 */
const TREATMENTS = [
  {
    Icon: Waves,
    title: "안면부 침 치료",
    desc: "마비된 부위의 신경·근육 자극과 순환을 도와 움직임 회복을 돕습니다. 시기에 따라 자극의 강도를 조절합니다.",
  },
  {
    Icon: Syringe,
    title: "약침 치료",
    desc: "염증과 부종이 있는 시기에는 이를 가라앉히는 데, 회복기에는 근육의 긴장을 푸는 데 활용합니다.",
  },
  {
    Icon: Leaf,
    title: "한약 치료",
    desc: "급성기와 회복기의 처방이 다릅니다. 발병 원인과 체력, 기저 질환을 함께 고려해 구성합니다.",
  },
  {
    Icon: Flame,
    title: "뜸 · 온열 치료",
    desc: "찬 기운에 노출된 뒤 발병한 경우나 회복이 더딘 경우, 국소 순환을 돕는 목적으로 병행합니다.",
  },
  {
    Icon: Activity,
    title: "추나 · 경추 관리",
    desc: "목과 어깨의 긴장은 안면부 순환에 영향을 줍니다. 중풍 후유증에서는 자세와 관절 가동 범위를 함께 봅니다.",
  },
  {
    Icon: Hand,
    title: "재활 운동 지도",
    desc: "집에서 매일 할 수 있는 안면 근육 운동과 눈 보호 방법을 알려드립니다. 치료만큼 중요한 부분입니다.",
  },
];

const STEPS = [
  { title: "발병 시점과 상태 확인", desc: "언제 시작됐는지, 어느 정도 마비인지, 다른 신경 증상이 있는지 확인합니다." },
  { title: "감별과 협진 안내", desc: "중추성 원인이 의심되면 즉시 신경과 진료를 안내합니다. 필요 시 병행 치료를 권해 드립니다." },
  { title: "시기별 집중 치료", desc: "급성기·회복기에 맞춰 치료 구성과 빈도를 달리합니다." },
  { title: "재활과 경과 확인", desc: "안면 운동을 병행하며 회복 정도를 확인하고 치료 간격을 조정합니다." },
];

const RED_FLAGS = [
  "얼굴과 함께 팔다리에 힘이 빠지거나 감각이 둔해진 경우",
  "말이 어눌해지거나 상대의 말을 이해하기 어려운 경우",
  "이마 주름은 정상인데 입만 돌아간 경우 (중추성 마비 의심)",
  "심한 두통, 어지럼, 물체가 겹쳐 보이는 증상이 함께 있는 경우",
  "의식이 흐려지거나 걸음이 휘청거리는 경우",
];

export default function StrokeClinicPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          breadcrumb([
            { name: "진료과목", path: "/#services" },
            { name: "안면마비·중풍 클리닉", path: "/clinic/stroke" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "@id": `${SITE_URL}/clinic/stroke#page`,
            name: "안면마비·중풍 클리닉",
            description:
              "구안와사(안면마비)와 중풍 후유증을 시기에 맞춰 침·약침·한약으로 관리하는 클리닉입니다.",
            about: { "@type": "MedicalCondition", name: "안면신경마비, 뇌졸중 후유증" },
            provider: { "@id": CLINIC_ID },
          },
        ]}
      />

      <ClinicHeader title="안면마비·중풍 클리닉" />

      {/* 이 질환만큼은 첫 화면에서 응급 감별을 먼저 알린다 — 늦으면 되돌릴 수 없는 경우가 있다 */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong className="font-bold">얼굴과 함께 팔다리에 힘이 빠지거나 말이 어눌하다면</strong>{" "}
            뇌졸중일 수 있습니다. 이 경우 한의원이 아니라 119 또는 응급실로 바로 가셔야 합니다.
          </p>
        </div>
      </div>

      <ClinicIntro
        eyebrow="Facial Palsy & Stroke Care"
        headline={
          <>
            얼마나 빨리 시작하느냐가
            <br className="md:hidden" /> <span className="text-[#8B1A2B]">회복의 폭</span>을
            정합니다
          </>
        }
        lead="안면마비와 중풍 후유증은 같은 치료를 계속 반복하는 질환이 아닙니다. 발병 직후, 회복기, 후유증 관리기에 몸의 상태가 다르고 필요한 치료도 달라집니다. 저희는 지금이 어느 시기인지 먼저 확인하고, 그에 맞춰 치료를 구성합니다."
      />

      <Section
        title="이런 증상이 있다면"
        desc="아래 증상이 갑자기 나타났다면 되도록 빨리 진료를 받으시길 권합니다."
      >
        <CardGrid items={SYMPTOMS} />
      </Section>

      <Section
        title="시기에 따라 치료가 다릅니다"
        desc="언제 오셨는지가 치료 구성을 가르는 가장 중요한 기준입니다."
        tone="white"
      >
        <CardGrid items={PHASES} cols={3} />
      </Section>

      <Section
        title="이렇게 치료합니다"
        desc="신경이 회복되는 과정을 돕고, 그 사이 굳어지는 근육과 이차적인 불편을 함께 관리합니다."
      >
        <FeatureList items={TREATMENTS} />
      </Section>

      <Section title="진료 절차" tone="white">
        <NumberedSteps steps={STEPS} />

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <NoticeBox
            title="내원 시 알려주세요"
            items={[
              "증상이 정확히 언제 시작됐는지 알려주세요. 치료 시기 판단에 가장 중요합니다.",
              "이미 받으신 검사(MRI·CT)나 처방받은 약이 있다면 지참해 주세요.",
              "고혈압·당뇨·심장질환 등 기저 질환과 복용 중인 약을 함께 알려주세요.",
              "눈이 잘 감기지 않는다면 인공눈물과 안대 사용법을 안내해 드립니다.",
            ]}
          />
          <WarningBox
            title="이런 경우에는 즉시 응급실로 가세요"
            items={RED_FLAGS}
          />
        </div>

        <div className="mt-10">
          <ClinicCTA />
        </div>
      </Section>

      <OtherClinics currentSlug="stroke" />

      <ClinicDisclaimer>
        회복의 정도와 기간은 발병 원인, 신경 손상의 정도, 치료 시작 시점, 기저 질환에 따라 개인차가
        크며 특정한 결과를 보장하지 않습니다. 중추성 원인이 의심되는 경우에는 신경과 등 관련 전문
        진료를 우선 안내해 드리며, 필요 시 병행 치료를 권해 드립니다.
      </ClinicDisclaimer>
    </div>
  );
}
