import React from 'react';
import Card from '../ui/Card';
import Stat from '../ui/Stat';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import Icon from '../ui/Icon';
import { TIER_REQUIREMENTS } from '../../constants';
import Button from '../ui/Button';

// Helper component for rendering each requirement
const RequirementItem: React.FC<{ label: string; current: number; required: number; format: (val: number) => string; }> = ({ label, current, required, format }) => {
  const isMet = current >= required;
  return (
    <li className={`flex justify-between items-center py-2 border-b border-gray-800 ${isMet ? 'text-gray-300' : 'text-gray-500'}`}>
      <span className="flex items-center">
        <span className={`w-2 h-2 rounded-full mr-3 ${isMet ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {label}
      </span>
      <span className={`font-mono text-sm ${isMet ? 'text-green-400' : 'text-red-400'}`}>
        {format(current)} / {format(required)}
      </span>
    </li>
  );
};


const CompanyView: React.FC = () => {
  const { company, promotionApplication } = useGameState();
  const dispatch = useGameDispatch();
  const formatMoney = (amount: number) => `${Math.floor(amount / 100000000).toLocaleString()}억 원`;
  const formatMoneyForReq = (amount: number) => `${Math.floor(amount / 100000000).toLocaleString()}억 원`;
  const formatEmployees = (count: number) => `${count}명`;

  const currentTierInfo = TIER_REQUIREMENTS[company.tier];
  const nextTier = currentTierInfo?.nextTier;
  const requirements = currentTierInfo;

  let canUpgrade = false;
  if (requirements && nextTier) {
      const assetsMet = company.assets >= requirements.assets;
      const employeesMet = company.employees >= requirements.employees;
      const revenueMet = company.revenue >= requirements.revenue;
      
      if (requirements.assets > 0 || requirements.employees > 0 || requirements.revenue > 0) {
        canUpgrade = assetsMet && employeesMet && revenueMet;
      } else {
        // For tiers with descriptive requirements, upgrade logic is more complex and handled elsewhere.
        // For now, let's assume complex conditions are met if there are no numerical ones.
        canUpgrade = true;
      }
  }

  const handleApplyForPromotion = () => {
    dispatch({ type: 'APPLY_FOR_PROMOTION' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">{company.name} - 회사 정보</h1>
      
      <Card title="핵심 지표">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Stat label="기업 단계" value={company.tier} />
            <Stat label="총 자산" value={formatMoney(company.assets)} />
            <Stat label="총 직원" value={`${company.employees} 명`} />
            <Stat label="평판" value={company.reputation.toString()} />
            <Stat label="연 매출" value={formatMoney(company.revenue)} />
            <Stat label="부채" value={formatMoney(company.debt)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="성장 조건">
            {nextTier && requirements ? (
            <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-3">다음 단계: {nextTier}</h3>
                <ul className="space-y-1 text-gray-300">
                {requirements.assets > 0 && (
                    <RequirementItem label="자산" current={company.assets} required={requirements.assets} format={formatMoneyForReq} />
                )}
                {requirements.employees > 0 && (
                    <RequirementItem label="직원 수" current={company.employees} required={requirements.employees} format={formatEmployees} />
                )}
                {requirements.revenue > 0 && (
                    <RequirementItem label="연 매출" current={company.revenue} required={requirements.revenue} format={formatMoneyForReq} />
                )}
                {requirements.description && (
                     <li className="py-2 text-gray-400 border-b border-gray-800">{requirements.description}</li>
                )}
                </ul>
                <div className="mt-4 flex justify-between items-center">
                    {promotionApplication ? (
                        <p className="text-cyan-400">승격 심사가 진행 중입니다... ({promotionApplication.weeksRemaining}주 남음)</p>
                    ) : (
                        <Button onClick={handleApplyForPromotion} disabled={!canUpgrade}>
                            승격 신청
                        </Button>
                    )}
                    {!promotionApplication && (
                        <p className="text-xs text-gray-500 text-right">
                            * 심사 1~4주 소요<br/>
                            (실패 가능성 존재)
                        </p>
                    )}
                </div>
            </div>
            ) : (
            <p className="text-gray-400">최고 등급의 기업입니다.</p>
            )}
        </Card>

        <Card title="성장 효과">
            <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>개발 성공률 상승</li>
                <li>글로벌 투자·합작 사업 확장</li>
                <li>뉴스/정부 신뢰도 상승</li>
                <li>임직원 지원 프로그램 해금</li>
            </ul>
        </Card>
      </div>
    </div>
  );
};

export default CompanyView;
