export type CompanyTier = '중소기업' | '중견기업' | '대기업' | '복합기업' | '글로벌 대기업';

export interface Company {
  name: string;
  tier: CompanyTier;
  assets: number;
  revenue: number; // This will now represent annual revenue
  debt: number;
  reputation: number;
  employees: number;
  employeeCapacity: number;
  headquartersBuildingId: string;
}

export interface GameProject {
  id: string;
  name: string;
  genre: string;
  platform: string;
  progress: number;
  budget: number;
  expectedRevenue: number;
  startDate: Date;
  releaseDate: Date | null;
  status: 'in-development' | 'released';
  targetCountry: string;
}

export interface GameEventLog {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  isNews?: boolean;
}

export interface Recruitment {
    id: string;
    hires: Record<string, number>;
    weeksRemaining: number;
}

export interface Review {
    projectId: string;
    expertScore: number;
    userRating: number;
    overallScore: number;
}

export interface Department {
    name: string;
    employees: number;
    efficiency: number;
    kpi: number; // Key Performance Indicator
}

export type BuildingType = '사옥' | '데이터센터' | '연구소' | '모션 캡처 스튜디오' | '인재 개발원';

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  cost: number;
  maintenanceFee: number;
  employeeCapacity: number;
  effects: string[];
  isUnique: boolean;
}

export type AssetType = '국내 주식' | '해외 주식' | 'ETF' | '채권' | '가상자산';

export interface FinancialAsset {
  id: string;
  name: string;
  type: AssetType;
  price: number;
  volatility: number; // 0 to 1
}

export interface AssetHolding {
  assetId: string;
  quantity: number;
  averagePrice: number;
}

export interface Portfolio {
  holdings: AssetHolding[];
  totalValue: number;
}

export interface GlobalStrategy {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number; // in weeks
}

export interface GlobalStrategyProject {
  id: string;
  strategyId: string;
  name: string;
  weeksRemaining: number;
  totalWeeks: number;
}

export interface IpStrategy {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number; // in weeks
}

export interface IpStrategyProject {
  id: string;
  strategyId: string;
  name: string;
  weeksRemaining: number;
  totalWeeks: number;
}

export interface RnDStrategy {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: number; // in weeks
}

export interface RnDStrategyProject {
  id: string;
  strategyId: string;
  name: string;
  weeksRemaining: number;
  totalWeeks: number;
}

export interface DepartmentPolicy {
  id: string;
  name: string;
  description: string;
  departments: string[];
  cost: number;
  duration: number; // in weeks
}

export interface ActivePolicy {
  policyId: string;
  name: string;
  weeksRemaining: number;
}

export interface Subsidiary {
  id: string;
  name: string;
  cost: number;
  maintenanceFee: number;
  weeklyRevenue: number;
  description: string;
  isUnique: boolean;
}

export interface Foundation {
  id: string;
  name: string;
  description: string;
  cost: number;
  maintenanceFee: number;
  reputationBonus: number; // Weekly reputation bonus
}

export interface PromotionApplication {
  weeksRemaining: number;
  success: boolean;
}

export interface MarketTrend {
  genre: string;
  trend: 'up' | 'down';
  weeksRemaining: number;
}

export interface TemporaryBoost {
  departmentName: string;
  type: 'efficiency';
  amount: number; // percentage points
  weeksRemaining: number;
}

export interface GameState {
  company: Company;
  projects: GameProject[];
  date: Date;
  eventLog: GameEventLog[];
  isPaused: boolean;
  gameSpeed: number; // ms per week
  recruitments: Recruitment[];
  reviews: Review[];
  departments: Department[];
  buildings: Building[];
  financialAssets: FinancialAsset[];
  portfolio: Portfolio;
  globalStrategies: GlobalStrategyProject[];
  ipStrategies: IpStrategyProject[];
  rndStrategies: RnDStrategyProject[];
  activePolicies: ActivePolicy[];
  subsidiaries: Subsidiary[];
  foundations: Foundation[];
  // Integration properties
  promotionApplication?: PromotionApplication;
  marketTrend?: MarketTrend;
  completedRndStrategies: RnDStrategy[];
  completedGlobalStrategies: GlobalStrategy[];
  completedIpStrategies: IpStrategy[];
  temporaryBoosts: TemporaryBoost[];
}

export interface GameEventPayload extends Omit<GameEventLog, 'id' | 'date'> {
  marketTrend?: {
    genre: string;
    trend: 'up' | 'down';
  };
}

export type GameAction =
  | { type: 'ADVANCE_WEEK' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SET_GAME_SPEED'; payload: number }
  | { type: 'ADD_EVENT'; payload: GameEventPayload }
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'START_RECRUITMENT'; payload: Record<string, number> }
  | { type: 'RELEASE_PROJECT'; payload: { projectId: string } }
  | { type: 'CREATE_DEPARTMENT'; payload: string }
  | { type: 'ABOLISH_DEPARTMENT'; payload: string }
  | { type: 'CREATE_PROJECT'; payload: { name: string; genre: string; platform: string; budget: number; targetCountry: string; } }
  | { type: 'BUY_BUILDING'; payload: Building }
  | { type: 'SELL_BUILDING'; payload: { buildingId: string } }
  | { type: 'BUY_ASSET'; payload: { assetId: string; quantity: number } }
  | { type: 'SELL_ASSET'; payload: { assetId: string; quantity: number } }
  | { type: 'START_GLOBAL_STRATEGY'; payload: GlobalStrategy }
  | { type: 'START_IP_STRATEGY'; payload: IpStrategy }
  | { type: 'START_RND_STRATEGY'; payload: RnDStrategy }
  | { type: 'START_POLICY'; payload: DepartmentPolicy }
  | { type: 'ESTABLISH_SUBSIDIARY'; payload: Subsidiary }
  | { type: 'ESTABLISH_FOUNDATION'; payload: Foundation }
  | { type: 'MOVE_HEADQUARTERS'; payload: { buildingId: string } }
  | { type: 'APPLY_FOR_PROMOTION' }
  | { type: 'GIVE_BONUS'; payload: { departmentName: string; amount: number } };

export type View = 'home' | 'company' | 'departments' | 'employee_management' | 'recruitment' | 'development' | 'reviews' | 'real_estate' | 'finance' | 'patents' | 'global' | 'ip' | 'subsidiaries' | 'foundation' | 'hr' | 'expansion' | 'data_ai' | 'settings';