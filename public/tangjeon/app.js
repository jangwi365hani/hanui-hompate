const STORAGE_KEY = "tangjeon-mvp-state-v4";
const PRESET_STORAGE_KEY = "tangjeon-mvp-presets-v1";
const DOCTOR_STORAGE_KEY = "tangjeon-mvp-doctors-v1";
const STAFF_STORAGE_KEY = "tangjeon-mvp-staff-v1";
const OPTIONS_STORAGE_KEY = "tangjeon-mvp-options-v1";
const AUTO_BACKUP_STORAGE_KEY = "tangjeon-mvp-auto-backup-v1";
const STANDBY_STORAGE_KEY = "tangjeon-mvp-standby-v1";
const GOBANG_STORAGE_KEY = "tangjeon-mvp-gobang-v1";
const LAST_SYNC_STORAGE_KEY = "tangjeon-mvp-last-sync-v1";
const SCHEDULE_PEOPLE_API_PATH = "/system/api/tangjeon/people";
const DEFAULT_GOBANG_PRESCRIPTIONS = window.GOBANG_PRESCRIPTIONS || [];
const DEFAULT_GOBANG_TEXT = serializeGobangPrescriptions(DEFAULT_GOBANG_PRESCRIPTIONS);
const DEFAULT_DOCTORS = ["김현규", "박종성", "안익균", "김경민", "박기석"];
const DEFAULT_STAFF = ["이현영", "김혜진", "김지영", "권정민", "강경숙", "김지은", "하지윤", "공민주", "임승지", "조현화", "윤정현", "김민서", "이미소", "곽연수"];
const DEFAULT_STANDBY_TEXT = `1.당귀수산(10000cc)
당귀 180
적작약 오약 향부자 소목 120
홍화 96 도인 84
계지 72 감초 60

2.가미작감탕(TA)(10000cc)
작약 320
당귀 천궁 숙지황 황기 감초 160
육계 구기자 120
건강 대조 40

3.반하사심탕(8000cc-20첩)
반하 100
황금 건강 인삼 감초 대조 120
황련 60

4.자보소아약(7000cc/65cc)
황기 백작약 80
인삼 백출 복령 감초 계지 60
당귀 진피 곽향 사인 40
승마 시호 생강 대조 20
흑당 200

5.조위승기탕(8000cc-30첩)
대황 240
망초 감초 120

6.계지가계탕(5000cc-30첩)
계지 300
대조 240
작약 생강 180
감초 120

7.궁귀교애탕(5000cc-10첩)
건지황 120
백작약 30
애엽 당귀 60
천궁 아교 감초 40

8.오령산(8000cc-20첩)
택사 240
저령 백출 복령 160
계지 80

9.마황탕(5000cc-30첩)
마황 행인 180
계지 120
감초 60

10.소시호탕(8000cc-20첩)
시호 320
반하 100
대조 황금 인삼 생강 감초 120

11.생맥산 가감(40첩 100cc 90팩)
오미자 11
인삼 2
맥문동 4.5
황기 2
감초 2`;

let presets = loadPresets();
let doctors = loadDoctors();
let staffMembers = loadStaffMembers();
let options = loadOptions();
let standbyText = loadStandbyText();
let gobangText = loadGobangText();
let gobangPrescriptions = parseGobangText(gobangText);
let pendingStaffAction = null;
let pendingPhotoAction = null;
let cameraStream = null;

const statuses = [
  "조제대기",
  "조제중",
  "조제완료",
  "전탕대기",
  "전탕중",
  "전탕완료",
  "포장중",
  "포장완료",
  "출고완료",
];

const workflowColumns = [
  { title: "조제", statuses: ["조제대기", "조제중"] },
  { title: "전탕대기", statuses: ["조제완료", "전탕대기"] },
  { title: "좌탕", type: "machine", machineId: "LEFT" },
  { title: "우탕", type: "machine", machineId: "RIGHT" },
  { title: "포장/출고", statuses: ["전탕완료", "포장중", "포장완료", "출고완료"] },
];

const initialState = {
  machines: [
    { id: "LEFT", name: "좌측탕전기", status: "대기" },
    { id: "RIGHT", name: "우측탕전기", status: "대기" },
  ],
  prescriptions: [
    {
      id: "RX-20260526-001",
      patientName: "김현규",
      doctorName: "원장",
      prescriptionDate: "2026-05-26",
      title: "갈근탕",
      category: "첩건",
      round: "1차",
      packCount: 10,
      pouchVolume: 100,
      pouchCount: 30,
      waterAmount: 5500,
      pouchColor: "빨강",
      sourceUrl: "https://docs.google.com/document/d/1J7Wbj3xuLYrAqfOcKiPsNsZR7t-V2X5uDsFXZ6XNuFw",
      decoctionNote: "후하약재 있음",
      postAdded: "녹각교질 60g",
      leftoverHandling: "보관",
      dosing: {
        totalCourseCount: 6,
        currentCourseNo: 1,
        dailyDays: 15,
        dailyDoseCount: 2,
        doseTiming: ["아침", "저녁"],
        mealTiming: "식후",
        mealOffsetMinutes: 30,
        avoidFoods: ["밀가루 음식", "튀긴 음식", "인스턴트 음식"],
        memo: "",
      },
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "갈근", amount: 40, unit: "g" },
        { name: "마황", amount: 6, unit: "g" },
        { name: "생강", amount: 6, unit: "g" },
        { name: "대조", amount: 6, unit: "g" },
        { name: "계지", amount: 4, unit: "g" },
        { name: "작약", amount: 4, unit: "g" },
        { name: "감초", amount: 4, unit: "g" },
      ],
    },
    {
      id: "RX-20260526-002",
      patientName: "정경옥",
      doctorName: "원장",
      prescriptionDate: "2026-05-26",
      title: "계지인삼탕 가 사물",
      category: "녹용한약",
      round: "2차 녹",
      packCount: 15,
      pouchVolume: 100,
      pouchCount: 45,
      waterAmount: 6500,
      pouchColor: "빨강",
      sourceUrl: "https://docs.google.com/document/d/1eAFWX8H7Def8W6-JBi_hq6MsUC1cK6Zi6lou_HpkYdU",
      decoctionNote: "후하약재 확인",
      postAdded: "녹각교질 60g, 녹용 1/2",
      leftoverHandling: "보관",
      dosing: {
        totalCourseCount: 2,
        currentCourseNo: 2,
        dailyDays: 22.5,
        dailyDoseCount: 2,
        doseTiming: ["아침", "저녁"],
        mealTiming: "식후",
        mealOffsetMinutes: 30,
        avoidFoods: ["음주", "커피"],
        memo: "",
      },
      memo: "",
      status: "전탕중",
      machineId: "LEFT",
      herbs: [
        { name: "육계", amount: 8, unit: "g" },
        { name: "감초", amount: 8, unit: "g" },
        { name: "창출", amount: 6, unit: "g" },
        { name: "인삼", amount: 6, unit: "g" },
        { name: "생강", amount: 6, unit: "g" },
        { name: "건지황", amount: 3, unit: "g" },
        { name: "천궁", amount: 3, unit: "g" },
        { name: "작약", amount: 3, unit: "g" },
        { name: "당귀", amount: 3, unit: "g" },
      ],
    },
    {
      id: "RX-20260521-001",
      patientName: "김고은",
      doctorName: "원장",
      prescriptionDate: "2026-05-21",
      title: "쏙쏙탕",
      category: "쏙쏙탕",
      round: "6차",
      packCount: 10,
      pouchVolume: 100,
      pouchCount: 45,
      waterAmount: 7500,
      pouchColor: "초록",
      sourceUrl: "https://docs.google.com/document/d/15LaGRNlLupEoGHLzu9-7yOp2M2G8HJZ-LdHydDQUHhM",
      decoctionNote: "",
      postAdded: "",
      leftoverHandling: "없음",
      dosing: {
        totalCourseCount: 6,
        currentCourseNo: 6,
        dailyDays: 22.5,
        dailyDoseCount: 2,
        doseTiming: ["아침", "저녁"],
        mealTiming: "식전",
        mealOffsetMinutes: 30,
        avoidFoods: ["밀가루 음식", "튀긴 음식", "인스턴트 음식", "음주"],
        memo: "",
      },
      memo: "",
      status: "포장중",
      machineId: "RIGHT",
      herbs: [
        { name: "의이인", amount: 17, unit: "g" },
        { name: "마황", amount: 14, unit: "g" },
        { name: "숙지황", amount: 10, unit: "g" },
        { name: "황기", amount: 8, unit: "g" },
        { name: "당귀", amount: 8, unit: "g" },
        { name: "용안육", amount: 6, unit: "g" },
        { name: "과루근", amount: 4, unit: "g" },
        { name: "산약", amount: 4, unit: "g" },
        { name: "천궁", amount: 3, unit: "g" },
      ],
    },
    {
      id: "RX-20260526-003",
      patientName: "배영봉",
      doctorName: "원장",
      title: "후생반감인 가 육미",
      category: "녹용한약",
      round: "2차 녹",
      packCount: 15,
      pouchVolume: 100,
      pouchCount: 45,
      waterAmount: 6500,
      pouchColor: "검정",
      sourceUrl: "https://docs.google.com/document/d/1uGf0j4z5Z3T-uPQb5ifi6rvdipvgwWANRkW1_EHg0b8",
      decoctionNote: "후하약재 확인",
      postAdded: "녹각교질 60g, 녹용 1/2",
      leftoverHandling: "보관",
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "후박", amount: 16, unit: "g" },
        { name: "생강", amount: 16, unit: "g" },
        { name: "반하", amount: 5, unit: "g" },
        { name: "감초", amount: 3, unit: "g" },
        { name: "인삼", amount: 3, unit: "g" },
        { name: "건지황", amount: 5, unit: "g" },
        { name: "목단피", amount: 4, unit: "g" },
        { name: "복령", amount: 4, unit: "g" },
        { name: "산수유", amount: 4, unit: "g" },
        { name: "산약", amount: 4, unit: "g" },
        { name: "우슬", amount: 4, unit: "g" },
        { name: "차전자", amount: 4, unit: "g" },
        { name: "택사", amount: 4, unit: "g" },
        { name: "육계", amount: 2, unit: "g" },
      ],
    },
    {
      id: "RX-20260526-004",
      patientName: "이선우",
      doctorName: "원장",
      title: "소건중합보중익기",
      category: "녹용한약",
      round: "1차 녹용",
      packCount: 15,
      pouchVolume: 100,
      pouchCount: 45,
      waterAmount: 5500,
      pouchColor: "노랑",
      sourceUrl: "https://docs.google.com/document/d/1Ts_d9qO2Yv3xFEL1veQEvxXEmhSt1-PqTNcWD94zLAA",
      decoctionNote: "",
      postAdded: "녹용 1/2, 교이 200g",
      leftoverHandling: "없음",
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "황기", amount: 8, unit: "g" },
        { name: "백작약", amount: 8, unit: "g" },
        { name: "인삼", amount: 6, unit: "g" },
        { name: "백출", amount: 6, unit: "g" },
        { name: "백복령", amount: 6, unit: "g" },
        { name: "감초", amount: 6, unit: "g" },
        { name: "계지", amount: 6, unit: "g" },
        { name: "당귀", amount: 3, unit: "g" },
        { name: "진피", amount: 3, unit: "g" },
        { name: "곽향", amount: 3, unit: "g" },
        { name: "사인", amount: 3, unit: "g" },
        { name: "녹용", amount: 3, unit: "g" },
        { name: "승마", amount: 2, unit: "g" },
        { name: "시호", amount: 2, unit: "g" },
        { name: "생강", amount: 2, unit: "g" },
        { name: "대조", amount: 2, unit: "g" },
      ],
    },
    {
      id: "RX-20260524-001",
      patientName: "김지현",
      doctorName: "원장",
      title: "소건중탕",
      category: "첩건",
      round: "1차 첩건",
      packCount: 10,
      pouchVolume: 100,
      pouchCount: 30,
      waterAmount: 5500,
      pouchColor: "빨강",
      sourceUrl: "https://docs.google.com/document/d/1C1J53rt5_3764wZybHzmWbiMykA_02dSfQy1iTnLpTs",
      decoctionNote: "",
      postAdded: "교이 100g, 녹각교질 70g",
      leftoverHandling: "보관",
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "작약", amount: 12, unit: "g" },
        { name: "육계", amount: 8, unit: "g" },
        { name: "생강", amount: 6, unit: "g" },
        { name: "대조", amount: 6, unit: "g" },
        { name: "감초", amount: 6, unit: "g" },
      ],
    },
    {
      id: "RX-20260523-001",
      patientName: "박옥태",
      doctorName: "원장",
      title: "복령건중탕",
      category: "첩건",
      round: "1차 소화불량",
      packCount: 10,
      pouchVolume: 100,
      pouchCount: 30,
      waterAmount: 4500,
      pouchColor: "빨강",
      sourceUrl: "https://docs.google.com/document/d/1vkk8jxDcNl-ncf_QHbM5tLEk-EYXkM7dJpX-pdxntnM",
      decoctionNote: "교이 후하",
      postAdded: "교이 180g",
      leftoverHandling: "보관",
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "작약", amount: 12, unit: "g" },
        { name: "육계", amount: 8, unit: "g" },
        { name: "생강", amount: 6, unit: "g" },
        { name: "대조", amount: 6, unit: "g" },
        { name: "감초", amount: 6, unit: "g" },
        { name: "복령", amount: 6, unit: "g" },
      ],
    },
    {
      id: "RX-20260522-001",
      patientName: "배진환",
      doctorName: "원장",
      title: "도핵승기탕",
      category: "첩건",
      round: "1차 소화불량",
      packCount: 10,
      pouchVolume: 100,
      pouchCount: 30,
      waterAmount: 5000,
      pouchColor: "초록",
      sourceUrl: "https://docs.google.com/document/d/1TI9mItiY_fvTe8NJv1jPJrICngFPa5VI8DlNQSUOXqY",
      decoctionNote: "",
      postAdded: "녹각교질 60g",
      leftoverHandling: "보관",
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "대황", amount: 8, unit: "g" },
        { name: "도인", amount: 6, unit: "g" },
        { name: "육계", amount: 6, unit: "g" },
        { name: "감초", amount: 4, unit: "g" },
        { name: "망초", amount: 4, unit: "g" },
      ],
    },
    {
      id: "RX-20260522-002",
      patientName: "강금수",
      doctorName: "원장",
      title: "보중익기가감",
      category: "치료약",
      round: "1차 치료",
      packCount: 15,
      pouchVolume: 100,
      pouchCount: 45,
      waterAmount: 6500,
      pouchColor: "빨강",
      sourceUrl: "https://docs.google.com/document/d/1AnKPD9_2Rn6i8hbA-Yll1682v7TqBxCbq-vSJhuYcic",
      decoctionNote: "",
      postAdded: "녹각교질, 박하 60g",
      leftoverHandling: "보관",
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "황기", amount: 12, unit: "g" },
        { name: "인삼", amount: 8, unit: "g" },
        { name: "백출", amount: 8, unit: "g" },
        { name: "감초", amount: 8, unit: "g" },
        { name: "시호", amount: 6, unit: "g" },
        { name: "당귀", amount: 4, unit: "g" },
        { name: "진피", amount: 4, unit: "g" },
        { name: "천궁", amount: 4, unit: "g" },
        { name: "방풍", amount: 4, unit: "g" },
        { name: "소엽", amount: 4, unit: "g" },
        { name: "형개", amount: 4, unit: "g" },
        { name: "승마", amount: 3, unit: "g" },
        { name: "산사", amount: 3, unit: "g" },
        { name: "신곡", amount: 3, unit: "g" },
        { name: "맥아", amount: 3, unit: "g" },
      ],
    },
    {
      id: "RX-20260521-002",
      patientName: "이지민/이하민",
      doctorName: "원장",
      title: "여택통기탕",
      category: "첩건",
      round: "1차 첩건",
      packCount: 15,
      pouchVolume: 80,
      pouchCount: 60,
      waterAmount: 6500,
      pouchColor: "노랑공룡",
      sourceUrl: "https://docs.google.com/document/d/1GuXrM_3UZvaD5BvI9ZE6xjU0k7931_QOvYyvWSXXzfk",
      decoctionNote: "",
      postAdded: "녹각교질 60g, 교이 400g",
      leftoverHandling: "없음",
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "황기", amount: 4, unit: "g" },
        { name: "갈근", amount: 3, unit: "g" },
        { name: "강활", amount: 3, unit: "g" },
        { name: "독활", amount: 3, unit: "g" },
        { name: "방풍", amount: 3, unit: "g" },
        { name: "승마", amount: 3, unit: "g" },
        { name: "창출", amount: 3, unit: "g" },
        { name: "감초", amount: 2, unit: "g" },
        { name: "대추", amount: 2, unit: "g" },
        { name: "생강", amount: 2, unit: "g" },
        { name: "마황", amount: 1, unit: "g" },
        { name: "백지", amount: 1, unit: "g" },
        { name: "산초", amount: 1, unit: "g" },
      ],
    },
    {
      id: "RX-20260521-003",
      patientName: "이성민",
      doctorName: "원장",
      title: "대시호탕",
      category: "첩건",
      round: "1차 첩건",
      packCount: 8,
      pouchVolume: 100,
      pouchCount: 30,
      waterAmount: 5500,
      pouchColor: "빨강",
      sourceUrl: "https://docs.google.com/document/d/1ownNiJVlYTfPg1OEhwwiy506UZszLYcZk7yXdGMXShk",
      decoctionNote: "",
      postAdded: "녹각교질 60g",
      leftoverHandling: "없음",
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "시호", amount: 16, unit: "g" },
        { name: "반하", amount: 5, unit: "g" },
        { name: "생강", amount: 10, unit: "g" },
        { name: "지실", amount: 8, unit: "g" },
        { name: "황금", amount: 6, unit: "g" },
        { name: "작약", amount: 6, unit: "g" },
        { name: "대조", amount: 6, unit: "g" },
        { name: "대황", amount: 4, unit: "g" },
      ],
    },
    {
      id: "RX-20260521-004",
      patientName: "백성현",
      doctorName: "원장",
      title: "쏙쏙탕",
      category: "쏙쏙탕",
      round: "5차",
      packCount: 10,
      pouchVolume: 100,
      pouchCount: 45,
      waterAmount: 6500,
      pouchColor: "초록",
      sourceUrl: "https://docs.google.com/document/d/1OSPj7aqGjHDQkcZ8p6jqjIC-9QBsQZCwmtrlWA0yCF4",
      decoctionNote: "",
      postAdded: "",
      leftoverHandling: "없음",
      memo: "",
      status: "조제대기",
      machineId: "",
      herbs: [
        { name: "의이인", amount: 20, unit: "g" },
        { name: "마황", amount: 13, unit: "g" },
        { name: "숙지황", amount: 10, unit: "g" },
        { name: "황기", amount: 8, unit: "g" },
        { name: "당귀", amount: 8, unit: "g" },
        { name: "복령", amount: 8, unit: "g" },
        { name: "저령", amount: 8, unit: "g" },
        { name: "택사", amount: 8, unit: "g" },
        { name: "용안육", amount: 6, unit: "g" },
        { name: "반하", amount: 6, unit: "g" },
        { name: "과루근", amount: 4, unit: "g" },
        { name: "산약", amount: 4, unit: "g" },
        { name: "상백피", amount: 4, unit: "g" },
        { name: "진피", amount: 4, unit: "g" },
        { name: "생강", amount: 4, unit: "g" },
        { name: "대조", amount: 4, unit: "g" },
        { name: "감초", amount: 4, unit: "g" },
        { name: "천궁", amount: 3, unit: "g" },
        { name: "황금", amount: 3, unit: "g" },
        { name: "대황", amount: 3, unit: "g" },
      ],
    },
  ],
  herbs: [
    { name: "갈근", stock: 3200, safety: 500, unit: "g" },
    { name: "마황", stock: 1800, safety: 400, unit: "g" },
    { name: "감초", stock: 2600, safety: 500, unit: "g" },
    { name: "녹각교질", stock: 420, safety: 200, unit: "g" },
    { name: "녹용", stock: 12, safety: 4, unit: "분" },
    { name: "작약", stock: 2400, safety: 500, unit: "g" },
    { name: "황기", stock: 2100, safety: 500, unit: "g" },
    { name: "복령", stock: 1900, safety: 400, unit: "g" },
    { name: "대황", stock: 900, safety: 300, unit: "g" },
  ],
  histories: [
    { text: "정경옥 처방이 좌측탕전기에서 전탕중으로 변경됨", at: "오늘 08:15" },
    { text: "김고은 처방이 포장중으로 변경됨", at: "오늘 08:04" },
    { text: "김현규 처방이 조제대기로 등록됨", at: "오늘 07:52" },
  ],
};

