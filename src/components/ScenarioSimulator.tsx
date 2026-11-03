import { useState } from 'react';
import {
  ProductionCondition,
  ProcessDefinition,
  ProcessCT,
  VehicleGrade,
  VEHICLE_GRADES,
  SimulationScenario,
} from '../types/production';
import { PRESET_SCENARIOS } from '../mock/initialData';
import { runSimulation } from '../utils/calculations';
import { ArrowRight, Check, Sparkles, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface ScenarioSimulatorProps {
  currentCondition: ProductionCondition;
  currentGradeCounts: Record<VehicleGrade, number>;
  processes: ProcessDefinition[];
  processCTs: ProcessCT[];
  onApplyCounts: (counts: Record<VehicleGrade, number>) => void;
}

export function ScenarioSimulator({
  currentCondition,
  currentGradeCounts,
  processes,
  processCTs,
  onApplyCounts,
}: ScenarioSimulatorProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario_b');

  // Calculate current baseline simulation
  const baseSim = runSimulation(
    currentCondition,
    currentGradeCounts,
    processes,
    processCTs
  );

  // Helper to convert scenario ratios to vehicle counts based on target units
  const scenarioToCounts = (scenario: SimulationScenario) => {
    const total = currentCondition.targetUnits || 500;
    const rawCounts: Record<VehicleGrade, number> = {
      Basic: Math.round((total * scenario.gradeRatios.Basic) / 100),
      Classic: Math.round((total * scenario.gradeRatios.Classic) / 100),
      Premium: Math.round((total * scenario.gradeRatios.Premium) / 100),
      Special: Math.round((total * scenario.gradeRatios.Special) / 100),
    };
    const sum = rawCounts.Basic + rawCounts.Classic + rawCounts.Premium + rawCounts.Special;
    rawCounts.Basic += total - sum;
    return rawCounts;
  };

  // Run simulations for all preset scenarios
  const scenarioSims = PRESET_SCENARIOS.map((scenario) => {
    const counts = scenarioToCounts(scenario);
    const sim = runSimulation(currentCondition, counts, processes, processCTs);
    return {
      scenario,
      counts,
      sim,
    };
  });

  const activeScenarioItem =
    scenarioSims.find((s) => s.scenario.id === selectedScenarioId) || scenarioSims[1];

  return (
    <div className="space-y-6">
      {/* Scenario Selection Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>생산계획 변경 시뮬레이션 & 시나리오 A/B/C 비교</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              차량 등급별 배분 비율 변경에 따른 공정별 CT 변화, 병목 전이, 일일 생산능력(Δ) 즉시 비교
            </p>
          </div>

          <button
            type="button"
            onClick={() => onApplyCounts(activeScenarioItem.counts)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Check className="w-4 h-4" />
            <span>선택한 [{activeScenarioItem.scenario.name.split(' ')[0]}]을 대시보드에 적용</span>
          </button>
        </div>

        {/* Scenario Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {scenarioSims.map(({ scenario, counts, sim }) => {
            const isSelected = scenario.id === selectedScenarioId;
            const deltaOutput = sim.estimatedDailyOutput - baseSim.estimatedDailyOutput;

            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => setSelectedScenarioId(scenario.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                    {scenario.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      sim.bottleneckProcessesCount > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {sim.bottleneckProcessesCount > 0 ? `병목 ${sim.bottleneckProcessesCount}건` : '정상 가동'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  {scenario.description}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">예상 생산: <strong>{sim.estimatedDailyOutput}대</strong></span>
                  <span className={`flex items-center font-bold ${
                    deltaOutput > 0 ? 'text-emerald-600' : deltaOutput < 0 ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {deltaOutput > 0 ? `+${deltaOutput}대` : `${deltaOutput}대`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Detailed Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>기준 계획 vs 선택 시나리오 상세 영향 비교표</span>
          <span className="text-slate-500 font-normal">
            기준 계획 ({baseSim.totalPlannedUnits}대) vs {activeScenarioItem.scenario.name}
          </span>
        </h4>

        {/* High Level KPI Delta Comparison */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[11px] text-slate-500 block">라인 Cycle Time</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold font-mono text-slate-900">
                {activeScenarioItem.sim.lineCT.toFixed(1)}s
              </span>
              <span className={`text-xs font-mono font-semibold ${
                activeScenarioItem.sim.lineCT < baseSim.lineCT ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {(activeScenarioItem.sim.lineCT - baseSim.lineCT).toFixed(1)}s
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">기준: {baseSim.lineCT.toFixed(1)}초</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[11px] text-slate-500 block">예상 생산 가능 대수</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold font-mono text-slate-900">
                {activeScenarioItem.sim.estimatedDailyOutput}대
              </span>
              <span className={`text-xs font-mono font-bold ${
                activeScenarioItem.sim.estimatedDailyOutput >= baseSim.estimatedDailyOutput ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {activeScenarioItem.sim.estimatedDailyOutput - baseSim.estimatedDailyOutput >= 0 ? '+' : ''}
                {activeScenarioItem.sim.estimatedDailyOutput - baseSim.estimatedDailyOutput}대
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">기준: {baseSim.estimatedDailyOutput}대</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[11px] text-slate-500 block">최대 병목 공정</span>
            <div className="mt-0.5">
              <span className="text-sm font-bold text-rose-700 truncate block">
                {activeScenarioItem.sim.maxBottleneckProcess?.processName || '-'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block truncate">
              기준: {baseSim.maxBottleneckProcess?.processName || '-'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="text-[11px] text-slate-500 block">라인 밸런싱 효율 (LBE)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold font-mono text-slate-900">
                {activeScenarioItem.sim.lineEfficiency.toFixed(1)}%
              </span>
              <span className={`text-xs font-mono font-semibold ${
                activeScenarioItem.sim.lineEfficiency >= baseSim.lineEfficiency ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {(activeScenarioItem.sim.lineEfficiency - baseSim.lineEfficiency).toFixed(1)}%p
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">기준: {baseSim.lineEfficiency.toFixed(1)}%</span>
          </div>
        </div>

        {/* Process-by-Process CT Delta Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">공정명</th>
                <th className="py-2.5 px-3 text-right">기준 계획 CT</th>
                <th className="py-2.5 px-3 text-right">시나리오 CT</th>
                <th className="py-2.5 px-3 text-right">변화량 (Δ)</th>
                <th className="py-2.5 px-3 text-right">시나리오 부하율</th>
                <th className="py-2.5 px-3 text-center">시나리오 판정</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {activeScenarioItem.sim.processes.map((proc) => {
                const baseProc = baseSim.processes.find((p) => p.processId === proc.processId);
                const deltaCT = Number((proc.averageCT - (baseProc?.averageCT || 0)).toFixed(2));
                const isBottleneck = proc.status === 'BOTTLENECK';

                return (
                  <tr key={proc.processId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 font-sans font-semibold text-slate-900">
                      {proc.processName}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {baseProc?.averageCT.toFixed(1)}s
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {proc.averageCT.toFixed(1)}s
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      <span className={deltaCT > 0 ? 'text-rose-600' : deltaCT < 0 ? 'text-emerald-600' : 'text-slate-400'}>
                        {deltaCT > 0 ? `+${deltaCT.toFixed(1)}s` : `${deltaCT.toFixed(1)}s`}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={proc.loadRate > 100 ? 'text-rose-700 font-bold' : 'text-slate-700'}>
                        {proc.loadRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          proc.status === 'BOTTLENECK'
                            ? 'bg-rose-100 text-rose-800'
                            : proc.status === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {proc.status === 'BOTTLENECK' ? '병목 위험' : proc.status === 'WARNING' ? '주의' : '정상'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
