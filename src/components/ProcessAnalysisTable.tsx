import { ProcessAnalysis } from '../types/production';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ProcessAnalysisTableProps {
  processes: ProcessAnalysis[];
  targetTaktTime: number;
  lineCT: number;
}

export function ProcessAnalysisTable({
  processes,
  targetTaktTime,
  lineCT,
}: ProcessAnalysisTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>공정별 작업 부하율 및 지연/여유 정밀 분석표</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            목표 Takt Time({targetTaktTime.toFixed(1)}초) 및 라인 CT({lineCT.toFixed(1)}초) 대비 각 공정의 부하와 불균형 유휴시간
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">순서</th>
              <th className="py-2.5 px-3 min-w-[120px]">공정명</th>
              <th className="py-2.5 px-3 text-right">평균 Cycle Time</th>
              <th className="py-2.5 px-3 text-right">목표 Takt Time</th>
              <th className="py-2.5 px-3 text-right">부하율 (%)</th>
              <th className="py-2.5 px-3 text-right">목표 대비 초과/여유</th>
              <th className="py-2.5 px-3 text-right text-slate-500">라인 불균형 유휴시간</th>
              <th className="py-2.5 px-3 text-center w-28">진단 상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processes.map((proc, index) => {
              const isBottleneck = proc.status === 'BOTTLENECK';
              const isWarning = proc.status === 'WARNING';
              // Line idle time = lineCT - proc.averageCT
              const idleTime = Math.max(0, Number((lineCT - proc.averageCT).toFixed(2)));

              return (
                <tr
                  key={proc.processId}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isBottleneck
                      ? 'bg-rose-50/30'
                      : isWarning
                      ? 'bg-amber-50/20'
                      : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                    {isBottleneck ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                    <span>{proc.processName}</span>
                    {proc.averageCT === lineCT && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-xs ml-1">
                        최대 병목
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                    {proc.averageCT.toFixed(1)}초
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                    {targetTaktTime.toFixed(1)}초
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <span
                      className={`font-bold ${
                        isBottleneck
                          ? 'text-rose-700'
                          : isWarning
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {proc.loadRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {proc.excessSeconds > 0 ? (
                      <span className="font-semibold text-rose-600">
                        +{proc.excessSeconds.toFixed(1)}초 초과
                      </span>
                    ) : (
                      <span className="text-emerald-600">
                        {Math.abs(proc.excessSeconds).toFixed(1)}초 여유
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                    {idleTime === 0 ? (
                      <span className="text-rose-600 font-semibold">0초 (지배 공정)</span>
                    ) : (
                      <span>{idleTime.toFixed(1)}초 대기</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {isBottleneck ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                        병목 위험
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        주의
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        정상
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