let state = loadState();

const viewTitle = document.querySelector("#viewTitle");
const navButtons = document.querySelectorAll(".nav-button");
const views = {
  dashboard: document.querySelector("#dashboardView"),
  prescription: document.querySelector("#prescriptionView"),
  list: document.querySelector("#listView"),
  standby: document.querySelector("#standbyView"),
  workflow: document.querySelector("#workflowView"),
  reports: document.querySelector("#reportsView"),
  herbs: document.querySelector("#herbsView"),
  settings: document.querySelector("#settingsView"),
};

const viewNames = {
  dashboard: "오늘 처방",
  prescription: "처방전 작성",
  list: "처방전 목록",
  standby: "상비약",
  workflow: "공정 현황",
  reports: "월별 현황",
  herbs: "약재 재고",
  settings: "설정",
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return normalizeExampleNames(structuredClone(initialState));
  try {
    return normalizeExampleNames(JSON.parse(saved));
  } catch {
    return normalizeExampleNames(structuredClone(initialState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveLocalBackup();
}

function normalizeExampleNames(data) {
  data.prescriptions?.forEach((item) => {
    if (item.patientName === "나지원") item.patientName = "김현규";
    item.staff = {
      dispense: item.staff?.dispense || "",
      decoction: item.staff?.decoction || "",
      washing: item.staff?.washing || "",
    };
    item.photos = item.photos || {};
  });
  data.histories?.forEach((item) => {
    item.text = item.text?.replaceAll("나지원", "김현규");
  });
  return data;
}

function saveLocalBackup() {
  localStorage.setItem(AUTO_BACKUP_STORAGE_KEY, JSON.stringify({
    app: "tangjeon-system",
    version: 1,
    savedAt: new Date().toISOString(),
    state,
    presets,
    doctors,
    staffMembers,
    options,
    standbyText,
    gobangText,
  }));
}

function exportBackup() {
  renderDosingPreview();
  saveState();
  savePresets();
  saveDoctors();
  saveStaffMembers();
  saveOptions();
  const payload = {
    app: "tangjeon-system",
    version: 1,
    exportedAt: new Date().toISOString(),
    state,
    presets,
    doctors,
    staffMembers,
    options,
    standbyText,
    gobangText,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  downloadBlob(blob, `탕전시스템_백업_${new Date().toISOString().slice(0, 10)}.json`);
}

async function importBackupFile(file) {
  try {
    const payload = JSON.parse(await file.text());
    const importedState = payload.state || payload;
    if (!importedState.prescriptions || !Array.isArray(importedState.prescriptions)) {
      alert("백업 파일 형식이 맞지 않습니다.");
      return;
    }
    state = importedState;
    presets = Array.isArray(payload.presets) ? payload.presets : presets;
    doctors = Array.isArray(payload.doctors) ? payload.doctors : doctors;
    staffMembers = Array.isArray(payload.staffMembers) ? payload.staffMembers : staffMembers;
    options = payload.options ? { ...defaultOptions(), ...payload.options } : options;
    standbyText = typeof payload.standbyText === "string" ? payload.standbyText : standbyText;
    gobangText = typeof payload.gobangText === "string" ? payload.gobangText : gobangText;
    gobangPrescriptions = parseGobangText(gobangText);
    saveState();
    savePresets();
    saveDoctors();
    saveStaffMembers();
    saveOptions();
    saveStandbyText();
    saveGobangText();
    addHistory("백업 파일에서 데이터를 복원함");
    render();
    alert("백업 데이터를 불러왔습니다.");
  } catch {
    alert("백업 파일을 읽지 못했습니다.");
  }
}

function setView(name) {
  navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  Object.entries(views).forEach(([key, view]) => view.classList.toggle("active", key === name));
  viewTitle.textContent = viewNames[name];
}

function render() {
  syncMachines();
  renderStats();
  renderPresets();
  renderGobangResults();
  renderGobangSettings();
  renderDoctors();
  renderStaffMembers();
  renderOptions();
  renderDashboardSheets();
  renderMachines();
  renderHistory();
  renderStatusFilter();
  renderPrescriptionList();
  renderStandbyMedicines();
  renderWorkflowBoard();
  renderReports();
  renderHerbStock();
  renderInvoiceRows();
  saveState();
}

function loadDoctors() {
  const saved = localStorage.getItem(DOCTOR_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const merged = [...DEFAULT_DOCTORS, ...parsed.filter((name) => !DEFAULT_DOCTORS.includes(name))];
      localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch {
      return DEFAULT_DOCTORS.slice();
    }
  }
  return DEFAULT_DOCTORS.slice();
}

function saveDoctors() {
  localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(doctors));
}

function renderDoctors() {
  const current = document.querySelector('[name="doctorName"]')?.value || doctors[0] || "";
  const quickRow = document.querySelector("#doctorQuickRow");
  if (quickRow) {
    quickRow.innerHTML = doctors
      .map((name) => `<button class="${name === current ? "active" : ""}" data-select-doctor="${escapeAttribute(name)}" type="button">${escapeHtml(name)}</button>`)
      .join("");
  }

  const settingsList = document.querySelector("#doctorSettingsList");
  if (settingsList) {
    settingsList.innerHTML = doctors
      .map((name, index) => `
        <div class="settings-item">
          <strong>${escapeHtml(name)}</strong>
          <button class="secondary-button" data-delete-doctor="${index}" type="button">삭제</button>
        </div>
      `)
      .join("");
  }
}

function loadStaffMembers() {
  const saved = localStorage.getItem(STAFF_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return [...DEFAULT_STAFF, ...parsed.filter((name) => !DEFAULT_STAFF.includes(name))];
    } catch {
      return DEFAULT_STAFF.slice();
    }
  }
  return DEFAULT_STAFF.slice();
}

function saveStaffMembers() {
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffMembers));
}

function renderStaffMembers() {
  const settingsList = document.querySelector("#staffSettingsList");
  if (!settingsList) return;
  settingsList.innerHTML = staffMembers
    .map((name, index) => `
      <div class="settings-item">
        <strong>${escapeHtml(name)}</strong>
        <button class="secondary-button" data-delete-staff="${index}" type="button">삭제</button>
      </div>
    `)
    .join("");
}

async function syncPeopleFromSchedule(options = {}) {
  const { silent = false } = options;
  const status = document.querySelector("#scheduleSyncStatus");
  const button = document.querySelector("#syncSchedulePeopleButton");
  if (status && !silent) status.textContent = "불러오는 중...";
  if (button) button.disabled = true;

  try {
    const payload = await fetchSchedulePeople();
    const nextDoctors = uniqueNames(payload.doctors || []);
    const nextStaff = uniqueNames(payload.staff || []);
    if (!nextDoctors.length || !nextStaff.length) throw new Error("원장 또는 직원 목록이 비어 있습니다.");

    doctors = nextDoctors;
    staffMembers = nextStaff;
    saveDoctors();
    saveStaffMembers();
    saveLastSyncAt(new Date().toISOString());
    saveLocalBackup();
    renderDoctors();
    renderStaffMembers();
    renderLastSyncStatus();

    const message = `완료: 원장 ${doctors.length}명, 직원 ${staffMembers.length}명`;
    if (status) status.textContent = message;
    return { ok: true, doctors: doctors.length, staff: staffMembers.length };
  } catch (error) {
    if (silent) {
      renderLastSyncStatus(error.message);
      return { ok: false, error };
    }
    const message = `${error.message} 장위스케쥴 실행/로그인을 확인해 주세요.`;
    if (status) status.textContent = message;
    alert(message);
    return { ok: false, error };
  } finally {
    if (button) button.disabled = false;
  }
}

