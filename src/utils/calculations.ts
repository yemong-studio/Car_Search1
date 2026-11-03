import {
  VehicleGrade,
  VEHICLE_GRADES,
  ProductionCondition,
  ProcessDefinition,
  ProcessCT,
  ProcessAnalysis,
  SimulationResult,
  BottleneckStatus,
  ValidationIssue,
} from '../types/production';

/**
 * STEP 1. 가용 생산시간 계산
 * 가용시간 = 근무시간 - 휴식시간 - 비가동시간
 */
export function calculateAvailableTime(condition: ProductionCondition): {
  availableMinutes: number;
  availableSeconds: number;
} {
  const availableMinutes = Math.max(
    0,
    condition.workShiftMinutes - condition.breakMinutes - condition.downtimeMinutes
  );
  return {
    availableMinutes,
    availableSeconds: availableMinutes * 60,
  };
}

/**
 * STEP 2. 목표 Takt Time 계산
 * Takt Time = 가용 생산시간(초) / 일일 생산 목표
 */
export function calculateTargetTaktTime(
  availableSeconds: number,
  targetUnits: number
): number {
  if (targetUnits <= 0 || availableSeconds <= 0) return 0;
  return Number((availableSeconds / targetUnits).toFixed(2));
}

/**
 * STEP 3. 등급별 생산 비율 계산
 * 생산 비율(%) = 등급별 생산 대수 / 총 생산 대수 × 100
 */
export function calculateGradeRatios(
  gradeCounts: Record<VehicleGrade, number>
): {
  totalUnits: number;
  ratios: Record<VehicleGrade, number>;
} {
  const totalUnits = VEHICLE_GRADES.reduce(
    (acc, grade) => acc + (Math.max(0, gradeCounts[grade] || 0)),
    0
  );

  const ratios: Record<VehicleGrade, number> = {
    Basic: 0,
    Classic: 0,
    Premium: 0,
    Special: 0,
  };

  if (totalUnits > 0) {
    VEHICLE_GRADES.forEach((grade) => {
      ratios[grade] = Number(
        (((gradeCounts[grade] || 0) / totalUnits) * 100).toFixed(1)
      );
    });
  }

  return { totalUnits, ratios };
}

/**
 * STEP 4. 공정별 가중평균 CT 계산
 * 평균 CT = Σ(등급별 생산 대수 × 해당 등급의 공정 CT) / 총 생산 대수
 */
export function calculateWeightedAverageCT(
  ctRecord: Record<VehicleGrade, number>,
  gradeCounts: Record<VehicleGrade, number>,
  totalUnits: number
): number {
  if (totalUnits <= 0) return 0;

  const totalWeightedSeconds = VEHICLE_GRADES.reduce((acc, grade) => {
    const count = Math.max(0, gradeCounts[grade] || 0);
    const ct = Math.max(0, ctRecord[grade] || 0);
    return acc + count * ct;
  }, 0);

  return Number((totalWeightedSeconds / totalUnits).toFixed(2));
}

/**
 * STEP 5. 병목 상태 판정
 * 90% 미만: 정상
 * 90% 이상 ~ 100% 이하: 주의
 * 100% 초과: 병목 위험
 */
export function evaluateBottleneckStatus(
  loadRate: number,
  warningThreshold: number = 90
): BottleneckStatus {
  if (loadRate > 100) return 'BOTTLENECK';
  if (loadRate >= warningThreshold) return 'WARNING';
  return 'NORMAL';
}

/**
 * STEP 6. 전체 공정 분석 및 생산 시뮬레이션 통합 연산
 */
