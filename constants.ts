import { GameState, View, CompanyTier, Building, FinancialAsset, GlobalStrategy, IpStrategy, RnDStrategy, DepartmentPolicy, Subsidiary, Foundation } from './types';
import HomeView from './components/views/HomeView';
import CompanyView from './components/views/CompanyView';
import DepartmentsView from './components/views/DepartmentsView';
import DevelopmentView from './components/views/DevelopmentView';
import RecruitmentView from './components/views/RecruitmentView';
import ReviewsView from './components/views/ReviewsView';
import RealEstateView from './components/views/RealEstateView';
import FinanceView from './components/views/FinanceView';
import PatentsView from './components/views/PatentsView';
import GlobalView from './components/views/GlobalView';
import IpView from './components/views/IpView';
import SubsidiariesView from './components/views/SubsidiariesView';
import EmployeeManagementView from './components/views/EmployeeManagementView';
import SettingsView from './components/views/SettingsView';
import FoundationView from './components/views/FoundationView';
import HrDevelopmentView from './components/views/HrDevelopmentView';
import BusinessExpansionView from './components/views/BusinessExpansionView';
import DataAiView from './components/views/DataAiView';

import Icon from './components/ui/Icon';
import React from 'react';

export const AVAILABLE_FOUNDATIONS: Foundation[] = [
  { id: 'scholarship', name: '게임 개발 장학 재단', description: '차세대 게임 개발자들을 지원하여 산업 발전에 기여하고 회사의 긍정적인 이미지를 구축합니다.', cost: 500 * 100000000, maintenanceFee: 100000000, reputationBonus: 0.1 },
  { id: 'esports_youth', name: '청소년 e스포츠 재단', description: '청소년 e스포츠 대회를 개최하고 유망주를 발굴하여 e스포츠 생태계를 활성화시킵니다.', cost: 300 * 100000000, maintenanceFee: 80000000, reputationBonus: 0.08 },
  { id: 'ai_research', name: 'AI 연구재단', description: 'AI 기술 연구를 후원하여 기술 발전에 기여하고, 회사의 기술 선도 이미지를 강화합니다.', cost: 800 * 100000000, maintenanceFee: 150000000, reputationBonus: 0.12 },
];

export const AVAILABLE_SUBSIDIARIES: Subsidiary[] = [
  { id: 'esports_corp', name: 'e스포츠 법인', cost: 50 * 100000000, maintenanceFee: 20000000, weeklyRevenue: 35000000, description: 'e스포츠 리그 운영, 선수단 관리, 스트리밍 사업을 통해 추가 수익을 창출합니다.', isUnique: true },
  { id: 'animation_studio', name: '영상/애니메이션 스튜디오', cost: 80 * 100000000, maintenanceFee: 30000000, weeklyRevenue: 45000000, description: '게임 IP를 활용한 고품질 영상 및 애니메이션을 제작하여 브랜드 가치를 높입니다.', isUnique: true },
  { id: 'merchandising_co', name: '굿즈·머천다이징 회사', cost: 30 * 100000000, maintenanceFee: 15000000, weeklyRevenue: 25000000, description: '게임 캐릭터와 세계관을 기반으로 한 다양한 굿즈를 제작 및 판매합니다.', isUnique: true },
  { id: 'webtoon_studio', name: '출판/웹툰 스튜디오', cost: 40 * 100000000, maintenanceFee: 18000000, weeklyRevenue: 30000000, description: '게임의 스토리를 웹툰, 소설 등 다른 매체로 확장하여 IP의 생명력을 연장합니다.', isUnique: true },
  { id: 'ai_dev_co', name: 'AI 개발 전문 회사', cost: 120 * 100000000, maintenanceFee: 50000000, weeklyRevenue: 70000000, description: '게임 개발을 지원하는 AI 기술 및 솔루션을 전문적으로 연구하고 판매합니다.', isUnique: true },
  { id: 'qa_outsourcing', name: '게임 QA 외주 회사', cost: 20 * 100000000, maintenanceFee: 25000000, weeklyRevenue: 30000000, description: '내부 및 외부 프로젝트의 QA를 담당하여 안정적인 수익을 창출합니다.', isUnique: true },
  { id: 'global_publishing', name: '해외 퍼블리싱 법인', cost: 100 * 100000000, maintenanceFee: 40000000, weeklyRevenue: 60000000, description: '해외 시장에 직접 게임을 퍼블리싱하여 수익을 극대화하고 시장 지배력을 강화합니다.', isUnique: true },
];