function loadLastSyncAt() {
  return localStorage.getItem(LAST_SYNC_STORAGE_KEY) || "";
}

function saveLastSyncAt(iso) {
  localStorage.setItem(LAST_SYNC_STORAGE_KEY, iso);
}

function formatLastSyncAt(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function renderLastSyncStatus(errorMessage) {
  const status = document.querySelector("#scheduleSyncStatus");
  if (!status) return;
  const last = formatLastSyncAt(loadLastSyncAt());
  if (errorMessage) {
    status.textContent = `자동 동기화 실패: ${errorMessage}${last ? ` · 마지막 성공 ${last}` : ""}`;
    return;
  }
  status.textContent = last ? `마지막 동기화 ${last} · 원장 ${doctors.length}명, 직원 ${staffMembers.length}명` : "";
}

async function fetchSchedulePeople() {
  const urls = schedulePeopleApiCandidates();
  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, { credentials: "include" });
      if (response.status === 401) throw new Error("장위스케쥴 로그인이 필요합니다.");
      if (!response.ok) {
        lastError = new Error(`연동 API 응답 오류(${response.status})`);
        continue;
      }
      return response.json();
    } catch (error) {
      if (error.message.includes("로그인이 필요")) throw error;
      lastError = error;
    }
  }

  throw lastError || new Error("장위스케쥴 데이터를 불러오지 못했습니다.");
}

function schedulePeopleApiCandidates() {
  const urls = [];
  const isHttp = location.protocol === "http:" || location.protocol === "https:";
  const isLocal = location.hostname === "127.0.0.1" || location.hostname === "localhost";

  if (isHttp) urls.push(`${location.origin}${SCHEDULE_PEOPLE_API_PATH}`);
  if (isLocal) {
    urls.push(`http://127.0.0.1:3000${SCHEDULE_PEOPLE_API_PATH}`);
    urls.push(`http://localhost:3000${SCHEDULE_PEOPLE_API_PATH}`);
  }

  return [...new Set(urls)];
}

function uniqueNames(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function defaultOptions() {
  return {
    categories: ["첩건", "녹용한약", "치료약", "쏙쏙탕"],
    pouches: ["빨강", "초록", "파랑", "투명", "검정", "노랑", "노랑공룡"],
    leftovers: ["보관", "없음", "환자 제공"],
  };
}

function loadOptions() {
  const saved = localStorage.getItem(OPTIONS_STORAGE_KEY);
  if (saved) {
    try {
      return { ...defaultOptions(), ...JSON.parse(saved) };
    } catch {
      return defaultOptions();
    }
  }
  return defaultOptions();
}

function saveOptions() {
  localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(options));
}

function loadStandbyText() {
  return mergeDefaultStandbyText(localStorage.getItem(STANDBY_STORAGE_KEY) || DEFAULT_STANDBY_TEXT);
}

function saveStandbyText() {
  localStorage.setItem(STANDBY_STORAGE_KEY, standbyText);
}

function loadGobangText() {
  return localStorage.getItem(GOBANG_STORAGE_KEY) || DEFAULT_GOBANG_TEXT;
}

function saveGobangText() {
  localStorage.setItem(GOBANG_STORAGE_KEY, gobangText);
}

function serializeGobangPrescriptions(items) {
  return items
    .map((item) => `${item.no}. ${item.title} | ${item.source || ""}`.trim())
    .join("\n");
}

function parseGobangText(text) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [head, ...sourceParts] = line.split("|");
      const source = sourceParts.join("|").trim();
      const match = head.trim().match(/^(\d{1,3}(?:-\d+)?)\.\s*(.+)$/);
      return {
        no: match?.[1] || String(index + 1),
        title: (match?.[2] || head).trim(),
        source,
      };
    })
    .filter((item) => item.title);
}

function renderGobangSettings() {
  const editor = document.querySelector("#gobangTextInput");
  const count = document.querySelector("#gobangSettingsCount");
  if (editor && editor.value !== gobangText) editor.value = gobangText;
  if (count) count.textContent = `${gobangPrescriptions.length}개 처방`;
}

function mergeDefaultStandbyText(text) {
  if (text.includes("생맥산 가감")) return text;
  const addition = DEFAULT_STANDBY_TEXT.split(/\n(?=\s*11\.)/)[1]?.trim();
  return addition ? `${text.trim()}\n\n${addition}` : text;
}

function renderOptions() {
  renderCategoryButtons();
  renderSelectOptions("pouchColor", options.pouches);
  renderSelectOptions("leftoverHandling", options.leftovers);
  renderOptionSettings("categories", "#categorySettingsList");
  renderOptionSettings("pouches", "#pouchSettingsList");
  renderOptionSettings("leftovers", "#leftoverSettingsList");
}

function renderCategoryButtons() {
  const row = document.querySelector("#categoryRow");
  if (!row) return;
  const current = document.querySelector('[name="category"]').value || options.categories[0] || "";
  row.innerHTML = options.categories
    .map((name) => `<button class="segment ${name === current ? "active" : ""}" data-type="${escapeAttribute(name)}" type="button">${escapeHtml(name)}</button>`)
    .join("");
  if (!document.querySelector('[name="category"]').value && options.categories[0]) {
    document.querySelector('[name="category"]').value = options.categories[0];
  }
}

function renderSelectOptions(name, values) {
  const select = document.querySelector(`[name="${name}"]`);
  if (!select) return;
  const current = select.value;
  select.innerHTML = values.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  if (values.includes(current)) select.value = current;
}

function renderOptionSettings(key, selector) {
  const list = document.querySelector(selector);
  if (!list) return;
  list.innerHTML = options[key]
    .map((value, index) => `
      <div class="settings-item">
        <strong>${escapeHtml(value)}</strong>
        <button class="secondary-button" data-delete-option="${key}" data-index="${index}" type="button">삭제</button>
      </div>
    `)
    .join("");
}

function renderReportDoctorOptions() {
  const select = document.querySelector("#reportDoctor");
  if (!select) return;
  const current = select.value;
  const values = ["전체", ...doctors];
  select.innerHTML = values.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  if (values.includes(current)) select.value = current;
}

function loadPresets() {
  const saved = localStorage.getItem(PRESET_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultPresets();
    }
  }
  return defaultPresets();
}

function defaultPresets() {
  return [
    { packCount: 10, pouchVolume: 100, pouchCount: 30, waterAmount: 5500 },
    { packCount: 15, pouchVolume: 100, pouchCount: 45, waterAmount: 6500 },
    { packCount: 15, pouchVolume: 80, pouchCount: 60, waterAmount: 6500 },
  ];
}

function savePresets() {
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
}

function renderPresets() {
  const row = document.querySelector("#presetRow");
  if (!row) return;
  row.innerHTML = presets
    .map((preset, index) => {
      const label = presetLabel(preset);
      return `
        <span class="preset-pill">
          <button data-preset-index="${index}" type="button">${label}</button>
          <button class="preset-edit" data-edit-preset="${index}" type="button" title="현재 입력값으로 수정" aria-label="${label} 수정">수정</button>
          <button class="preset-delete" data-delete-preset="${index}" type="button" title="구성 삭제" aria-label="${label} 삭제">×</button>
        </span>
      `;
    })
    .join("");
}

function presetLabel(preset) {
  return `${preset.packCount}첩 ${preset.pouchVolume}cc ${preset.pouchCount}팩`;
}

function renderGobangResults() {
  const results = document.querySelector("#gobangResults");
  const countText = document.querySelector("#gobangCountText");
  const input = document.querySelector("#gobangSearchInput");
  if (!results || !countText || !input) return;

  const query = input.value.trim().toLowerCase();
  const popularTitles = ["갈근탕", "소시호탕", "반하사심탕", "소건중탕", "오령산", "마황탕", "대시호탕", "궁귀교애탕"];
  const matches = gobangPrescriptions
    .filter((item) => {
      if (!query) return popularTitles.includes(item.title);
      return `${item.no} ${item.title} ${item.source}`.toLowerCase().includes(query);
    })
    .sort((a, b) => gobangSearchRank(a, query) - gobangSearchRank(b, query))
    .slice(0, query ? 18 : 10);

  countText.textContent = `고방 ${gobangPrescriptions.length}개`;
  results.innerHTML = matches.length
    ? matches
        .map((item) => `
          <button class="gobang-result" data-gobang-no="${escapeAttribute(item.no)}" data-gobang-title="${escapeAttribute(item.title)}" type="button">
            <span>${escapeHtml(item.no)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.source || "원문 용량 확인 필요")}</small>
          </button>
        `)
        .join("")
    : `<div class="muted">검색 결과가 없습니다.</div>`;
}

function gobangSearchRank(item, query) {
  if (!query) return 0;
  const title = item.title.toLowerCase();
  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (item.no.toLowerCase() === query) return 2;
  if (title.includes(query)) return 3;
  return 4;
}

function applyGobangPrescription(no, title) {
  const item = gobangPrescriptions.find((entry) => entry.no === no && entry.title === title);
  if (!item) return;

  document.querySelector('[name="title"]').value = item.title;
  const bulkInput = document.querySelector("#herbBulkInput");
  bulkInput.value = item.source;
  const parsedHerbs = parseHerbText(item.source);
  renderHerbRows(parsedHerbs);

  const note = document.querySelector('[name="decoctionNote"]');
  const sourceNote = `고방 ${item.no}. ${item.title}`;
  if (!note.value.trim()) note.value = sourceNote;
  else if (!note.value.includes(sourceNote)) note.value = `${note.value.trim()}\n${sourceNote}`;

  renderDosingPreview();
}

function syncMachines() {
  state.machines.forEach((machine) => {
    const current = state.prescriptions.find((item) => item.machineId === machine.id && item.status === "전탕중");
    machine.status = current ? `${current.patientName} 전탕중` : "대기";
  });
}

function renderStats() {
  const targets = ["조제대기", "조제중", "전탕대기", "전탕중", "포장중", "출고완료"];
  document.querySelector("#statsGrid").innerHTML = targets
    .map((status) => {
      const count = state.prescriptions.filter((item) => item.status === status).length;
      return `<article class="stat"><span>${status}</span><strong>${count}</strong></article>`;
    })
    .join("");
}

function renderDashboardSheets() {
  document.querySelector("#dashboardSheets").innerHTML = state.prescriptions
    .slice(0, 3)
    .map((item) => renderPrescriptionSheet(item))
    .join("");
}

function renderMachines() {
  document.querySelector("#machineList").innerHTML = state.machines
    .map((machine) => {
      const item = state.prescriptions.find((prescription) => prescription.machineId === machine.id && prescription.status === "전탕중");
      return `
        <article class="machine-card">
          <header>
            <strong>${machine.name}</strong>
            <span class="status-pill ${item ? "blue" : ""}">${machine.status}</span>
          </header>
          <p>${item ? `${item.title} · 물 ${formatNumber(item.waterAmount)}cc · ${item.pouchColor} 파우치` : "배정 가능한 상태입니다."}</p>
        </article>
      `;
    })
    .join("");
}

function renderHistory() {
  document.querySelector("#historyList").innerHTML = state.histories
    .slice(0, 8)
    .map((item) => `<div class="history-item"><p>${item.text}</p><small class="muted">${item.at}</small></div>`)
    .join("");
}

function renderStatusFilter() {
  const filter = document.querySelector("#statusFilter");
  if (filter.options.length > 1) return;
  statuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    filter.appendChild(option);
  });
}

function renderPrescriptionList() {
  const selected = document.querySelector("#statusFilter").value;
  const category = document.querySelector("#categoryFilter").value;
  const items = state.prescriptions.filter((item) => {
    const statusMatch = selected === "all" || item.status === selected;
    const categoryMatch = category === "all" || item.category === category;
    return statusMatch && categoryMatch;
  });
  document.querySelector("#prescriptionList").innerHTML =
    items.map((item) => renderPrescriptionSheet(item)).join("") || `<p class="muted">해당 처방전이 없습니다.</p>`;
}

function renderReports() {
  normalizePrescriptionDates();
  renderReportDoctorOptions();
  const month = document.querySelector("#reportMonth").value || currentMonth();
  const doctor = document.querySelector("#reportDoctor").value || "전체";
  document.querySelector("#reportMonth").value = month;

  const items = state.prescriptions.filter((item) => {
    const itemMonth = (item.prescriptionDate || "").slice(0, 7);
    const monthMatch = itemMonth === month;
    const doctorMatch = doctor === "전체" || item.doctorName === doctor;
    return monthMatch && doctorMatch;
  });

  const uniquePatients = new Set(items.map((item) => item.patientName));
  const decoctionCount = items.filter((item) => item.category === "녹용한약").length;

  document.querySelector("#reportSummary").innerHTML = `
    <article class="report-stat"><span>처방 건수</span><strong>${items.length}</strong></article>
    <article class="report-stat"><span>환자 수</span><strong>${uniquePatients.size}</strong></article>
    <article class="report-stat"><span>녹용한약</span><strong>${decoctionCount}</strong></article>
  `;

  document.querySelector("#reportList").innerHTML =
    items
      .map((item) => `
        <article class="report-row">
          <span>${escapeHtml(item.prescriptionDate || "-")}</span>
          <strong>${escapeHtml(item.patientName)}님</strong>
          <span>${escapeHtml(item.round || "-")}</span>
          <span>${escapeHtml(item.doctorName || "-")}</span>
          <span class="status-pill">${escapeHtml(item.category || "미분류")}</span>
        </article>
      `)
      .join("") || `<p class="muted">해당 월의 처방이 없습니다.</p>`;
}

function normalizePrescriptionDates() {
  state.prescriptions.forEach((item) => {
    if (item.prescriptionDate) return;
    const match = item.id.match(/RX-(\d{4})(\d{2})(\d{2})-/);
    item.prescriptionDate = match ? `${match[1]}-${match[2]}-${match[3]}` : new Date().toISOString().slice(0, 10);
  });
}

