/**
 * 클리닉 페이지 목록 — 홈 진료과목 카드, 상단 내비, 사이트맵, 클리닉끼리의 상호 링크가
 * 모두 이 배열 하나를 본다. 페이지를 새로 만들면 여기 `ready: true`로 바꾸면 되고,
 * 아직 안 만든 클리닉은 홈 카드에서 링크 없이 표시된다.
 *
 * title은 홈페이지 진료과목 카드(SERVICES)의 이름과 글자까지 같게 맞춘다 — 같은 것을
 * 두 이름으로 부르면 환자가 다른 진료로 오해한다.
 */

export interface ClinicMeta {
  slug: string;
  /** 홈 진료과목 카드와 동일한 명칭 */
  title: string;
  /** 내비게이션·링크에 쓰는 짧은 이름 */
  short: string;
  /** 페이지가 만들어졌는지 */
  ready: boolean;
}

export const CLINICS: ClinicMeta[] = [
  // 순서는 홈 진료과목 카드(SERVICES)와 같게 유지한다
  { slug: "disc",      title: "디스크·협착증 클리닉", short: "디스크·협착증", ready: true },
  { slug: "diet",      title: "다이어트 클리닉",      short: "다이어트",      ready: true },
  { slug: "women",     title: "여성 클리닉",          short: "여성",          ready: true },
  { slug: "rhinitis",  title: "비염 클리닉",          short: "비염",          ready: true },
  { slug: "antiaging", title: "항노화 클리닉",        short: "항노화",        ready: true },
  { slug: "growth",    title: "성장 클리닉",          short: "소아 성장",     ready: true },
  { slug: "digestion", title: "만성 소화불량 클리닉", short: "만성 소화불량", ready: true },
  { slug: "stroke",    title: "안면마비·중풍 클리닉", short: "안면마비·중풍", ready: true },
];

export const readyClinics = () => CLINICS.filter((c) => c.ready);

export const clinicPath = (slug: string) => `/clinic/${slug}`;

/** 홈 진료과목 카드 제목으로 클리닉을 찾는다. */
export function findClinicByTitle(title: string): ClinicMeta | undefined {
  return CLINICS.find((c) => c.title === title);
}
