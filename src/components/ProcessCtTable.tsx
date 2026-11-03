import { useState } from 'react';
import {
  ProcessDefinition,
  ProcessCT,
  VehicleGrade,
  VEHICLE_GRADES,
  ProcessAnalysis,
} from '../types/production';
import { Plus, Trash2, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';

interface ProcessCtTableProps {
  processes: ProcessDefinition[];
  processCTs: ProcessCT[];
  analysisList: ProcessAnalysis[];
  targetTaktTime: number;
  onProcessesChange: (processes: ProcessDefinition[]) => void;
  onProcessCTsChange: (processCTs: ProcessCT[]) => void;
}

export function ProcessCtTable({
  processes,
  processCTs,
  analysisList,
  targetTaktTime,
  onProcessesChange,
  onProcessCTsChange,
}: ProcessCtTableProps) {
  const [newProcessName, setNewProcessName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Handle CT change for a specific process and grade
  const handleCTChange = (processId: string, grade: VehicleGrade, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    const updated = processCTs.map((item) => {
      if (item.processId === processId) {
        return {
          ...item,
          cycleTimes: {
            ...item.cycleTimes,
            [grade]: num,
          },
        };
      }
      return item;
    });
    onProcessCTsChange(updated);
  };

  // Add process
  const handleAddProcess = () => {
    if (!newProcessName.trim()) return;
    const newId = `proc_${Date.now()}`;
    const newProcess: ProcessDefinition = {
      id: newId,
      name: newProcessName.trim(),
      order: processes.length + 1,
    };
    const newCT: ProcessCT = {
      processId: newId,
      cycleTimes: {
        Basic: 40,
        Classic: 45,
        Premium: 50,
        Special: 60,
      },
    };

    onProcessesChange([...processes, newProcess]);
    onProcessCTsChange([...processCTs, newCT]);
    setNewProcessName('');
    setIsAdding(false);
  };

  // Delete process
  const handleDeleteProcess = (processId: string) => {
    if (processes.length <= 1) {
      alert('최소 1개 이상의 공정이 유지되어야 합니다.');
      return;
    }
    const updatedProcesses = processes
      .filter((p) => p.id !== processId)
      .map((p, idx) => ({ ...p, order: idx + 1 }));
    const updatedCTs = processCTs.filter((c) => c.processId !== processId);

    onProcessesChange(updatedProcesses);
    onProcessCTsChange(updatedCTs);
  };

  // Move process up/down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= processes.length) return;

    const copy = [...processes];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reordered = copy.map((p, idx) => ({ ...p, order: idx + 1 }));
    onProcessesChange(reordered);
  };

  // Edit process name
  const handleNameChange = (processId: string, name: string) => {
    const updated = processes.map((p) =>
      p.id === processId ? { ...p, name } : p
    );
    onProcessesChange(updated);
  };

  const getAnalysis = (processId: string) => {
    return analysisList.find((a) => a.processId === processId);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>STEP 4. 공정별 × 차량 등급별 Cycle Time (CT) 관리</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            차량 1대를 처리하는 순수 작업시간 (단위: 초). 가중평균 CT 및 부하율 실시간 산출
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAdding ? (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200/60"
            >
              <Plus className="w-3.5 h-3.5" />
              공정 추가
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="새 공정명 (예: 도어 조립)"
                value={newProcessName}
                onChange={(e) => setNewProcessName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddProcess()}
                className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-36"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddProcess}
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">순서</th>
              <th className="py-2.5 px-3 min-w-[130px]">공정명</th>
              <th className="py-2.5 px-2 text-center w-20">Basic (초)</th>
              <th className="py-2.5 px-2 text-center w-20">Classic (초)</th>
              <th className="py-2.5 px-2 text-center w-20">Premium (초)</th>
              <th className="py-2.5 px-2 text-center w-20">Special (초)</th>
              <th className="py-2.5 px-3 text-right bg-blue-50/50 w-24">가중평균 CT</th>
              <th className="py-2.5 px-3 text-right w-20">부하율</th>
              <th className="py-2.5 px-3 text-center w-24">판정</th>
              <th className="py-2.5 px-2 text-center w-24">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processes.map((process, index) => {
              const ctItem = processCTs.find((c) => c.processId === process.id);
              const analysis = getAnalysis(process.id);
              const isBottleneck = analysis?.status === 'BOTTLENECK';
              const isWarning = analysis?.status === 'WARNING';

              return (
                <tr
                  key={process.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isBottleneck
                      ? 'bg-rose-50/30'
                      : isWarning
                      ? 'bg-amber-50/30'
                      : ''
                  }`}
                >
                  {/* Order & Reorder buttons */}
                  <td className="py-2 px-1 text-center font-mono text-slate-400">
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="w-3 text-right text-[11px]">{index + 1}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'up')}
                          className="p-0.5 hover:text-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === processes.length - 1}
                          onClick={() => handleMove(index, 'down')}
                          className="p-0.5 hover:text-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Process Name Editable */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={process.name}
                      onChange={(e) => handleNameChange(process.id, e.target.value)}
                      className="w-full font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white px-1 py-0.5 rounded-xs focus:outline-hidden"
                    />
                  </td>

                  {/* Grade CT inputs */}
                  {VEHICLE_GRADES.map((grade) => {
                    const ctVal = ctItem?.cycleTimes[grade] ?? 0;
                    return (
                      <td key={grade} className="py-2 px-2 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          value={ctVal || ''}
                          onChange={(e) =>
                            handleCTChange(process.id, grade, e.target.value)
                          }
                          className="w-16 text-center font-mono tabular-nums text-xs font-semibold py-1 px-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                        />
                      </td>
                    );
                  })}

                  {/* Weighted Average CT */}
                  <td className="py-2 px-3 text-right font-mono tabular-nums font-bold bg-blue-50/50">
                    <span
                      className={
                        isBottleneck
                          ? 'text-rose-700'
                          : isWarning
                          ? 'text-amber-700'
                          : 'text-slate-900'
                      }
                    >
                      {analysis ? `${analysis.averageCT.toFixed(1)}s` : '-'}
                    </span>
                  </td>

                  {/* Load Rate */}
                  <td className="py-2 px-3 text-right font-mono tabular-nums">
                    <span
                      className={`font-semibold ${
                        isBottleneck
                          ? 'text-rose-700'
                          : isWarning
                          ? 'text-amber-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {analysis ? `${analysis.loadRate}%` : '-'}
                    </span>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-2 px-3 text-center">
                    {isBottleneck ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                        병목 위험
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                        주의 (90%↑)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        정상 여유
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteProcess(process.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="공정 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            정상 (&lt; 90%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            주의 (90% ~ 100%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            병목 위험 (&gt; 100%)
          </span>
        </div>
        <div className="text-[11px]">
          목표 Takt Time: <strong className="font-mono text-blue-700">{targetTaktTime.toFixed(1)}초</strong> 기준 판정
        </div>
      </div>
    </div>
  );
}
