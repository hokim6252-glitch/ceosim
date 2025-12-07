import React from 'react';
import Card from '../ui/Card';
import { useGameState } from '../../context/GameContext';
import Icon from '../ui/Icon';

const BusinessExpansionView: React.FC = () => {
    const { company } = useGameState();
    const isUnlocked = company.tier === '대기업' || company.tier === '복합기업' || company.tier === '글로벌 대기업';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">사업 확장</h1>

            {!isUnlocked ? (
                <Card title="잠김">
                    <div className="text-center py-8">
                        <div className="text-5xl text-gray-500 mb-4 mx-auto w-16 h-16">{Icon.Briefcase}</div>
                        <p className="text-gray-400">이 기능은 기업 단계가 <span className="font-bold text-cyan-400">'대기업'</span> 이상일 때 해금됩니다.</p>
                        <p className="text-sm text-gray-500 mt-2">회사를 성장시켜 새로운 사업 분야로 진출하세요.</p>
                    </div>
                </Card>
            ) : (
                <>
                    <Card title="신규 업종 진출">
                        <p className="text-gray-400 mb-4">기존 IT/게임 사업을 기반으로 다른 업종으로 사업을 확장하여 '복합기업'으로 성장하고 안정적인 수익원을 확보합니다.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {['전자·하드웨어', '화학·제약', '서비스', '금융', '부동산/건설'].map(industry => (
                                <div key={industry} className="bg-gray-800 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-cyan-400">{industry}</h3>
                                    <p className="text-sm text-gray-400 mt-2">해당 업종으로 사업을 확장합니다. (기능 구현 예정)</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="운영 방식 및 효과">
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>신규 업종 진출 → 시장 조사 → 사업 계획 수립 → 투자/사업부 신설</li>
                            <li>초기 비용 발생 및 운영 인력 필요</li>
                            <li>업종별 성공/실패 확률 존재 (팀 능력, 투자 규모, 시장 상황 영향)</li>
                            <li>매출 다각화를 통한 안정적 수익 확보</li>
                            <li>뉴스·정부 신뢰도 상승 및 브랜드 확장 기회 증가</li>
                        </ul>
                    </Card>
                </>
            )}
        </div>
    );
};

export default BusinessExpansionView;