function renderStandbyMedicines() {
  const list = document.querySelector("#standbyList");
  const editor = document.querySelector("#standbyTextInput");
  if (editor && editor.value !== standbyText) editor.value = standbyText;
  if (!list) return;

  const medicines = parseStandbyMedicines(standbyText);
  list.innerHTML = medicines
    .map((item, index) => `
      <article class="standby-card">
        <header>
          <div>
            <span class="status-pill">상비약</span>
            <h2>${escapeHtml(item.title)}</h2>
          </div>
          <strong>${item.waterAmount ? `${formatNumber(item.waterAmount)}cc` : `${formatNumber(item.pouchCount || 0)}팩`}</strong>
        </header>
        <div class="standby-meta">
          <span>${item.packCount ? `${item.packCount}첩` : "첩수 미지정"}</span>
          <span>${item.pouchVolume ? `${item.pouchVolume}cc 팩` : "팩 용량 미지정"}</span>
          <span>${item.pouchCount ? `${item.pouchCount}팩` : "팩수 미지정"}</span>
          <span>${item.herbs.length}개 약재</span>
        </div>
        <p class="herb-lines">${formatHerbs(item.herbs)}</p>
        <button class="primary-button" data-add-standby="${index}" type="button">공정에 바로 넣기</button>
      </article>
    `)
    .join("") || `<p class="muted">설정에서 상비약 처방을 입력해 주세요.</p>`;
}

function parseStandbyMedicines(text) {
  return text
    .split(/\n(?=\s*\d+\.)/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      const header = lines.shift() || "";
      const titleMatch = header.match(/^\s*\d+\.\s*([^()]+?)(?:\((.+)\))?\s*$/);
      const title = titleMatch?.[1]?.trim() || header.replace(/^\d+\.\s*/, "").trim();
      const meta = titleMatch?.[2] || "";
      const parsedMeta = parseStandbyMeta(meta);
      return {
        title,
        ...parsedMeta,
        herbs: parseHerbText(lines.join("\n")),
      };
    });
}

function parseStandbyMeta(meta) {
  const packCount = Number(meta.match(/(\d+)\s*첩/)?.[1] || 0);
  const pouchCount = Number(meta.match(/(\d+)\s*팩/)?.[1] || 0);
  const ccValues = [...meta.matchAll(/(\d+)\s*cc/gi)].map((match) => Number(match[1]));
  const waterAmount = pouchCount ? 0 : (ccValues[0] || 0);
  const pouchVolume = pouchCount ? (ccValues[0] || 0) : (ccValues[1] || 0);
  return { waterAmount, pouchVolume, packCount, pouchCount };
}

function addStandbyToWorkflow(index) {
  const medicine = parseStandbyMedicines(standbyText)[index];
  if (!medicine) return;
  const nextNumber = String(state.prescriptions.length + 1).padStart(3, "0");
  const item = {
    id: `SB-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${nextNumber}`,
    patientName: "상비약",
    doctorName: "",
    prescriptionDate: new Date().toISOString().slice(0, 10),
    title: medicine.title,
    category: "상비약",
    round: "상비약",
    packCount: medicine.packCount || 0,
    pouchVolume: medicine.pouchVolume || 0,
    pouchCount: medicine.pouchCount || 0,
    waterAmount: medicine.waterAmount || 0,
    pouchColor: options.pouches[0] || "",
    sourceUrl: "",
    decoctionNote: "상비약 조제",
    postAdded: "",
    leftoverHandling: options.leftovers[0] || "",
    dosing: {},
    memo: "",
    staff: { dispense: "", decoction: "", washing: "" },
    photos: {},
    status: "조제대기",
    machineId: "",
    herbs: medicine.herbs,
  };
  state.prescriptions.unshift(item);
  addHistory(`${medicine.title} 상비약이 조제대기로 등록됨`);
  setView("workflow");
  render();
}

function renderWorkflowBoard() {
  const dispensing = state.prescriptions.filter((item) => ["조제대기", "조제중"].includes(item.status));
  const waiting = state.prescriptions.filter((item) => ["조제완료", "전탕대기"].includes(item.status) && !item.machineId);
  const left = state.prescriptions.filter((item) => item.machineId === "LEFT" && ["전탕대기", "전탕중"].includes(item.status));
  const right = state.prescriptions.filter((item) => item.machineId === "RIGHT" && ["전탕대기", "전탕중"].includes(item.status));
  const shipping = state.prescriptions.filter((item) => ["전탕완료", "포장중", "포장완료", "출고완료"].includes(item.status));

  document.querySelector("#workflowBoard").innerHTML = `
    ${renderWorkflowColumn("조제", dispensing)}
    <section class="decoction-area">
      <section class="board-column waiting-column">
        <header class="board-column-head">
          <h2>전탕대기</h2>
          <span>${waiting.length}건</span>
        </header>
        <div class="column-items waiting-items">
          ${waiting.map(renderWaitingWorkflowItem).join("") || `<p class="muted">해당 작업이 없습니다.</p>`}
        </div>
      </section>
      <div class="machine-pair">
        ${renderWorkflowColumn("좌탕", left, "machine-column")}
        ${renderWorkflowColumn("우탕", right, "machine-column right-machine-column")}
      </div>
    </section>
    ${renderWorkflowColumn("포장/출고", shipping)}
  `;
}

function renderWaitingWorkflowItem(item) {
  return `
    <article class="waiting-item">
      <strong>${escapeHtml(workflowDisplayName(item))}</strong>
      <span>${escapeHtml(item.category || "미분류")}</span>
      <span class="workflow-status">${item.status}</span>
      <div class="workflow-mini-actions">${workflowActionButtons(item)}</div>
    </article>
  `;
}

function renderWorkflowColumn(title, items, className = "") {
  return `
    <section class="board-column ${className}">
      <header class="board-column-head">
        <h2>${title}</h2>
        <span>${items.length}건</span>
      </header>
      <div class="column-items">
        ${items.map(renderWorkflowItem).join("") || `<p class="muted">해당 작업이 없습니다.</p>`}
      </div>
    </section>
  `;
}

function renderWorkflowItem(item) {
  const simple = ["조제대기", "포장중", "포장완료", "출고완료"].includes(item.status);
  if (simple) return renderSimpleWorkflowItem(item);

  return `
    <article class="workflow-item">
      <div class="workflow-row-top">
        <div>
          <strong class="workflow-patient">${escapeHtml(workflowDisplayName(item))}</strong>
          <span class="workflow-round">${escapeHtml(item.round || "")}</span>
        </div>
        <span class="workflow-status ${pillClass(item.status)}">${item.status}</span>
      </div>

      <div class="workflow-prescription">
        <span>${escapeHtml(item.category || "미분류")}</span>
        <strong>${escapeHtml(item.title)}</strong>
      </div>

      <dl class="workflow-facts">
        <div><dt>구성</dt><dd>${item.packCount}첩 ${item.pouchVolume}cc ${item.pouchCount}팩</dd></div>
        <div><dt>물양</dt><dd>${formatNumber(item.waterAmount)}cc</dd></div>
        <div><dt>파우치</dt><dd>${escapeHtml(item.pouchColor)}</dd></div>
      </dl>

      <div class="workflow-note">
        ${item.machineId ? `<span class="machine-tag">${machineName(item.machineId)}</span>` : ""}
        <span>${item.postAdded ? `후하: ${escapeHtml(item.postAdded)}` : "후하: -"}</span>
      </div>

      ${renderStaffSummary(item)}
      <div class="workflow-actions">${workflowActionButtons(item)}</div>
    </article>
  `;
}

function renderSimpleWorkflowItem(item) {
  return `
    <article class="workflow-item simple-workflow-item">
      <div class="simple-name">
        <strong>${escapeHtml(workflowDisplayName(item))}</strong>
        <span>${escapeHtml(item.round || "")}</span>
      </div>
      <div class="simple-action workflow-mini-actions">${workflowActionButtons(item)}</div>
    </article>
  `;
}

function renderPrescriptionSheet(item, compact = false) {
  const titleText = item.category === "상비약"
    ? `${item.title} 상비약`
    : `${item.patientName}님 ${item.round || ""}`;
  return `
    <article class="prescription-sheet ${compact ? "compact-sheet" : ""}">
      <header class="sheet-head">
        <div>
          <h2 class="patient-title">${escapeHtml(titleText)}</h2>
          <span class="status-pill">${escapeHtml(item.category || "미분류")}</span>
          <span class="status-pill ${pillClass(item.status)}">${item.status}</span>
        </div>
        <div class="sheet-no">
          <strong>${item.id}</strong><br />
          ${escapeHtml(item.prescriptionDate || "-")}<br />
          ${escapeHtml(item.doctorName || "담당 한의사 미지정")}
        </div>
      </header>

      <div class="rx-meta">
        <span>${item.packCount}첩</span>
        <span>${item.pouchVolume}cc</span>
        <span>${item.pouchCount}팩</span>
      </div>

      <div class="rx-row"><strong>물양 :</strong><span>${formatNumber(item.waterAmount)}cc</span></div>
      <div class="rx-row"><strong>파우치색상 :</strong><span>${escapeHtml(item.pouchColor)}</span></div>
      <div class="rx-row"><strong>처방명 :</strong><span>${escapeHtml(item.title)}</span></div>
      <div class="rx-row"><strong>약재 :</strong><span class="herb-lines">${formatHerbs(item.herbs)}</span></div>
      <div class="rx-row"><strong>탕전참고사항 :</strong><span>${escapeHtml(item.decoctionNote || "-")}</span></div>
      <div class="rx-row"><strong>후하약재 :</strong><span>${escapeHtml(item.postAdded || "-")}</span></div>
      <div class="rx-row"><strong>잉여약 :</strong><span>${escapeHtml(item.leftoverHandling || "-")}</span></div>
      <div class="rx-row dosing-summary"><strong>복용법 :</strong><span>${formatDosing(item.dosing)}</span></div>
      ${renderDispensePhoto(item)}

      <div class="sheet-actions">
        ${item.machineId ? `<span class="status-pill blue">${machineName(item.machineId)}</span>` : ""}
        ${nextActionButton(item)}
      </div>
    </article>
  `;
}

function renderDispensePhoto(item) {
  const photo = item.photos?.dispense;
  if (!photo?.dataUrl) return "";
  return `
    <div class="rx-row photo-row">
      <strong>조제사진 :</strong>
      <figure>
        <img src="${escapeAttribute(photo.dataUrl)}" alt="조제한약 사진" />
        <figcaption>${escapeHtml(photo.at || "")}</figcaption>
      </figure>
    </div>
  `;
}

function workflowDisplayName(item) {
  return item.category === "상비약" ? item.title : `${item.patientName}님`;
}

function renderStaffSummary(item) {
  const labels = [
    ["dispense", "조제"],
    ["decoction", "탕전셋팅"],
    ["washing", "설거지"],
  ];
  const tags = labels
    .filter(([role]) => item.staff?.[role])
    .map(([role, label]) => `<span>${label} ${escapeHtml(item.staff[role])}</span>`)
    .join("");
  return tags ? `<div class="staff-summary">${tags}</div>` : "";
}

function formatHerbs(herbs) {
  if (!herbs || herbs.length === 0) return "-";
  const lines = [];
  for (let index = 0; index < herbs.length; index += 4) {
    lines.push(
      herbs
        .slice(index, index + 4)
        .map((herb) => `${escapeHtml(herb.name)} ${herb.amount}${escapeHtml(herb.unit)}`)
        .join("   ")
    );
  }
  return lines.join("\n");
}

function renderHerbStock() {
  document.querySelector("#herbStockList").innerHTML = state.herbs
    .map((herb) => {
      const low = herb.stock <= herb.safety;
      return `
        <article class="stock-row">
          <strong>${escapeHtml(herb.name)}</strong>
          <span>${formatNumber(herb.stock)}${escapeHtml(herb.unit)}</span>
          <span class="status-pill ${low ? "red" : ""}">${low ? "부족" : "정상"}</span>
        </article>
      `;
    })
    .join("");
}

let invoiceRows = [];

function parseInvoiceText(text) {
  return text
    .split(/\n+/)
    .map((line) => {
      const match = line.trim().match(/^([가-힣A-Za-z]+)\s+(\d+(?:\.\d+)?)\s*(kg|KG|Kg|g|G|근|봉|포)?/);
      if (!match) return null;
      const unit = match[3] || "g";
      const amount = unit.toLowerCase() === "kg" ? Number(match[2]) * 1000 : Number(match[2]);
      return {
        name: match[1],
        amount,
        unit: unit.toLowerCase() === "kg" ? "g" : unit,
      };
    })
    .filter(Boolean);
}

function renderInvoiceRows() {
  const body = document.querySelector("#invoiceRows");
  if (!body) return;
  body.innerHTML = invoiceRows
    .map((row, index) => `
      <tr>
        <td><input data-invoice-field="name" data-index="${index}" value="${escapeAttribute(row.name)}" /></td>
        <td><input data-invoice-field="amount" data-index="${index}" type="number" value="${escapeAttribute(row.amount)}" /></td>
        <td><input data-invoice-field="unit" data-index="${index}" value="${escapeAttribute(row.unit)}" /></td>
        <td><button class="secondary-button" data-remove-invoice="${index}" type="button">삭제</button></td>
      </tr>
    `)
    .join("");
}

function applyInvoiceRows() {
  invoiceRows.forEach((row) => {
    const existing = state.herbs.find((herb) => herb.name === row.name && herb.unit === row.unit);
    if (existing) {
      existing.stock += Number(row.amount || 0);
    } else {
      state.herbs.push({ name: row.name, stock: Number(row.amount || 0), safety: 0, unit: row.unit || "g" });
    }
  });
  addHistory(`거래명세서 ${invoiceRows.length}개 항목이 재고에 반영됨`);
  invoiceRows = [];
  document.querySelector("#invoiceTextInput").value = "";
  render();
}

function nextActionButton(item) {
  if (item.status === "전탕대기") return machineStartButtons(item);

  const next = {
    조제대기: "조제 시작",
    조제중: "조제 완료",
    조제완료: "전탕 대기",
    전탕중: "전탕 완료",
    전탕완료: "포장 시작",
    포장중: "포장 완료",
    포장완료: "출고 완료",
  }[item.status];

  if (!next) return `<span class="muted">완료</span>`;
  return `<button class="action-button" data-action="advance" data-id="${item.id}" type="button">${next}</button>`;
}