export const DEPARTMENT_POLICIES: DepartmentPolicy[] = [
  { id: 'salary_negotiation', name: '연봉 협상 시즌', description: '직원 만족도와 충성도를 반영하여 연봉을 조정합니다. 예산 변동이 발생합니다.', departments: ['인사'], cost: 500000000, duration: 4 },
  { id: 'remote_work', name: '재택근무', description: '인건비 및 시설비를 절감하지만, 커뮤니케이션 감소로 개발 효율이 일부 하락할 수 있습니다.', departments: ['인사', '개발', '운영'], cost: 100000000, duration: 24 },
  { id: 'ai_dev', name: 'AI 기반 개발', description: 'AI를 활용하여 개발 속도를 높이고 버그 발생률을 감소시켜 AAA 프로젝트 효율을 높입니다.', departments: ['개발'], cost: 1000000000, duration: 12 },
  { id: 'qa_reinforcement', name: 'QA 강화', description: '출시 버전의 안정성을 높여 유저 리뷰 점수를 상승시키고 CS/운영 부담을 줄입니다.', departments: ['운영'], cost: 300000000, duration: 8 },
  { id: 'streamer_event', name: '스트리머 이벤트', description: '스트리머와 협업하여 단기간에 매출을 증대시키고 신규 유저를 확보합니다.', departments: ['마케팅', 'e스포츠·콘텐츠'], cost: 800000000, duration: 4 },
  { id: 'global_ad', name: '글로벌 광고 계약', description: '글로벌 광고를 집행하여 국가별 유저 확보(UA) 성과를 관리합니다. 해외 서버 및 현지화와 연계됩니다.', departments: ['현지화팀', '마케팅'], cost: 1200000000, duration: 8 },
  { id: 'offline_event', name: '오프라인 행사·컨벤션 참가', description: '브랜드 가치를 높이고 투자자 및 유저의 신뢰를 상승시킵니다. 신작 정보 공개 기회로 활용할 수 있습니다.', departments: ['마케팅'], cost: 1500000000, duration: 2 },
  { id: 'monetization_adjustment', name: '과금 모델 조정', description: '유저 반응, 시스템, 커뮤니티, 매출 예측을 종합적으로 분석하여 과금 모델을 변경합니다.', departments: ['운영', '개발', '마케팅', '투자·재무'], cost: 200000000, duration: 12 },
  { id: 'exec_meeting', name: '임원 회의', description: '회사 전체 정책을 조율하고 프로젝트 승인 및 리스크 대응 속도를 높입니다.', departments: ['미래전략실'], cost: 50000000, duration: 1 },
];

