export interface FeedbackSection {
  id: string;
  category: string;
  title: string;
  badge: '강점' | '핵심 개선점' | '아키텍처 제언' | '현장 UX' | '로드맵';
  badgeColor: string;
  summary: string;
  details: string[];
  recommendation: string;
}

export const SENIOR_DEV_FEEDBACK: FeedbackSection[] = [
  {
    id: 'critique_sequencing',
    category: '도메인 알고리즘 & 생산 공학',
    title: '‘가중평균 CT’의 치명적 맹점과 혼류 투입 순서(Sequencing) 한계',
    badge: '핵심 개선점',
    badgeColor: 'border-red-300 text-red-700 bg-red-50',
    summary: '하루 500대 기준 가중평균 CT가 48초 이하로 합격하더라도, 고부하 차량(Special/Premium)이 2~3대 연속 진입하면 실제 라인은 즉시 멈춥니다(Line Stop).',
    details: [
      '가중평균은 하루 전체의 거시적 총량 계산에는 유효하지만, 순차 컨베이어 조립 라인의 물리적 특성상 단 20초의 순간 지연도 전체 라인의 비상 정지(Andon Cord 당김)를 유발합니다.',
      '기획서 17-2에서 이 한계를 인지하고 명시한 점은 매우 훌륭하나, 사용자(생산 관리자)가 "대시보드에서는 정상이랬는데 왜 라인이 터지죠?"라고 반문할 확률이 100%입니다.',
      '개선안: "평균 기반 분석" 배너를 명시하는 것에 그치지 않고, [연속 투입 제한 규칙(Sequencing Rules)] 제안(예: "Special 모델은 최소 3대 간격 분산 투입 필요")을 진단 요약 카드에 추가해야 합니다.',
    ],
    recommendation: '단기적으로는 "최대 허용 연속 투입 대수" 계산 지표를 보완하고, Phase 2에서 슬라이딩 윈도우 기반 혼류 시퀀싱 시뮬레이터를 도입할 것을 강력히 권장합니다.',
  },
  {
    id: 'critique_option_coupling',
    category: '데이터 모델링 & 요구사항 정합성',
    title: '옵션 관리와 공정 CT 간의 비동기 결합(Broken Coupling) 구조',
    badge: '핵심 개선점',
    badgeColor: 'border-amber-300 text-amber-700 bg-amber-50',
    summary: '기획서 5-4에서 "옵션 변경이 CT에 자동 반영되지 않고 참고용"이라 명시했으나, 실제 사용자 관점에서는 UX 인지 부조화와 데이터 불일치를 초래합니다.',
    details: [
      '관리자가 옵션 화면에서 "선루프"를 Classic 등급에 체크했는데, 공정 CT 테이블의 루프 조립 시간(35초)이 그대로 유지된다면 사용자는 시스템 버그로 오인합니다.',
      '현업의 실제 데이터베이스는 [기본 Base CT] + [선택 옵션별 공수(Delta CT)]의 합산 공식으로 관리됩니다.',
      '개선안: 입력 방식을 두 가지 모드로 지원하는 토글을 도입하는 것이 현실적입니다. 1) 현재의 직접 입력 모드(Manual Mode), 2) 옵션 기반 자동 산출 모드(Base + Option Delta CT). 이를 통해 현장 도입 거부감을 줄일 수 있습니다.',
    ],
    recommendation: '현재 MVP에서는 옵션 행에 "해당 옵션이 영향을 주는 공정" 라벨을 매핑하고, 옵션 수정 시 "관련 공정 CT 수정 필요" 알림 툴팁을 연결하여 UX 인지 간극을 메워야 합니다.',
  },
  {
    id: 'critique_line_balancing',
    category: '생산 지표 체계',
    title: '라인 밸런싱 효율(LBE) 및 불균형 유휴 손실(Loss Time) 지표 누락',
    badge: '아키텍처 제언',
    badgeColor: 'border-blue-300 text-blue-700 bg-blue-50',
    summary: '단순히 "어느 공정이 병목인가"만 보면 안 됩니다. 다른 공정들이 낭비하고 있는 대기 시간(Idle Time)이 얼마인지 보여주어야 진짜 생산성 개선이 가능합니다.',
    details: [
      '예를 들어 목업 데이터에서 "시트 장착"이 51.5초로 병목일 때, 바로 다음 "루프 조립"은 37.0초로 무려 대당 14.5초를 멍하니 대기하게 됩니다.',
      '500대 생산 시 루프 공정에서만 7,250초(약 120분, 2시간)의 유휴 낭비가 발생합니다.',
      '현대 생산 관리의 핵심 지표인 라인 밸런싱 효율(Line Balancing Efficiency = ΣCT / (Line CT × 공정수))과 밸런스 딜레이(Balance Delay = 100 - LBE)를 KPI에 추가해야 공정 간 작업 재분배(Line Balancing) 의사결정을 내릴 수 있습니다.',
    ],
    recommendation: '핵심 KPI 카드에 라인 밸런싱 효율(LBE %)을 추가하고, 공정별 분석 테이블에 "대기 유휴시간(Idle Seconds)" 열을 추가하십시오.',
  },
  {
    id: 'critique_state_management',
    category: '프론트엔드 엔지니어링',
    title: '웹 상태 관리의 영속성(Persistence) 및 시나리오 스냅샷 비교',
    badge: '아키텍처 제언',
    badgeColor: 'border-indigo-300 text-indigo-700 bg-indigo-50',
    summary: '단일 세션 메모리 변수만으로는 생산 회의나 교대 근무자 간 시뮬레이션 공유가 불가능합니다. URL Query 기반 상태 및 브라우저 영속화가 필수적입니다.',
    details: [
      '생산 관리자는 시뮬레이션 결과를 타 부서(품질, 노사 협의, 공정기술팀)에 전달해야 합니다.',
      '페이지를 새로고침하면 고생해서 입력한 공정 CT 20개와 등급 대수가 전부 날아간다면 현업에서 버려집니다.',
      '해결책: 1) LocalStorage 자동 임시저장, 2) "공유 링크 생성(State to URL Query Param / Base64 Hash)", 3) "엑셀(CSV) 다운로드 / 업로드", 4) "원클릭 시나리오 스냅샷(Base vs A vs B vs C) 동시 비교표"가 필수적입니다.',
    ],
    recommendation: '시나리오를 탭으로 넘나들며 비교하는 것을 넘어, 한 화면에서 "기준안 vs 시나리오 A vs 시나리오 B"의 차이(Δ CT, Δ 대수, 병목 이동)를 비교하는 나란히(Side-by-side) 매트릭스를 구현해야 합니다.',
  },
  {
    id: 'critique_shopfloor_ux',
    category: '현장 UI/UX 엔지니어링',
    title: '공장 현장 단말기(Shopfloor/Kiosk) 친화적 입력 UX 및 키보드 네비게이션',
    badge: '현장 UX',
    badgeColor: 'border-emerald-300 text-emerald-700 bg-emerald-50',
    summary: '생산 관리 현장은 마우스 클릭보다 키보드 넘버패드 탭(Tab) 이동이 훨씬 빠르고 선호됩니다. 20개 셀의 수동 입력 피로도를 극적으로 낮춰야 합니다.',
    details: [
      '공정 5개 × 등급 4개 = 최소 20개의 숫자 인풋이 표 형태로 배치됩니다.',
      'Excel처럼 방향키(Arrow Keys)나 Enter/Tab 키로 셀 간 직관적 포커스 이동이 지원되어야 입력 누락이나 지연이 없습니다.',
      '모든 숫자에 `tabular-nums` 폰트를 적용하여 숫자가 변경될 때 테이블 레이아웃이 좌우로 흔들리는 지터(Jitter) 현상을 원천 방지해야 합니다.',
      '부동소수점 오차 방지: 등급별 대수 비율 계산 시 `(count / total) * 100` 단순 반올림으로 인해 합계가 99.9%나 100.1%가 되는 현상을 제어해야 합니다.',
    ],
    recommendation: '인라인 에디팅 테이블에 Tab/Shift+Tab 고속 포커스 트래버설을 적용하고, 퀵 시나리오 프리셋 버튼(40:30:20:10, 25:25:25:25 등)을 제공하여 원클릭 입력 편의성을 극대화해야 합니다.',
  },
  {
    id: 'critique_prd_strengths',
    category: '기획서 완성도 평가',
    title: 'MVP 스코프 통제와 수식/목업 데이터의 명확성은 대단히 우수함',
    badge: '강점',
    badgeColor: 'border-teal-300 text-teal-700 bg-teal-50',
    summary: '초기 스타트업이나 제조 DX 프로젝트에서 흔히 범하는 "AI 환각/무리한 MES 연동"을 과감히 1차 스코프에서 배제한 판단력이 매우 돋보입니다.',
    details: [
      '기획서 1-4 및 15-2에서 "복잡한 AI API 및 센서 연동을 배제하고 수학적 시뮬레이션 우선 개발"로 정의한 점은 프로젝트 납기와 품질을 지키는 훌륭한 엔지니어링 감각입니다.',
      '가용시간, Takt Time, 가중평균 CT의 수식과 변수 정의(Section 3, 4, 7, 8)가 명확하여 개발자와의 의사소통 비용이 최소화됩니다.',
      '순차 라인에서 "라인 CT = MAX(공정별 평균 CT)"라는 제약 이론(TOC, Theory of Constraints)의 핵심 원칙을 충실히 반영했습니다.',
    ],
    recommendation: '이 탄탄한 기초 위에 위의 5가지 실무적 보완점을 결합하면, 단순 프로토타입을 넘어 실제 완성차 조립 공장에 당장 파일럿 투입 가능한 고품질 엔터프라이즈 시스템이 됩니다.',
  },
];
