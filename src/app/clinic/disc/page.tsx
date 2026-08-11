import type { Metadata } from "next";
import {
  Bone, Zap, Activity, Waves, Syringe, Leaf, Ruler, ScanLine,
  AlertTriangle, Footprints, MoveVertical, Armchair, Weight, Hourglass,
} from "lucide-react";
import JsonLd, { breadcrumb, SITE_URL, CLINIC_ID } from "@/components/JsonLd";
import {
  ClinicHeader, ClinicIntro, Section, CardGrid, FeatureList,
  NumberedSteps, NoticeBox, WarningBox, ClinicCTA, OtherClinics, ClinicDisclaimer,
} from "@/components/clinic/ClinicUI";

export const metadata: Metadata = {
  title: "디스크·협착증 클리닉 · 장위365경희한의원",
  description:
    "허리디스크(추간판탈출증)와 척추관협착증을 수술 없이 관리하는 장위365경희한의원 디스크·협착증 클리닉입니다. 초음파 유도 약침, 추나요법, 한약 치료로 신경 자극을 줄이고 척추 주변 구조를 안정화합니다. 성북구 장위동.",
};

/* 증상 — 환자가 자기 상태를 알아볼 수 있는 말로 쓴다 */
const SYMPTOMS = [
  {
    Icon: Footprints,
    title: "다리로 뻗치는 통증",
    desc: "허리보다 엉덩이·허벅지·종아리가 더 아픈 경우가 많습니다. 한쪽 다리로 뻗치듯 내려가는 통증이 특징입니다.",
  },
  {
    Icon: Zap,
    title: "저림과 감각 둔화",
    desc: "다리나 발이 저리고 남의 살 같거나, 찬물에 닿은 듯한 느낌이 지속됩니다.",
  },
  {
    Icon: MoveVertical,
    title: "특정 자세에서 심해지는 통증",
    desc: "디스크는 앉아 있거나 앞으로 숙일 때, 협착증은 허리를 펴고 걸을 때 통증이 커지는 경향이 있습니다.",
  },
  {
    Icon: Hourglass,
    title: "조금만 걸어도 쉬어야 하는 다리",
    desc: "협착증에서 흔합니다. 걷다 보면 다리가 무겁고 저려 멈췄다가, 잠시 앉으면 다시 걸을 수 있습니다.",
  },
  {
    Icon: AlertTriangle,
    title: "기침·재채기에 울리는 허리",
    desc: "복압이 올라가는 순간 허리와 다리에 통증이 번지면 신경 자극이 있다는 신호일 수 있습니다.",
  },
  {
    Icon: Bone,
    title: "아침에 굳는 허리",
    desc: "자고 일어났을 때 허리가 뻣뻣해 한참 움직여야 풀리고, 오래 서 있기 힘듭니다.",
  },
];

/* 원인 */
const CAUSES = [
  {
    Icon: Armchair,
    title: "오래 앉아 있는 생활",
    desc: "앉은 자세는 서 있을 때보다 디스크에 실리는 압력이 큽니다. 장시간 앉아 일하면 추간판이 뒤로 밀리기 쉽습니다.",
  },
  {
    Icon: Hourglass,
    title: "노화에 따른 퇴행",
    desc: "추간판의 수분이 줄고 인대·후관절이 두꺼워지면서 신경이 지나는 공간이 좁아집니다. 협착증의 주된 배경입니다.",
  },
  {
    Icon: Weight,
    title: "반복적인 부하와 외상",
    desc: "무거운 물건을 자주 들거나, 허리를 비틀며 힘을 쓰는 동작이 반복되면 특정 분절에 부담이 몰립니다.",
  },
  {
    Icon: Ruler,
    title: "무너진 정렬과 약해진 근육",
    desc: "골반이 틀어지고 복부·둔부 근육이 약해지면 척추가 스스로를 지탱하지 못해 같은 자리가 계속 아픕니다.",
  },
];