export const AVAILABLE_BUILDINGS: Building[] = [
  { id: 'office_small', name: '30평대 3층 소형 사옥', type: '사옥', cost: 20 * 100000000, maintenanceFee: 5000000, employeeCapacity: 30, effects: ['직원 30명 수용'], isUnique: false },
  { id: 'office_medium', name: '60평대 6층 중형 사옥', type: '사옥', cost: 50 * 100000000, maintenanceFee: 10000000, employeeCapacity: 60, effects: ['직원 60명 수용'], isUnique: false },
  { id: 'office_large', name: '90평대 12층 대형 사옥', type: '사옥', cost: 100 * 100000000, maintenanceFee: 20000000, employeeCapacity: 120, effects: ['직원 120명 수용'], isUnique: false },
  { id: 'office_xlarge', name: '150평대 20층 초대형 사옥', type: '사옥', cost: 250 * 100000000, maintenanceFee: 50000000, employeeCapacity: 300, effects: ['직원 300명 수용'], isUnique: false },
  { id: 'office_hq', name: '본사 빌딩', type: '사옥', cost: 1000 * 100000000, maintenanceFee: 200000000, employeeCapacity: 1000, effects: ['직원 1000명 수용'], isUnique: false },
  { id: 'data_center', name: '데이터센터', type: '데이터센터', cost: 300 * 100000000, maintenanceFee: 80000000, employeeCapacity: 0, effects: ['서버 안정성 ↑'], isUnique: true },
  { id: 'research_lab', name: '연구소', type: '연구소', cost: 200 * 100000000, maintenanceFee: 60000000, employeeCapacity: 0, effects: ['R&D 속도 ↑', '특허 성공률 ↑'], isUnique: true },
  { id: 'motion_capture_studio', name: '모션 캡처 스튜디오', type: '모션 캡처 스튜디오', cost: 150 * 100000000, maintenanceFee: 40000000, employeeCapacity: 0, effects: ['AAA 게임 품질 보너스 ↑'], isUnique: true },
  { id: 'hr_dev_center', name: '인재 개발원', type: '인재 개발원', cost: 180 * 100000000, maintenanceFee: 45000000, employeeCapacity: 0, effects: ['내부 연수 효율 ↑', '직원 능력치 상승'], isUnique: true },
];

export const FINANCIAL_ASSETS: FinancialAsset[] = [
    // 국내 주식
    { id: 'stock_kr_1', name: 'K-게임즈', type: '국내 주식', price: 85000, volatility: 0.15 },
    { id: 'stock_kr_2', name: '메타버스 코리아', type: '국내 주식', price: 120000, volatility: 0.2 },
    { id: 'stock_kr_3', name: '서울 반도체', type: '국내 주식', price: 55000, volatility: 0.1 },
    { id: 'stock_kr_4', name: 'AI 솔루션즈', type: '국내 주식', price: 210000, volatility: 0.25 },
    { id: 'stock_kr_5', name: '미래 모빌리티', type: '국내 주식', price: 95000, volatility: 0.18 },
    // 해외 주식
    { id: 'stock_us_1', name: 'Global Gaming Inc.', type: '해외 주식', price: 150, volatility: 0.12 },
    { id: 'stock_us_2', name: 'Silicon Valley Tech', type: '해외 주식', price: 320, volatility: 0.18 },
    { id: 'stock_us_3', name: 'NextGen AI Corp', type: '해외 주식', price: 500, volatility: 0.3 },
    { id: 'stock_us_4', name: 'Quantum Computing Co.', type: '해외 주식', price: 80, volatility: 0.4 },
    { id: 'stock_us_5', name: 'Cloud Services Giant', type: '해외 주식', price: 280, volatility: 0.1 },
    // ETF/채권
    { id: 'etf_1', name: 'KODEX 200', type: 'ETF', price: 30000, volatility: 0.05 },
    { id: 'etf_2', name: 'TIGER 나스닥 100', type: 'ETF', price: 80000, volatility: 0.08 },
    { id: 'etf_3', name: '글로벌 리튬&2차전지', type: 'ETF', price: 15000, volatility: 0.22 },
    { id: 'bond_1', name: '대한민국 국채 10년', type: '채권', price: 100000, volatility: 0.01 },
    { id: 'bond_2', name: '미국 국채 20년', type: '채권', price: 105, volatility: 0.02 },
    // 코인
    { id: 'crypto_1', name: '겜코인 (GMC)', type: '가상자산', price: 1500, volatility: 0.5 },
    { id: 'crypto_2', name: '테크리움 (TCR)', type: '가상자산', price: 80000, volatility: 0.4 },
    { id: 'crypto_3', name: 'AI 코인 (AIC)', type: '가상자산', price: 500, volatility: 0.6 },
    { id: 'crypto_4', name: '사이버 토큰 (CYT)', type: '가상자산', price: 2200, volatility: 0.45 },
    { id: 'crypto_5', name: '메타버스 캐시 (MVC)', type: '가상자산', price: 50, volatility: 0.8 },
];

