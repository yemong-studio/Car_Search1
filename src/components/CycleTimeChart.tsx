import { useState } from 'react';
import { ProcessAnalysis } from '../types/production';

interface CycleTimeChartProps {
  processes: ProcessAnalysis[];
  targetTaktTime: number;
}

export function CycleTimeChart({ processes, targetTaktTime }: CycleTimeChartProps) {
  const [hoveredProcess, setHoveredProcess] = useState<ProcessAnalysis | null>(null);

  if (processes.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
        등록된 공정이 없습니다.
      </div>
    );
  }

  // Determine max value for Y-axis scale
  const maxCT = Math.max(...processes.map((p) => p.averageCT), targetTaktTime, 60);
  const yAxisMax = Math.ceil((maxCT * 1.2) / 10) * 10; // round up to nearest 10 with margin

  // SVG dimensions
  const chartHeight = 240;
  const paddingBottom = 40;
  const paddingTop = 30;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const yTicks = [0, yAxisMax * 0.25, yAxisMax * 0.5, yAxisMax * 0.75, yAxisMax];
  const taktTimeY = paddingTop + plotHeight * (1 - targetTaktTime / yAxisMax);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>공정별 평균 Cycle Time vs 목표 Takt Time 비교</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            목표 Takt Time({targetTaktTime.toFixed(1)}초) 기준선을 초과한 공정이 라인의 처리 속도를 지배합니다.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500" />
            <span className="text-slate-600 font-semibold">Takt Time ({targetTaktTime.toFixed(1)}초)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
            <span className="text-slate-600">병목 초과</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
            <span className="text-slate-600">주의 (90%↑)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span className="text-slate-600">정상</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 700 ${chartHeight}`}
          className="w-full h-64 overflow-visible select-none"
        >
          {/* Background Grid Lines & Y Ticks */}
          {yTicks.map((tickVal) => {
            const y = paddingTop + plotHeight * (1 - tickVal / yAxisMax);
            return (
              <g key={tickVal}>
                <line
                  x1="55"
                  y1={y}
                  x2="685"
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={tickVal === 0 ? '0' : '2 2'}
                />
                <text
                  x="48"
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-mono"
                >
                  {tickVal}s
                </text>
              </g>
            );
          })}

          {/* Target Takt Time Reference Line */}
          {targetTaktTime > 0 && taktTimeY >= paddingTop && (
            <g>
              <line
                x1="55"
                y1={taktTimeY}
                x2="685"
                y2={taktTimeY}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <rect
                x="620"
                y={taktTimeY - 18}
                width="65"
                height="16"
                rx="3"
                fill="#ef4444"
              />
              <text
                x="652"
                y={taktTimeY - 6}
                textAnchor="middle"
                className="text-[10px] fill-white font-mono font-bold"
              >
                TT {targetTaktTime.toFixed(1)}s
              </text>
            </g>
          )}

          {/* Process Bars */}
          {processes.map((proc, idx) => {
            const barCount = processes.length;
            const availableWidth = 630; // 685 - 55
            const slotWidth = availableWidth / barCount;
            const barWidth = Math.min(54, slotWidth * 0.55);
            const x = 55 + idx * slotWidth + (slotWidth - barWidth) / 2;

            const barHeight = (proc.averageCT / yAxisMax) * plotHeight;
            const y = paddingTop + plotHeight - barHeight;

            const isBottleneck = proc.status === 'BOTTLENECK';
            const isWarning = proc.status === 'WARNING';
            const barFill = isBottleneck
              ? '#ef4444' // rose-500
              : isWarning
              ? '#f59e0b' // amber-500
              : '#10b981'; // emerald-500

            const isHovered = hoveredProcess?.processId === proc.processId;

            return (
              <g
                key={proc.processId}
                onMouseEnter={() => setHoveredProcess(proc)}
                onMouseLeave={() => setHoveredProcess(null)}
                className="cursor-pointer transition-opacity"
                opacity={hoveredProcess && !isHovered ? 0.45 : 1}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={barFill}
                  className="transition-all duration-200"
                />

                {/* Top Value Label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className={`text-[11px] font-mono font-bold ${
                    isBottleneck ? 'fill-rose-600' : isWarning ? 'fill-amber-600' : 'fill-slate-700'
                  }`}
                >
                  {proc.averageCT.toFixed(1)}s
                </text>

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  className={`text-xs font-semibold ${
                    isBottleneck ? 'fill-rose-700 font-bold' : 'fill-slate-700'
                  }`}
                >
                  {proc.processName}
                </text>

                {/* Order Index Badge */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 26}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  #{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredProcess && (
          <div className="absolute top-2 right-4 bg-slate-900/95 text-white p-3 rounded-lg shadow-lg text-xs pointer-events-none z-10 border border-slate-700 max-w-xs animate-in fade-in duration-150">
            <div className="font-bold text-sm text-white flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
              <span>{hoveredProcess.processName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  hoveredProcess.status === 'BOTTLENECK'
                    ? 'bg-rose-500 text-white'
                    : hoveredProcess.status === 'WARNING'
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {hoveredProcess.status === 'BOTTLENECK' ? '병목 위험' : hoveredProcess.status === 'WARNING' ? '주의' : '정상'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
              <span className="text-slate-400">평균 Cycle Time:</span>
              <span className="font-bold text-right">{hoveredProcess.averageCT.toFixed(1)}초</span>
              <span className="text-slate-400">목표 Takt Time:</span>
              <span className="text-right">{targetTaktTime.toFixed(1)}초</span>
              <span className="text-slate-400">부하율:</span>
              <span className={`font-bold text-right ${hoveredProcess.loadRate > 100 ? 'text-rose-400' : 'text-white'}`}>
                {hoveredProcess.loadRate}%
              </span>
              <span className="text-slate-400">초과/여유 시간:</span>
              <span className={`font-bold text-right ${hoveredProcess.excessSeconds > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {hoveredProcess.excessSeconds > 0 ? `+${hoveredProcess.excessSeconds}초 (지연)` : `${hoveredProcess.excessSeconds}초 (여유)`}
              </span>
            </div>
            <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
              <span>Basic {hoveredProcess.gradeCTs.Basic}s</span>
              <span>Classic {hoveredProcess.gradeCTs.Classic}s</span>
              <span>Prem {hoveredProcess.gradeCTs.Premium}s</span>
              <span>Spec {hoveredProcess.gradeCTs.Special}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
