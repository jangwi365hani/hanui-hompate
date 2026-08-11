import type { Metadata } from "next";
import {
  Heart, Flame, Baby, CalendarHeart, Droplets, Moon, Thermometer,
  Sparkles, Leaf, Waves, Activity, HeartPulse, Sun, ShieldCheck,
} from "lucide-react";
import JsonLd, { breadcrumb, SITE_URL, CLINIC_ID } from "@/components/JsonLd";
import {
  ClinicHeader, ClinicIntro, Section, CardGrid, FeatureList,
  NumberedSteps, NoticeBox, WarningBox, ClinicCTA, OtherClinics, ClinicDisclaimer,
} from "@/components/clinic/ClinicUI";

export const metadata: Metadata = {
  title: "여성 클리닉 · 장위365경희한의원",
  description:
    "월경통·생리불순·난임 준비부터 산후 관리, 갱년기까지 여성의 생애주기에 맞춰 관리하는 장위365경희한의원 여성 클리닉입니다. 왕뜸·약침·맞춤 한약으로 자궁과 골반 순환, 호르몬 균형을 함께 돌봅니다. 성북구 장위동.",
};

/* 생애주기 — 자윤 사이트처럼 '시기별로 다른 고민'을 먼저 보여준다 */
const LIFE_STAGES = [
  {
    Icon: Sun,
    title: "초경 이후 · 10~20대",
    desc: "생리통, 생리불순, 심한 생리전증후군. 처음부터 참는 것이 습관이 되면 원인을 놓치기 쉽습니다.",
  },
  {
    Icon: Baby,
    title: "임신 준비기",
    desc: "자연 임신 준비, 시술 전후 몸 만들기, 반복되는 유산 이후의 회복까지 시기에 맞춰 관리합니다.",
  },
  {
    Icon: HeartPulse,
    title: "출산 이후",
    desc: "산후풍, 부종, 수유기 체력 저하, 산후 우울감. 회복이 덜 된 채 지나가면 오래 남습니다.",
  },
  {
    Icon: Moon,
    title: "갱년기 전후",
    desc: "안면홍조, 발한, 불면, 감정 기복. 자연스러운 변화지만 삶의 질을 해칠 정도라면 관리 대상입니다.",
  },
];

/* 진료 항목 */
const CONDITIONS = [
  {
    Icon: Droplets,
    title: "월경 이상",
    desc: "생리통, 생리불순, 무월경, 생리전증후군, 부정출혈. 주기와 양상의 변화를 함께 살핍니다.",
  },
  {
    Icon: CalendarHeart,
    title: "임신 준비 · 난임",
    desc: "자연 임신 준비, 난임 시술 전후 컨디션 관리. 배란·자궁 내막 환경과 전신 순환을 함께 봅니다.",
  },
  {
    Icon: Heart,
    title: "유산 후 조리",
    desc: "계류유산·자연유산·인공유산 이후의 회복. 다음을 준비하기 전 몸을 정리하는 시기입니다.",
  },
  {
    Icon: Flame,
    title: "산전 · 산후 관리",
    desc: "입덧, 임신 중 요통, 산후풍, 산후 부종과 체력 저하, 수유기 관리까지 이어서 봅니다.",
  },
  {
    Icon: Thermometer,
    title: "갱년기 증상",
    desc: "안면홍조, 야간 발한, 불면, 관절통, 감정 기복 등 호르몬 변화에 따른 전신 증상을 다룹니다.",
  },
  {
    Icon: Sparkles,
    title: "여성 만성 불편",
    desc: "만성 골반 냉감, 잦은 방광 불편감, 피로와 어지럼 등 검사상 뚜렷하지 않은 불편감을 관리합니다.",
  },
];

/* 치료 방법 */
const TREATMENTS = [
  {
    Icon: Flame,
    title: "왕뜸 · 좌훈 케어",
    desc: "아랫배와 골반을 깊게 데워 순환을 돕습니다. 냉감과 함께 오는 생리통, 만성 골반 불편감에 활용합니다.",
  },
  {
    Icon: Leaf,
    title: "맞춤 한약",
    desc: "같은 생리통이어도 원인이 다릅니다. 체질과 주기별 상태에 맞춰 처방을 달리하고, 시기에 따라 조정합니다.",
  },
  {
    Icon: Waves,
    title: "침 · 약침 치료",
    desc: "자궁과 골반 주변 순환, 자율신경 균형을 조절합니다. 통증과 긴장이 심한 시기에 함께 진행합니다.",
  },
  {
    Icon: Activity,
    title: "추나 · 골반 정렬",
    desc: "출산이나 자세로 틀어진 골반 정렬을 교정합니다. 산후 요통과 골반 불편감 관리에 함께 씁니다.",
  },
  {
    Icon: ShieldCheck,
    title: "혈액검사 기반 확인",
    desc: "필요한 경우 혈액검사로 빈혈·염증·갑상선 등 전신 상태를 확인해 한약 처방의 근거로 삼습니다.",
  },
  {
    Icon: HeartPulse,
    title: "생활 관리 지도",
    desc: "수면, 식사, 스트레스, 운동은 호르몬 주기에 직접 영향을 줍니다. 진료와 함께 조정 방향을 안내합니다.",
  },
];