export const GLOBAL_STRATEGIES: GlobalStrategy[] = [
    { id: 'localization', name: '현지화 (번역, 보이스)', description: '현지 문화와 언어에 맞게 게임을 번역하고 더빙하여 현지 유저들의 몰입감을 극대화합니다. 성공적인 글로벌 진출의 첫걸음입니다.', cost: 30 * 100000000, duration: 8 },
    { id: 'server', name: '해외 서버 구축', description: '해외 주요 거점에 데이터센터를 구축하여 빠르고 안정적인 게임 플레이 환경을 제공합니다. 쾌적한 네트워크는 유저 만족도의 핵심입니다.', cost: 100 * 100000000, duration: 24 },
    { id: 'publishing', name: '해외 퍼블리셔 계약', description: '현지 시장에 대한 깊은 이해를 가진 퍼블리셔와 계약하여 마케팅 및 운영 효율을 높입니다. 리스크를 줄이고 안정적인 시장 안착을 도모할 수 있습니다.', cost: 50 * 100000000, duration: 12 },
    { id: 'advertising', name: '글로벌 광고', description: '전 세계 유저들을 대상으로 대규모 마케팅 캠페인을 진행하여 게임의 인지도를 높이고 초기 흥행을 유도합니다.', cost: 80 * 100000000, duration: 4 },
    { id: 'pricing', name: '글로벌 가격 정책', description: '각 국가의 경제 상황과 유저 성향에 맞는 최적의 가격 정책을 수립하여 매출을 극대화합니다.', cost: 10 * 100000000, duration: 6 },
    { id: 'branch', name: '해외 지사 설립', description: '해외 주요 시장에 지사를 설립하여 현지 사업을 총괄하고, 빠른 의사결정과 긴밀한 파트너십을 통해 시장 지배력을 강화합니다.', cost: 200 * 100000000, duration: 36 },
];

export const IP_STRATEGIES: IpStrategy[] = [
    { id: 'license_in', name: '유명 IP 라이선스 계약', description: '전 세계적으로 유명한 IP를 라이선스하여 게임을 개발합니다. 높은 인지도를 바탕으로 초기 흥행을 보장받을 수 있지만, 높은 로열티 비용이 발생합니다.', cost: 150 * 100000000, duration: 4 },
    { id: 'collab', name: 'IP 콜로보', description: '자사의 IP와 다른 유명 IP가 협업하여 새로운 콘텐츠를 만듭니다. 양측 팬덤을 모두 공략하여 시너지를 창출할 수 있습니다.', cost: 50 * 100000000, duration: 12 },
    { id: 'media_mix', name: '영상/웹툰/굿즈 등 미디어 확장', description: '자사의 게임 IP를 활용하여 웹툰, 애니메이션, 굿즈 등 다양한 미디어로 확장하여 IP의 생명력을 연장하고 추가 수익을 창출합니다.', cost: 80 * 100000000, duration: 24 },
    { id: 'animation', name: '애니메이션 제작', description: '게임의 스토리와 세계관을 기반으로 고품질 애니메이션을 제작하여 IP의 팬덤을 공고히 하고 글로벌 시장에 IP를 알립니다.', cost: 200 * 100000000, duration: 52 },
    { id: 'license_renew', name: '라이선스 계약 갱신', description: '기존에 계약한 IP의 라이선스를 갱신하여 서비스를 지속하거나 후속작을 개발합니다. 안정적인 매출원을 확보할 수 있습니다.', cost: 100 * 100000000, duration: 2 },
    { id: 'co_dev', name: '타사 프로젝트 공동 개발', description: '다른 개발사와 협력하여 프로젝트를 공동으로 개발합니다. 리스크를 분산하고 양사의 기술적 장점을 결합할 수 있습니다.', cost: 0, duration: 16 },
    { id: 'platform_expansion', name: '콘솔·모바일 플랫폼 확장', description: '기존에 성공한 PC 게임을 콘솔이나 모바일 등 다른 플랫폼으로 확장 출시하여 새로운 유저층을 공략합니다.', cost: 60 * 100000000, duration: 30 },
];

