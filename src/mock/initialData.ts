import {
  ProductionCondition,
  VehicleGrade,
  VehicleOption,
  ProcessDefinition,
  ProcessCT,
  SimulationScenario,
} from '../types/production';

export const INITIAL_PRODUCTION_CONDITION: ProductionCondition = {
  targetUnits: 500,
  workShiftMinutes: 480,
  breakMinutes: 60,
  downtimeMinutes: 20,
};

export const INITIAL_GRADE_COUNTS: Record<VehicleGrade, number> = {
  Basic: 200,
  Classic: 150,
  Premium: 100,
  Special: 50,
};

export const INITIAL_VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'opt_surround_view',
    name: '서라운드 뷰 카메라',
    availability: {
      Basic: false,
      Classic: false,
      Premium: true,
      Special: true,
    },
  },
  {
    id: 'opt_radar_sensor',
    name: '전방 레이더 센서',
    availability: {
      Basic: false,
      Classic: true,
      Premium: true,
      Special: true,
    },
  },
  {
    id: 'opt_hud',
    name: '헤드업 디스플레이 (HUD)',
    availability: {
      Basic: false,
      Classic: false,
      Premium: true,
      Special: true,
    },
  },
  {
    id: 'opt_power_seat',
    name: '전동·통풍 시트',
    availability: {
      Basic: false,
      Classic: true,
      Premium: true,
      Special: true,
    },
  },
  {
    id: 'opt_sunroof',
    name: '파노라마 선루프',
    availability: {
      Basic: false,
      Classic: false,
      Premium: false,
      Special: true,
    },
  },
];

export const INITIAL_PROCESSES: ProcessDefinition[] = [
  { id: 'proc_dash', name: '대시보드 조립', order: 1 },
  { id: 'proc_elec', name: '전장 조립', order: 2 },
  { id: 'proc_seat', name: '시트 장착', order: 3 },
  { id: 'proc_roof', name: '루프 조립', order: 4 },
  { id: 'proc_ext', name: '외장 조립', order: 5 },
];

export const INITIAL_PROCESS_CTS: ProcessCT[] = [
  {
    processId: 'proc_dash',
    cycleTimes: {
      Basic: 40,
      Classic: 45,
      Premium: 65,
      Special: 75,
    },
  },
  {
    processId: 'proc_elec',
    cycleTimes: {
      Basic: 35,
      Classic: 45,
      Premium: 55,
      Special: 60,
    },
  },
  {
    processId: 'proc_seat',
    cycleTimes: {
      Basic: 40,
      Classic: 50,
      Premium: 65,
      Special: 75,
    },
  },
  {
    processId: 'proc_roof',
    cycleTimes: {
      Basic: 30,
      Classic: 35,
      Premium: 40,
      Special: 65,
    },
  },
  {
    processId: 'proc_ext',
    cycleTimes: {
      Basic: 35,
      Classic: 40,
      Premium: 45,
      Special: 50,
    },
  },
];

export const PRESET_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scenario_a',
    name: '시나리오 A (기본 표준 모델)',
    description: 'Basic 40%, Classic 30%, Premium 20%, Special 10%',
    gradeRatios: {
      Basic: 40,
      Classic: 30,
      Premium: 20,
      Special: 10,
    },
  },
  {
    id: 'scenario_b',
    name: '시나리오 B (중고급 트림 확대)',
    description: 'Basic 20%, Classic 30%, Premium 30%, Special 20%',
    gradeRatios: {
      Basic: 20,
      Classic: 30,
      Premium: 30,
      Special: 20,
    },
  },
  {
    id: 'scenario_c',
    name: '시나리오 C (최고급 특화 집중)',
    description: 'Basic 10%, Classic 20%, Premium 30%, Special 40%',
    gradeRatios: {
      Basic: 10,
      Classic: 20,
      Premium: 30,
      Special: 40,
    },
  },
];