export function runSimulation(
  condition: ProductionCondition,
  gradeCounts: Record<VehicleGrade, number>,
  processes: ProcessDefinition[],
  processCTs: ProcessCT[],
  warningThreshold: number = 90
): SimulationResult {
  const { availableMinutes, availableSeconds } = calculateAvailableTime(condition);
  const targetTaktTime = calculateTargetTaktTime(availableSeconds, condition.targetUnits);
  const { totalUnits, ratios } = calculateGradeRatios(gradeCounts);

  const ctMap = new Map<string, Record<VehicleGrade, number>>();
  processCTs.forEach((item) => {
    ctMap.set(item.processId, item.cycleTimes);
  });

  const analyzedProcesses: ProcessAnalysis[] = processes
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      const gradeCTs = ctMap.get(p.id) || {
        Basic: 0,
        Classic: 0,
        Premium: 0,
        Special: 0,
      };

      const ctValues = VEHICLE_GRADES.map((g) => gradeCTs[g] || 0);
      const minCT = Math.min(...ctValues);
      const maxCT = Math.max(...ctValues);
      const averageCT = calculateWeightedAverageCT(gradeCTs, gradeCounts, totalUnits);

      const loadRate =
        targetTaktTime > 0
          ? Number(((averageCT / targetTaktTime) * 100).toFixed(1))
          : 0;

      const excessSeconds =
        targetTaktTime > 0
          ? Number((averageCT - targetTaktTime).toFixed(2))
          : 0;

      const status = evaluateBottleneckStatus(loadRate, warningThreshold);

      return {
        processId: p.id,
        processName: p.name,
        order: p.order,
        gradeCTs,
        minCT,
        maxCT,
        averageCT,
        taktTime: targetTaktTime,
        loadRate,
        excessSeconds,
        status,
      };
    });

  // 전체 생산라인 CT = MAX(공정별 평균 CT)
  const allAverageCTs = analyzedProcesses.map((p) => p.averageCT);
  const lineCT = allAverageCTs.length > 0 ? Math.max(...allAverageCTs) : 0;

  // 최대 병목 공정
  const sortedByLoad = [...analyzedProcesses].sort((a, b) => b.loadRate - a.loadRate);
  const maxBottleneckProcess = sortedByLoad.length > 0 ? sortedByLoad[0] : null;

  const warningCount = analyzedProcesses.filter((p) => p.status === 'WARNING').length;
  const bottleneckCount = analyzedProcesses.filter((p) => p.status === 'BOTTLENECK').length;

  // 예상 생산 가능 대수 = 가용 생산시간(초) / 라인 CT (정수로 버림)
  const estimatedDailyOutput =
    lineCT > 0 ? Math.floor(availableSeconds / lineCT) : 0;

  // 라인 밸런싱 효율 (Line Balancing Efficiency, LBE)
  const totalProcessCT = allAverageCTs.reduce((acc, curr) => acc + curr, 0);
  const lineEfficiency =
    lineCT > 0 && analyzedProcesses.length > 0
      ? Number(((totalProcessCT / (lineCT * analyzedProcesses.length)) * 100).toFixed(1))
      : 0;

  const achievementRate =
    condition.targetUnits > 0
      ? Number(((estimatedDailyOutput / condition.targetUnits) * 100).toFixed(1))
      : 0;

  // 규칙형 진단 요약 생성 (Rule-based diagnosis)
  let statusText = '정상 가동 가능';
  let primaryConcern = '모든 공정이 목표 Takt Time 이내에서 안정적으로 운영되고 있습니다.';
  let excessInfo = '공정 지연 위험이 감지되지 않았습니다.';
  let recommendation = '현재 생산계획 편성을 유지하며 설비 상태 및 가동률을 모니터링하십시오.';

  if (bottleneckCount > 0 && maxBottleneckProcess) {
    statusText = `병목 위험 감지 (${bottleneckCount}개 공정)`;
    primaryConcern = `최대 병목 공정은 [${maxBottleneckProcess.processName}]입니다. (평균 CT: ${maxBottleneckProcess.averageCT}초, 부하율: ${maxBottleneckProcess.loadRate}%)`;
    excessInfo = `목표 Takt Time(${targetTaktTime}초) 대비 대당 약 ${maxBottleneckProcess.excessSeconds}초를 초과하고 있습니다.`;
    recommendation = `현재 계획 유지 시 일일 생산 목표(${condition.targetUnits}대) 달성이 불가능하며, 예상 생산 가능 대수는 ${estimatedDailyOutput}대에 그칩니다. 해당 공정의 작업 분할(Line Balancing), 보조 작업자 투입, 또는 고부하 등급(Special/Premium)의 투입 분산이 시급합니다.`;
  } else if (warningCount > 0) {
    statusText = `주의 공정 감지 (${warningCount}개 공정)`;
    primaryConcern = `목표 Takt Time에는 미치지 않으나 90% 이상의 고부하 상태인 공정이 존재합니다.`;
    excessInfo = `작업자 피로 누적이나 순간적인 자재 결품 시 즉각적인 라인 정지(Line Stop)로 전이될 위험이 있습니다.`;
    recommendation = `공정별 실시간 작업시간 편차를 점검하고, 버퍼 스톡 확보 및 예비 작업 인력 대기 체계를 확인하십시오.`;
  }

  return {
    availableMinutes,
    availableSeconds,
    targetTaktTime,
    totalPlannedUnits: totalUnits,
    gradeCounts,
    gradeRatios: ratios,
    processes: analyzedProcesses,
    lineCT,
    maxBottleneckProcess,
    warningProcessesCount: warningCount,
    bottleneckProcessesCount: bottleneckCount,
    estimatedDailyOutput,
    lineEfficiency,
    achievementRate,
    ruleBasedDiagnosis: {
      statusText,
      primaryConcern,
      excessInfo,
      recommendation,
    },
  };
}