function machineStartButtons(item) {
  return state.machines
    .map((machine) => {
      const busy = isMachineBusy(machine.id);
      return `
        <button
          class="action-button ${busy ? "disabled-action" : ""}"
          data-action="start-machine"
          data-id="${item.id}"
          data-machine="${machine.id}"
          type="button"
          ${busy ? "disabled" : ""}
        >${machine.id === "LEFT" ? "좌탕 시작" : "우탕 시작"}</button>
      `;
    })
    .join("");
}

function workflowActionButtons(item) {
  return `
    <button class="action-button ghost-action" data-action="view-prescription" data-id="${item.id}" type="button">처방전</button>
    ${canRevertPrescription(item) ? `<button class="action-button ghost-action" data-action="revert" data-id="${item.id}" type="button">되돌리기</button>` : ""}
    ${nextActionButton(item)}
  `;
}

function canRevertPrescription(item) {
  return item.status !== "조제대기";
}

function pillClass(status) {
  if (status.includes("대기")) return "orange";
  if (status.includes("중")) return "blue";
  if (status.includes("완료")) return "";
  return "";
}

function advancePrescription(id) {
  const item = state.prescriptions.find((prescription) => prescription.id === id);
  if (!item) return;

  const before = item.status;
  if (item.status === "조제대기") item.status = "조제중";
  else if (item.status === "조제중") item.status = "조제완료";
  else if (item.status === "조제완료") item.status = "전탕대기";
  else if (item.status === "전탕대기") startDecoction(item);
  else if (item.status === "전탕중") item.status = "전탕완료";
  else if (item.status === "전탕완료") item.status = "포장중";
  else if (item.status === "포장중") item.status = "포장완료";
  else if (item.status === "포장완료") item.status = "출고완료";

  if (before !== item.status) {
    addHistory(`${item.patientName} 처방이 ${before}에서 ${item.status}로 변경됨`);
    render();
  }
}

function advancePrescriptionWithoutPrompts(id) {
  advancePrescription(id);
}

function startDecoctionByMachine(id, machineId) {
  const item = state.prescriptions.find((prescription) => prescription.id === id);
  if (!item || item.status !== "전탕대기") return;
  const before = item.status;
  startDecoction(item, machineId);
  if (before !== item.status) {
    addHistory(`${workflowDisplayName(item)} ${machineName(machineId)} 전탕 시작`);
    render();
  }
}

function roleForAdvance(item) {
  if (item.status === "조제대기") return { role: "dispense", title: "조제보조 선택", subtitle: `${workflowDisplayName(item)} 조제를 시작합니다.` };
  if (item.status === "전탕중") return { role: "washing", title: "설거지 담당 선택", subtitle: `${workflowDisplayName(item)} 전탕을 완료합니다.` };
  return null;
}

function openStaffModal({ id, role, title, subtitle, action, machineId = "" }) {
  pendingStaffAction = { id, role, action, machineId };
  document.querySelector("#staffModalTitle").textContent = title;
  document.querySelector("#staffModalSubtitle").textContent = subtitle;
  document.querySelector("#staffChoiceGrid").innerHTML = renderStaffChoiceButtons();
  document.querySelector("#staffModal").hidden = false;
}

function renderStaffChoiceButtons() {
  const employeeButtons = staffMembers
    .map((name) => `<button data-staff-choice="${escapeAttribute(name)}" type="button">${escapeHtml(name)}</button>`)
    .join("");
  const doctorButtons = doctors
    .map((name) => `<button data-staff-choice="${escapeAttribute(name)}" type="button">${escapeHtml(name)}</button>`)
    .join("");
  return `
    <div class="staff-choice-section">
      ${employeeButtons}
    </div>
    <div class="staff-choice-section doctor-choice-section">
      <span>원장님</span>
      ${doctorButtons}
    </div>
  `;
}

function closeStaffModal() {
  pendingStaffAction = null;
  document.querySelector("#staffModal").hidden = true;
  document.querySelector("#staffChoiceGrid").innerHTML = "";
}

function confirmStaffChoice(name = "") {
  if (!pendingStaffAction) return;
  const { id, role, action, machineId } = pendingStaffAction;
  if (name) updateStaffAssignment(id, role, name);
  closeStaffModal();
  if (action === "start-machine") startDecoctionByMachine(id, machineId);
  if (action === "advance") advancePrescription(id);
}

async function openDispensePhotoModal(id) {
  const item = state.prescriptions.find((prescription) => prescription.id === id);
  if (!item) return;
  pendingPhotoAction = { id, dataUrl: "" };
  document.querySelector("#cameraModalTitle").textContent = "조제한약 사진";
  document.querySelector("#cameraModalSubtitle").textContent = `${workflowDisplayName(item)} 조제 완료 전 사진을 남깁니다.`;
  document.querySelector("#dispensePhotoPreview").classList.remove("active");
  document.querySelector("#dispensePhotoPreview").removeAttribute("src");
  document.querySelector("#saveDispensePhotoButton").disabled = true;
  document.querySelector("#cameraStatus").textContent = "카메라를 여는 중입니다.";
  document.querySelector("#cameraModal").hidden = false;
  await startCamera();
}

async function startCamera() {
  stopCamera();
  const video = document.querySelector("#dispenseCameraVideo");
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    video.srcObject = cameraStream;
    video.style.display = "block";
    document.querySelector("#cameraStatus").textContent = "사진을 찍어 주세요.";
  } catch {
    video.style.display = "none";
    document.querySelector("#cameraStatus").textContent = "카메라를 열 수 없습니다. 사진 업로드를 사용해 주세요.";
  }
}

function stopCamera() {
  if (!cameraStream) return;
  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
}

function closeCameraModal({ advance = false } = {}) {
  const id = pendingPhotoAction?.id;
  stopCamera();
  pendingPhotoAction = null;
  document.querySelector("#cameraModal").hidden = true;
  document.querySelector("#dispensePhotoUpload").value = "";
  if (advance && id) advancePrescription(id);
}

function setDispensePhotoPreview(dataUrl) {
  if (!pendingPhotoAction || !dataUrl) return;
  pendingPhotoAction.dataUrl = dataUrl;
  const preview = document.querySelector("#dispensePhotoPreview");
  preview.src = dataUrl;
  preview.classList.add("active");
  document.querySelector("#saveDispensePhotoButton").disabled = false;
  document.querySelector("#cameraStatus").textContent = "사진을 확인한 뒤 저장해 주세요.";
}

function captureDispensePhoto() {
  const video = document.querySelector("#dispenseCameraVideo");
  if (!video.videoWidth) {
    document.querySelector("#cameraStatus").textContent = "카메라 화면이 준비되지 않았습니다.";
    return;
  }
  const canvas = document.querySelector("#dispensePhotoCanvas");
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  setDispensePhotoPreview(canvas.toDataURL("image/jpeg", 0.78));
}

function saveDispensePhotoAndAdvance() {
  if (!pendingPhotoAction?.dataUrl) return;
  const item = state.prescriptions.find((prescription) => prescription.id === pendingPhotoAction.id);
  if (!item) return;
  item.photos = item.photos || {};
  item.photos.dispense = {
    dataUrl: pendingPhotoAction.dataUrl,
    at: new Date().toLocaleString("ko-KR"),
  };
  closeCameraModal({ advance: true });
}

function readUploadedDispensePhoto(file) {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.addEventListener("load", () => {
    const canvas = document.querySelector("#dispensePhotoCanvas");
    const maxWidth = 1280;
    const scale = Math.min(1, maxWidth / image.naturalWidth);
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    setDispensePhotoPreview(canvas.toDataURL("image/jpeg", 0.78));
    URL.revokeObjectURL(objectUrl);
  }, { once: true });
  image.src = objectUrl;
}

function updateStaffAssignment(id, role, name) {
  const item = state.prescriptions.find((prescription) => prescription.id === id);
  if (!item || !["dispense", "decoction", "washing"].includes(role)) return;
  item.staff = {
    dispense: item.staff?.dispense || "",
    decoction: item.staff?.decoction || "",
    washing: item.staff?.washing || "",
    [role]: name,
  };
  saveState();
}

function revertPrescription(id) {
  const item = state.prescriptions.find((prescription) => prescription.id === id);
  if (!item || !canRevertPrescription(item)) return;

  const before = item.status;
  if (item.status === "조제중") item.status = "조제대기";
  else if (item.status === "조제완료") item.status = "조제중";
  else if (item.status === "전탕대기") {
    item.status = "조제완료";
    item.machineId = "";
  } else if (item.status === "전탕중") {
    item.status = "전탕대기";
    item.machineId = "";
  } else if (item.status === "전탕완료") item.status = "전탕중";
  else if (item.status === "포장중") item.status = "전탕완료";
  else if (item.status === "포장완료") item.status = "포장중";
  else if (item.status === "출고완료") item.status = "포장완료";

  if (before !== item.status) {
    addHistory(`${item.patientName} 처방이 ${before}에서 ${item.status}로 되돌림`);
    render();
  }
}

function openPrescriptionModal(id) {
  const item = state.prescriptions.find((prescription) => prescription.id === id);
  if (!item) return;
  document.querySelector("#prescriptionModalTitle").textContent = item.category === "상비약" ? `${item.title} 상비약` : `${item.patientName}님 처방전`;
  document.querySelector("#prescriptionModalBody").innerHTML = renderPrescriptionSheet(item);
  document.querySelector("#prescriptionModal").hidden = false;
}

function closePrescriptionModal() {
  document.querySelector("#prescriptionModal").hidden = true;
  document.querySelector("#prescriptionModalBody").innerHTML = "";
}

function startDecoction(item, machineId = "") {
  const machine = machineId
    ? state.machines.find((candidate) => candidate.id === machineId)
    : state.machines.find((candidate) => !isMachineBusy(candidate.id));
  if (!machine) {
    alert("현재 비어 있는 탕전기가 없습니다.");
    return;
  }
  if (isMachineBusy(machine.id)) {
    alert(`${machine.name}는 현재 사용 중입니다.`);
    return;
  }
  item.machineId = machine.id;
  item.status = "전탕중";
}

function isMachineBusy(machineId) {
  return state.prescriptions.some((p) => p.machineId === machineId && p.status === "전탕중");
}

function addHistory(text) {
  state.histories.unshift({ text, at: "방금" });
}

function addHerbRow(values = { name: "", amount: "", unit: "g" }) {
  const row = document.createElement("div");
  row.className = "herb-row";
  row.innerHTML = `
    <input name="herbName" value="${escapeAttribute(values.name)}" placeholder="약재명" />
    <input name="herbAmount" type="number" min="0" value="${escapeAttribute(values.amount)}" placeholder="용량" />
    <input name="herbUnit" value="${escapeAttribute(values.unit)}" placeholder="단위" />
    <button class="remove-button" type="button" title="약재 삭제" aria-label="약재 삭제">×</button>
  `;
  row.querySelector(".remove-button").addEventListener("click", () => {
    row.remove();
    if (!document.querySelector("#herbEditor").children.length) addHerbRow();
  });
  document.querySelector("#herbEditor").appendChild(row);
}

function renderHerbRows(herbs) {
  const editor = document.querySelector("#herbEditor");
  editor.innerHTML = "";
  herbs.forEach((herb) => addHerbRow(herb));
  if (!editor.children.length) addHerbRow();
}

