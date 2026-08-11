/**
 * 커뮤니티 상담문의 더미 데이터 생성기.
 *
 *   node tools/seed-community.mjs          # 미리보기(DB 안 건드림)
 *   node tools/seed-community.mjs --write  # 실제 삽입
 *   node tools/seed-community.mjs --clean  # 시드 데이터만 삭제
 *
 * 원칙
 *  - **상담문의(inquiry)만** 만든다. 상담문의는 비공개 1:1이라 작성자 본인과 관리자만 본다.
 *    공개 게시판인 병원후기(review)는 만들지 않는다 — 지어낸 환자 후기를 공개하면
 *    의료법 제56조(허위·과장 의료광고)에 걸리고, 다른 플랫폼(네이버·카카오·구글) 후기를
 *    옮겨오는 것은 실제 작성자의 글을 남의 이름으로 올리는 셈이 된다.
 *  - 이 한의원은 성장호르몬 주사를 하지 않는다. '주사'라는 표현을 쓰지 않고 한약·침·추나로만 쓴다.
 *  - 지어낸 글이라도 효과를 단정하는 표현은 넣지 않는다(관리자 화면 '표현 주의' 배지 기준).
 *  - 제목과 본문은 반드시 같은 주제(TOPIC)에서 뽑는다. 따로 뽑으면 초1 아이에게 초경 이야기가
 *    붙는 식으로 말이 안 맞는 글이 나온다.
 *
 * 되돌리기: 시드 회원은 provider_uid_hash 가 'seed-' 로 시작한다.
 *   DELETE FROM community_users WHERE provider_uid_hash LIKE 'seed-%';
 *   (community_posts / community_replies 는 ON DELETE CASCADE 로 같이 지워진다)
 */

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

/* ── 환경 ───────────────────────────────────────────────── */