export const RND_STRATEGIES: RnDStrategy[] = [
    { id: 'engine', name: '독자 엔진 개발', description: '게임의 핵심 기반이 되는 자체 엔진을 개발하여 최적화 및 기술적 독립성을 확보합니다. 장기적으로 개발 속도와 게임 품질에 큰 영향을 미칩니다.', cost: 500 * 100000000, duration: 104 },
    { id: 'ai_support', name: 'AI 개발 지원 시스템', description: 'AI를 활용하여 개발 프로세스를 자동화하고 버그를 예측하는 등 개발 효율을 극대화하는 시스템을 구축합니다.', cost: 150 * 100000000, duration: 52 },
    { id: 'ai_npc', name: 'AI NPC/적응형 AI', description: '플레이어의 행동에 실시간으로 반응하고 학습하는 지능형 NPC를 연구하여 더욱 생동감 넘치는 게임 월드를 만듭니다.', cost: 80 * 100000000, duration: 40 },
    { id: 'physics', name: '물리 엔진 연구', description: '현실적인 물리 현상을 시뮬레이션하는 엔진을 개발하여 게임의 몰입감과 사실성을 높입니다.', cost: 120 * 100000000, duration: 60 },
    { id: 'patent', name: '특허 제출 및 수익화', description: '개발한 고유 기술을 특허로 등록하여 회사의 자산을 보호하고, 타사에 라이선스를 판매하여 추가 수익을 창출합니다.', cost: 10 * 100000000, duration: 24 },
    { id: 'security', name: '보안·안티치트 기술 개발', description: '해킹과 불법 프로그램을 방지하는 강력한 보안 솔루션을 개발하여 공정한 게임 환경과 유저 경험을 보호합니다.', cost: 70 * 100000000, duration: 36 },
];

const initialDepartments = [
    { name: '개발', employees: 10, efficiency: Math.floor(Math.random() * 101) },
    { name: '운영', employees: 2, efficiency: Math.floor(Math.random() * 101) },
    { name: '마케팅', employees: 2, efficiency: Math.floor(Math.random() * 101) },
    { name: '투자·재무', employees: 1, efficiency: Math.floor(Math.random() * 101) },
    { name: '인사', employees: 1, efficiency: Math.floor(Math.random() * 101) },
    { name: '현지화팀', employees: 1, efficiency: Math.floor(Math.random() * 101) },
    { name: 'e스포츠·콘텐츠', employees: 0, efficiency: Math.floor(Math.random() * 101) },
];

export const INITIAL_GAME_STATE: GameState = {
  company: {
    name: '새로운 게임 스튜디오',
    tier: '중소기업',
    assets: 100000000000,
    revenue: 0,
    debt: 0,
    reputation: 50,
    employees: 17,
    employeeCapacity: 30,
    headquartersBuildingId: AVAILABLE_BUILDINGS[0].id,
  },
  projects: [
    {
      id: 'proj_1',
      name: '프로젝트: 드래곤소울',
      genre: '판타지 RPG',
      platform: 'PC',
      progress: 5,
      budget: 1000000000,
      expectedRevenue: 5000000000,
      startDate: new Date('2025-01-01'),
      releaseDate: null,
      status: 'in-development',
      targetCountry: '국내',
    },
  ],
  date: new Date('2025-01-01'),
  eventLog: [
    {
      id: 'log_0',
      date: new Date('2025-01-01'),
      title: '새로운 시작',
      description: 'CEO로서의 첫 주입니다. 회사를 성공으로 이끌어 보세요.',
      type: 'neutral',
    },
  ],
  isPaused: true,
  gameSpeed: 1000, // 1 second per week
  recruitments: [],
  reviews: [],
  departments: initialDepartments.map(d => ({ ...d, kpi: d.efficiency })),
  buildings: [AVAILABLE_BUILDINGS[0]],
  financialAssets: FINANCIAL_ASSETS,
  portfolio: {
    holdings: [],
    totalValue: 0,
  },
  globalStrategies: [],
  ipStrategies: [],
  rndStrategies: [],
  activePolicies: [],
  subsidiaries: [],
  foundations: [],
  promotionApplication: undefined,
  marketTrend: undefined,
  completedRndStrategies: [],
  completedGlobalStrategies: [],
  completedIpStrategies: [],
  temporaryBoosts: [],
};

