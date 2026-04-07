import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, ChevronLeft } from "lucide-react";

const DOCTORS = [
  {
    slug: "kim",
    file: "doctork",
    name: "김현규",
    title: "대표원장",
    subtitle: "몸과 마음의 균형을 돌보는 한의학적 가치",
    tags: ["초음파 진단", "통증 치료", "혈액검사 기반 한약"],
    bio: [
      "안녕하세요, 장위365경희한의원 대표원장 김현규입니다. 저희 한의원을 믿고 찾아주신 모든 분께 깊은 감사의 마음을 전합니다.",
      "건강은 삶의 가장 기본이자 무엇과도 바꿀 수 없는 소중한 자산입니다. 우리 몸과 마음은 늘 긴밀하게 연결되어 있으며, 이 두 가지가 균형을 이룰 때 비로소 편안하고 건강한 일상을 누릴 수 있습니다. 장위365경희한의원은 이러한 원리를 중심에 두고, 한의학이 지닌 깊은 지혜와 현대의학적 진단 기술을 조화롭게 융합해 환자 한 분 한 분께 최적의 치료를 제공하고자 합니다.",
      "특히 초음파를 활용한 정밀 진단 및 통증 치료, 그리고 혈액검사 기반의 맞춤 한약 치료를 통해 환자분의 상태를 보다 객관적이고 정확하게 파악하고 있습니다. 이와 같은 체계적인 접근은 단순 '시술'이 아닌, 환자 개인의 몸 상태와 생활 패턴을 고려한 종합적인 '치료 전략'을 세우는 데 큰 도움이 됩니다.",
      "현재까지 10,000명 이상의 환자분들이 저희 한의원을 찾아주셨고, 그중 약 78%가 절반 이상의 증상 호전을 경험하셨습니다. 이는 저희 의료진의 노력이 아니라, 환자분들이 적극적으로 치료에 함께해 주신 결과이기에 더욱 의미가 깊습니다.",
      "저희의 목표는 단순히 통증을 줄이고 증상을 완화하는 데 그치지 않습니다. \"건강한 상태를 오래 유지할 수 있도록 돕는 것\"이 저희가 가장 소중히 여기는 가치입니다. 한 순간의 호전이 아닌, 환자분의 삶 전체가 더 편안하고 활력 있게 변화할 수 있도록 항상 최선의 진료와 따뜻한 소통을 이어가겠습니다.",
    ],
  },
  {
    slug: "ahn",
    file: "doctora",
    name: "안익균",
    title: "원장",
    subtitle: "환자분께 도움을 되돌려드리는 진료의 마음",
    tags: ["통증 치료", "비염", "체형 교정"],
    bio: [
      "안녕하세요. 장위365경희한의원 원장 안익균입니다.",
      "저는 어린 시절부터 잦은 허리 통증과 비염으로 일상에 불편함을 겪어 왔습니다. 그때마다 한의원 치료는 제게 큰 도움을 주었고, 이 경험은 자연스럽게 한의학에 대한 관심과 신뢰로 이어졌습니다. 지금은 그때 받았던 도움을 환자분들께 되돌려드리는 마음으로, 한 분 한 분의 일상 회복을 위해 진료하고 있습니다.",
      "통증은 눈에 보이는 증상만으로 설명되지 않는 경우가 많습니다. 오랜 시간 반복된 자세, 생활 습관, 신체 균형의 붕괴가 함께 얽혀 증상을 만들어내는 경우가 많습니다. 그렇기 때문에 통증 치료는 단순히 아픈 부위를 자극하거나 일시적인 완화를 목표로 해서는 안 됩니다. 통증이 발생한 근본적인 구조적·기능적 문제를 파악하고, 그 원인을 바로잡는 과정을 함께 만들어가는 것이 중요합니다.",
      "같은 진단명을 듣고 내원하시더라도, 통증의 양상과 불편한 정도는 각자의 삶 속에서 다른 모습으로 나타납니다. 그래서 진료실에서 환자분을 마주할 때 저는 먼저 '이분의 몸이 어떤 여정을 지나 지금에 이르렀는가'를 듣는 데 집중합니다.",
      "앞으로도 환자분들이 자신의 몸 상태를 스스로 이해하고, 통증을 줄이는 단계를 넘어 \"다시 아프지 않은 상태\"를 만드는 데 도움을 드리는 것을 목표로 진료하겠습니다.",
    ],
  },
  {
    slug: "park",
    file: "doctorp",
    name: "박종성",
    title: "원장",
    subtitle: "환자의 건강 회복을 함께하는 든든한 동반자",
    tags: ["종합적 치료", "생활습관 관리", "한약·추나·약침"],
    bio: [
      "안녕하세요. 장위365경희한의원 박종성 원장입니다.",
      "진심을 담은 경청과 따뜻한 소통, 질병뿐만 아니라 몸과 삶 전체를 아우르는 치유, 최선의 진료를 바탕으로 환자분들의 건강 회복 여정에 든든한 동반자가 되겠습니다.",
      "일상에서 겪는 크고 작은 통증과 불편함, 고단함과 답답함까지 우리의 몸은 우리에게 항상 메시지를 전달하고 있습니다. 바쁜 일상 속에서 지나치기 쉬운 작은 신호까지 놓치지 않도록 환자분의 말씀에 귀기울여 듣고 세심하게 소통합니다.",
      "환자분들이 겪는 불편함은 대부분 생활습관, 환경, 스트레스, 식습관, 정서적인 상태 등 다양한 구조적·기능적 요인들이 복합적으로 작용한 결과입니다. 이러한 복합적인 요인들을 한의학적 관점에서 면밀히 분석하고, 단순히 증상만을 완화시키는 것이 아닌 인체의 균형을 회복하여 근본적인 치유를 이끌어내는 종합적인 치료를 제공하겠습니다.",
      "환자분이 치료를 통해 건강을 회복하고 활력을 되찾는 순간이 제게 가장 큰 보람과 기쁨입니다. 올바른 방향으로 나아가실 수 있도록 든든히 지원하는 동반자가 되겠습니다.",
    ],
  },
  {
    slug: "shin",
    file: "doctors",
    name: "신지훈",
    title: "원장",
    subtitle: "재활 경험을 통해 다져진 스포츠 통증 전문성",
    tags: ["스포츠 손상", "근골격계 통증", "재활 치료"],
    bio: [
      "안녕하세요. 장위365경희한의원 신지훈 원장입니다.",
      "어릴 때 저는 참 작고 말도 없던 아이였습니다. 부모님이 지어주신 한약을 먹으며 밥맛이 돌아오고 키도 쑥쑥 자라는 경험을 했습니다. '몸이 좋아지는 경험'을 스스로 겪고 나니 자연스레 한의학이라는 길에 마음이 갔습니다.",
      "운동은 제 평생 취미이자 삶의 한 부분입니다. 공보의 시절 보디빌딩 대회에도 출전할 만큼 진심을 다해 운동했습니다. 하지만 그만큼 잔부상도 많았습니다. 허리, 어깨, 손목은 물론이고 결국엔 아킬레스건이 끊어지는 큰 부상도 겪었습니다. 몇 달 동안 목발을 짚고 재활치료를 받으며 '아픈 사람이 하루를 버틴다는 게 얼마나 지치는 일인지' 뼈저리게 느꼈습니다.",
      "재활하는 동안 스포츠손상학·근골격계 통증에 더 깊게 빠져들었고, 누군가의 통증을 정확히 이해하고 해결해주는 한의사가 되고 싶다는 마음이 더욱 단단해졌습니다.",
      "저는 아픈 환자분들의 마음을 누구보다 잘 압니다. 통증이 있으면 일상이 무너지고, 운동은 물론 걷는 것조차 힘들어집니다. 그래서 저는 진료실에 오신 분들께 \"전문성\"과 \"진심\"을 동시에 드리고 싶습니다. 아플 때 가장 먼저 떠올릴 수 있는 사람, 믿고 몸을 맡길 수 있는 한의사가 되겠습니다.",
    ],
  },
];

