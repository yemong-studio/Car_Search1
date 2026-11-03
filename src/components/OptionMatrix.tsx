import { VehicleOption, VehicleGrade, VEHICLE_GRADES } from '../types/production';
import { Info, Check } from 'lucide-react';

interface OptionMatrixProps {
  options: VehicleOption[];
  onChange: (updatedOptions: VehicleOption[]) => void;
}

// Map each option to its primarily affected assembly process
const OPTION_PROCESS_MAP: Record<string, string> = {
  opt_surround_view: '전장 조립 (카메라 하네스 & 캘리브레이션)',
  opt_radar_sensor: '전장/외장 조립 (범퍼 레이더 모듈)',
  opt_hud: '대시보드 조립 (인스트루먼트 패널 하우징)',
  opt_power_seat: '시트 장착 (전동 액추에이터 & 에어 통풍관)',
  opt_sunroof: '루프 조립 (파노라마 글라스 및 레일 모터)',
};

export function OptionMatrix({ options, onChange }: OptionMatrixProps) {
  const toggleOption = (optionId: string, grade: VehicleGrade) => {
    const updated = options.map((opt) => {
      if (opt.id === optionId) {
        return {
          ...opt,
          availability: {
            ...opt.availability,
            [grade]: !opt.availability[grade],
          },
        };
      }
      return opt;
    });
    onChange(updated);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>STEP 3. 차량 등급별 옵션 구성 관리</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            5종 핵심 편의·주행 옵션의 등급별 적용 매트릭스 확인 및 변경
          </p>
        </div>
      </div>

      {/* Domain notice about Section 5-4 */}
      <div className="mb-4 p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">기획서 설계 원칙(5-4):</strong> 본 단계의 옵션 매트릭스는 등급별 작업 부하 차이를 이해하기 위한 <em>참고 정보</em>입니다. 등급별 공정 CT에는 이미 해당 옵션의 공수가 포함되어 있다고 가정하므로, 옵션 체크 변경 시 공정 CT가 자동 변경되지는 않습니다. 공수 변경 시 STEP 4 공정 CT를 직접 수정하십시오.
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">옵션 명칭</th>
              <th className="py-2.5 px-3">관련 영향 의장 공정</th>
              {VEHICLE_GRADES.map((grade) => (
                <th key={grade} className="py-2.5 px-3 text-center w-24">
                  {grade}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {options.map((option) => (
              <tr key={option.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-3 font-medium text-slate-900">
                  {option.name}
                </td>
                <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                  {OPTION_PROCESS_MAP[option.id] || '일반 조립'}
                </td>
                {VEHICLE_GRADES.map((grade) => {
                  const isChecked = !!option.availability[grade];
                  return (
                    <td key={grade} className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleOption(option.id, grade)}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md border text-xs transition-colors ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                            : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                        }`}
                        title={`${grade} 등급에 ${option.name} ${isChecked ? '해제' : '적용'}`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