/**
 * STEP 7. 입력 유효성 검증
 */
export function validateInputs(
  condition: ProductionCondition,
  gradeCounts: Record<VehicleGrade, number>,
  processes: ProcessDefinition[],
  processCTs: ProcessCT[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 생산 조건 검증
  if (condition.targetUnits <= 0) {
    issues.push({
      field: 'targetUnits',
      message: '일일 생산 목표는 1대 이상이어야 합니다.',
      severity: 'error',
    });
  }

  if (condition.workShiftMinutes <= 0) {
    issues.push({
      field: 'workShiftMinutes',
      message: '일일 근무시간은 0분보다 커야 합니다.',
      severity: 'error',
    });
  }

  if (condition.breakMinutes + condition.downtimeMinutes >= condition.workShiftMinutes) {
    issues.push({
      field: 'availableTime',
      message: '휴식시간과 비가동시간의 합이 총 근무시간 이상입니다. 가용시간이 0 이하가 됩니다.',
      severity: 'error',
    });
  }

  // 차량 생산 대수 합계 검증
  const totalGradeUnits = VEHICLE_GRADES.reduce(
    (acc, g) => acc + (gradeCounts[g] || 0),
    0
  );

  if (totalGradeUnits <= 0) {
    issues.push({
      field: 'gradeCounts',
      message: '차량 등급별 생산 대수의 합계가 0대입니다. 1대 이상 입력해야 합니다.',
      severity: 'error',
    });
  } else if (totalGradeUnits !== condition.targetUnits) {
    issues.push({
      field: 'gradeCountsMismatch',
      message: `총 생산 대수 합계(${totalGradeUnits}대)가 일일 생산 목표(${condition.targetUnits}대)와 일치하지 않습니다.`,
      severity: 'warning',
    });
  }

  // 음수 입력 확인
  VEHICLE_GRADES.forEach((g) => {
    if ((gradeCounts[g] || 0) < 0) {
      issues.push({
        field: `grade_${g}`,
        message: `${g} 등급 생산 대수는 0 이상이어야 합니다.`,
        severity: 'error',
      });
    }
  });

  // 공정 CT 유효성 검증
  processes.forEach((p) => {
    const ctItem = processCTs.find((c) => c.processId === p.id);
    if (!ctItem) {
      issues.push({
        field: `ct_${p.id}`,
        message: `[${p.name}] 공정의 Cycle Time 정보가 누락되었습니다.`,
        severity: 'error',
      });
    } else {
      VEHICLE_GRADES.forEach((g) => {
        const val = ctItem.cycleTimes[g];
        if (val === undefined || isNaN(val) || val <= 0) {
          issues.push({
            field: `ct_${p.id}_${g}`,
            message: `[${p.name}] 공정의 ${g} 등급 CT는 0초보다 커야 합니다.`,
            severity: 'error',
          });
        }
      });
    }
  });

  return issues;
}