function loadEnv() {
  try {
    const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const i = line.indexOf("=");
      if (i < 1 || line.trimStart().startsWith("#")) continue;
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim().replace(/^"|"$/g, "");
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {
    /* .env.local 이 없으면 실제 환경변수를 쓴다 */
  }
}
loadEnv();

const CONN = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
if (!CONN) {
  console.error("DATABASE_URL 이 없습니다. `npx vercel env pull .env.local` 로 받아오세요.");
  process.exit(1);
}
const sql = neon(CONN);

/* ── 재현 가능한 난수 ────────────────────────────────────── */

let _s = 20220103;
const rnd = () => {
  _s |= 0;
  _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (min, max) => min + Math.floor(rnd() * (max - min + 1));
const chance = (p) => rnd() < p;

/* ── 회원 닉네임 ────────────────────────────────────────── */

const NICK_A = [
  "봄이", "하율", "서준", "다인", "은결", "지호", "예린", "수아", "시우", "채원",
  "도윤", "가온", "라온", "윤슬", "여름", "겨울", "소리", "미소", "달래", "보라",
  "초코", "구름", "바다", "노을", "새봄", "한결", "이레", "온유", "루하", "제이",
];
const NICK_B = ["맘", "엄마", "아빠", "이네", "마미", "대디", "님"];
const NICK_PLAIN = [
  "장위동주민", "돌곶이역앞", "석관동맘", "월곡동사는사람", "성북구민", "장위뉴타운",
  "우리아이키크자", "키크는중", "성장맘", "두아이맘", "세아이맘", "워킹맘",
  "허리아파요", "목디스크탈출", "다이어터", "건강챙기자", "비염탈출", "코숨쉬자",
  "요가하는맘", "등산조아", "야근러", "새벽러", "직장인A", "프리랜서B",
];

function makeNicknames(n) {
  const out = new Set();
  while (out.size < n) {
    if (chance(0.45)) out.add(pick(NICK_PLAIN) + (chance(0.4) ? String(int(1, 99)) : ""));
    else out.add(pick(NICK_A) + pick(NICK_B));
  }
  return [...out];
}

/* ── 아이 정보 ──────────────────────────────────────────────
   base = 해당 학년 또래 평균 키(대략). 문의 글이니 평균보다 5~12cm 작게 잡는다.
   girl 은 초경 관련 주제에서만 걸러 쓴다.                          */

const KIDS = [
  { label: "6살 여아", base: 115, girl: true },
  { label: "7살 남아", base: 122, girl: false },
  { label: "예비 초1 아이", base: 121, girl: null },
  { label: "초1 남아", base: 124, girl: false },
  { label: "초2 여아", base: 128, girl: true },
  { label: "초2 남아", base: 129, girl: false },
  { label: "초3 남아", base: 134, girl: false },
  { label: "초3 여아", base: 134, girl: true },
  { label: "초4 남아", base: 140, girl: false },
  { label: "초4 여아", base: 140, girl: true },
  { label: "초5 여아", base: 147, girl: true },
  { label: "초5 남아", base: 146, girl: false },
  { label: "초6 남아", base: 152, girl: false },
  { label: "초6 여아", base: 152, girl: true },
  { label: "중1 남아", base: 159, girl: false },
  { label: "중1 여아", base: 156, girl: true },
  { label: "중2 남아", base: 165, girl: false },
  { label: "중2 여아", base: 158, girl: true },
  { label: "중3 남아", base: 170, girl: false },
  { label: "10살 딸", base: 138, girl: true },
  { label: "11살 딸", base: 144, girl: true },
  { label: "12살 아들", base: 149, girl: false },
];

const GIRLS = KIDS.filter((k) => k.girl && k.base >= 140); // 초경 이야기가 어색하지 않은 나이

function kidCtx(pool = KIDS) {
  const k = pick(pool);
  return { kid: k.label, h: k.base - int(5, 12), grew: int(2, 5) };
}

/* ── 주제 ───────────────────────────────────────────────────
   제목과 본문을 같은 주제 안에서만 뽑는다. ctx 는 주제별로 만들어 둘 다에 넘긴다. */

const TOPICS = [
  /* ── 성장 (합계 45%) ─────────────────────────────── */
  {
    cat: "growth", weight: 9, ctx: () => kidCtx(),
    titles: [
      (c) => `${c.kid} ${c.h}cm인데 많이 작은 편일까요?`,
      (c) => `${c.kid} 또래보다 작아서 걱정입니다`,
      (c) => `${c.kid} 반에서 제일 앞에 서요`,
      (c) => `${c.kid}인데 1년에 ${c.grew}cm밖에 안 컸어요`,
      (c) => `${c.kid} 키 때문에 상담받고 싶습니다`,
    ],
    bodies: [
      (c) => `${c.kid}이고 키가 ${c.h}cm입니다. 반에서 앞에서 두세 번째고 작년보다 ${c.grew}cm 정도밖에 안 자랐습니다. 지금 상태가 어느 정도인지 확인부터 하고 싶어 문의드립니다.`,
      (c) => `${c.kid} 키우고 있는데 또래 아이들과 세워 보면 차이가 확실히 납니다. 현재 ${c.h}cm입니다. 검사부터 받아보는 게 좋을지, 바로 상담을 가는 게 나을지 알려주세요.`,
      (c) => `${c.kid}입니다. 작년 신체검사 때보다 ${c.grew}cm 자랐는데 주변에서는 적게 큰 거라고 합니다. 이런 경우에도 도움받을 수 있는지 궁금합니다.`,
    ],
  },
  {
    cat: "growth", weight: 5, ctx: () => kidCtx(GIRLS),
    titles: [
      () => `초경 시작하면 이제 그만 크는 건가요ㅠㅠ`,
      (c) => `${c.kid} 초경했는데 더 클 수 있을까요`,
      () => `초경이 빨리 온 편인데 괜찮을까요?`,
      (c) => `${c.kid}인데 가슴이 나오기 시작했어요`,
    ],
    bodies: [
      (c) => `${c.kid}이고 얼마 전 초경을 시작했습니다. 초경 후에는 많이 못 큰다는 얘기를 들어 마음이 급해졌습니다. 지금 시작해도 늦지 않은지 여쭤봅니다.`,
      (c) => `${c.kid}인데 또래보다 2차 성징이 빨리 온 것 같습니다. 현재 ${c.h}cm입니다. 이런 경우 무엇부터 확인해야 하는지 알고 싶습니다.`,
    ],
  },
  {
    cat: "growth", weight: 6, ctx: () => kidCtx(),
    titles: [
      () => `밥을 너무 안 먹는데 그래서 안 크는 걸까요`,
      (c) => `${c.kid} 편식이 너무 심합니다`,
      (c) => `${c.kid} 소화가 안 된다는 말을 자주 해요`,
      () => `입이 짧은 아이도 한약으로 도움될까요`,
    ],
    bodies: [
      (c) => `${c.kid}인데 한 끼에 반 공기도 겨우 먹습니다. 고기나 채소는 거의 손도 안 대고요. 잘 안 먹어서 안 크는 건지, 소화 쪽부터 봐야 하는지 궁금합니다.`,
      (c) => `${c.kid}입니다. 밥을 먹다가도 배가 아프다는 말을 자주 합니다. 먹는 양이 적으니 키도 영향이 있을 것 같아 상담을 받아보고 싶습니다.`,
    ],
  },
  {
    cat: "growth", weight: 5, ctx: () => kidCtx(),
    titles: [
      (c) => `${c.kid} 성장판 검사만 먼저 받아볼 수 있을까요`,
      () => `성장판 검사는 어떻게 진행되나요?`,
      () => `학교 신체검사 결과지 들고 가도 되나요`,
      () => `성장 상담은 아이도 꼭 같이 가야 하나요?`,
    ],
    bodies: [
      (c) => `${c.kid} 성장판 검사만 먼저 받아보고 결과에 따라 치료를 결정하고 싶습니다. 검사만 따로 가능한지, 비용은 어느 정도인지 알려주세요.`,
      () => `학교 신체검사 결과지를 가지고 있습니다. 가져가면 상담에 도움이 될까요? 아이 없이 부모만 먼저 가서 상담받아도 되는지도 알고 싶습니다.`,
      (c) => `${c.kid} 데리고 가려는데 아이가 검사를 무서워합니다. 어떤 순서로 진행되는지 미리 알고 가면 좋을 것 같아 문의드립니다.`,
    ],
  },
  {
    cat: "growth", weight: 4, ctx: () => kidCtx(),
    titles: [
      () => `한약 복용 기간은 보통 어느 정도인가요`,
      () => `성장 한약 먹으면 살이 찌지는 않나요?`,
      () => `아이가 한약을 잘 못 먹는데 방법이 있을까요`,
      () => `성장 치료 기간이랑 비용 문의드립니다`,
    ],
    bodies: [
      (c) => `${c.kid} 한약을 고민 중입니다. 보통 얼마 동안 먹이고 중간에 다시 내원해야 하는지, 비용은 어떻게 되는지 알고 싶습니다.`,
      (c) => `${c.kid}이고 지금도 통통한 편입니다. 한약을 먹으면 살이 같이 찐다는 얘기를 들어 망설이고 있는데 괜찮을까요?`,
      () => `아이가 쓴 걸 정말 못 먹습니다. 아이들도 먹기 편한 형태가 있는지 여쭤보고 싶습니다.`,
    ],
  },
  {
    cat: "growth", weight: 4, ctx: () => kidCtx(),
    titles: [
      () => `아이가 밤마다 다리가 아프다고 해요`,
      () => `학원 때문에 12시 넘어 자는데 괜찮을까요`,
      (c) => `${c.kid} 자세가 많이 굽었는데 키에 영향이 있을까요`,
    ],
    bodies: [
      (c) => `${c.kid}인데 밤에 다리가 아프다고 자주 깹니다. 성장통이라고들 하지만 매일 그러니 걱정이 되어 문의드립니다.`,
      (c) => `${c.kid}이고 학원 때문에 12시가 넘어 잡니다. 수면이 중요하다는데 생활 습관부터 어떻게 잡아야 할지 조언 부탁드립니다.`,
      (c) => `${c.kid}인데 앉는 자세가 많이 굽었습니다. 자세가 키에도 영향이 있는지, 같이 봐주시는지 궁금합니다.`,
    ],
  },
  {
    cat: "growth", weight: 4, ctx: () => kidCtx(),
    titles: [
      () => `형제인데 동생만 유독 작습니다`,
      () => `부모가 둘 다 작은데 아이도 작을 수밖에 없나요`,
      () => `우유랑 영양제는 챙겨 먹이는데 변화가 없어요`,
      (c) => `${c.kid} 몸무게만 늘고 키는 그대로입니다`,
    ],
    bodies: [
      (c) => `첫째는 큰 편인데 ${c.kid}인 둘째만 유독 작습니다. 같은 걸 먹여도 차이가 나니 체질 문제인가 싶어 상담을 받아보려 합니다.`,
      (c) => `저희 부부가 둘 다 키가 크지 않습니다. ${c.kid}이고 현재 ${c.h}cm인데, 유전이라 어쩔 수 없다는 말을 많이 들어 그래도 한 번 상담받아 보고 싶습니다.`,
      (c) => `${c.kid}인데 우유랑 영양제는 계속 챙겨 먹이고 있습니다. 그런데 눈에 띄는 변화가 없어서 다른 방법이 있는지 알고 싶습니다.`,
      (c) => `${c.kid}입니다. 몸무게만 늘고 키는 거의 그대로여서 걱정입니다. 무엇부터 해야 할지 방향이라도 잡고 싶습니다.`,
    ],
  },
  {
    cat: "growth", weight: 3, ctx: () => kidCtx(),
    titles: [
      (c) => `${c.kid} 비염이랑 성장 같이 봐주실 수 있나요`,
      () => `방학 동안 집중해서 관리할 수 있을까요`,
      () => `키 성장 상담 예약은 어떻게 하나요?`,
      () => `성장 한약은 몇 살부터 먹일 수 있나요?`,
    ],
    bodies: [
      (c) => `${c.kid}인데 비염이 심해 코를 막고 잡니다. 잠을 깊게 못 자니 키에도 영향이 있을까 싶어서요. 비염과 성장을 같이 봐주시는지 궁금합니다.`,
      (c) => `${c.kid} 방학에 맞춰 집중적으로 관리해 보고 싶습니다. 방학 중에 시작하면 어떤 순서로 진행되는지 알려주세요.`,
      () => `성장 상담 예약은 전화로만 되는지, 평일 저녁이나 주말에도 가능한지 문의드립니다.`,
      (c) => `${c.kid}인데 아직 이른 나이인가 싶어 여쭤봅니다. 보통 몇 살부터 상담을 받는 것이 좋을까요?`,
    ],
  },

  /* ── 통증·척추 (12%) ─────────────────────────────── */
  {
    cat: "pain", weight: 5, ctx: () => ({ m: int(2, 8) }),
    titles: [
      () => `허리디스크 진단받았는데 한방치료 가능할까요`,
      () => `앉아 있으면 다리가 저린데 협착증일까요?`,
      () => `허리 통증 때문에 밤에 잠을 못 잡니다`,
      () => `MRI 찍은 결과지 가져가도 되나요`,
    ],
    bodies: [
      (c) => `${c.m}개월 전부터 허리가 아팠는데 최근에는 다리까지 저립니다. 정형외과에서 디스크 소견을 들었고 수술은 아직 아니라고 합니다. 한방치료로 관리가 가능한 단계인지 궁금합니다.`,
      (c) => `${c.m}개월째 허리가 아픕니다. 오래 앉아 있으면 종아리가 저려서 중간중간 일어나야 합니다. 검사부터 받아야 할지 문의드립니다.`,
      () => `MRI 영상 CD와 판독지를 가지고 있습니다. 가져가면 진료에 도움이 될지, 초음파 검사도 따로 하는지 궁금합니다.`,
    ],
  },
  {
    cat: "pain", weight: 4, ctx: () => ({}),
    titles: [
      () => `목이랑 어깨가 너무 뭉쳐서 두통까지 옵니다`,
      () => `무릎이 계단 내려갈 때 시큰합니다`,
      () => `운동하다 삐끗했는데 지금 가도 될까요`,
    ],
    bodies: [
      () => `사무직이라 하루 종일 앉아 있습니다. 목과 어깨가 늘 뭉쳐 있고 오후가 되면 두통까지 옵니다. 침과 추나를 같이 받으면 좋을지 문의드립니다.`,
      () => `계단을 내려갈 때 무릎이 시큰거립니다. 운동을 줄여야 하는지, 치료를 받으면서 해도 되는지 알고 싶습니다.`,
      () => `주말에 운동하다 허리를 삐끗했습니다. 지금 바로 가도 진료가 되는지, 예약이 필요한지 여쭤봅니다.`,
    ],
  },
  {
    cat: "pain", weight: 3, ctx: () => ({}),
    titles: [
      () => `추나 치료는 보험이 되나요?`,
      () => `약침 치료는 몇 번 정도 받아야 하나요`,
      () => `주말에도 진료하시나요? 평일에 시간이 안 나서요`,
    ],
    bodies: [
      () => `추나와 약침이 건강보험 적용이 되는지, 한 번 받을 때 비용이 어느 정도인지 알고 싶습니다.`,
      () => `치료를 몇 번 정도, 얼마 간격으로 받아야 하는지 대략이라도 알고 싶습니다. 직장 때문에 자주 오기가 어려워서요.`,
      () => `주중에는 퇴근이 늦어 평일 야간이나 주말 진료가 가능한지 여쭤봅니다. 초진은 시간이 얼마나 걸릴까요?`,
    ],
  },

  /* ── 다이어트 (10%) ──────────────────────────────── */
  {
    cat: "diet", weight: 5, ctx: () => ({ age: pick([20, 30, 40, 50]), kg: int(8, 15) }),
    titles: [
      () => `다이어트 한약 상담받고 싶습니다`,
      (c) => `출산 후 ${c.kg}kg이 안 빠져요`,
      () => `요요가 너무 심한데 체질 문제일까요`,
      () => `다이어트 프로그램 기간이랑 비용 문의`,
    ],
    bodies: [
      (c) => `${c.age}대이고 몇 년째 찌고 빠지고를 반복합니다. 이번에는 제대로 관리해 보고 싶어 상담을 신청합니다. 프로그램이 보통 몇 개월인지 알고 싶습니다.`,
      (c) => `출산한 지 ${int(6, 24)}개월 됐는데 ${c.kg}kg 정도가 그대로입니다. 수유는 끝났습니다. 지금 시작해도 되는 시기인지 궁금합니다.`,
      (c) => `${c.age}대인데 빼면 다시 찌기를 반복합니다. 체질 자체를 같이 봐주시는지 문의드립니다.`,
    ],
  },
  {
    cat: "diet", weight: 5, ctx: () => ({ n: int(2, 5) }),
    titles: [
      () => `한약 먹으면서 운동 병행해도 되나요?`,
      () => `식욕이 너무 강해서 저녁에 폭식합니다`,
      () => `약 먹으면 잠이 안 온다던데 괜찮나요`,
      () => `체성분 검사도 같이 하나요?`,
    ],
    bodies: [
      (c) => `운동을 주 ${c.n}회 하고 있습니다. 한약을 먹으면서 운동을 계속해도 되는지, 식단은 따로 받는지 문의드립니다.`,
      () => `낮에는 잘 지키는데 저녁만 되면 식욕을 참기가 어렵습니다. 밤에 무너지는 편이라 이 부분부터 상담받고 싶습니다.`,
      () => `다이어트 한약을 먹으면 잠이 잘 안 온다는 얘기를 들었습니다. 원래 잠이 얕은 편인데 괜찮을지 걱정됩니다.`,
      () => `체성분 검사도 같이 하는지, 중간에 다시 측정해서 비교해 주시는지 궁금합니다.`,
    ],
  },

  /* ── 여성 (8%) ───────────────────────────────────── */
  {
    cat: "women", weight: 4, ctx: () => ({ d1: int(24, 45), m: int(4, 18) }),
    titles: [
      () => `생리통이 매달 너무 심합니다`,
      (c) => `생리 주기가 ${c.d1}일까지 들쭉날쭉해요`,
      () => `임신 준비 중인데 한약 도움될까요`,
    ],
    bodies: [
      () => `매달 첫날은 진통제 없이 못 지냅니다. 검사에서는 특별한 이상이 없다고 하는데 이런 경우에도 한방치료가 도움이 될지 궁금합니다.`,
      (c) => `주기가 ${c.d1}일까지 벌어질 때가 있어 매번 예측이 안 됩니다. 스트레스 때문인지 체질 문제인지 확인하고 싶어 문의드립니다.`,
      (c) => `임신을 준비한 지 ${c.m}개월 됐습니다. 몸 상태를 먼저 챙기고 싶은데 어떤 것부터 봐주시는지 알고 싶습니다.`,
    ],
  },
  {
    cat: "women", weight: 4, ctx: () => ({}),
    titles: [
      () => `왕뜸 치료는 어떤 건가요?`,
      () => `산후에 손목이랑 발목이 계속 시립니다`,
      () => `갱년기 증상으로 상담 가능한가요`,
    ],
    bodies: [
      () => `왕뜸이라는 치료를 보고 문의드립니다. 어떤 경우에 받는 치료인지, 한 번에 시간이 얼마나 걸리는지 궁금합니다.`,
      () => `출산 후부터 손목과 발목이 시리고 아픕니다. 아이가 어려서 오래 있기는 어려운데 치료 시간이 얼마나 걸리는지 궁금합니다.`,
      () => `요즘 얼굴로 열이 오르고 밤에 자주 깹니다. 나이 때문인 것 같은데 상담이 가능한지 여쭤봅니다.`,
    ],
  },

  /* ── 비염 (7%) ───────────────────────────────────── */
  {
    cat: "rhinitis", weight: 7, ctx: () => kidCtx(),
    titles: [
      () => `아이 비염이 환절기마다 심해집니다`,
      () => `코막힘 때문에 입으로 자고 있어요`,
      () => `축농증까지 왔다는데 한방으로 되나요`,
      () => `비염 치료 기간이 궁금합니다`,
      () => `성인 비염도 봐주시나요?`,
    ],
    bodies: [
      (c) => `${c.kid}인데 환절기마다 콧물과 재채기가 심해집니다. 약을 먹으면 잠깐 괜찮다가 다시 반복이라 근본적으로 관리해 보고 싶습니다.`,
      (c) => `${c.kid}가 코가 막혀 입을 벌리고 잡니다. 잠을 설치니 낮에도 피곤해합니다. 몇 살부터 치료가 가능한지 알려주세요.`,
      () => `이비인후과에서 축농증 소견을 들었습니다. 항생제를 여러 번 먹었는데도 반복돼서 다른 방법을 찾고 있습니다.`,
      () => `성인인데 1년 내내 코가 막혀 있습니다. 치료를 시작하면 보통 얼마나 다녀야 하는지 궁금합니다.`,
    ],
  },

  /* ── 소화 (6%) ───────────────────────────────────── */
  {
    cat: "digestion", weight: 6, ctx: () => kidCtx(),
    titles: [
      () => `늘 더부룩하고 소화가 안 됩니다`,
      () => `내시경은 정상인데 계속 속이 불편해요`,
      () => `스트레스만 받으면 체합니다`,
      () => `아이가 아침마다 배가 아프다고 해요`,
    ],
    bodies: [
      () => `몇 달째 명치가 답답하고 식후에 더부룩합니다. 내시경에서는 이상이 없다고 하는데 계속 불편해서 문의드립니다.`,
      () => `긴장하거나 스트레스를 받으면 바로 체합니다. 체질적인 문제인지 상담받고 싶습니다.`,
      (c) => `${c.kid}인데 아침마다 배가 아프다고 합니다. 학교 가기 싫어서 그런 건지 정말 아픈 건지 판단이 어렵습니다.`,
    ],
  },

  /* ── 피로·항노화 (5%) ────────────────────────────── */
  {
    cat: "fatigue", weight: 5, ctx: () => ({ age: pick([30, 40, 50, 60]) }),
    titles: [
      () => `자도 자도 피곤합니다`,
      () => `기력 보충 한약 상담드려요`,
      () => `건강검진은 정상인데 늘 지쳐 있어요`,
      () => `수험생 아이 체력 관리 문의`,
    ],
    bodies: [
      () => `일이 바쁜 시기이긴 한데 몇 달째 아침에 일어나기가 힘듭니다. 검진에서는 특별한 게 없다고 나왔습니다.`,
      (c) => `${c.age}대이고 최근 들어 쉽게 지칩니다. 체력 관리 목적으로 상담을 받아보고 싶습니다.`,
      () => `고등학생 아이가 늘 피곤해합니다. 공부에 지장이 없도록 체력을 챙겨주고 싶어 문의드립니다.`,
    ],
  },

  /* ── 안면마비·중풍 (4%) ──────────────────────────── */
  {
    cat: "facial", weight: 4, ctx: () => ({ d: int(3, 20) }),
    titles: [
      () => `구안와사가 왔는데 언제부터 치료하나요`,
      (c) => `안면마비 ${c.d}일째입니다`,
      () => `중풍 후유증 재활도 봐주시나요`,
      () => `눈이 잘 안 감기는데 진료 가능할까요`,
    ],
    bodies: [
      (c) => `${c.d}일 전 아침에 갑자기 한쪽 얼굴이 굳었습니다. 병원에서 약을 받아 먹고 있는데 침 치료를 같이 받는 게 좋다고 들었습니다. 언제부터 받는 게 좋을까요?`,
      () => `가족이 중풍 이후 재활 중입니다. 거동이 불편한데 방문진료도 하시는지 함께 여쭤봅니다.`,
      (c) => `${c.d}일째 한쪽 눈이 잘 안 감기고 물을 마시면 샙니다. 지금이라도 치료를 시작하는 게 나을지 문의드립니다.`,
    ],
  },

  /* ── 기타 (3%) ───────────────────────────────────── */
  {
    cat: "etc", weight: 3, ctx: () => ({}),
    titles: [
      () => `방문진료도 되나요? 거동이 불편한 어른이 계셔서요`,
      () => `주차 가능한가요?`,
      () => `공휴일에도 진료하시나요`,
      () => `첩약 건강보험 적용되는 항목이 뭔가요`,
      () => `초진 예약 없이 가도 되나요?`,
    ],
    bodies: [
      () => `어르신이 거동이 불편해서 내원이 어렵습니다. 방문진료가 가능한 지역인지, 신청은 어떻게 하는지 알고 싶습니다.`,
      () => `주차가 가능한지, 몇 대나 세울 수 있는지 궁금합니다. 6호선 돌곶이역에서 걸어가도 되는 거리인가요?`,
      () => `공휴일이나 일요일에도 진료하시는지, 마지막 접수는 몇 시까지인지 알려주시면 감사하겠습니다.`,
      () => `첩약이 건강보험으로 되는 경우가 있다고 들었습니다. 어떤 경우에 해당하는지 알고 싶습니다.`,
      () => `예약 없이 방문해도 진료가 가능한지, 대기가 보통 얼마나 되는지 문의드립니다.`,
    ],
  },
];

/* 답변 — 효과를 단정하지 않고 내원 안내로 마무리한다 */
const REPLIES = {
  growth: [
    "안녕하세요, 장위365경희한의원입니다. 아이마다 성장 시기와 상태가 달라 글만으로는 판단이 어렵습니다. 내원하시면 성장판과 체성분을 확인한 뒤 지금 무엇부터 챙기면 좋을지 원장이 직접 안내해 드립니다. 아이와 함께 오시면 더 정확합니다.",
    "안녕하세요. 문의 주셔서 감사합니다. 키는 수면·식사·활동량이 함께 얽혀 있어 한 가지만 보고 말씀드리기는 조심스럽습니다. 첫 상담 때 성장 상태를 확인하고 생활 관리부터 함께 잡아드리고 있습니다. 예약 후 방문 부탁드립니다.",
    "안녕하세요, 장위365경희한의원입니다. 성장 상담은 아이와 함께 오시는 것을 권해 드립니다. 검사 결과지가 있으시면 지참해 주시면 도움이 됩니다. 평일 야간과 주말·공휴일에도 진료하고 있습니다.",
    "안녕하세요. 말씀하신 부분은 진료실에서 직접 확인이 필요합니다. 성장판 검사와 체성분 측정 후 상태에 맞춰 안내드리고 있으니 편하신 시간에 예약해 주세요. 비용은 검사 항목에 따라 달라 내원 시 상세히 설명드립니다.",
  ],
  common: [
    "안녕하세요, 장위365경희한의원입니다. 증상만으로는 원인을 단정하기 어려워 진료실에서 직접 확인이 필요합니다. 내원하시면 필요한 검사를 함께 보고 치료 방향을 안내해 드리겠습니다.",
    "안녕하세요. 문의 감사합니다. 말씀하신 내용은 첫 진료 때 원장이 직접 상담하며 확인해 드립니다. 검사 자료가 있으시면 가져오시면 도움이 됩니다.",
    "안녕하세요, 장위365경희한의원입니다. 평일은 야간까지, 주말과 공휴일에도 진료하고 있습니다. 예약 후 방문하시면 대기 없이 상담받으실 수 있습니다.",
    "안녕하세요. 상태에 따라 치료 방법과 기간이 달라집니다. 내원해 주시면 확인 후 안내드리겠습니다. 궁금하신 점은 전화(02-6952-2800)로도 문의 가능합니다.",
  ],
};

const TOTAL_WEIGHT = TOPICS.reduce((s, t) => s + t.weight, 0);

function makeInquiry() {
  let r = rnd() * TOTAL_WEIGHT;
  const topic = TOPICS.find((t) => (r -= t.weight) < 0) || TOPICS[0];
  const ctx = topic.ctx();
  return { cat: topic.cat, title: pick(topic.titles)(ctx), content: pick(topic.bodies)(ctx) };
}

/* ── 날짜: 2022-01-03(월)부터 주당 4~6건 ────────────────── */

const START = Date.UTC(2022, 0, 3);
const END = Date.UTC(2026, 7, 10);
const DAY = 86400000;

function buildSchedule() {
  const out = [];
  let weeks = 0;
  for (let weekStart = START; weekStart <= END; weekStart += 7 * DAY) {
    weeks++;
    const n = int(4, 6);
    for (let i = 0; i < n; i++) {
      const dow = chance(0.08) ? 6 : int(0, 5); // 일요일 문의는 드물게
      const hour = chance(0.25) ? int(20, 23) : int(9, 19);
      const t = weekStart + dow * DAY + hour * 3600000 + int(0, 59) * 60000;
      if (t <= END) out.push(t);
    }
  }
  out.sort((a, b) => a - b);
  return { times: out, weeks };
}

/* ── 실행 ───────────────────────────────────────────────── */

const mode = process.argv.includes("--write")
  ? "write"
  : process.argv.includes("--clean")
    ? "clean"
    : "preview";

async function clean() {
  const r = await sql.query(
    "DELETE FROM community_users WHERE provider_uid_hash LIKE 'seed-%' RETURNING id"
  );
  console.log(`시드 회원 ${r.length}명 삭제 (글·답변은 CASCADE 로 함께 삭제)`);
}

async function main() {
  if (mode === "clean") return clean();

  const { times, weeks } = buildSchedule();
  const nicknames = makeNicknames(180);
  const posts = times.map((t) => {
    const q = makeInquiry();
    return { ...q, at: new Date(t), user: int(0, nicknames.length - 1) };
  });

  const growth = posts.filter((p) => p.cat === "growth").length;
  const byCat = {};
  for (const p of posts) byCat[p.cat] = (byCat[p.cat] || 0) + 1;

  console.log(`기간   : 2022-01-03 ~ 2026-08-10 (${weeks}주, 주당 평균 ${(posts.length / weeks).toFixed(1)}건)`);
  console.log(`문의   : ${posts.length}건  (성장 ${growth}건 = ${Math.round((growth / posts.length) * 100)}%)`);
  console.log(`분포   : ${Object.entries(byCat).map(([k, v]) => `${k} ${v}`).join(" / ")}`);
  console.log(`회원   : ${nicknames.length}명`);

  if (mode === "preview") {
    console.log("\n--- 샘플 12건 ---");
    for (let i = 0; i < 12; i++) {
      const p = posts[Math.floor((posts.length / 12) * i)];
      console.log(`\n[${p.at.toISOString().slice(0, 10)}] (${p.cat}) ${p.title}`);
      console.log(`  ${p.content}`);
    }
    console.log("\n미리보기입니다. 실제로 넣으려면 --write 를 붙이세요.");
    return;
  }

  // 회원
  const providers = nicknames.map(() => (chance(0.72) ? "kakao" : "naver"));
  const hashes = nicknames.map((_, i) => `seed-${String(i).padStart(4, "0")}`);
  const userRows = await sql.query(
    `INSERT INTO community_users (provider, provider_uid_hash, nickname, created_at, last_login_at)
     SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::timestamptz[], $5::timestamptz[])
     ON CONFLICT (provider, provider_uid_hash) DO UPDATE SET nickname = EXCLUDED.nickname
     RETURNING id`,
    [
      providers,
      hashes,
      nicknames,
      nicknames.map(() => new Date(START)),
      nicknames.map(() => new Date(END)),
    ]
  );
  const userIds = userRows.map((r) => Number(r.id));
  console.log(`회원 ${userIds.length}명 등록`);

  // 글 — 상담문의는 작성 API와 동일하게 status='published', is_private=true
  const CHUNK = 250;
  let inserted = 0;
  const withIds = [];
  for (let i = 0; i < posts.length; i += CHUNK) {
    const part = posts.slice(i, i + CHUNK);
    const rows = await sql.query(
      `INSERT INTO community_posts (kind, user_id, title, content, rating, status, is_private, created_at, updated_at)
       SELECT 'inquiry', u, t, c, NULL, 'published', TRUE, d, d
         FROM unnest($1::bigint[], $2::text[], $3::text[], $4::timestamptz[]) AS x(u, t, c, d)
       RETURNING id`,
      [
        part.map((p) => userIds[p.user % userIds.length]),
        part.map((p) => p.title),
        part.map((p) => p.content),
        part.map((p) => p.at),
      ]
    );
    rows.forEach((r, j) => withIds.push({ id: Number(r.id), cat: part[j].cat, at: part[j].at }));
    inserted += rows.length;
    process.stdout.write(`\r글 ${inserted}/${posts.length}건 삽입`);
  }
  console.log();

  // 답변 — 약 60%에 몇 시간~이틀 뒤 답변
  const replies = withIds.filter(() => chance(0.6));
  let rcount = 0;
  for (let i = 0; i < replies.length; i += CHUNK) {
    const part = replies.slice(i, i + CHUNK);
    await sql.query(
      `INSERT INTO community_replies (post_id, body, author_name, created_at)
       SELECT p, b, '장위365경희한의원', d
         FROM unnest($1::bigint[], $2::text[], $3::timestamptz[]) AS x(p, b, d)`,
      [
        part.map((p) => p.id),
        part.map((p) => pick(p.cat === "growth" ? REPLIES.growth : REPLIES.common)),
        part.map((p) => new Date(p.at.getTime() + int(3, 48) * 3600000)),
      ]
    );
    rcount += part.length;
    process.stdout.write(`\r답변 ${rcount}/${replies.length}건 삽입`);
  }
  console.log("\n완료.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
