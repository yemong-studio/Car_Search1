/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import {
  ProductionCondition,
  VehicleGrade,
  VehicleOption,
  ProcessDefinition,
  ProcessCT,
} from './types/production';
import {
  INITIAL_PRODUCTION_CONDITION,
  INITIAL_GRADE_COUNTS,
  INITIAL_VEHICLE_OPTIONS,
  INITIAL_PROCESSES,
  INITIAL_PROCESS_CTS,
} from './mock/initialData';
import { runSimulation, validateInputs } from './utils/calculations';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { ProductionConditionForm } from './components/ProductionConditionForm';
import { GradeAllocationForm } from './components/GradeAllocationForm';
import { OptionMatrix } from './components/OptionMatrix';
import { ProcessCtTable } from './components/ProcessCtTable';
import { CycleTimeChart } from './components/CycleTimeChart';
import { ProcessAnalysisTable } from './components/ProcessAnalysisTable';
import { BottleneckSummaryCard } from './components/BottleneckSummaryCard';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { SeniorDevReviewView } from './components/SeniorDevReviewView';
import { AlertTriangle, AlertCircle, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'processes' | 'scenarios' | 'senior-feedback'
  >('dashboard');

  // Application State
  const [condition, setCondition] = useState<ProductionCondition>(
    INITIAL_PRODUCTION_CONDITION
  );
  const [gradeCounts, setGradeCounts] = useState<Record<VehicleGrade, number>>(
    INITIAL_GRADE_COUNTS
  );
  const [options, setOptions] = useState<VehicleOption[]>(
    INITIAL_VEHICLE_OPTIONS
  );
  const [processes, setProcesses] = useState<ProcessDefinition[]>(
    INITIAL_PROCESSES
  );
  const [processCTs, setProcessCTs] = useState<ProcessCT[]>(
    INITIAL_PROCESS_CTS
  );

  // Core Math Simulation
  const simulation = useMemo(() => {
    return runSimulation(condition, gradeCounts, processes, processCTs);
  }, [condition, gradeCounts, processes, processCTs]);

  // Validation Issues
  const validationIssues = useMemo(() => {
    return validateInputs(condition, gradeCounts, processes, processCTs);
  }, [condition, gradeCounts, processes, processCTs]);

  const errorIssues = validationIssues.filter((i) => i.severity === 'error');
  const warningIssues = validationIssues.filter((i) => i.severity === 'warning');

  // Reset to initial mock data from PRD
  const handleResetToMock = () => {
    if (confirm('기획서 표준 목업 데이터(500대, 5개 공정, 5개 옵션)로 초기화하시겠습니까?')) {
      setCondition(INITIAL_PRODUCTION_CONDITION);
      setGradeCounts(INITIAL_GRADE_COUNTS);
      setOptions(INITIAL_VEHICLE_OPTIONS);
      setProcesses(INITIAL_PROCESSES);
      setProcessCTs(INITIAL_PROCESS_CTS);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const rows = [
      ['[병목 현상 탐지 생산 분석 보고서]'],
      ['생산 일자', new Date().toLocaleDateString('ko-KR')],
      ['일일 생산 목표', `${condition.targetUnits}대`],
      ['가용 생산시간', `${simulation.availableMinutes}분 (${simulation.availableSeconds}초)`],
      ['목표 Takt Time', `${simulation.targetTaktTime}초`],
      ['전체 라인 CT', `${simulation.lineCT}초`],
      ['최대 병목 공정', simulation.maxBottleneckProcess?.processName || '없음'],
      ['예상 일일 생산량', `${simulation.estimatedDailyOutput}대`],
      ['라인 밸런싱 효율(LBE)', `${simulation.lineEfficiency}%`],
      [],
      ['[차량 등급별 생산 배분]'],
      ['등급', '생산 대수', '생산 비율'],
      ['Basic', `${gradeCounts.Basic}대`, `${simulation.gradeRatios.Basic}%`],
      ['Classic', `${gradeCounts.Classic}대`, `${simulation.gradeRatios.Classic}%`],
      ['Premium', `${gradeCounts.Premium}대`, `${simulation.gradeRatios.Premium}%`],
      ['Special', `${gradeCounts.Special}대`, `${simulation.gradeRatios.Special}%`],
      ['합계', `${simulation.totalPlannedUnits}대`, '100%'],
      [],
      ['[공정별 CT 및 부하율 분석]'],
      ['순서', '공정명', 'Basic(s)', 'Classic(s)', 'Premium(s)', 'Special(s)', '가중평균 CT(s)', '부하율(%)', '목표 대비 초과(s)', '상태'],
      ...simulation.processes.map((p) => [
        p.order,
        p.processName,
        p.gradeCTs.Basic,
        p.gradeCTs.Classic,
        p.gradeCTs.Premium,
        p.gradeCTs.Special,
        p.averageCT,
        p.loadRate,
        p.excessSeconds,
        p.status === 'BOTTLENECK' ? '병목 위험' : p.status === 'WARNING' ? '주의' : '정상',
      ]),
    ];

    const csvContent =
      '\uFEFF' + rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `생산_병목분석_리포트_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 3-Zone Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetToMock={handleResetToMock}
        onExportCsv={handleExportCsv}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Validation Alert Bar */}
        {errorIssues.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-sm block mb-1">
                계산 오류 방지 안내 ({errorIssues.length}건)
              </strong>
              <ul className="list-disc list-inside space-y-0.5">
                {errorIssues.map((err, i) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {warningIssues.length > 0 && errorIssues.length === 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{warningIssues[0].message}</span>
            </div>
            <button
              onClick={() => {
                const total = condition.targetUnits;
                setGradeCounts({
                  Basic: Math.round(total * 0.4),
                  Classic: Math.round(total * 0.3),
                  Premium: Math.round(total * 0.2),
                  Special: total - Math.round(total * 0.4) - Math.round(total * 0.3) - Math.round(total * 0.2),
                });
              }}
              className="text-amber-800 underline font-semibold hover:text-amber-950 text-[11px]"
            >
              목표 대수로 자동 맞춤 (40:30:20:10)
            </button>
          </div>
        )}

        {/* Global Key KPI Strip */}
        <KpiCards simulation={simulation} targetUnits={condition.targetUnits} />

        {/* View Switching */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Input Section Grid: STEP 1 & STEP 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductionConditionForm
                condition={condition}
                onChange={setCondition}
                availableMinutes={simulation.availableMinutes}
                targetTaktTime={simulation.targetTaktTime}
              />
              <GradeAllocationForm
                gradeCounts={gradeCounts}
                gradeRatios={simulation.gradeRatios}
                totalUnits={simulation.totalPlannedUnits}
                targetUnits={condition.targetUnits}
                onChange={setGradeCounts}
              />
            </div>

            {/* Visual Analytics Chart: Section 9-2 */}
            <CycleTimeChart
              processes={simulation.processes}
              targetTaktTime={simulation.targetTaktTime}
            />

            {/* Rule-based Bottleneck Diagnosis Card: Section 9-4 */}
            <BottleneckSummaryCard simulation={simulation} />

            {/* Detailed Load Table: Section 9-3 */}
            <ProcessAnalysisTable
              processes={simulation.processes}
              targetTaktTime={simulation.targetTaktTime}
              lineCT={simulation.lineCT}
            />
          </div>
        )}

        {activeTab === 'processes' && (
          <div className="space-y-6">
            {/* Process Cycle Time Editor */}
            <ProcessCtTable
              processes={processes}
              processCTs={processCTs}
              analysisList={simulation.processes}
              targetTaktTime={simulation.targetTaktTime}
              onProcessesChange={setProcesses}
              onProcessCTsChange={setProcessCTs}
            />

            {/* Option Matrix Reference */}
            <OptionMatrix options={options} onChange={setOptions} />
          </div>
        )}

        {activeTab === 'scenarios' && (
          <ScenarioSimulator
            currentCondition={condition}
            currentGradeCounts={gradeCounts}
            processes={processes}
            processCTs={processCTs}
            onApplyCounts={(counts) => {
              setGradeCounts(counts);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'senior-feedback' && (
          <SeniorDevReviewView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">병목 현상 탐지 생산 대시보드</span>
            <span>·</span>
            <span>자동차 의장 순차 생산라인 시뮬레이션 시스템</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">
              Takt Time: {simulation.targetTaktTime.toFixed(1)}s | Line CT: {simulation.lineCT.toFixed(1)}s
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
