import { AlertTriangle, CheckCircle2, Clock, Gauge, Target, TrendingDown, Layers } from 'lucide-react';
import { SimulationResult } from '../types/production';

interface KpiCardsProps {
  simulation: SimulationResult;
  targetUnits: number;
}

export function KpiCards({ simulation, targetUnits }: KpiCardsProps) {
  const isBottleneck = simulation.bottleneckProcessesCount > 0;
  const isWarning = simulation.warningProcessesCount > 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. 일일 생산 목표 & 총 생산 예정 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">일일 생산 목표</span>
          <Target className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {targetUnits.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">대</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>예정 합계</span>
          <span className="font-mono tabular-nums font-semibold text-slate-700">
            {simulation.totalPlannedUnits.toLocaleString()}대
          </span>
        </div>
      </div>

      {/* 2. 목표 Takt Time & 가용시간 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">목표 Takt Time</span>
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tabular-nums text-blue-700">
            {simulation.targetTaktTime.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">초/대</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>가용 시간</span>
          <span className="font-mono tabular-nums font-semibold text-slate-700">
            {simulation.availableMinutes}분 ({simulation.availableSeconds.toLocaleString()}초)
          </span>
        </div>
      </div>

      {/* 3. 최대 공정 CT (라인 CT) & 병목 공정 */}
      <div className={`border rounded-xl p-4 shadow-xs transition-colors ${
        isBottleneck 
          ? 'bg-rose-50/50 border-rose-200' 
          : isWarning 
          ? 'bg-amber-50/50 border-amber-200' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">라인 Cycle Time</span>
          <Gauge className={`w-4 h-4 ${isBottleneck ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-mono tabular-nums ${isBottleneck ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-slate-900'}`}>
            {simulation.lineCT.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">초</span>
        </div>
        <div className="mt-2 text-[11px] flex items-center justify-between truncate">
          <span className="text-slate-500">지배 병목</span>
          <span className={`font-semibold truncate max-w-[90px] ${isBottleneck ? 'text-rose-700' : 'text-slate-700'}`}>
            {simulation.maxBottleneckProcess?.processName || '-'}
          </span>
        </div>
      </div>

      {/* 4. 예상 생산 가능 대수 & 달성률 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">예상 생산 가능 대수</span>
          {simulation.achievementRate >= 100 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-500" />
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {simulation.estimatedDailyOutput.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500">대</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>목표 달성률</span>
          <span className={`font-mono tabular-nums font-semibold ${
            simulation.achievementRate >= 100 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {simulation.achievementRate}%
          </span>
        </div>
      </div>

      {/* 5. 라인 밸런싱 효율 (LBE) - 10년차 시니어 추천 지표 */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">라인 밸런싱 효율</span>
          </div>
          <Layers className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {simulation.lineEfficiency.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500">%</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>불균형 손실</span>
          <span className="font-mono tabular-nums font-semibold text-slate-700">
            {(100 - simulation.lineEfficiency).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 6. 병목 위험 상태 종합 요약 */}
      <div className={`border rounded-xl p-4 shadow-xs flex flex-col justify-between ${
        isBottleneck 
          ? 'bg-rose-50 border-rose-200 text-rose-900' 
          : isWarning 
          ? 'bg-amber-50 border-amber-200 text-amber-900' 
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold">라인 가동 판정</span>
          {isBottleneck ? (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          ) : isWarning ? (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">
            {isBottleneck ? '병목 위험 발생' : isWarning ? '고부하 주의 상태' : '안정적 정상 운영'}
          </p>
          <p className="text-[11px] mt-1 opacity-80">
            {isBottleneck
              ? `위험 ${simulation.bottleneckProcessesCount}건 · 주의 ${simulation.warningProcessesCount}건`
              : isWarning
              ? `주의 ${simulation.warningProcessesCount}건 발생`
              : '전 공정 Takt Time 충족'}
          </p>
        </div>
      </div>
    </div>
  );
}
