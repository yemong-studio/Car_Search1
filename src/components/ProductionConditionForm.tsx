import { ProductionCondition } from '../types/production';
import { Clock, AlertCircle } from 'lucide-react';

interface ProductionConditionFormProps {
  condition: ProductionCondition;
  onChange: (updated: ProductionCondition) => void;
  availableMinutes: number;
  targetTaktTime: number;
}

export function ProductionConditionForm({
  condition,
  onChange,
  availableMinutes,
  targetTaktTime,
}: ProductionConditionFormProps) {
  const isTimeInvalid =
    condition.breakMinutes + condition.downtimeMinutes >= condition.workShiftMinutes;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>STEP 1. 생산 조건 설정</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            일일 생산 목표 및 가용 시간 설정 (자동 Takt Time 도출)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>가용시간: <strong className="font-mono text-slate-900">{availableMinutes}분</strong></span>
          <span className="text-slate-300">|</span>
          <span>Takt Time: <strong className="font-mono text-blue-700">{targetTaktTime.toFixed(1)}초</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 일일 생산 목표 */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            일일 생산 목표 (대)
          </label>
          <input
            type="number"
            min="1"
            value={condition.targetUnits || ''}
            onChange={(e) =>
              onChange({
                ...condition,
                targetUnits: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            className="w-full text-sm font-mono tabular-nums px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        {/* 근무 시간 */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            일일 근무시간 (분)
          </label>
          <input
            type="number"
            min="1"
            value={condition.workShiftMinutes || ''}
            onChange={(e) =>
              onChange({
                ...condition,
                workShiftMinutes: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            className="w-full text-sm font-mono tabular-nums px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        {/* 휴식 시간 */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            휴식시간 (분)
          </label>
          <input
            type="number"
            min="0"
            value={condition.breakMinutes || ''}
            onChange={(e) =>
              onChange({
                ...condition,
                breakMinutes: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            className="w-full text-sm font-mono tabular-nums px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        {/* 기타 비가동 시간 */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            기타 비가동시간 (분)
          </label>
          <input
            type="number"
            min="0"
            value={condition.downtimeMinutes || ''}
            onChange={(e) =>
              onChange({
                ...condition,
                downtimeMinutes: Math.max(0, parseInt(e.target.value) || 0),
              })
            }
            className="w-full text-sm font-mono tabular-nums px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
        </div>
      </div>

      {isTimeInvalid && (
        <div className="mt-3 flex items-center gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            경고: 휴식시간({condition.breakMinutes}분)과 비가동시간({condition.downtimeMinutes}분)의 합산이
            근무시간({condition.workShiftMinutes}분) 이상입니다. 가용시간이 0 이하가 되어 Takt Time을 계산할 수 없습니다.
          </span>
        </div>
      )}

      {/* Preset Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-600">근무 교대 프리셋:</span>
        <button
          type="button"
          onClick={() =>
            onChange({
              targetUnits: 500,
              workShiftMinutes: 480,
              breakMinutes: 60,
              downtimeMinutes: 20,
            })
          }
          className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
        >
          주간 8시간 (400분 가용 / 500대)
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              targetUnits: 580,
              workShiftMinutes: 540,
              breakMinutes: 70,
              downtimeMinutes: 20,
            })
          }
          className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
        >
          잔업 1시간 포함 (450분 가용 / 580대)
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              targetUnits: 300,
              workShiftMinutes: 300,
              breakMinutes: 30,
              downtimeMinutes: 10,
            })
          }
          className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
        >
          단축/하프 시프트 (260분 가용 / 300대)
        </button>
      </div>
    </div>
  );
}