export const GAME_GENRES = ['판타지 RPG', 'SF FPS', '경영 시뮬레이션', '캐주얼 퍼즐', '스포츠', '호러', '액션 어드벤처'];
export const PLATFORMS = ['PC', '모바일', '콘솔', 'VR/AR'];
export const TARGET_COUNTRIES = ['국내', '북미', '유럽', '일본', '중국', '글로벌'];


export const TIER_REQUIREMENTS: Record<CompanyTier, { assets: number; employees: number; revenue: number; description?: string; nextTier: CompanyTier | null }> = {
  '중소기업': {
    assets: 100 * 100000000, // 100억
    employees: 50,
    revenue: 500 * 100000000, // 500억 (연 매출)
    nextTier: '중견기업',
  },
  '중견기업': {
    assets: 500 * 100000000, // 500억
    employees: 300,
    revenue: 1000 * 100000000, // 1000억 (연 매출)
    nextTier: '대기업',
  },
  '대기업': {
    assets: 0, // Descriptive requirements take precedence
    employees: 0,
    revenue: 0,
    description: '게임 외 e스포츠/부동산/금융/콘텐츠 등 복수 사업 확장',
    nextTier: '복합기업',
  },
  '복합기업': {
    assets: 2000 * 100000000, // 2000억
    employees: 0, // Not a primary requirement at this stage
    revenue: 0, // Global revenue is the key
    description: '글로벌 매출 충족',
    nextTier: '글로벌 대기업',
  },
  '글로벌 대기업': {
    assets: 0,
    employees: 0,
    revenue: 0,
    nextTier: null,
  },
};

export const MENU_ITEMS: { id: View; name: string; icon: React.ReactNode; component: React.FC }[] = [
  { id: 'home', name: '홈', icon: Icon.Home, component: HomeView },
  { id: 'company', name: '회사 관리', icon: Icon.Building, component: CompanyView },
  { id: 'departments', name: '부서 관리', icon: Icon.Users, component: DepartmentsView },
  { id: 'employee_management', name: '직원 관리', icon: Icon.User, component: EmployeeManagementView },
  { id: 'recruitment', name: '채용', icon: Icon.UserPlus, component: RecruitmentView },
  { id: 'development', name: '게임 개발', icon: Icon.Gamepad, component: DevelopmentView },
  { id: 'reviews', name: '리뷰 관리', icon: Icon.Star, component: ReviewsView },
  { id: 'real_estate', name: '부동산', icon: Icon.Office, component: RealEstateView },
  { id: 'finance', name: '금융/투자/계약', icon: Icon.Chart, component: FinanceView },
  { id: 'patents', name: 'R&D/특허', icon: Icon.Lightbulb, component: PatentsView },
  { id: 'global', name: '글로벌 시장', icon: Icon.Globe, component: GlobalView },
  { id: 'ip', name: '합작·IP·콘텐츠', icon: Icon.Puzzle, component: IpView },
  { id: 'subsidiaries', name: '계열사', icon: Icon.Sitemap, component: SubsidiariesView },
  { id: 'foundation', name: '재단', icon: Icon.Heart, component: FoundationView },
  { id: 'hr', name: '신입/인재 개발', icon: Icon.UserGraduate, component: HrDevelopmentView },
  { id: 'expansion', name: '사업 확장', icon: Icon.Briefcase, component: BusinessExpansionView },
  { id: 'data_ai', name: '그룹화/데이터 AI', icon: Icon.Brain, component: DataAiView },
  { id: 'settings', name: '설정', icon: Icon.Cog, component: SettingsView },
];