/* 치료 — 실제로 원내에서 하는 것만 적는다 */
const TREATMENTS = [
  {
    Icon: ScanLine,
    title: "초음파 진단",
    desc: "통증 부위의 근육·건·신경 주변 상태를 초음파로 직접 확인합니다. 어디에서 문제가 생기는지 보고 치료 지점을 정합니다.",
  },
  {
    Icon: Syringe,
    title: "초음파 유도 약침",
    desc: "한약재에서 정제한 약침액을 초음파로 위치를 보면서 필요한 깊이에 정확히 주입해, 신경 주변의 염증과 자극을 줄입니다.",
  },
  {
    Icon: Activity,
    title: "추나요법",
    desc: "틀어진 척추·골반 정렬과 굳은 관절 움직임을 손으로 교정합니다. 통증이 반복되는 구조적 원인을 다룹니다.",
  },
  {
    Icon: Waves,
    title: "침·전기침 치료",
    desc: "경직된 심부 근육을 풀고 순환을 도와 급성기의 통증과 근육 긴장을 낮춥니다.",
  },
  {
    Icon: Leaf,
    title: "한약 치료",
    desc: "염증기·회복기에 따라 처방을 달리합니다. 통증이 가라앉은 뒤에는 뼈와 인대, 기력 회복에 중점을 둡니다.",
  },
  {
    Icon: Bone,
    title: "재발 관리",
    desc: "치료가 끝난 뒤가 더 중요합니다. 일상에서의 자세, 운동 범위, 생활 동작을 함께 점검해 재발 간격을 늘립니다.",
  },
];

const STEPS = [
  { title: "문진과 이학적 검사", desc: "통증 위치와 양상, 악화·완화 자세를 확인하고 신경 증상 여부를 검사합니다." },
  { title: "초음파 확인", desc: "통증 부위를 초음파로 살펴 치료 지점과 깊이를 정합니다. 필요 시 영상의학 검사를 권해 드립니다." },
  { title: "단계별 치료", desc: "급성기에는 통증과 염증을 줄이는 데, 이후에는 구조 안정화에 중점을 둡니다." },
  { title: "생활 관리와 재평가", desc: "자세·운동 지도를 병행하고, 경과에 따라 치료 간격과 방법을 조정합니다." },
];

const RED_FLAGS = [
  "대소변 조절이 어려워지거나 항문·회음부 감각이 둔해진 경우",
  "다리에 힘이 빠져 발목이 들리지 않거나 주저앉는 경우",
  "휴식과 관계없이 통증이 계속 심해지고 밤에 더 아픈 경우",
  "발열, 원인 모를 체중 감소가 통증과 함께 나타나는 경우",
];

const FAQS = [
  {
    q: "수술하지 않고도 좋아질 수 있나요?",
    a: "신경학적 이상 소견이 없는 경우라면 비수술적 치료를 먼저 시도하는 것이 일반적입니다. 다만 위에 적어둔 응급 신호가 있다면 지체 없이 수술적 평가가 필요하며, 이때는 저희가 협진 의료기관을 안내해 드립니다.",
  },
  {
    q: "디스크와 협착증은 어떻게 다른가요?",
    a: "디스크는 추간판이 밀려 나와 신경을 자극하는 것이고, 협착증은 신경이 지나는 통로 자체가 좁아진 상태입니다. 디스크는 앉거나 숙일 때, 협착증은 걸을 때 증상이 심해지는 경향이 있어 치료 방향도 달라집니다.",
  },
  {
    q: "치료 기간은 얼마나 걸리나요?",
    a: "증상의 정도와 유병 기간에 따라 달라집니다. 급성기에는 주 2~3회 집중 치료로 통증을 낮추고, 이후 간격을 늘리며 관리합니다. 경과는 개인차가 크므로 첫 진료에서 상태를 확인한 뒤 안내해 드립니다.",
  },
  {
    q: "MRI를 찍고 가야 하나요?",
    a: "반드시 필요하지는 않습니다. 문진과 이학적 검사, 초음파로 상당 부분 판단할 수 있습니다. 이미 촬영한 영상이 있다면 지참해 주시면 도움이 되고, 필요하다고 판단되면 검사를 권해 드립니다.",
  },
  {
    q: "자동차보험으로도 치료받을 수 있나요?",
    a: "교통사고로 인한 허리 통증은 자동차보험 적용이 가능합니다. 접수 시 사고 접수번호를 알려주시면 안내해 드립니다.",
  },
];

