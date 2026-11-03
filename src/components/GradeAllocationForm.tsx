import { VehicleGrade, VEHICLE_GRADES } from '../types/production';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface GradeAllocationFormProps {
  gradeCounts: Record<VehicleGrade, number>;
  gradeRatios: Record<VehicleGrade, number>;
  totalUnits: number;
  targetUnits: number;
  onChange: (counts: Record<VehicleGrade, number>) => void;
}

const GRADE_THEMES: Record<
  VehicleGrade,
  { label: string; bg: string; bar: string; badge: string }
> = {
  Basic: {
    label: 'Basic (기본)',
    bg: 'border-slate-200 bg-slate-50/50',
    bar: 'bg-slate-500',
    badge: 'text-slate-700 bg-slate-100',
  },
  Classic: {
    label: 'Classic (대중형)',
    bg: 'border-blue-200 bg-blue-50/30',
    bar: 'bg-blue-500',
    badge: 'text-blue-700 bg-blue-100',
  },
  Premium: {
    label: 'Premium (고급형)',
    bg: 'border-purple-200 bg-purple-50/30',
    bar: 'bg-purple-500',
    badge: 'text-purple-700 bg-purple-100',
  },
  Special: {
    label: 'Special (특화/풀옵션)',
    bg: 'border-amber-200 bg-amber-50/30',
    bar: 'bg-amber-500',
    badge: 'text-amber-700 bg-amber-100',
  },
};

export function GradeAllocationForm({
  gradeCounts,
  gradeRatios,
  totalUnits,
  targetUnits,
  onChange,
}: GradeAllocationFormProps) {
  const isMatch = totalUnits === targetUnits;
  const isZero = totalUnits === 0;

  const applyRatios = (ratios: Record<VehicleGrade, number>) => {
    const base = targetUnits > 0 ? targetUnits : 500;
    const newCounts = {
      Basic: Math.round((base * ratios.Basic) / 100),
      Classic: Math.round((base * ratios.Classic) / 100),
      Premium: Math.round((base * ratios.Premium) / 100),
      Special: Math.round((base * ratios.Special) / 100),
    };
    // Adjust rounding difference to Basic
    const sum = newCounts.Basic + newCounts.Classic + newCounts.Premium + newCounts.Special;
    newCounts.Basic += base - sum;
    onChange(newCounts);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>STEP 2. 차량 등급별 생산 대수 입력</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            4개 트림 등급별 투입 대수 설정 및 생산 비중 자동 산출
          </p>
        </div>

        {/* Target vs Total badge */}
        <div className="flex items-center gap-1.5 text-xs">
          {isZero ? (
            <span className="flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
              <AlertTriangle className="w-3.5 h-3.5" />
              대수 합계 0대
            </span>
          ) : isMatch ? (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              목표({targetUnits}대) 일치
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
              <AlertTriangle className="w-3.5 h-3.5" />
              목표({targetUnits}대)와 불일치 (합계: {totalUnits}대, {totalUnits - targetUnits > 0 ? `+${totalUnits - targetUnits}` : totalUnits - targetUnits}대)
            </span>
          )}
        </div>
      </div>

      {/* Visual Composition Progress Bar */}
      <div className="mb-4">
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {VEHICLE_GRADES.map((grade) => (
            <div
              key={grade}
              style={{ width: `${gradeRatios[grade] || 0}%` }}
              className={`${GRADE_THEMES[grade].bar} transition-all duration-300`}
              title={`${grade}: ${gradeCounts[grade]}대 (${gradeRatios[grade]}%)`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5 font-mono">
          {VEHICLE_GRADES.map((grade) => (
            <div key={grade} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-xs ${GRADE_THEMES[grade].bar}`} />
              <span>{grade}</span>
              <span className="font-semibold text-slate-800">{gradeRatios[grade]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Grade Input Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {VEHICLE_GRADES.map((grade) => (
          <div
            key={grade}
            className={`border rounded-lg p-3 ${GRADE_THEMES[grade].bg}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">{GRADE_THEMES[grade].label}</span>
              <span className="text-[11px] font-mono font-semibold text-slate-600">
                {gradeRatios[grade]}%
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={gradeCounts[grade] ?? ''}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  onChange({
                    ...gradeCounts,
                    [grade]: val,
                  });
                }}
                className="w-full text-base font-mono tabular-nums font-bold px-3 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 pointer-events-none">
                대
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Ratio Presets */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">비율 퀵 프리셋:</span>
          <button
            type="button"
            onClick={() => applyRatios({ Basic: 40, Classic: 30, Premium: 20, Special: 10 })}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors text-[11px]"
          >
            기본안 (40:30:20:10)
          </button>
          <button
            type="button"
            onClick={() => applyRatios({ Basic: 20, Classic: 30, Premium: 30, Special: 20 })}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors text-[11px]"
          >
            고급확대 (20:30:30:20)
          </button>
          <button
            type="button"
            onClick={() => applyRatios({ Basic: 10, Classic: 20, Premium: 30, Special: 40 })}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors text-[11px]"
          >
            특화집중 (10:20:30:40)
          </button>
          <button
            type="button"
            onClick={() => applyRatios({ Basic: 25, Classic: 25, Premium: 25, Special: 25 })}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors text-[11px]"
          >
            균등배분 (25:25:25:25)
          </button>
        </div>

        <div className="text-[11px] text-slate-500">
          총 생산 대수: <strong className="font-mono text-slate-900">{totalUnits}</strong> / {targetUnits}대
        </div>
      </div>
    </div>
  );
}
