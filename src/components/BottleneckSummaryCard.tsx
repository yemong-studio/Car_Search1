import { SimulationResult } from '../types/production';
import { AlertTriangle, CheckCircle2, Lightbulb, ShieldAlert, Wrench } from 'lucide-react';

interface BottleneckSummaryCardProps {
  simulation: SimulationResult;
}

export function BottleneckSummaryCard({ simulation }: BottleneckSummaryCardProps) {
  const isBottleneck = simulation.bottleneckProcessesCount > 0;
  const isWarning = simulation.warningProcessesCount > 0;
  const maxProc = simulation.maxBottleneckProcess;

  return (
    <div className={`border rounded-xl p-5 shadow-xs transition-colors ${
      isBottleneck
        ? 'bg-rose-50/40 border-rose-200'
        : isWarning
        ? 'bg-amber-50/40 border-amber-200'
        : 'bg-emerald-50/40 border-emerald-200'
    }`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          {isBottleneck ? (
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
          ) : isWarning ? (
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>병목 분석 요약 및 조치 제언 (기획서 9-4 진단 규칙)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {simulation.ruleBasedDiagnosis.statusText}
            </p>
          </div>
        </div>

        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
          isBottleneck
            ? 'bg-rose-100 text-rose-800'
            : isWarning
            ? 'bg-amber-100 text-amber-800'
            : 'bg-emerald-100 text-emerald-800'
        }`}>
          {isBottleneck ? '라인 지연 불가피' : isWarning ? '공정 부하 주의' : '정상 생산 가능'}
        </span>
      </div>

      {/* Primary Concern Block */}
      {isBottleneck && maxProc && (
        <div className="bg-white/90 border border-rose-200/80 rounded-lg p-3.5 mb-3 text-xs">
          <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
            <span className="text-rose-700">
              [병목 위험 감지] 핵심 지배 공정: {maxProc.processName}
            </span>
            <span className="font-mono text-slate-500">부하율 {maxProc.loadRate}%</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 text-slate-700 font-mono text-[11px] border-y border-slate-100 my-2">
            <div>평균 CT: <strong className="text-rose-700">{maxProc.averageCT.toFixed(1)}초</strong></div>
            <div>목표 Takt Time: <strong>{simulation.targetTaktTime.toFixed(1)}초</strong></div>
            <div>초과 시간: <strong className="text-rose-600">+{maxProc.excessSeconds.toFixed(1)}초/대</strong></div>
            <div>예상 일일 손실량: <strong className="text-rose-600">{Math.max(0, simulation.gradeCounts ? Object.values(simulation.gradeCounts).reduce((a,b)=>a+b,0) - simulation.estimatedDailyOutput : 0)}대</strong></div>
          </div>
          <p className="text-slate-700 leading-relaxed">
            {simulation.ruleBasedDiagnosis.recommendation}
          </p>
        </div>
      )}

      {!isBottleneck && (
        <div className="bg-white/90 border border-slate-200 rounded-lg p-3.5 mb-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-medium text-slate-900 mb-1">{simulation.ruleBasedDiagnosis.primaryConcern}</p>
          <p className="text-slate-600">{simulation.ruleBasedDiagnosis.recommendation}</p>
        </div>
      )}

      {/* Senior Dev Expert Field Advice Box */}
      <div className="p-3 bg-white/70 border border-slate-200/80 rounded-lg text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>현장 생산기술 관점의 3대 개선 액션 가이드:</span>
        </div>
        <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
          <li>
            <strong className="text-slate-800">라인 밸런싱(Line Balancing):</strong> 병목인 {maxProc?.processName || '해당 공정'}의 부품 사전 서브 조립(Kitting/Sub-assembly)을 통해 본라인 사이클 타임을 48초 이하로 단축.
          </li>
          <li>
            <strong className="text-slate-800">혼류 투입 순서(Sequencing) 제어:</strong> Special/Premium 등급 차량이 2대 이상 연속으로 컨베이어에 투입되지 않도록 1:2 혹은 1:3 인터리빙(교차 투입) 룰 적용.
          </li>
          <li>
            <strong className="text-slate-800">공정 간 버퍼(In-line Buffer) 활용:</strong> 시트 장착과 루프 조립 사이에 1~2대의 대기 버퍼를 운영하여 순간적인 공수 초과 완충.
          </li>
        </ul>
      </div>
    </div>
  );
}
