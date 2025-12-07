import React, { createContext, useReducer, Dispatch, useContext, ReactNode, useEffect } from 'react';
import { GameState, GameAction, GameEventLog, Recruitment, Review, Department, GameProject, Building, AssetHolding, GlobalStrategyProject, GlobalStrategy, IpStrategy, IpStrategyProject, RnDStrategy, RnDStrategyProject, DepartmentPolicy, ActivePolicy, Subsidiary, Foundation, GameEventPayload, CompanyTier, TemporaryBoost } from '../types';
import { INITIAL_GAME_STATE, TIER_REQUIREMENTS, GLOBAL_STRATEGIES, IP_STRATEGIES, RND_STRATEGIES, DEPARTMENT_POLICIES, GAME_GENRES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameDispatchContext = createContext<Dispatch<GameAction> | undefined>(undefined);

const calculateCapacity = (buildings: Building[]): number => {
  return buildings.reduce((sum, b) => sum + b.employeeCapacity, 0);
};

// --- Helper Functions ---
function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = [];
    const fail: T[] = [];
    array.forEach(item => (predicate(item) ? pass : fail).push(item));
    return [pass, fail];
}

const calculateBonuses = (state: GameState, departmentBoosts: Record<string, number>) => {
    const bonuses = {
        devSpeed: 1.0,
        reviewScore: 0,
        rndSpeed: 1.0,
        departmentEfficiencies: { ...departmentBoosts }
    };

    // Building bonuses
    state.buildings.forEach(b => {
        if (b.type === '연구소') bonuses.rndSpeed += 0.2;
    });

    // Policy bonuses
    state.activePolicies.forEach(p => {
        if (p.policyId === 'ai_dev') bonuses.devSpeed += 0.25;
        if (p.policyId === 'salary_negotiation') {
            Object.keys(bonuses.departmentEfficiencies).forEach(deptName => {
                bonuses.departmentEfficiencies[deptName] = (bonuses.departmentEfficiencies[deptName] || 0) + 5;
            });
        }
    });

    // R&D bonuses
    state.completedRndStrategies.forEach(r => {
        if (r.id === 'engine') bonuses.devSpeed += 0.15;
        if (r.id === 'ai_support') bonuses.devSpeed += 0.1;
    });

    return bonuses;
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'ADVANCE_WEEK': {
      const newDate = new Date(state.date);
      newDate.setDate(newDate.getDate() + 7);
      const newEvents: GameEventLog[] = [];

      // --- Temporary Boosts Processing ---
      const departmentBoosts: Record<string, number> = {};
      const ongoingBoosts = state.temporaryBoosts
        .map(b => ({ ...b, weeksRemaining: b.weeksRemaining - 1 }))
        .filter(b => {
            if (b.weeksRemaining > 0) {
                if (b.type === 'efficiency') {
                    departmentBoosts[b.departmentName] = (departmentBoosts[b.departmentName] || 0) + b.amount;
                }
                return true;
            }
            return false;
        });

      const bonuses = calculateBonuses(state, departmentBoosts);

      // --- Policy Effects ---
      let policyCostMultiplier = 1.0;
      if (state.activePolicies.some(p => p.policyId === 'salary_negotiation')) {
          policyCostMultiplier += 0.1;
      }
      const ongoingPolicies = state.activePolicies
        .map(p => ({ ...p, weeksRemaining: p.weeksRemaining - 1 }))
        .filter(p => {
            if (p.weeksRemaining <= 0) {
                newEvents.push({ id: uuidv4(), date: newDate, title: '정책 만료', description: `'${p.name}' 정책이 만료되었습니다.`, type: 'neutral' });
                return false;
            }
            return true;
        });

      let updatedDepartments = state.departments.map(d => {
        const efficiencyBoost = bonuses.departmentEfficiencies[d.name] || 0;
        const newEfficiency = Math.min(100, d.efficiency + efficiencyBoost);
        const newKpi = Math.max(0, Math.min(100, Math.round(newEfficiency + (Math.random() * 10 - 5))));
        return { ...d, efficiency: newEfficiency, kpi: newKpi };
      });

      // --- Building Effects ---
      if (state.buildings.some(b => b.type === '인재 개발원') && Math.random() < 0.2) {
        const randomIndex = Math.floor(Math.random() * updatedDepartments.length);
        const originalEfficiency = updatedDepartments[randomIndex].efficiency - (bonuses.departmentEfficiencies[updatedDepartments[randomIndex].name] || 0);
        updatedDepartments[randomIndex].efficiency = Math.min(100, originalEfficiency + 1) + (bonuses.departmentEfficiencies[updatedDepartments[randomIndex].name] || 0);
      }
      
      // --- Costs & Revenues ---
      const weeklyEmployeeCost = state.company.employees * 1500000 * policyCostMultiplier;
      const weeklyMaintenanceCost = state.buildings.reduce((sum, b) => sum + b.maintenanceFee, 0);
      const weeklySubsidiaryCost = state.subsidiaries.reduce((sum, s) => sum + s.maintenanceFee, 0);
      const weeklySubsidiaryRevenue = state.subsidiaries.reduce((sum, s) => sum + s.weeklyRevenue, 0);
      const weeklyFoundationCost = state.foundations.reduce((sum, f) => sum + f.maintenanceFee, 0);
      const weeklyReputationBonus = state.foundations.reduce((sum, f) => sum + f.reputationBonus, 0);
      let weeklyProjectCost = 0;

      // --- Project Progress ---
      const devDept = updatedDepartments.find(d => d.name === '개발');
      const devProgressPerWeek = devDept ? (0.5 + devDept.employees * 0.05) * (1 + (devDept.efficiency - 50) / 100) * bonuses.devSpeed : 0.5 * bonuses.devSpeed;
      
      const updatedProjects = state.projects.map(p => {
        if (p.status === 'in-development') {
            const progressThisWeek = Math.max(0, devProgressPerWeek);
            const weeksToComplete = 100 / progressThisWeek;
            weeklyProjectCost += p.budget / weeksToComplete;
            return { ...p, progress: Math.min(100, p.progress + progressThisWeek) };
        }
        return p;
      });

      // --- Recruitment ---
      let totalNewHires = 0;
      const ongoingRecruitments = state.recruitments
        .map(rec => ({ ...rec, weeksRemaining: rec.weeksRemaining - 1 }))
        .filter(rec => {
          if (rec.weeksRemaining <= 0) {
            Object.entries(rec.hires).forEach(([deptName, count]) => {
                const dept = updatedDepartments.find(d => d.name === deptName);
                if (dept) {
                    dept.employees += count;
                    totalNewHires += count;
                }
            });
            return false;
          }
          return true;
        });

      const availableSpace = state.company.employeeCapacity - state.company.employees;
      const actualHires = Math.max(0, Math.min(totalNewHires, availableSpace));
      const lostHires = totalNewHires - actualHires;
      if (actualHires > 0) newEvents.push({ id: uuidv4(), date: newDate, title: '채용 완료', description: `${actualHires}명의 새로운 직원이 각 부서에 배치되었습니다.`, type: 'positive' });
      if (lostHires > 0) newEvents.push({ id: uuidv4(), date: newDate, title: '채용 실패', description: `사무 공간이 부족하여 ${lostHires}명의 인재를 놓쳤습니다.`, type: 'negative' });
      
      // --- Financial Market ---
      const updatedFinancialAssets = state.financialAssets.map(asset => {
          const change = (Math.random() - 0.5) * 2 * asset.volatility * 0.5;
          return { ...asset, price: Math.max(1, asset.price * (1 + change)) };
      });
      const updatedPortfolioValue = state.portfolio.holdings.reduce((sum, h) => {
          const asset = updatedFinancialAssets.find(a => a.id === h.assetId);
          return sum + (asset ? asset.price * h.quantity : 0);
      }, 0);
      
      // --- Strategy/R&D Progress & Completion ---
      const [ongoingRndStrategies, newlyCompletedRnd] = partition(state.rndStrategies.map(p => ({ ...p, weeksRemaining: p.weeksRemaining - 1 })), p => p.weeksRemaining > 0);
      const [ongoingGlobalStrategies, newlyCompletedGlobal] = partition(state.globalStrategies.map(p => ({ ...p, weeksRemaining: p.weeksRemaining - 1 })), p => p.weeksRemaining > 0);
      const [ongoingIpStrategies, newlyCompletedIp] = partition(state.ipStrategies.map(p => ({ ...p, weeksRemaining: p.weeksRemaining - 1 })), p => p.weeksRemaining > 0);

      newlyCompletedRnd.forEach(p => newEvents.push({ id: uuidv4(), date: newDate, title: 'R&D 프로젝트 완료', description: `'${p.name}' 연구가 성공적으로 완료되었습니다.`, type: 'positive'}));
      newlyCompletedGlobal.forEach(p => newEvents.push({ id: uuidv4(), date: newDate, title: '글로벌 전략 완료', description: `'${p.name}' 전략이 성공적으로 완료되었습니다.`, type: 'positive'}));
      newlyCompletedIp.forEach(p => newEvents.push({ id: uuidv4(), date: newDate, title: 'IP 프로젝트 완료', description: `'${p.name}' 프로젝트가 성공적으로 완료되었습니다.`, type: 'positive'}));

      const completedRndDefs = newlyCompletedRnd.map(p => RND_STRATEGIES.find(s => s.id === p.strategyId)).filter(Boolean) as RnDStrategy[];
      const completedGlobalDefs = newlyCompletedGlobal.map(p => GLOBAL_STRATEGIES.find(s => s.id === p.strategyId)).filter(Boolean) as GlobalStrategy[];
      const completedIpDefs = newlyCompletedIp.map(p => IP_STRATEGIES.find(s => s.id === p.strategyId)).filter(Boolean) as IpStrategy[];

      // --- Countdown Timers ---
      let updatedPromotionApplication = state.promotionApplication;
      let nextTier: CompanyTier | null = null;
      if (updatedPromotionApplication) {
          updatedPromotionApplication.weeksRemaining--;
          if (updatedPromotionApplication.weeksRemaining <= 0) {
              const currentTierInfo = TIER_REQUIREMENTS[state.company.tier];
              if (updatedPromotionApplication.success && currentTierInfo.nextTier) {
                  nextTier = currentTierInfo.nextTier;
                  newEvents.push({id: uuidv4(), date: newDate, title: '승격 성공!', description: `회사가 ${nextTier}(으)로 성장했습니다!`, type: 'positive'});
              } else {
                  newEvents.push({id: uuidv4(), date: newDate, title: '승격 실패', description: '승격 심사에서 탈락했습니다. 조건을 다시 확인해주세요.', type: 'negative'});
              }
              updatedPromotionApplication = undefined;
          }
      }

      let updatedMarketTrend = state.marketTrend;
      if (updatedMarketTrend) {
          updatedMarketTrend.weeksRemaining--;
          if (updatedMarketTrend.weeksRemaining <= 0) {
              updatedMarketTrend = undefined;
          }
      }

      // --- Final State Assembly ---
      return {
        ...state,
        date: newDate,
        company: {
          ...state.company,
          tier: nextTier || state.company.tier,
          assets: state.company.assets - weeklyEmployeeCost - weeklyProjectCost - weeklyMaintenanceCost - weeklySubsidiaryCost - weeklyFoundationCost + weeklySubsidiaryRevenue,
          employees: state.company.employees + actualHires,
          reputation: Math.max(0, Math.min(100, state.company.reputation + weeklyReputationBonus)),
        },
        projects: updatedProjects,
        recruitments: ongoingRecruitments,
        departments: updatedDepartments.map(d => ({...d, efficiency: d.efficiency - (departmentBoosts[d.name] || 0)})),
        financialAssets: updatedFinancialAssets,
        portfolio: { ...state.portfolio, totalValue: updatedPortfolioValue },
        globalStrategies: ongoingGlobalStrategies,
        completedGlobalStrategies: [...state.completedGlobalStrategies, ...completedGlobalDefs],
        ipStrategies: ongoingIpStrategies,
        completedIpStrategies: [...state.completedIpStrategies, ...completedIpDefs],
        rndStrategies: ongoingRndStrategies,
        completedRndStrategies: [...state.completedRndStrategies, ...completedRndDefs],
        activePolicies: ongoingPolicies,
        promotionApplication: updatedPromotionApplication,
        marketTrend: updatedMarketTrend,
        temporaryBoosts: ongoingBoosts,
        eventLog: [...newEvents, ...state.eventLog].slice(0, 100),
      };
    }
    case 'ADD_EVENT': {
      const { marketTrend, ...eventPayload } = action.payload;
      const newEvent: GameEventLog = {
        ...eventPayload,
        id: uuidv4(),
        date: new Date(state.date),
      };
      let newMarketTrend = state.marketTrend;
      if (marketTrend) {
          newMarketTrend = {
              genre: marketTrend.genre,
              trend: marketTrend.trend,
              weeksRemaining: 12, // Trend lasts for 12 weeks
          };
      }
      return {
        ...state,
        eventLog: [newEvent, ...state.eventLog].slice(0, 100),
        marketTrend: newMarketTrend,
      };
    }
    case 'RELEASE_PROJECT': {
        const { projectId } = action.payload;
        const projectToRelease = state.projects.find(p => p.id === projectId);
        if (!projectToRelease) return state;

        const departmentBoosts: Record<string, number> = {};
        state.temporaryBoosts.forEach(b => {
             if (b.type === 'efficiency') {
                departmentBoosts[b.departmentName] = (departmentBoosts[b.departmentName] || 0) + b.amount;
            }
        });

        const bonuses = calculateBonuses(state, departmentBoosts);
        let reviewScoreBonus = bonuses.reviewScore;

        const getDept = (name: string) => state.departments.find(d => d.name === name);
        const getEffectiveEfficiency = (dept?: Department) => {
            if (!dept) return 0;
            return dept.efficiency + (departmentBoosts[dept.name] || 0);
        };

        const devDept = getDept('개발');
        const qaDept = getDept('운영');
        const marketingDept = getDept('마케팅');

        reviewScoreBonus += (devDept ? getEffectiveEfficiency(devDept) - 50 : -20) / 5;
        reviewScoreBonus += (qaDept ? getEffectiveEfficiency(qaDept) - 50 : -20) / 4;
        
        if (state.buildings.some(b => b.type === '모션 캡처 스튜디오')) reviewScoreBonus += 5;
        if (state.activePolicies.some(p => p.policyId === 'qa_reinforcement')) reviewScoreBonus += 10;
        if (state.completedRndStrategies.some(r => r.id === 'ai_npc')) reviewScoreBonus += 5;
        if (state.completedRndStrategies.some(r => r.id === 'physics')) reviewScoreBonus += 3;
        
        if (state.marketTrend && state.marketTrend.genre === projectToRelease.genre && state.marketTrend.trend === 'up') {
            reviewScoreBonus += 20;
        }

        const baseScore = 50 + Math.random() * 25; // 50-74
        const expertScore = Math.max(0, Math.min(100, Math.floor(baseScore + reviewScoreBonus)));
        const userRating = Math.max(0, Math.min(10, (expertScore / 10) - 1 + (Math.random() * 2))); // Base on expert score +-1
        const overallScore = Math.floor((expertScore + userRating * 10) / 2);

        const newReview: Review = { projectId, expertScore, userRating, overallScore };

        const revenueMultiplier = Math.max(0.1, overallScore / 60); // 60점 기준 본전
        const marketingBonus = marketingDept ? 1 + (getEffectiveEfficiency(marketingDept) - 50) / 200 : 1;
        const generatedRevenue = Math.floor(projectToRelease.expectedRevenue * revenueMultiplier * marketingBonus);
        const reputationChange = Math.floor((overallScore - 65) / 5);

        const releaseEvent: GameEventLog = {
            id: uuidv4(), date: new Date(state.date),
            title: `신작 출시: ${projectToRelease.name}`,
            description: `새로운 게임 ${projectToRelease.name}이(가) 출시되어 ${generatedRevenue.toLocaleString()}원의 매출을 기록했습니다! 회사 평판이 ${reputationChange}만큼 변동합니다.`,
            type: generatedRevenue > projectToRelease.budget ? 'positive' : 'negative',
        };

        return {
            ...state,
            projects: state.projects.map(p => p.id === projectId ? { ...p, status: 'released', releaseDate: new Date(state.date) } : p),
            reviews: [...state.reviews, newReview],
            company: { ...state.company, assets: state.company.assets + generatedRevenue, revenue: state.company.revenue + generatedRevenue, reputation: Math.max(0, Math.min(100, state.company.reputation + reputationChange)) },
            eventLog: [releaseEvent, ...state.eventLog].slice(0, 100),
        };
    }
    case 'APPLY_FOR_PROMOTION': {
        if (state.promotionApplication) return state; // Already applying
        const weeksRemaining = Math.floor(Math.random() * 4) + 1; // 1-4 weeks
        const success = Math.random() < 0.9; // 90% success rate

        const event: GameEventLog = {
            id: uuidv4(),
            date: new Date(state.date),
            title: '승격 심사 신청',
            description: `다음 기업 등급으로의 승격 심사를 신청했습니다. ${weeksRemaining}주 후에 결과가 발표됩니다.`,
            type: 'neutral',
        };

        return {
            ...state,
            promotionApplication: { weeksRemaining, success },
            eventLog: [event, ...state.eventLog].slice(0, 100),
        };
    }
    case 'GIVE_BONUS': {
        const { departmentName, amount } = action.payload;
        if (state.company.assets < amount) {
            return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '보너스 지급 실패', description: '자금이 부족합니다.', type: 'negative' }, ...state.eventLog] };
        }
        const newBoost: TemporaryBoost = {
            departmentName,
            type: 'efficiency',
            amount: 10, // +10% efficiency
            weeksRemaining: 4, // for 4 weeks
        };
        const event: GameEventLog = {
            id: uuidv4(), date: new Date(state.date),
            title: '보너스 지급',
            description: `${departmentName}팀에 성과 보너스 ${(amount / 10000).toLocaleString()}만 원을 지급했습니다. 4주간 부서 효율이 10% 상승합니다.`,
            type: 'positive',
        };
        return {
            ...state,
            company: { ...state.company, assets: state.company.assets - amount },
            temporaryBoosts: [...state.temporaryBoosts, newBoost],
            eventLog: [event, ...state.eventLog].slice(0, 100),
        };
    }
    case 'SET_STATE': return action.payload;
    
    // --- Other cases are mostly unchanged, just ensure they are included ---
    case 'TOGGLE_PAUSE': return { ...state, isPaused: !state.isPaused };
    case 'SET_GAME_SPEED': return { ...state, gameSpeed: action.payload };
    case 'START_RECRUITMENT': {
        const totalHires = Object.values(action.payload).reduce((sum, count) => sum + count, 0);
        const recruitmentCost = totalHires * 10000000;
        if (state.company.assets < recruitmentCost) return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '채용 실패', description: '채용 비용이 부족합니다.', type: 'negative' }, ...state.eventLog] };
        const newRecruitment: Recruitment = { id: uuidv4(), hires: action.payload, weeksRemaining: 4 };
        return { ...state, company: { ...state.company, assets: state.company.assets - recruitmentCost }, recruitments: [...state.recruitments, newRecruitment], eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '채용 공고', description: `${totalHires}명에 대한 채용을 시작합니다. 비용: ${(recruitmentCost/10000).toLocaleString()}만 원`, type: 'neutral' }, ...state.eventLog]};
    }
    case 'CREATE_PROJECT': {
      const { name, genre, platform, budget, targetCountry } = action.payload;
      const newProject: GameProject = { id: `proj_${uuidv4()}`, name, genre, platform, progress: 0, budget, expectedRevenue: budget * 3, startDate: new Date(state.date), releaseDate: null, status: 'in-development', targetCountry };
      const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: '신규 프로젝트 시작', description: `새로운 게임 '${name}'의 개발을 시작합니다. 예산: ${(budget / 10000).toLocaleString()}만 원`, type: 'neutral' };
      return { ...state, projects: [...state.projects, newProject], eventLog: [event, ...state.eventLog].slice(0, 100) };
    }
    case 'CREATE_DEPARTMENT':
      if (state.departments.some(d => d.name === action.payload.trim()) || action.payload.trim() === '') return state;
      const newEfficiency = Math.floor(Math.random() * 101);
      return { ...state, departments: [...state.departments, { name: action.payload.trim(), employees: 0, efficiency: newEfficiency, kpi: newEfficiency }] };
    case 'ABOLISH_DEPARTMENT':
        const deptToAbolish = state.departments.find(d => d.name === action.payload);
        if (!deptToAbolish) return state;
        const employeesLost = deptToAbolish.employees;
        const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: '부서 폐지', description: `${action.payload} 부서가 폐지되어 ${employeesLost}명의 직원이 퇴사했습니다.`, type: 'negative' };
        return { ...state, departments: state.departments.filter(dept => dept.name !== action.payload), company: { ...state.company, employees: state.company.employees - employeesLost }, eventLog: [event, ...state.eventLog].slice(0, 100) };
    case 'BUY_BUILDING': {
        const building = action.payload;
        if (state.company.assets < building.cost) return state;
        const newBuildings = [...state.buildings, building];
        const newCapacity = calculateCapacity(newBuildings);
        const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: '부동산 매입', description: `${building.name}을(를) ${Math.floor(building.cost / 100000000).toLocaleString()}억 원에 매입했습니다.`, type: 'neutral' };
        return { ...state, company: { ...state.company, assets: state.company.assets - building.cost, employeeCapacity: newCapacity }, buildings: newBuildings, eventLog: [event, ...state.eventLog].slice(0, 100) };
    }
    case 'SELL_BUILDING': {
        const { buildingId } = action.payload;
        const buildingToSell = state.buildings.find(b => b.id === buildingId);
        if (!buildingToSell) return state;
        const officeBuildings = state.buildings.filter(b => b.type === '사옥');
        if (officeBuildings.length === 1 && officeBuildings[0].id === buildingId) return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '매각 실패', description: '회사의 마지막 남은 사옥은 매각할 수 없습니다.', type: 'negative' }, ...state.eventLog] };
        const isSellingHq = buildingId === state.company.headquartersBuildingId;
        const proceeds = buildingToSell.cost * 0.8;
        const newBuildings = state.buildings.filter(b => b.id !== buildingId);
        const newCapacity = calculateCapacity(newBuildings);
        let employeesToFire = 0;
        let newEmployees = state.company.employees;
        let newDepartments = [...state.departments.map(d => ({...d}))];
        let layoffEvent: GameEventLog | null = null;
        if (state.company.employees > newCapacity) {
            employeesToFire = state.company.employees - newCapacity;
            newEmployees = newCapacity;
            let firedCount = 0;
            while (firedCount < employeesToFire) {
                const deptsWithEmployees = newDepartments.filter(d => d.employees > 0);
                if (deptsWithEmployees.length === 0) break;
                const randDeptIndex = Math.floor(Math.random() * deptsWithEmployees.length);
                const deptToFireFrom = newDepartments.find(d => d.name === deptsWithEmployees[randDeptIndex].name);
                if (deptToFireFrom) {
                    deptToFireFrom.employees--;
                    firedCount++;
                }
            }
            layoffEvent = { id: uuidv4(), date: new Date(state.date), title: '구조조정 실시', description: `사무 공간 부족으로 인해 ${employeesToFire}명의 직원이 해고되었습니다.`, type: 'negative' };
        }
        const sellEvent: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: '부동산 매각', description: `${buildingToSell.name}을(를) ${Math.floor(proceeds / 100000000).toLocaleString()}억 원에 매각했습니다.`, type: 'neutral' };
        const eventsToAdd = layoffEvent ? [layoffEvent, sellEvent] : [sellEvent];
        let newHqId = state.company.headquartersBuildingId;
        if (isSellingHq) {
            const newHq = newBuildings.find(b => b.type === '사옥');
            newHqId = newHq ? newHq.id : '';
        }
        return { ...state, company: { ...state.company, assets: state.company.assets + proceeds, employeeCapacity: newCapacity, employees: newEmployees, headquartersBuildingId: newHqId }, buildings: newBuildings, departments: newDepartments, eventLog: [...eventsToAdd, ...state.eventLog].slice(0, 100) };
    }
    case 'MOVE_HEADQUARTERS': {
        const { buildingId } = action.payload;
        const targetBuilding = state.buildings.find(b => b.id === buildingId);
        if (!targetBuilding || targetBuilding.type !== '사옥') return state;
        const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: '본사 이전', description: `본사를 ${targetBuilding.name}(으)로 이전했습니다.`, type: 'neutral' };
        return { ...state, company: { ...state.company, headquartersBuildingId: buildingId }, eventLog: [event, ...state.eventLog].slice(0, 100) };
    }
    case 'BUY_ASSET': {
        const { assetId, quantity } = action.payload;
        if (quantity <= 0) return state;
        const asset = state.financialAssets.find(a => a.id === assetId);
        if (!asset) return state;
        const cost = asset.price * quantity;
        if (state.company.assets < cost) return state;
        const existingHolding = state.portfolio.holdings.find(h => h.assetId === assetId);
        let updatedHoldings: AssetHolding[];
        if (existingHolding) {
            const totalQuantity = existingHolding.quantity + quantity;
            const totalCost = (existingHolding.averagePrice * existingHolding.quantity) + cost;
            const newAveragePrice = totalCost / totalQuantity;
            updatedHoldings = state.portfolio.holdings.map(h => h.assetId === assetId ? { ...h, quantity: totalQuantity, averagePrice: newAveragePrice } : h);
        } else {
            updatedHoldings = [...state.portfolio.holdings, { assetId, quantity, averagePrice: asset.price }];
        }
        return { ...state, company: { ...state.company, assets: state.company.assets - cost }, portfolio: { ...state.portfolio, holdings: updatedHoldings } };
    }
    case 'SELL_ASSET': {
        const { assetId, quantity } = action.payload;
        if (quantity <= 0) return state;
        const asset = state.financialAssets.find(a => a.id === assetId);
        if (!asset) return state;
        const holding = state.portfolio.holdings.find(h => h.assetId === assetId);
        if (!holding || holding.quantity < quantity) return state;
        const proceeds = asset.price * quantity;
        const remainingQuantity = holding.quantity - quantity;
        let updatedHoldings: AssetHolding[];
        if (remainingQuantity > 0) {
            updatedHoldings = state.portfolio.holdings.map(h => h.assetId === assetId ? { ...h, quantity: remainingQuantity } : h);
        } else {
            updatedHoldings = state.portfolio.holdings.filter(h => h.assetId !== assetId);
        }
        return { ...state, company: { ...state.company, assets: state.company.assets + proceeds }, portfolio: { ...state.portfolio, holdings: updatedHoldings } };
    }
    case 'START_GLOBAL_STRATEGY': {
        const strategy = action.payload;
        if (state.company.assets < strategy.cost) return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '전략 실행 실패', description: `자금이 부족하여 '${strategy.name}' 전략을 시작할 수 없습니다.`, type: 'negative' }, ...state.eventLog] };
        const newGlobalStrategy: GlobalStrategyProject = { id: uuidv4(), strategyId: strategy.id, name: strategy.name, weeksRemaining: strategy.duration, totalWeeks: strategy.duration };
        const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: '글로벌 전략 시작', description: `'${strategy.name}' 전략을 시작합니다. 비용: ${(strategy.cost/10000).toLocaleString()}만 원, 기간: ${strategy.duration}주`, type: 'neutral' };
        return { ...state, company: { ...state.company, assets: state.company.assets - strategy.cost }, globalStrategies: [...state.globalStrategies, newGlobalStrategy], eventLog: [event, ...state.eventLog].slice(0, 100) };
    }
     case 'START_IP_STRATEGY': {
        const strategy = action.payload;
        if (state.company.assets < strategy.cost) return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '프로젝트 실패', description: `자금이 부족하여 '${strategy.name}'을(를) 시작할 수 없습니다.`, type: 'negative' }, ...state.eventLog] };
        const newIpStrategy: IpStrategyProject = { id: uuidv4(), strategyId: strategy.id, name: strategy.name, weeksRemaining: strategy.duration, totalWeeks: strategy.duration };
        const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: 'IP 프로젝트 시작', description: `'${strategy.name}' 프로젝트를 시작합니다. 비용: ${(strategy.cost/10000).toLocaleString()}만 원, 기간: ${strategy.duration}주`, type: 'neutral' };
        return { ...state, company: { ...state.company, assets: state.company.assets - strategy.cost }, ipStrategies: [...state.ipStrategies, newIpStrategy], eventLog: [event, ...state.eventLog].slice(0, 100) };
    }
    case 'START_RND_STRATEGY': {
        const strategy = action.payload;
        if (state.company.assets < strategy.cost) return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '연구 실패', description: `자금이 부족하여 '${strategy.name}' 연구를 시작할 수 없습니다.`, type: 'negative' }, ...state.eventLog] };
        const newRndStrategy: RnDStrategyProject = { id: uuidv4(), strategyId: strategy.id, name: strategy.name, weeksRemaining: strategy.duration, totalWeeks: strategy.duration };
        const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: 'R&D 프로젝트 시작', description: `'${strategy.name}' 연구를 시작합니다. 비용: ${(strategy.cost/10000).toLocaleString()}만 원, 기간: ${strategy.duration}주`, type: 'neutral' };
        return { ...state, company: { ...state.company, assets: state.company.assets - strategy.cost }, rndStrategies: [...state.rndStrategies, newRndStrategy], eventLog: [event, ...state.eventLog].slice(0, 100) };
    }
    case 'START_POLICY': {
        const policy = action.payload;
        if (state.company.assets < policy.cost) return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '정책 시행 실패', description: `자금이 부족하여 '${policy.name}' 정책을 시행할 수 없습니다.`, type: 'negative' }, ...state.eventLog] };
        if (state.activePolicies.some(p => p.policyId === policy.id)) return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '정책 시행 실패', description: `이미 시행 중인 정책입니다: '${policy.name}'`, type: 'negative' }, ...state.eventLog] };
        const newActivePolicy: ActivePolicy = { policyId: policy.id, name: policy.name, weeksRemaining: policy.duration };
        const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: '정책 시행', description: `'${policy.name}' 정책을 시행합니다. 비용: ${(policy.cost/10000).toLocaleString()}만 원, 기간: ${policy.duration}주`, type: 'neutral' };
        return { ...state, company: { ...state.company, assets: state.company.assets - policy.cost }, activePolicies: [...state.activePolicies, newActivePolicy], eventLog: [event, ...state.eventLog].slice(0, 100) };
    }
    case 'ESTABLISH_SUBSIDIARY': {
      const subsidiary = action.payload;
      if (state.company.assets < subsidiary.cost) return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '계열사 설립 실패', description: `자금이 부족하여 '${subsidiary.name}'을(를) 설립할 수 없습니다.`, type: 'negative' }, ...state.eventLog] };
      const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: '계열사 설립', description: `'${subsidiary.name}'을(를) 성공적으로 설립했습니다. 비용: ${Math.floor(subsidiary.cost / 100000000).toLocaleString()}억 원`, type: 'positive' };
      return { ...state, company: { ...state.company, assets: state.company.assets - subsidiary.cost }, subsidiaries: [...state.subsidiaries, subsidiary], eventLog: [event, ...state.eventLog].slice(0, 100) };
    }
    case 'ESTABLISH_FOUNDATION': {
        const foundation = action.payload;
        if (state.company.assets < foundation.cost) return { ...state, eventLog: [{ id: uuidv4(), date: new Date(state.date), title: '재단 설립 실패', description: `자금이 부족하여 '${foundation.name}'을(를) 설립할 수 없습니다.`, type: 'negative' }, ...state.eventLog] };
        const event: GameEventLog = { id: uuidv4(), date: new Date(state.date), title: '재단 설립', description: `'${foundation.name}'을(를) 성공적으로 설립했습니다. 비용: ${Math.floor(foundation.cost / 100000000).toLocaleString()}억 원`, type: 'positive' };
        return { ...state, company: { ...state.company, assets: state.company.assets - foundation.cost }, foundations: [...state.foundations, foundation], eventLog: [event, ...state.eventLog].slice(0, 100) };
    }
    default: return state;
  }
};

