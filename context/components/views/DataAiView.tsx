import React from 'react';
import Card from '../ui/Card';
import { useGameState } from '../../context/GameContext';
import Icon from '../ui/Icon';

const DataAiView: React.FC = () => {
    const { company } = useGameState();
    const isUnlocked = company.tier === '대기업' || company.tier === '복합기업' || company.tier === '글로벌 대기업';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">그룹화/데이터 AI</h1>

            {!isUnlocked ? (
                <Card title="잠김">
                    <div className="text-center py-8">
                        <div className="text-5xl text-gray-500 mb-4 mx-auto w-16 h-16">{Icon.Brain}</div>
                        <p className="text-gray-400">이 기능은 기업 단계가 <span className="font-bold text-cyan-400">'대기업'</span> 이상일 때 해금됩니다.</p>
                        <p className="text-sm text-gray-500 mt-2">그룹 경영 시스템을 통해 운영 효율을 극대화하세요.</p>
                    </div>
                </Card>
            ) : (
                <>
                    <Card title="그룹 경영 시스템">
                        <p className="text-gray-400 mb-4">계열사, 사업부, 재단, 프로젝트 등을 하나의 그룹으로 묶어 경영·재무·보고 관리를 효율화하고, 데이터 기반의 전략적 의사결정을 지원합니다.</p>
                         <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>그룹 전체 매출, 비용, 이익 통합 확인</li>
                            <li>그룹 내 계열사·부서·프로젝트 트리 구조 시각화</li>
                            <li>그룹 단위 투자, M&A, 신규 사업 확장 결정</li>
                            <li>계열사/부서별 KPI 설정 및 성과 평가</li>
                             <li>그룹 전체 리스크 분석 및 대응 계획 수립</li>
                        </ul>
                    </Card>
                    <Card title="데이터 분석/예측 AI 시스템">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-400">시장 트렌드, 경쟁사 동향, 매출 예측 등 AI를 활용한 데이터 분석으로 의사결정에 보너스를 적용합니다.</p>
                                <p className="text-sm text-cyan-400 mt-2">효과: R&D·투자 효율 상승, 의사결정 정확도 증가</p>
                            </div>
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">비활성</span>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default DataAiView;
