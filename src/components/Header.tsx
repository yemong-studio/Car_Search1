import { Activity, RotateCcw, Download, Sparkles, FileText, BarChart3, Settings2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'processes' | 'scenarios' | 'senior-feedback';
  setActiveTab: (tab: 'dashboard' | 'processes' | 'scenarios' | 'senior-feedback') => void;
  onResetToMock: () => void;
  onExportCsv: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  onResetToMock,
  onExportCsv,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight whitespace-nowrap">
                  병목 현상 탐지 생산 대시보드
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-sm">
                  의장공정 순차라인 v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                차량 등급별 Cycle Time 가중평균 & Takt Time 실시간 시뮬레이터
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              통합 대시보드
            </button>
            <button
              onClick={() => setActiveTab('processes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'processes'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              공정 & 옵션 관리
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'scenarios'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              시나리오 비교 분석
            </button>
            <button
              onClick={() => setActiveTab('senior-feedback')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                activeTab === 'senior-feedback'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              10년차 개발자 기획 리뷰
            </button>
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onResetToMock}
              title="기획서 표준 목업 데이터로 초기화"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">초기 목업 복원</span>
            </button>
            <button
              onClick={onExportCsv}
              title="현재 분석 결과 CSV 다운로드"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