export function generateStaticParams() {
  return DOCTORS.map((d) => ({ slug: d.slug }));
}

export default async function DoctorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doctor = DOCTORS.find((d) => d.slug === slug);
  if (!doctor) notFound();

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif" }}>
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#8B1A2B] transition-colors text-sm font-medium">
            <ChevronLeft size={16} /> 홈으로
          </Link>
          <Link href="/">
            <Image src="/images/logo.png" alt="장위365경희한의원" width={120} height={40} className="object-contain h-10 w-auto" />
          </Link>
          <a href="https://m.booking.naver.com/booking/13/bizes/567280?theme=place&service-target=map-pc&lang=ko&area=bmp&map-search=1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#03C75A] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#02b350] transition-colors">
            <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-[#03C75A] rounded-sm text-xs font-black leading-none">N</span> 네이버 예약
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* 프로필 상단 */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 shadow-md">
            <Image
              src={`/images/${doctor.file}.png`}
              alt={doctor.name}
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          <div>
            <span className="text-xs tracking-[0.2em] text-[#8B1A2B] font-semibold uppercase">Medical Team</span>
            <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-1">{doctor.name}</h1>
            <p className="text-[#8B1A2B] font-semibold mb-4">{doctor.title}</p>
            <p className="text-xl text-gray-700 font-medium leading-snug mb-6 border-l-4 border-[#8B1A2B] pl-4">
              {doctor.subtitle}
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {doctor.tags.map((tag) => (
                <span key={tag} className="bg-[#fdf3f4] text-[#8B1A2B] text-sm font-medium px-4 py-1.5 rounded-full border border-[#f5e0e3]">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              <a href="https://m.booking.naver.com/booking/13/bizes/567280?theme=place&service-target=map-pc&lang=ko&area=bmp&map-search=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#03C75A] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#02b350] transition-colors shadow-sm">
                <span className="inline-flex items-center justify-center w-4 h-4 bg-white text-[#03C75A] rounded-sm text-xs font-black leading-none">N</span> 네이버 예약하기
              </a>
              <a href="tel:02-6952-2800" className="inline-flex items-center gap-2 bg-[#8B1A2B] text-white font-bold px-8 py-3.5 rounded-full hover:bg-[#6e1522] transition-colors shadow-sm">
                <Phone size={15} /> 02-6952-2800
              </a>
            </div>
          </div>
        </div>

        {/* 인사말 */}
        <div className="bg-gray-50 rounded-3xl p-10 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-[#8B1A2B] rounded-full inline-block" />
            원장 인사말
          </h2>
          {doctor.bio.map((para, i) => (
            <p key={i} className="text-gray-600 leading-relaxed text-[15px]">{para}</p>
          ))}
        </div>

        {/* 다른 의료진 */}
        <div className="mt-16">
          <h2 className="text-lg font-bold text-gray-900 mb-6">다른 의료진 보기</h2>
          <div className="flex flex-wrap gap-3">
            {DOCTORS.filter((d) => d.slug !== doctor.slug).map((d) => (
              <Link
                key={d.slug}
                href={`/doctors/${d.slug}`}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:border-[#8B1A2B] hover:shadow-sm transition-all"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  <Image src={`/images/${d.file}.png`} alt={d.name} fill className="object-cover object-top" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{d.name}</p>
                  <p className="text-xs text-[#8B1A2B]">{d.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-500 py-8 px-6 mt-16">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p className="text-white font-bold mb-1">장위365경희한의원</p>
          <p>서울 성북구 장월로38길 4 타워39 3층 · 02-6952-2800</p>
          <p className="mt-1 text-xs">© 2026 장위365경희한의원. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
