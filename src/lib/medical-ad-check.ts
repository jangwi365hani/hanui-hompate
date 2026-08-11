/**
 * 의료광고 표현 점검.
 *
 * 환자가 쓴 후기라도 병원 홈페이지에 올라가는 순간 의료광고로 해석될 수 있다
 * (의료법 제56조). 특히 "치료효과를 보장하거나 오인하게 하는 표현", "최상급 표현",
 * "다른 의료인 비방"은 게시 전에 걸러야 한다.
 *
 * 여기서 하는 일은 차단이 아니라 '표시'다. 판단은 사람이 한다 —
 * 문맥에 따라 문제없는 문장까지 기계가 막으면 후기를 아무도 못 쓰게 된다.
 * 그래서 작성자에게는 안내로, 관리자 승인 화면에서는 경고 배지로만 쓴다.
 */

export type AdRiskLevel = "high" | "medium";

export interface AdRiskHit {
  term: string;
  level: AdRiskLevel;
  reason: string;
}

interface Rule {
  terms: string[];
  level: AdRiskLevel;
  reason: string;
}

const RULES: Rule[] = [
  {
    terms: ["완치", "완전히 나았", "다 나았", "싹 나았", "재발 없", "재발이 없"],
    level: "high",
    reason: "치료 결과를 보장하는 표현 (의료법 제56조 ②항 2호)",
  },
  {
    terms: ["100%", "백퍼", "무조건", "확실히 낫", "반드시 낫", "장담"],
    level: "high",
    reason: "효과를 단정·보장하는 표현",
  },
  {
    terms: ["부작용 없", "부작용이 없", "부작용은 없", "안전합니다", "전혀 아프지"],
    level: "high",
    reason: "안전성을 단정하는 표현",
  },
  {
    terms: ["최고", "최상", "유일", "제일 잘", "가장 잘", "1위", "일등", "최초", "명의", "신의 손"],
    level: "high",
    reason: "객관적으로 인정되지 않은 최상급 표현 (의료법 제56조 ②항 3호)",
  },
  {
    terms: ["다른 병원", "다른 한의원", "타 병원", "타 한의원", "딴 데", "거기는"],
    level: "medium",
    reason: "다른 의료기관과 비교·비방으로 읽힐 수 있음",
  },
  {
    terms: ["할인", "이벤트가", "무료로", "공짜", "사은품", "페이백"],
    level: "medium",
    reason: "비급여 진료비 할인·유인 광고로 해석될 수 있음",
  },
  {
    terms: ["암이 나았", "암을 고", "당뇨가 나았", "고혈압이 나았", "만병통치", "특효"],
    level: "high",
    reason: "특정 질환의 치료 효과를 단정하는 표현",
  },
];

/** 본문에서 위험 표현을 찾아 돌려준다. 없으면 빈 배열. */
export function checkAdRisk(text: string): AdRiskHit[] {
  if (!text) return [];
  const hits: AdRiskHit[] = [];
  for (const rule of RULES) {
    for (const term of rule.terms) {
      if (text.includes(term)) {
        hits.push({ term, level: rule.level, reason: rule.reason });
      }
    }
  }
  return hits;
}

/** 작성 화면에서 보여줄 한 줄 안내. */
export const AD_NOTICE =
  "치료 효과를 단정하는 표현(완치·100%·부작용 없음 등)이나 최상급 표현은 의료법상 게시가 어려워, 검토 과정에서 수정을 요청드릴 수 있습니다.";