function parseHerbText(text) {
  const normalized = text
    .replaceAll("->", " ")
    .replace(/[＋+\-－=]/g, " ")
    .replaceAll("/", " ")
    .replace(/[!,:()]/g, " ")
    .replace(/(\d+(?:\.\d+)?(?:~\d+(?:\.\d+)?)?)(?=[가-힣A-Za-z])/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return [];

  const skipWords = new Set(["후하", "후하약재", "탕전참고사항", "처방명", "물양", "파우치색상", "잉여약", "보관", "여부", "yes", "no", "nope"]);
  const formulaNames = new Set(gobangPrescriptions.map((item) => item.title));
  const tokens = normalized.split(" ");
  const herbs = [];
  let pendingNames = [];

  tokens.forEach((rawToken) => {
    const token = rawToken.trim();
    if (!token) return;
    if (skipWords.has(token.toLowerCase())) return;

    const compactMatch = token.match(/^([가-힣A-Za-z]+)(\d+(?:\.\d+)?(?:~\d+(?:\.\d+)?)?|½|1\/2)(g|G)?$/);
    const numberOnlyMatch = token.match(/^(\d+(?:\.\d+)?(?:~\d+(?:\.\d+)?)?|½|1\/2)(g|G)?$/);

    if (compactMatch) {
      pendingNames.push(compactMatch[1]);
      pendingNames = pendingNames.filter((name) => !formulaNames.has(name));
      flushPendingHerbs(herbs, pendingNames, normalizeAmount(compactMatch[2]), compactMatch[3] || "g");
      pendingNames = [];
      return;
    }

    if (numberOnlyMatch && pendingNames.length) {
      flushPendingHerbs(herbs, pendingNames, normalizeAmount(numberOnlyMatch[1]), numberOnlyMatch[2] || "g");
      pendingNames = [];
      return;
    }

    if (/^[가-힣A-Za-z]+$/.test(token)) {
      if (formulaNames.has(token)) return;
      pendingNames.push(token);
    }
  });

  pendingNames.forEach((name) => herbs.push({ name, amount: "", unit: "g" }));
  return herbs;
}

function flushPendingHerbs(herbs, names, amount, unit) {
  names.forEach((name) => herbs.push({ name, amount, unit: unit.toLowerCase() }));
}

function normalizeAmount(value) {
  if (value === "½" || value === "1/2") return 0.5;
  if (String(value).includes("~")) return Number(String(value).split("~")[0]);
  return Number(value);
}

function createPrescription(form) {
  const data = new FormData(form);
  const herbs = [...document.querySelectorAll(".herb-row")]
    .map((row) => ({
      name: row.querySelector('[name="herbName"]').value.trim(),
      amount: Number(row.querySelector('[name="herbAmount"]').value || 0),
      unit: row.querySelector('[name="herbUnit"]').value.trim() || "g",
    }))
    .filter((herb) => herb.name);

  const nextNumber = String(state.prescriptions.length + 1).padStart(3, "0");
  const item = {
    id: `RX-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${nextNumber}`,
    patientName: data.get("patientName").trim(),
    doctorName: data.get("doctorName").trim(),
    prescriptionDate: data.get("prescriptionDate"),
    title: data.get("title").trim(),
    category: data.get("category"),
    round: data.get("round").trim(),
    packCount: Number(data.get("packCount")),
    pouchVolume: Number(data.get("pouchVolume")),
    pouchCount: Number(data.get("pouchCount")),
    waterAmount: Number(data.get("waterAmount")),
    pouchColor: data.get("pouchColor"),
    sourceUrl: data.get("sourceUrl")?.trim() || "",
    decoctionNote: data.get("decoctionNote").trim(),
    postAdded: data.get("postAdded").trim(),
    leftoverHandling: data.get("leftoverHandling"),
    dosing: readDosingFromForm(data),
    memo: data.get("memo").trim(),
    staff: { dispense: "", decoction: "", washing: "" },
    photos: {},
    status: "조제대기",
    machineId: "",
    herbs,
  };

  state.prescriptions.unshift(item);
  addHistory(`${item.patientName} 처방이 조제대기로 등록됨`);
  form.reset();
  document.querySelector("#herbBulkInput").value = "";
  renderHerbRows([{ name: "갈근", amount: 40, unit: "g" }, { name: "마황", amount: 6, unit: "g" }]);
  setPrescriptionDefaults();
  setView("list");
  render();
}

function machineName(id) {
  return state.machines.find((machine) => machine.id === id)?.name || id;
}

function calculateDosingDays(pouchCount, dailyDoseCount) {
  const packs = Number(pouchCount || document.querySelector('[name="pouchCount"]')?.value || 0);
  const daily = Number(dailyDoseCount || document.querySelector('[name="dailyDoseCount"]')?.value || 0);
  if (!packs || !daily) return "";
  const days = packs / daily;
  return Number.isInteger(days) ? String(days) : String(Number(days.toFixed(1)));
}

function formatDosingDays(days) {
  return days ? `${days}일분` : "N일분 자동계산";
}

function formatDaysAndPacks(days, pouchCount) {
  const packs = Number(pouchCount || document.querySelector('[name="pouchCount"]')?.value || 0);
  const daysText = formatDosingDays(days);
  return packs ? `${daysText} · ${packs}팩` : daysText;
}

function readDosingFromForm(data) {
  const dailyDoseCount = data.get("dailyDoseCount");
  const dailyDays = calculateDosingDays(data.get("pouchCount"), dailyDoseCount);
  return {
    totalCourseCount: data.get("totalCourseCount"),
    currentCourseNo: data.get("currentCourseNo"),
    dailyDays,
    dailyDoseCount,
    doseTiming: data.getAll("doseTiming"),
    mealTiming: data.get("mealTiming") || "",
    mealOffsetMinutes: data.get("mealOffsetMinutes"),
    avoidFoods: data.getAll("avoidFoods"),
    memo: data.get("dosingMemo").trim(),
  };
}

function currentDosingValues() {
  return readDosingFromForm(new FormData(document.querySelector("#prescriptionForm")));
}

function formatDosing(dosing = {}) {
  const course = dosing.totalCourseCount || dosing.currentCourseNo
    ? `${dosing.totalCourseCount || "?"}회 처방 중 ${dosing.currentCourseNo || "?"}번째`
    : "";
  const days = dosing.dailyDays ? formatDaysAndPacks(dosing.dailyDays) : "";
  const daily = dosing.dailyDoseCount ? `하루 ${dosing.dailyDoseCount}번` : "";
  const timing = dosing.doseTiming?.length ? dosing.doseTiming.join("/") : "";
  const meal = dosing.mealTiming ? `${dosing.mealTiming}${dosing.mealOffsetMinutes ? ` ${dosing.mealOffsetMinutes}분` : ""}` : "";
  const avoid = dosing.avoidFoods?.length ? `주의: ${dosing.avoidFoods.join(", ")}` : "";
  const memo = dosing.memo ? `메모: ${escapeHtml(dosing.memo)}` : "";
  return [course, days, daily, timing, meal, avoid, memo].filter(Boolean).join(" · ") || "-";
}

function renderDosingPreview() {
  const preview = document.querySelector("#dosingPreview");
  if (!preview) return;
  const patient = document.querySelector('[name="patientName"]').value.trim() || "환자";
  const doctor = document.querySelector('[name="doctorName"]').value.trim() || "담당원장";
  const date = document.querySelector('[name="prescriptionDate"]').value || new Date().toISOString().slice(0, 10);
  const dosing = currentDosingValues();
  const dailyDaysBadge = document.querySelector("#dailyDaysBadge");
  if (dailyDaysBadge) dailyDaysBadge.textContent = formatDaysAndPacks(dosing.dailyDays);
  const course = dosing.totalCourseCount || dosing.currentCourseNo
    ? `${dosing.totalCourseCount || "?"}회 처방 예정 중 ${dosing.currentCourseNo || "?"}번째 한약`
    : "처방 회차 미입력";
  const days = formatDaysAndPacks(dosing.dailyDays);
  const daily = dosing.dailyDoseCount ? `하루 ${dosing.dailyDoseCount}번` : "하루 복용 횟수 미입력";
  const timing = dosing.doseTiming.length ? dosing.doseTiming.join(", ") : "복용 시간 미선택";
  const meal = dosing.mealTiming ? `${dosing.mealTiming}${dosing.mealOffsetMinutes ? ` ${dosing.mealOffsetMinutes}분` : ""}` : "식전/식후 미선택";
  const avoid = dosing.avoidFoods.length ? dosing.avoidFoods.join(", ") : "특별히 선택된 주의 음식 없음";
  const memo = dosing.memo || "특별 메모 없음";
  const selectedTiming = ["아침", "점심", "저녁", "취침전"]
    .map((name) => `<span class="${dosing.doseTiming.includes(name) ? "checked" : ""}">${dosing.doseTiming.includes(name) ? "✓" : ""}${escapeHtml(name)}</span>`)
    .join(" ");
  const mealChecks = ["식전", "식후", "공복 가능"]
    .map((name) => {
      const checked = dosing.mealTiming === name;
      const suffix = name !== "공복 가능" && checked && dosing.mealOffsetMinutes ? ` ${dosing.mealOffsetMinutes}분` : "";
      return `<span class="${checked ? "checked" : ""}">${checked ? "✓" : ""}${escapeHtml(name + suffix)}</span>`;
    })
    .join(" ");
  const avoidChips = dosing.avoidFoods.length
    ? dosing.avoidFoods.map((food) => `<span class="caution-chip">${escapeHtml(food)}</span>`).join("")
    : `<span class="caution-chip quiet">선택된 주의 음식 없음</span>`;

  preview.innerHTML = `
    <header class="dosing-paper-head">
      <img class="dosing-preview-logo" src="./assets/hospital-logo.png" alt="장위365경희한의원" />
      <div class="dosing-paper-title">
        <h3>한약 복용법</h3>
        <p>이 한약은 <strong>${escapeHtml(patient)}님</strong>의 증상을 위한 맞춤 한약입니다.</p>
      </div>
    </header>

    <div class="dosing-summary-table">
      <div><span>처방 회차</span><strong>${escapeHtml(course)}</strong></div>
      <div><span>N일분</span><strong>${escapeHtml(days)}</strong></div>
      <div><span>복용 방법</span><strong>${escapeHtml(daily)} · ${escapeHtml(timing)} · ${escapeHtml(meal)}</strong></div>
      <div><span>조제 정보</span><strong>${escapeHtml(doctor)} 처방 · ${escapeHtml(date)}</strong></div>
    </div>

    <section class="dosing-paper-section">
      <h4>복용방법</h4>
      <div class="dosing-checks">${selectedTiming}</div>
      <div class="dosing-checks">${mealChecks}</div>
    </section>

    <div class="dosing-info-copy">
      장위365경희한의원 정품 한약은 순수한 천연재료만 사용합니다. 더운 날씨에는 냉장보관하시기 바랍니다.<br />
      침전물이 생길 수 있으나 품질에는 영향이 없습니다. 드시기 전에 가볍게 흔들거나 저어서 드세요.
    </div>

    <section class="dosing-paper-section">
      <h4>주의해야 할 음식</h4>
      <div class="dosing-caution-chips">${avoidChips}</div>
    </section>

    <div class="dosing-caution">
      <strong>특별히 주의해야 할 사항</strong><br />
      ${escapeHtml(memo)}
    </div>
    <div class="dosing-consult">
      <strong>○ 한약 상담은 한의원에서</strong><br />
      한약 복용후 무른 대변 등의 가벼운 설사나 소화장애, 현기증, 두통, 불쾌감, 미열, 생리량의 변화 혹은 신체의 통증이나 뻐근함등이 있을 수 있습니다.
      이는 한약 복용에 따른 자연스러운 반응이므로 걱정마시고 한의원으로 연락 주시면 상담을 통해 복용방법을 통해 안내드리겠습니다.<br />
      한약 복용중 다른 질환(감기 등)이 생겼을 경우, 일단 한약의 복용을 중단하시고 한의원으로 문의해 주세요
      치료의 우선순위 설정 및 추가 치료에 대한 상담을 받으실 수 있습니다.
    </div>
    <div class="dosing-final-copy">
      장위365경희한의원의 모든 한약은 맞춤처방으로 한의사가 직접 처방합니다.
      장위365경희한의원의 한약은 GMP인증을 받은 회사의 엄격한 기준의 의약품용한약재로 조재한 정품한약입니다.
      장위365경희한의원은 의료법 시행규칙 33조, 의약품 등의 안전에 관한 규칙의 품질관리규정에 따라 식약처 인증 의약품용 한약재만을 사용합니다.
    </div>
  `;
}

function dosingDocumentValues() {
  const dosing = currentDosingValues();
  const patient = document.querySelector('[name="patientName"]').value.trim() || "환자";
  const doctor = document.querySelector('[name="doctorName"]').value.trim() || "담당원장";
  const date = document.querySelector('[name="prescriptionDate"]').value || new Date().toISOString().slice(0, 10);
  return {
    patient,
    doctor,
    date,
    course: dosing.totalCourseCount || dosing.currentCourseNo
      ? `${dosing.totalCourseCount || "?"}회 처방 예정중, ${dosing.currentCourseNo || "?"}번째 한약입니다`
      : "처방 회차 미입력",
    days: formatDaysAndPacks(dosing.dailyDays),
    method: [
      dosing.dailyDoseCount ? `하루 ${dosing.dailyDoseCount}번` : "하루 복용 횟수 미입력",
      dosing.doseTiming.length ? dosing.doseTiming.join(", ") : "복용 시간 미선택",
      dosing.mealTiming ? `${dosing.mealTiming}${dosing.mealOffsetMinutes ? ` ${dosing.mealOffsetMinutes}분` : ""}` : "식전/식후 미선택",
    ].join(" · "),
    doseTiming: dosing.doseTiming,
    mealTiming: dosing.mealTiming,
    mealOffsetMinutes: dosing.mealOffsetMinutes,
    avoidFoods: dosing.avoidFoods,
    memo: dosing.memo || "특별 메모 없음",
  };
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const lines = [];
  String(text).split("\n").forEach((paragraph) => {
    let line = "";
    paragraph.split(" ").forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    lines.push(line);
  });
  lines.forEach((line) => {
    context.fillText(line, x, y);
    y += lineHeight;
  });
  return y;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function drawDosingImage() {
  const data = dosingDocumentValues();
  await document.fonts?.ready;
  let logo = null;
  try {
    logo = await loadImage("./assets/hospital-logo.png");
  } catch {
    logo = null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext("2d");
  const margin = 88;
  const width = canvas.width - margin * 2;
  let y = 78;

  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#9d1f2b";
  context.fillRect(0, 0, canvas.width, 14);

  if (logo) {
    const logoW = 650;
    const logoH = logoW * (logo.naturalHeight / logo.naturalWidth);
    context.drawImage(logo, (canvas.width - logoW) / 2, y - 26, logoW, logoH);
    y += logoH + 16;
  } else {
    context.textAlign = "center";
    context.fillStyle = "#9d1f2b";
    context.font = "700 24px Malgun Gothic, Arial";
    context.fillText("장위365경희한의원", canvas.width / 2, y);
    y += 54;
  }
  context.textAlign = "center";
  context.fillStyle = "#211a16";
  context.font = "900 52px 'Noto Serif KR', Batang, serif";
  context.fillText("한약 복용법", canvas.width / 2, y);
  y += 46;
  context.fillStyle = "#63584d";
  context.font = "500 25px 'Noto Sans KR', Malgun Gothic, Arial";
  context.fillText(`이 한약은 ${data.patient}님의 증상을 위한 맞춤 한약입니다.`, canvas.width / 2, y);
  y += 54;

  context.textAlign = "left";
  const boxGap = 18;
  const boxW = (width - boxGap) / 2;
  const drawBox = (x, top, label, value) => {
    context.strokeStyle = "#cfc3ad";
    context.fillStyle = "#fff";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(x, top, boxW, 86, 12);
    context.fill();
    context.stroke();
    context.fillStyle = "#6a5538";
    context.font = "900 18px 'Noto Sans KR', Malgun Gothic, Arial";
    context.fillText(label, x + 18, top + 30);
    context.fillStyle = "#211a16";
    context.font = "700 24px 'Noto Serif KR', Batang, serif";
    wrapCanvasText(context, value, x + 18, top + 63, boxW - 36, 30);
  };
  drawBox(margin, y, "처방 회차", data.course);
  drawBox(margin + boxW + boxGap, y, "N일분", data.days);
  y += 104;
  drawBox(margin, y, "복용 방법", data.method);
  drawBox(margin + boxW + boxGap, y, "조제 정보", `${data.doctor} 처방 · ${data.date}`);
  y += 126;

  const section = (title) => {
    context.fillStyle = "#9d1f2b";
    context.beginPath();
    context.roundRect(margin, y, 156, 38, 19);
    context.fill();
    context.fillStyle = "#fff";
    context.font = "900 23px 'Noto Serif KR', Batang, serif";
    context.fillText(title, margin + 18, y + 27);
    y += 58;
  };
  const pill = (text, checked, x, top, minWidth = 114) => {
    const pillWidth = Math.max(minWidth, context.measureText(text).width + 42);
    context.fillStyle = checked ? "#9d1f2b" : "#fff";
    context.strokeStyle = checked ? "#9d1f2b" : "#d9d0be";
    context.beginPath();
    context.roundRect(x, top, pillWidth, 42, 21);
    context.fill();
    context.stroke();
    context.fillStyle = checked ? "#fff" : "#777";
    context.font = "800 21px 'Noto Sans KR', Malgun Gothic, Arial";
    context.fillText(`${checked ? "✓ " : ""}${text}`, x + 18, top + 28);
    return pillWidth;
  };

  section("복용방법");
  let x = margin;
  ["아침", "점심", "저녁", "취침전"].forEach((name) => {
    x += pill(name, data.doseTiming.includes(name), x, y) + 12;
  });
  y += 58;
  x = margin;
  ["식전", "식후", "공복 가능"].forEach((name) => {
    const checked = data.mealTiming === name;
    const text = checked && name !== "공복 가능" && data.mealOffsetMinutes ? `${name} ${data.mealOffsetMinutes}분` : name;
    x += pill(text, checked, x, y, 130) + 12;
  });
  y += 72;

  context.strokeStyle = "#e0d7c8";
  context.fillStyle = "#fcfaf5";
  context.beginPath();
  context.roundRect(margin, y, width, 104, 12);
  context.fill();
  context.stroke();
  context.fillStyle = "#44504a";
  context.font = "500 20px 'Noto Sans KR', Malgun Gothic, Arial";
  y = wrapCanvasText(
    context,
    "장위365경희한의원 정품 한약은 순수한 천연재료만 사용합니다. 더운 날씨에는 냉장보관하시기 바랍니다.\n침전물이 생길 수 있으나 품질에는 영향이 없습니다. 드시기 전에 가볍게 흔들거나 저어서 드세요.",
    margin + 22,
    y + 32,
    width - 44,
    29
  ) + 26;

  section("주의해야 할 음식");
  x = margin;
  const foods = data.avoidFoods.length ? data.avoidFoods : ["선택된 주의 음식 없음"];
  foods.forEach((food) => {
    const nextW = Math.max(124, context.measureText(food).width + 40);
    if (x + nextW > canvas.width - margin) {
      x = margin;
      y += 52;
    }
    x += pill(food, data.avoidFoods.length > 0, x, y, 124) + 10;
  });
  y += 66;

  context.strokeStyle = "#ded6c5";
  context.fillStyle = "#fff";
  context.beginPath();
  context.roundRect(margin, y, width, 76, 12);
  context.fill();
  context.stroke();
  context.fillStyle = "#39443f";
  context.font = "900 20px 'Noto Serif KR', Batang, serif";
  context.fillText("특별히 주의해야 할 사항", margin + 20, y + 29);
  context.font = "500 20px 'Noto Sans KR', Malgun Gothic, Arial";
  wrapCanvasText(context, data.memo, margin + 20, y + 57, width - 40, 28);
  y += 100;

  context.fillStyle = "#fbfaf7";
  context.strokeStyle = "#e5ddcf";
  context.beginPath();
  context.roundRect(margin, y, width, 228, 12);
  context.fill();
  context.stroke();
  context.fillStyle = "#4d5752";
  context.font = "900 20px 'Noto Serif KR', Batang, serif";
  context.fillText("○ 한약 상담은 한의원에서", margin + 20, y + 32);
  context.font = "500 19px 'Noto Sans KR', Malgun Gothic, Arial";
  y = wrapCanvasText(
    context,
    "한약 복용후 무른 대변 등의 가벼운 설사나 소화장애, 현기증, 두통, 불쾌감, 미열, 생리량의 변화 혹은 신체의 통증이나 뻐근함등이 있을 수 있습니다. 이는 한약 복용에 따른 자연스러운 반응이므로 걱정마시고 한의원으로 연락 주시면 상담을 통해 복용방법을 통해 안내드리겠습니다.\n한약 복용중 다른 질환(감기 등)이 생겼을 경우, 일단 한약의 복용을 중단하시고 한의원으로 문의해 주세요 치료의 우선순위 설정 및 추가 치료에 대한 상담을 받으실 수 있습니다.",
    margin + 20,
    y + 66,
    width - 40,
    28
  ) + 22;

  context.fillStyle = "#fff";
  context.strokeStyle = "#e0d7c8";
  context.beginPath();
  context.roundRect(margin, y, width, 150, 12);
  context.fill();
  context.stroke();
  context.fillStyle = "#4d5752";
  context.font = "500 18px 'Noto Sans KR', Malgun Gothic, Arial";
  wrapCanvasText(
    context,
    "장위365경희한의원의 모든 한약은 맞춤처방으로 한의사가 직접 처방합니다. 장위365경희한의원의 한약은 GMP인증을 받은 회사의 엄격한 기준의 의약품용한약재로 조재한 정품한약입니다. 장위365경희한의원은 의료법 시행규칙 33조, 의약품 등의 안전에 관한 규칙의 품질관리규정에 따라 식약처 인증 의약품용 한약재만을 사용합니다.",
    margin + 20,
    y + 34,
    width - 40,
    26
  );

  return canvas;
}

async function copyDosingImageToClipboard() {
  const status = document.querySelector("#dosingOutputStatus");
  let blob = null;
  try {
    status.textContent = "이미지 복사 준비 중...";
    renderDosingPreview();
    const canvas = await drawDosingImage();
    blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob || !navigator.clipboard || !window.ClipboardItem) {
      throw new Error("clipboard-unavailable");
    }
    await Promise.race([
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]),
      new Promise((_, reject) => setTimeout(() => reject(new Error("clipboard-timeout")), 2500)),
    ]);
    status.textContent = "이미지를 클립보드에 복사했습니다.";
  } catch {
    if (blob) {
      downloadBlob(blob, dosingImageFileName("png"));
      status.textContent = "클립보드 권한이 막혀 PNG로 다운로드했습니다.";
      return;
    }
    status.textContent = "복사 권한이 막히면 PDF 저장/인쇄를 사용해주세요.";
  }
}