export default function DiscClinicPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          breadcrumb([
            { name: "진료과목", path: "/#services" },
            { name: "디스크·협착증 클리닉", path: "/clinic/disc" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "@id": `${SITE_URL}/clinic/disc#page`,
            name: "디스크·협착증 클리닉",
            description:
              "허리디스크와 척추관협착증을 초음파 유도 약침, 추나요법, 한약으로 수술 없이 관리하는 클리닉입니다.",
            about: { "@type": "MedicalCondition", name: "요추 추간판 탈출증, 척추관협착증" },
            provider: { "@id": CLINIC_ID },
          },
          {
            // 화면에 그대로 있는 문답만 담는다 (구글 구조화데이터 정책)
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `${SITE_URL}/clinic/disc#faq`,
            mainEntity: FAQS.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          },
        ]}
      />

      <ClinicHeader title="디스크·협착증 클리닉" />

      <ClinicIntro
        eyebrow="Spine Clinic"
        headline={
          <>
            아픈 자리가 아니라
            <br className="md:hidden" /> <span className="text-[#8B1A2B]">눌리는 지점</span>을
            찾습니다
          </>
        }
        lead="허리가 아파도 원인은 제각각입니다. 추간판이 밀려 신경을 건드리는 경우, 신경이 지나는 길 자체가 좁아진 경우, 정렬이 무너져 특정 분절에 부담이 몰리는 경우가 모두 다릅니다. 초음파로 상태를 확인하고, 그에 맞는 치료를 단계적으로 진행합니다."
      />

      <Section
        title="이런 증상이 있다면"
        desc="아래 증상이 2주 이상 이어진다면 한 번 확인해 보시길 권합니다."
      >
        <CardGrid items={SYMPTOMS} />
      </Section>

      <Section
        title="왜 생기나요"
        desc="대부분 한 가지 원인보다 여러 요인이 겹쳐 나타납니다."
        tone="white"
      >
        <CardGrid items={CAUSES} cols={2} />
      </Section>

      <Section
        title="이렇게 치료합니다"
        desc="통증을 눌러두는 데서 그치지 않고, 같은 자리가 반복해 아픈 이유를 함께 다룹니다."
      >
        <FeatureList items={TREATMENTS} />
      </Section>

      <Section title="진료 절차" tone="white">
        <NumberedSteps steps={STEPS} />

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <NoticeBox
            title="내원 전 준비해 주세요"
            items={[
              "이전에 촬영한 X-ray·CT·MRI 영상이 있다면 CD나 판독지를 지참해 주세요.",
              "복용 중인 약이 있다면 약 봉투나 처방전을 보여주시면 좋습니다.",
              "추나 치료가 있을 수 있어 편한 복장으로 오시면 도움이 됩니다.",
              "교통사고 치료는 접수 시 사고 접수번호를 알려주세요.",
            ]}
          />
          <WarningBox
            title="이런 경우에는 지체하지 말고 진료를 받으세요"
            items={RED_FLAGS}
          />
        </div>
      </Section>

      <Section title="자주 묻는 질문">
        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5"
            >
              <summary className="font-bold text-gray-900 text-[15px] cursor-pointer list-none flex items-start justify-between gap-3">
                <span>{q}</span>
                <span className="text-[#8B1A2B] shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-sm text-gray-500 leading-relaxed mt-3">{a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10">
          <ClinicCTA />
        </div>
      </Section>

      <OtherClinics currentSlug="disc" />

      <ClinicDisclaimer>
        치료 경과와 회복 기간은 증상의 정도, 유병 기간, 생활 환경에 따라 개인차가 있으며 특정한
        결과를 보장하지 않습니다. 신경학적 이상 소견이 확인되는 경우에는 수술적 치료를 포함한 협진을
        안내해 드립니다.
      </ClinicDisclaimer>
    </div>
  );
}