const loadState = (): GameState => {
    try {
        const serializedState = localStorage.getItem('gameState');
        if (serializedState === null) {
            return INITIAL_GAME_STATE;
        }
        const parsed = JSON.parse(serializedState);
        
        const buildings = parsed.buildings || INITIAL_GAME_STATE.buildings;
        const departments = (parsed.departments || INITIAL_GAME_STATE.departments).map((d: any) => ({
            name: d.name,
            employees: d.employees || 0,
            efficiency: d.efficiency !== undefined ? d.efficiency : Math.floor(Math.random() * 50) + 30,
            kpi: d.kpi !== undefined ? d.kpi : (d.efficiency !== undefined ? d.efficiency : Math.floor(Math.random() * 50) + 30),
        }));

        return {
            ...INITIAL_GAME_STATE,
            ...parsed,
            date: new Date(parsed.date),
            company: {
                ...INITIAL_GAME_STATE.company,
                ...parsed.company,
                employeeCapacity: calculateCapacity(buildings),
                headquartersBuildingId: parsed.company.headquartersBuildingId || (buildings.find((b: Building) => b.type === '사옥')?.id || ''),
            },
            eventLog: parsed.eventLog.map((e: GameEventLog) => ({...e, date: new Date(e.date)})),
            projects: parsed.projects.map((p: any) => ({
                ...p, 
                status: p.status || 'in-development',
                startDate: new Date(p.startDate), 
                releaseDate: p.releaseDate ? new Date(p.releaseDate) : null,
                targetCountry: p.targetCountry || '국내',
            })),
            recruitments: parsed.recruitments || [],
            reviews: parsed.reviews || [],
            departments,
            buildings,
            financialAssets: parsed.financialAssets || INITIAL_GAME_STATE.financialAssets,
            portfolio: parsed.portfolio || INITIAL_GAME_STATE.portfolio,
            globalStrategies: parsed.globalStrategies || [],
            ipStrategies: parsed.ipStrategies || [],
            rndStrategies: parsed.rndStrategies || [],
            activePolicies: parsed.activePolicies || [],
            subsidiaries: parsed.subsidiaries || [],
            foundations: parsed.foundations || [],
            promotionApplication: parsed.promotionApplication || undefined,
            marketTrend: parsed.marketTrend || undefined,
            completedRndStrategies: parsed.completedRndStrategies || [],
            completedGlobalStrategies: parsed.completedGlobalStrategies || [],
            completedIpStrategies: parsed.completedIpStrategies || [],
            temporaryBoosts: parsed.temporaryBoosts || [],
        };
    } catch (err) {
        console.error("Could not load state from localStorage", err);
        return INITIAL_GAME_STATE;
    }
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);
  
  useEffect(() => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('gameState', serializedState);
    } catch (err) {
      console.error("Could not save state to localStorage", err);
    }
  }, [state]);

  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
};

export const useGameState = (): GameState => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
};

export const useGameDispatch = (): Dispatch<GameAction> => {
  const context = useContext(GameDispatchContext);
  if (context === undefined) {
    throw new Error('useGameDispatch must be used within a GameProvider');
  }
  return context;
};