function dosingImageFileName(extension) {
  const patient = document.querySelector('[name="patientName"]').value.trim() || "환자";
  const date = document.querySelector('[name="prescriptionDate"]').value || new Date().toISOString().slice(0, 10);
  return `약복용법_${patient}_${date}.${extension}`;
}

function printDosingDocument() {
  renderDosingPreview();
  const preview = document.querySelector("#dosingPreview");
  const logoUrl = new URL("./assets/hospital-logo.png", window.location.href).href;
  const printFrame = document.createElement("iframe");
  printFrame.className = "print-frame";
  printFrame.setAttribute("aria-hidden", "true");
  document.body.appendChild(printFrame);

  const documentHtml = `
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>한약 복용법</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&family=Noto+Serif+KR:wght@500;600;700;900&display=swap" rel="stylesheet" />
    <style>
      @page { size: A4; margin: 10mm; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; color: #201915; }
      body { width: 190mm; min-height: 277mm; font-family: "Noto Sans KR", "Malgun Gothic", Arial, sans-serif; }
      #dosingPreview {
        position: relative;
        width: 190mm;
        max-width: 190mm;
        min-height: 0;
        margin: 0;
        padding: 6mm 0 0;
        border: 0;
        border-radius: 0;
        background: #fff;
        box-shadow: none;
        overflow: hidden;
        font-size: 10pt;
      }
      #dosingPreview::before {
        content: "";
        position: absolute;
        inset: 0 0 auto;
        height: 2mm;
        background: linear-gradient(90deg, #9d1f2b 0%, #b89b59 58%, #d7c087 100%);
      }
      .dosing-paper-head {
        display: flex;
        align-items: center;
        gap: 7mm;
        border-bottom: 1px solid #b89b59;
        padding: 2mm 0 5mm;
        margin-bottom: 6mm;
      }
      .dosing-preview-logo {
        width: 46mm;
        height: auto;
        object-fit: contain;
        flex: 0 0 auto;
      }
      .dosing-paper-title {
        min-width: 0;
        flex: 1;
        border-left: 1px solid #eadfcc;
        padding-left: 7mm;
      }
      h3 {
        margin: 0 0 2mm;
        color: #261b16;
        font-family: "Noto Serif KR", "Batang", serif;
        font-size: 21pt;
        font-weight: 900;
        line-height: 1.1;
      }
      .dosing-paper-title p {
        margin: 0;
        color: #63584d;
        font-size: 10.5pt;
        font-weight: 500;
        line-height: 1.45;
      }
      .dosing-paper-title strong {
        color: #9d1f2b;
        font-family: "Noto Serif KR", "Batang", serif;
        font-size: 13pt;
        font-weight: 900;
      }
      .dosing-summary-table {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border-top: 1px solid #cfc3ad;
        border-left: 1px solid #cfc3ad;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 5.5mm;
      }
      .dosing-summary-table div {
        display: grid;
        grid-template-columns: 26mm minmax(0, 1fr);
        align-items: stretch;
        min-height: 14mm;
        border-right: 1px solid #cfc3ad;
        border-bottom: 1px solid #cfc3ad;
        background: #fff;
      }
      .dosing-summary-table span {
        display: flex;
        align-items: center;
        background: #faf6ee;
        color: #6a5538;
        padding: 0 3mm;
        font-size: 8.4pt;
        font-weight: 900;
        white-space: nowrap;
      }
      .dosing-summary-table strong {
        display: flex;
        align-items: center;
        min-width: 0;
        padding: 2mm 4mm;
        color: #211a16;
        font-family: "Noto Serif KR", "Batang", serif;
        font-size: 10.4pt;
        font-weight: 700;
        line-height: 1.35;
        overflow-wrap: anywhere;
      }
      .dosing-paper-section {
        margin: 4.5mm 0 3.5mm;
      }
      .dosing-paper-section h4 {
        display: flex;
        align-items: center;
        gap: 2mm;
        margin: 0 0 2.5mm;
        color: #251b16;
        font-family: "Noto Serif KR", "Batang", serif;
        font-size: 12.5pt;
        font-weight: 900;
      }
      .dosing-paper-section h4::before {
        content: "";
        width: 1.4mm;
        height: 4.2mm;
        border-radius: 999px;
        background: #b89b59;
      }
      .dosing-checks, .dosing-caution-chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 2mm;
        margin: 2mm 0;
      }
      .dosing-checks span, .caution-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 8.2mm;
        min-width: 21mm;
        border: 1px solid #d5cab8;
        border-radius: 4px;
        background: #fff;
        color: #7a6b5b;
        padding: 0 3mm;
        font-size: 9.2pt;
        font-weight: 800;
      }
      .dosing-checks span.checked {
        border-color: #9d1f2b;
        background: #9d1f2b;
        color: #fff;
      }
      .caution-chip {
        border-color: #dbcaa9;
        background: #fbf3df;
        color: #6b4d18;
      }
      .caution-chip.quiet {
        border-color: #d9d0be;
        background: #fff;
        color: #63584d;
      }
      .dosing-info-copy {
        border: 0;
        border-left: 0.8mm solid #b99b58;
        border-radius: 0 4px 4px 0;
        background: #fcfaf5;
        padding: 3mm 4mm;
        color: #50483d;
        font-size: 8.8pt;
        font-weight: 500;
        line-height: 1.55;
        break-inside: avoid;
      }
      .dosing-caution {
        border: 1px solid #ddd3c4;
        border-radius: 4px;
        background: #fffefb;
        padding: 3mm 4mm;
        color: #3e352d;
        font-size: 8.8pt;
        font-weight: 500;
        line-height: 1.55;
        break-inside: avoid;
      }
      .dosing-consult {
        margin-top: 3mm;
        border: 1px solid #e5ddcf;
        border-radius: 4px;
        background: #fbfaf7;
        padding: 3.5mm 4mm;
        color: #4b453f;
        font-size: 8pt;
        font-weight: 500;
        line-height: 1.62;
        break-inside: avoid;
      }
      .dosing-consult strong {
        display: block;
        margin-bottom: 1mm;
        color: #8c1824;
        font-family: "Noto Serif KR", "Batang", serif;
        font-size: 9.4pt;
        font-weight: 900;
      }
      .dosing-final-copy {
        margin-top: 3mm;
        border-top: 1px solid #e6ddd0;
        padding: 2.5mm 0 0;
        color: #686057;
        font-size: 7.4pt;
        font-weight: 500;
        line-height: 1.55;
      }
    </style>
  </head>
  <body>
    ${preview.outerHTML.replaceAll("./assets/hospital-logo.png", logoUrl)}
  </body>
</html>`;

  const frameDocument = printFrame.contentWindow.document;
  frameDocument.open();
  frameDocument.write(documentHtml);
  frameDocument.close();
  printFrame.onload = () => {
    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => printFrame.remove(), 1000);
    }, 500);
  };
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

document.addEventListener("click", (event) => {
  const machineStartButton = event.target.closest("[data-action='start-machine']");
  if (machineStartButton) {
    const item = state.prescriptions.find((prescription) => prescription.id === machineStartButton.dataset.id);
    if (item) {
      openStaffModal({
        id: item.id,
        role: "decoction",
        title: "탕전셋팅담당 선택",
        subtitle: `${workflowDisplayName(item)} ${machineStartButton.textContent.trim()}합니다.`,
        action: "start-machine",
        machineId: machineStartButton.dataset.machine,
      });
    }
    return;
  }

  const actionButton = event.target.closest("[data-action='advance']");
  if (actionButton) {
    const item = state.prescriptions.find((prescription) => prescription.id === actionButton.dataset.id);
    const staffPrompt = item ? roleForAdvance(item) : null;
    if (item && staffPrompt) {
      openStaffModal({ id: item.id, action: "advance", ...staffPrompt });
    } else if (item?.status === "조제중") {
      openDispensePhotoModal(item.id);
    } else {
      advancePrescription(actionButton.dataset.id);
    }
    return;
  }

  const revertButton = event.target.closest("[data-action='revert']");
  if (revertButton) revertPrescription(revertButton.dataset.id);

  const viewButton = event.target.closest("[data-action='view-prescription']");
  if (viewButton) openPrescriptionModal(viewButton.dataset.id);

  if (event.target.closest("#printDosingButton")) {
    printDosingDocument();
  }

  if (event.target.closest("#copyDosingImageButton")) {
    copyDosingImageToClipboard();
  }
});