const STEPS = [
  { title: "상담 및 주기 확인", desc: "월경 주기와 양상, 임신·출산 이력, 복용 중인 약을 함께 확인합니다." },
  { title: "진찰 및 필요 검사", desc: "복진·맥진과 함께 필요 시 혈액검사로 전신 상태를 확인합니다." },
  { title: "시기에 맞춘 치료", desc: "주기와 목적(통증 완화·임신 준비·산후 회복)에 따라 치료 구성을 달리합니다." },
  { title: "경과 확인과 조정", desc: "다음 주기의 변화를 확인하며 처방과 치료 간격을 조정합니다." },
];

const REFER = [
  "생리량이 갑자기 크게 늘거나, 월경과 무관한 출혈이 반복되는 경우",
  "골반 통증이 심해지면서 발열이 동반되는 경우",
  "폐경 이후에 출혈이 있는 경우",
  "임신 중 출혈이나 복통이 있는 경우",
];

export default function WomenClinicPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          breadcrumb([
            { name: "진료과목", path: "/#services" },
            { name: "여성 클리닉", path: "/clinic/women" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "@id": `${SITE_URL}/clinic/women#page`,
            name: "여성 클리닉",
            description:
              "월경 이상, 임신 준비, 산후 관리, 갱년기 증상을 생애주기에 맞춰 관리하는 한의원 여성 클리닉입니다.",
            about: { "@type": "MedicalProcedure", name: "여성 클리닉" },
            provider: { "@id": CLINIC_ID },
          },
        ]}
      />

      <ClinicHeader title="여성 클리닉" />

      <ClinicIntro
        eyebrow="Women's Clinic"
        headline={
          <>
            시기마다 몸이 다르니
            <br className="md:hidden" /> <span className="text-[#8B1A2B]">관리도 달라야</span>
            합니다
          </>
        }
        lead="초경, 임신 준비, 출산과 회복, 갱년기까지 여성의 몸은 시기마다 다른 조건에 놓입니다. 같은 생리통이어도 20대와 40대의 원인이 다르고, 필요한 관리도 다릅니다. 지금 어느 시기에 있는지부터 확인하고 그에 맞춰 진료합니다."
      />

      <Section
        title="어느 시기에 계신가요"
        desc="시기에 따라 자주 마주치는 고민입니다. 해당하는 시기부터 확인해 보세요."
      >
        <CardGrid items={LIFE_STAGES} cols={2} />
      </Section>

      <Section
        title="이런 증상을 진료합니다"
        desc="검사에서 특별한 이상이 없다고 들으셨더라도, 불편함이 계속된다면 관리 대상입니다."
        tone="white"
      >
        <CardGrid items={CONDITIONS} />
      </Section>

      <Section
        title="이렇게 치료합니다"
        desc="증상만 눌러두기보다, 순환과 호르몬 주기의 흐름을 함께 조정하는 데 중점을 둡니다."
      >
        <FeatureList items={TREATMENTS} />
      </Section>

      <Section title="진료 절차" tone="white">
        <NumberedSteps steps={STEPS} />

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <NoticeBox
            title="내원 전 준비해 주세요"
            items={[
              "최근 몇 달간의 월경 시작일을 알고 오시면 도움이 됩니다. 주기 기록 앱 화면도 좋습니다.",
              "산부인과 초음파·혈액검사 결과지가 있다면 지참해 주세요.",
              "임신을 준비 중이시라면 시술 일정이 있는지 미리 알려주세요.",
              "복용 중인 호르몬제나 약이 있다면 함께 알려주세요.",
            ]}
          />
          <WarningBox
            title="이런 경우에는 산부인과 진료를 먼저 받으세요"
            items={REFER}
          />
        </div>

        <div className="mt-10">
          <ClinicCTA />
        </div>
      </Section>

      <OtherClinics currentSlug="women" />

      <ClinicDisclaimer>
        치료 반응과 회복 기간은 개인의 상태에 따라 다르며 특정한 결과를 보장하지 않습니다. 한의 진료는
        산부인과 진단과 치료를 대신하지 않으며, 기질적 질환이 의심되는 경우 관련 전문 진료를 함께 권해
        드립니다.
      </ClinicDisclaimer>
    </div>
  );
}
