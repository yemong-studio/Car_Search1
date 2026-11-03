import { useState } from 'react';
import { SENIOR_DEV_FEEDBACK, FeedbackSection } from '../data/seniorFeedback';
import { CheckCircle2, ChevronDown, ChevronRight, FileText, Lightbulb, ShieldAlert, Zap, Layers, Sparkles } from 'lucide-react';

export function SeniorDevReviewView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    critique_sequencing: true,
    critique_option_coupling: true,
    critique_line_balancing: true,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = [
    { id: 'all', label: '전체 보기' },
    { id: '도메인 알고리즘 & 생산 공학', label: '도메인 알고리즘' },
    { id: '데이터 모델링 & 요구사항 정합성', label: '데이터 모델링' },
    { id: '생산 지표 체계', label: '생산 지표' },
    { id: '프론트엔드 엔지니어링', label: '프론트엔드 아키텍처' },
    { id: '현장 UI/UX 엔지니어링', label: '현장 UX' },
  ];

  const filteredItems =
    selectedCategory === 'all'
      ? SENIOR_DEV_FEEDBACK
      : SENIOR_DEV_FEEDBACK.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Hero Executive Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                10년차 풀스택·제조 웹앱 개발자의 기획서 종합 리뷰 및 아키텍처 개선안
              </h3>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                Senior Technical Review
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              본 기획서는 <strong>수학적 시뮬레이션에 집중하고 고비용 AI/MES를 1단계에서 과감히 배제한 점(MVP 스코프 통제)</strong>에서 매우 뛰어난 현실감각을 보여줍니다. 그러나 <strong>실제 자동차 조립공장의 물리적 특성(혼류 투입 순서의 맹점, 옵션-CT 결합도, 라인 밸런싱 효율 누락)</strong>을 보완하지 않으면 실제 현장 관리자에게 외면받을 위험이 있습니다.
            </p>
          </div>
        </div>

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 text-xs">
          <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-lg">
            <span className="font-bold text-teal-800 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              탁월한 기획서 강점
            </span>
            <p className="text-teal-900/80 leading-relaxed text-[11px]">
              TOC(제약이론)의 라인 CT = MAX(평균 CT) 원칙 충실, 수식과 입출력 스펙의 모호함 제로, 개발자 친화적 목업 데이터 완비.
            </p>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-lg">
            <span className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              가장 치명적인 리스크
            </span>
            <p className="text-rose-900/80 leading-relaxed text-[11px]">
              ‘가중평균 CT’의 한계: 평균이 48초라도 Special 3대가 연속 투입되면 라인 스탑. 슬라이딩 윈도우 기반 혼류 투입 제한 룰 보완 필수.
            </p>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg">
            <span className="font-bold text-blue-800 flex items-center gap-1.5 mb-1">
              <Zap className="w-4 h-4 text-blue-600" />
              핵심 권장 개선안
            </span>
            <p className="text-blue-900/80 leading-relaxed text-[11px]">
              라인 밸런싱 효율(LBE) 및 대기 유휴시간(Loss Time) 지표 추가, 옵션 연동 하이브리드 모드, 시나리오 스냅샷 비교표 도입.
            </p>
          </div>
        </div>
      </div>

      {/* Category Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Detailed Feedback Accordion Cards */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isExpanded = !!expandedIds[item.id];

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="w-full text-left p-4.5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm border shrink-0 mt-0.5 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 p-1 shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-xs text-slate-700 space-y-3 bg-slate-50/30">
                  {/* Detailed Analysis Points */}
                  <div>
                    <h5 className="font-bold text-slate-900 mb-1.5 text-[11px] flex items-center gap-1">
                      <span>상세 분석 및 문제 제기</span>
                    </h5>
                    <ul className="space-y-1.5 pl-4 list-disc text-slate-600 leading-relaxed text-[11px]">
                      {item.details.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Concrete Actionable Recommendation */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                    <span className="font-bold text-blue-900 text-[11px] flex items-center gap-1 mb-0.5">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                      10년차 개발자의 구체적 아키텍처 제언:
                    </span>
                    <p className="text-blue-950 text-[11px] leading-relaxed">
                      {item.recommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actionable Phase 1 vs Phase 2 Sprint Roadmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>개발자 관점의 2단계 릴리즈 로드맵 제안 (Sprint Architecture)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Phase 1: MVP 완성도 극대화 */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/40">
            <div className="flex items-center justify-between mb-2">
              <strong className="text-slate-900 font-bold">Phase 1: 현재 MVP (본 앱에 즉각 구현 완료)</strong>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                현재 반영됨
              </span>
            </div>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>기획서 1~18항목 전체 수학적 계산 로직 (가용시간, Takt Time, 가중평균 CT, 부하율)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>공정 CRUD 및 인라인 순서 재배치, 4개 등급 실시간 CT 변경</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>시나리오 A, B, C 및 실시간 Side-by-Side 영향도 매트릭스 비교</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>라인 밸런싱 효율(LBE %) 및 공정별 유휴 대기시간 지표 보강</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>원클릭 CSV 내보내기 및 표준 목업 복원 기능</span>
              </li>
            </ul>
          </div>

          {/* Phase 2: 엔터프라이즈 확장 */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/40">
            <div className="flex items-center justify-between mb-2">
              <strong className="text-slate-900 font-bold">Phase 2: 고도화 (엔터프라이즈 공장 투입용)</strong>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Next Sprint
              </span>
            </div>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">→</span>
                <span>혼류 생산 투입 시퀀싱(Car Sequencing) 시뮬레이터 (1:2:1 교차 투입 검증)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">→</span>
                <span>옵션별 파생 공수(Base CT + Delta CT) 자동 합산 모드 토글</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">→</span>
                <span>실제 MES 생산 실적 데이터(OPC-UA/MQTT) 실시간 인터페이스</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 font-bold">→</span>
                <span>작업자 배분 및 2인 동시 작업(Team Assembly) 공수 분할 모델링</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