document.querySelector("#closePrescriptionModal").addEventListener("click", closePrescriptionModal);
document.querySelector("#prescriptionModal").addEventListener("click", (event) => {
  if (event.target.id === "prescriptionModal") closePrescriptionModal();
});

document.querySelector("#closeStaffModal").addEventListener("click", closeStaffModal);
document.querySelector("#skipStaffButton").addEventListener("click", () => confirmStaffChoice(""));
document.querySelector("#staffModal").addEventListener("click", (event) => {
  const choice = event.target.closest("[data-staff-choice]");
  if (choice) confirmStaffChoice(choice.dataset.staffChoice);
  if (event.target.id === "staffModal") closeStaffModal();
});

document.querySelector("#closeCameraModal").addEventListener("click", () => closeCameraModal());
document.querySelector("#captureDispensePhotoButton").addEventListener("click", captureDispensePhoto);
document.querySelector("#saveDispensePhotoButton").addEventListener("click", saveDispensePhotoAndAdvance);
document.querySelector("#skipDispensePhotoButton").addEventListener("click", () => closeCameraModal({ advance: true }));
document.querySelector("#dispensePhotoUpload").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  readUploadedDispensePhoto(file);
});
document.querySelector("#cameraModal").addEventListener("click", (event) => {
  if (event.target.id === "cameraModal") closeCameraModal();
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#statusFilter").addEventListener("change", renderPrescriptionList);
document.querySelector("#categoryFilter").addEventListener("change", renderPrescriptionList);
document.querySelector("#reportMonth").addEventListener("change", renderReports);
document.querySelector("#reportDoctor").addEventListener("change", renderReports);
document.querySelector("#addHerbButton").addEventListener("click", () => addHerbRow());
document.querySelector("#herbBulkInput").addEventListener("input", (event) => {
  const parsed = parseHerbText(event.target.value);
  if (parsed.length) renderHerbRows(parsed);
});
document.querySelector("#gobangSearchInput")?.addEventListener("input", renderGobangResults);
document.querySelector("#gobangResults")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-gobang-no]");
  if (!button) return;
  applyGobangPrescription(button.dataset.gobangNo, button.dataset.gobangTitle);
});
document.querySelector("#prescriptionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  createPrescription(event.currentTarget);
});

document.querySelector("#prescriptionForm").addEventListener("input", renderDosingPreview);
document.querySelector("#prescriptionForm").addEventListener("change", renderDosingPreview);

document.querySelector(".dosing-template-row").addEventListener("click", (event) => {
  const button = event.target.closest("[data-dosing-template]");
  if (!button) return;
  applyDosingTemplate(button.dataset.dosingTemplate);
});

document.querySelector(".food-tools").addEventListener("click", (event) => {
  const button = event.target.closest("[data-food-template]");
  if (!button) return;
  applyFoodTemplate(button.dataset.foodTemplate);
});

document.querySelector("#resetDataButton").addEventListener("click", () => {
  state = structuredClone(initialState);
  render();
});

document.querySelector("#exportBackupButton").addEventListener("click", exportBackup);

document.querySelector("#importBackupButton").addEventListener("click", () => {
  document.querySelector("#backupFileInput").click();
});

document.querySelector("#backupFileInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  await importBackupFile(file);
  event.target.value = "";
});

document.querySelector("#syncSchedulePeopleButton")?.addEventListener("click", () => syncPeopleFromSchedule());

document.querySelector("#mockStockButton").addEventListener("click", () => {
  state.herbs = state.herbs.map((herb) => ({ ...herb, stock: herb.stock + herb.safety }));
  addHistory("샘플 재고가 보충됨");
  render();
});

document.querySelector("#invoiceImageInput").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const preview = document.querySelector("#invoicePreview");
  preview.src = URL.createObjectURL(file);
  preview.classList.add("active");
});

document.querySelector("#sampleInvoiceButton").addEventListener("click", () => {
  document.querySelector("#invoiceTextInput").value = "갈근 1000g\n감초 500g\n녹각교질 60g\n작약 1kg";
});

document.querySelector("#parseInvoiceButton").addEventListener("click", () => {
  invoiceRows = parseInvoiceText(document.querySelector("#invoiceTextInput").value);
  renderInvoiceRows();
});

document.querySelector("#invoiceRows").addEventListener("input", (event) => {
  const input = event.target.closest("[data-invoice-field]");
  if (!input) return;
  const row = invoiceRows[Number(input.dataset.index)];
  row[input.dataset.invoiceField] = input.dataset.invoiceField === "amount" ? Number(input.value) : input.value;
});

document.querySelector("#invoiceRows").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-invoice]");
  if (!button) return;
  invoiceRows.splice(Number(button.dataset.removeInvoice), 1);
  renderInvoiceRows();
});

document.querySelector("#applyInvoiceButton").addEventListener("click", applyInvoiceRows);

document.querySelector("#doctorQuickRow").addEventListener("click", (event) => {
  const button = event.target.closest("[data-select-doctor]");
  if (!button) return;
  document.querySelector('[name="doctorName"]').value = button.dataset.selectDoctor;
  renderDoctors();
});

document.querySelector("#addDoctorButton").addEventListener("click", () => {
  const input = document.querySelector("#doctorNameInput");
  const name = input.value.trim();
  if (!name || doctors.includes(name)) return;
  doctors.push(name);
  input.value = "";
  saveDoctors();
  renderDoctors();
});

document.querySelector("#doctorSettingsList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-doctor]");
  if (!button) return;
  doctors.splice(Number(button.dataset.deleteDoctor), 1);
  if (!doctors.length) doctors = DEFAULT_DOCTORS.slice();
  saveDoctors();
  renderDoctors();
});

document.querySelector("#addStaffButton").addEventListener("click", () => {
  const input = document.querySelector("#staffNameInput");
  const name = input.value.trim();
  if (!name || staffMembers.includes(name)) return;
  staffMembers.push(name);
  input.value = "";
  saveStaffMembers();
  renderStaffMembers();
});

document.querySelector("#staffSettingsList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-staff]");
  if (!button) return;
  staffMembers.splice(Number(button.dataset.deleteStaff), 1);
  if (!staffMembers.length) staffMembers = DEFAULT_STAFF.slice();
  saveStaffMembers();
  renderStaffMembers();
});

document.querySelector("#categoryRow").addEventListener("click", (event) => {
  const button = event.target.closest("[data-type]");
  if (!button) return;
  document.querySelector('[name="category"]').value = button.dataset.type;
  renderCategoryButtons();
  updateRoundField();
});

document.querySelectorAll("[data-add-option]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.addOption;
    const input = document.querySelector({
      categories: "#categoryOptionInput",
      pouches: "#pouchOptionInput",
      leftovers: "#leftoverOptionInput",
    }[key]);
    const value = input.value.trim();
    if (!value || options[key].includes(value)) return;
    options[key].push(value);
    input.value = "";
    saveOptions();
    renderOptions();
  });
});

document.querySelector("#settingsView").addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-option]");
  if (!button) return;
  const key = button.dataset.deleteOption;
  options[key].splice(Number(button.dataset.index), 1);
  if (!options[key].length) options[key] = defaultOptions()[key].slice(0, 1);
  saveOptions();
  renderOptions();
  updateRoundField();
});

document.querySelector("#standbyList")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-standby]");
  if (!button) return;
  addStandbyToWorkflow(Number(button.dataset.addStandby));
});

document.querySelector("#saveStandbyButton")?.addEventListener("click", () => {
  standbyText = document.querySelector("#standbyTextInput").value.trim();
  saveStandbyText();
  saveLocalBackup();
  renderStandbyMedicines();
  alert("상비약 처방을 저장했습니다.");
});

document.querySelector("#resetStandbyButton")?.addEventListener("click", () => {
  standbyText = DEFAULT_STANDBY_TEXT;
  saveStandbyText();
  saveLocalBackup();
  renderStandbyMedicines();
});

document.querySelector("#saveGobangButton")?.addEventListener("click", () => {
  const nextText = document.querySelector("#gobangTextInput").value.trim();
  const nextItems = parseGobangText(nextText);
  if (!nextItems.length) {
    alert("고방 처방을 1개 이상 입력해 주세요.");
    return;
  }
  gobangText = nextText;
  gobangPrescriptions = nextItems;
  saveGobangText();
  saveLocalBackup();
  renderGobangResults();
  renderGobangSettings();
  alert("고방 처방을 저장했습니다.");
});

document.querySelector("#resetGobangButton")?.addEventListener("click", () => {
  gobangText = DEFAULT_GOBANG_TEXT;
  gobangPrescriptions = parseGobangText(gobangText);
  saveGobangText();
  saveLocalBackup();
  renderGobangResults();
  renderGobangSettings();
});

document.querySelectorAll("[data-round-step]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.querySelector("#roundNumber");
    const next = Math.max(1, Number(input.value || 1) + Number(button.dataset.roundStep));
    input.value = next;
    updateRoundField();
  });
});

document.querySelector("#roundNumber").addEventListener("input", updateRoundField);

document.querySelector("#presetRow").addEventListener("click", (event) => {
  const presetButton = event.target.closest("[data-preset-index]");
  const deleteButton = event.target.closest("[data-delete-preset]");
  const editButton = event.target.closest("[data-edit-preset]");

  if (deleteButton) {
    presets.splice(Number(deleteButton.dataset.deletePreset), 1);
    savePresets();
    renderPresets();
    return;
  }

  if (editButton) {
    presets[Number(editButton.dataset.editPreset)] = currentPresetValues();
    savePresets();
    renderPresets();
    return;
  }

  if (presetButton) {
    const preset = presets[Number(presetButton.dataset.presetIndex)];
    document.querySelector('[name="packCount"]').value = preset.packCount;
    document.querySelector('[name="pouchVolume"]').value = preset.pouchVolume;
    document.querySelector('[name="pouchCount"]').value = preset.pouchCount;
    document.querySelector('[name="waterAmount"]').value = preset.waterAmount;
  }
});

document.querySelector("#savePresetButton").addEventListener("click", () => {
  const preset = currentPresetValues();
  const exists = presets.some((item) =>
    item.packCount === preset.packCount &&
    item.pouchVolume === preset.pouchVolume &&
    item.pouchCount === preset.pouchCount &&
    item.waterAmount === preset.waterAmount
  );
  if (!exists) presets.push(preset);
  savePresets();
  renderPresets();
});

function currentPresetValues() {
  return {
    packCount: Number(document.querySelector('[name="packCount"]').value || 0),
    pouchVolume: Number(document.querySelector('[name="pouchVolume"]').value || 0),
    pouchCount: Number(document.querySelector('[name="pouchCount"]').value || 0),
    waterAmount: Number(document.querySelector('[name="waterAmount"]').value || 0),
  };
}

function updateRoundField() {
  const type = document.querySelector('[name="category"]').value;
  const round = document.querySelector("#roundNumber").value || 1;
  document.querySelector('[name="round"]').value = `${round}차 ${type}`;
}

function applyDosingTemplate(template) {
  const form = document.querySelector("#prescriptionForm");
  const values = {
    "twice-after": { dailyDoseCount: 2, mealTiming: "식후", mealOffsetMinutes: 30, doseTiming: ["아침", "저녁"] },
    "twice-before": { dailyDoseCount: 2, mealTiming: "식전", mealOffsetMinutes: 30, doseTiming: ["아침", "저녁"] },
    "three-after": { dailyDoseCount: 3, mealTiming: "식후", mealOffsetMinutes: 30, doseTiming: ["아침", "점심", "저녁"] },
    "empty-ok": { dailyDoseCount: 2, mealTiming: "공복 가능", mealOffsetMinutes: "", doseTiming: ["아침", "저녁"] },
  }[template];
  if (!values) return;

  form.elements.dailyDoseCount.value = values.dailyDoseCount;
  form.elements.mealOffsetMinutes.value = values.mealOffsetMinutes;
  form.querySelectorAll('[name="doseTiming"]').forEach((input) => {
    input.checked = values.doseTiming.includes(input.value);
  });
  form.querySelectorAll('[name="mealTiming"]').forEach((input) => {
    input.checked = input.value === values.mealTiming;
  });
  renderDosingPreview();
}

function applyFoodTemplate(template) {
  const basicFoods = ["밀가루 음식", "튀긴 음식", "인스턴트 음식", "차고 냉한 음식", "짜고 매운 음식", "음주", "흡연", "커피"];
  document.querySelectorAll('[name="avoidFoods"]').forEach((input) => {
    input.checked = template === "basic" && basicFoods.includes(input.value);
  });
  renderDosingPreview();
}

function setPrescriptionDefaults() {
  document.querySelector('[name="doctorName"]').value = doctors[0] || DEFAULT_DOCTORS[0];
  document.querySelector('[name="prescriptionDate"]').valueAsDate = new Date();
  document.querySelector('[name="totalCourseCount"]').value = 6;
  document.querySelector('[name="currentCourseNo"]').value = 1;
  document.querySelector('[name="dailyDoseCount"]').value = 2;
  document.querySelector('[name="mealOffsetMinutes"]').value = 30;
  document.querySelector('[name="doseTiming"][value="아침"]').checked = true;
  document.querySelector('[name="doseTiming"][value="저녁"]').checked = true;
  document.querySelector('[name="mealTiming"][value="식후"]').checked = true;
  updateRoundField();
  renderDosingPreview();
}

document.querySelector("#herbBulkInput").value = "갈근40 마황 생강 대조6 계지 작약 감초4";
renderHerbRows(parseHerbText(document.querySelector("#herbBulkInput").value));
setPrescriptionDefaults();
render();
renderLastSyncStatus();

// 페이지 로드 시 장위스케쥴에서 원장/직원 자동 동기화 (실패 시 localStorage 폴백)
syncPeopleFromSchedule({ silent: true });
