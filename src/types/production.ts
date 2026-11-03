export type VehicleGrade = 'Basic' | 'Classic' | 'Premium' | 'Special';

export const VEHICLE_GRADES: VehicleGrade[] = ['Basic', 'Classic', 'Premium', 'Special'];

export interface ProductionCondition {
  targetUnits: number;       // 일일 생산 목표 (대)
  workShiftMinutes: number;  // 일일 근무시간 (분)
  breakMinutes: number;      // 휴식시간 (분)
  downtimeMinutes: number;   // 기타 비가동시간 (분)
}

export interface VehicleOption {
  id: string;
  name: string;
  availability: Record<VehicleGrade, boolean>;
}

export interface ProcessDefinition {
  id: string;
  name: string;
  order: number;
}

export interface ProcessCT {
  processId: string;
  cycleTimes: Record<VehicleGrade, number>; // in seconds
}

export type BottleneckStatus = 'NORMAL' | 'WARNING' | 'BOTTLENECK';

export interface ProcessAnalysis {
  processId: string;
  processName: string;
  order: number;
  gradeCTs: Record<VehicleGrade, number>;
  minCT: number;
  maxCT: number;
  averageCT: number;
  taktTime: number;
  loadRate: number;            // (averageCT / taktTime) * 100
  excessSeconds: number;       // averageCT - taktTime
  status: BottleneckStatus;
}

export interface SimulationResult {
  availableMinutes: number;
  availableSeconds: number;
  targetTaktTime: number;
  totalPlannedUnits: number;
  gradeCounts: Record<VehicleGrade, number>;
  gradeRatios: Record<VehicleGrade, number>;
  processes: ProcessAnalysis[];
  lineCT: number;              // MAX(averageCT)
  maxBottleneckProcess: ProcessAnalysis | null;
  warningProcessesCount: number;
  bottleneckProcessesCount: number;
  estimatedDailyOutput: number; // availableSeconds / lineCT
  lineEfficiency: number;      // (Sum of avg CT / (lineCT * processCount)) * 100
  achievementRate: number;     // (estimatedDailyOutput / targetUnits) * 100
  ruleBasedDiagnosis: {
    statusText: string;
    primaryConcern: string;
    excessInfo: string;
    recommendation: string;
  };
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  gradeRatios: Record<VehicleGrade, number>; // percentages
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
