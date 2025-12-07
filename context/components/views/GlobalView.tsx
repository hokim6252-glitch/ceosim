import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import { GLOBAL_STRATEGIES } from '../../constants';
import { GlobalStrategy } from '../../types';

const GlobalView: React.FC = () => {
    const { company, globalStrategies, completedGlobalStrategies } = useGameState();
    const dispatch = useGameDispatch();
    const [activeModal, setActiveModal] = useState<GlobalStrategy | null>(null);

    const handleStartStrategy = (strategy: GlobalStrategy) => {
        dispatch({ type: 'START_GLOBAL_STRATEGY', payload: strategy });
        setActiveModal(null);
    };
    
    const isStrategyInProgress = (strategyId: string) => {
        return globalStrategies.some(gs => gs.strategyId === strategyId);
    };
    
    const isStrategyCompleted = (strategyId: string) => {
        return completedGlobalStrategies.some(s => s.id === strategyId);
    }

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">글로벌 시장</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card title="글로벌 전략" className="lg:col-span-2">
                        <p className="text-gray-400 text-sm mb-4">해외 시장을 공략하기 위한 핵심 전략을 실행합니다.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {GLOBAL_STRATEGIES.map(strategy => {
                                const inProgress = isStrategyInProgress(strategy.id);
                                const completed = isStrategyCompleted(strategy.id);
                                return (
                                <Button 
                                    key={strategy.id} 
                                    variant="secondary" 
                                    className="w-full justify-start text-left" 
                                    onClick={() => setActiveModal(strategy)}
                                    disabled={inProgress || completed}
                                >
                                    {strategy.name} {completed && '(완료)'}
                                </Button>
                            )})}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card title="글로벌 시장 현황">
                            <p className="text-gray-400 text-sm">
                                현재 글로벌 시장은 기회와 리스크가 공존합니다. 특히 환율 변동은 해외 매출에 직접적인 영향을 미칠 수 있으니 주의 깊게 관찰해야 합니다.
                            </p>
                        </Card>

                        <Card title="글로벌 확장 효과">
                            <ul className="list-disc list-inside text-gray-300 space-y-2">
                                <li>국가별 매출 증가</li>
                                <li>글로벌 점유율 증가</li>
                                <li>새로운 유저층 확보</li>
                                <li>브랜드 인지도 상승</li>
                            </ul>
                        </Card>
                    </div>
                </div>
                
                <Card title="글로벌 전략 진행사항">
                     {globalStrategies.length > 0 ? (
                        <div className="space-y-4">
                            {globalStrategies.map(gs => {
                                const progress = ((gs.totalWeeks - gs.weeksRemaining) / gs.totalWeeks) * 100;
                                return (
                                    <div key={gs.id} className="bg-gray-800 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-lg text-cyan-400">{gs.name}</h3>
                                            <span className="text-sm text-gray-400">{gs.weeksRemaining}주 남음</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400">현재 진행 중인 글로벌 전략 프로젝트가 여기에 표시됩니다.</p>
                    )}
                </Card>
                <Card title="완료된 글로벌 전략">
                     {completedGlobalStrategies.length > 0 ? (
                        <div className="space-y-2">
                            {completedGlobalStrategies.map(gs => (
                                <div key={gs.id} className="bg-gray-800 p-3 rounded-lg">
                                    <p className="font-semibold text-cyan-400">{gs.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">완료된 글로벌 전략이 여기에 표시됩니다.</p>
                    )}
                </Card>
            </div>

            <Modal
                isOpen={!!activeModal}
                onClose={() => setActiveModal(null)}
                title={activeModal?.name || ''}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setActiveModal(null)}>취소</Button>
                        <Button onClick={() => activeModal && handleStartStrategy(activeModal)} disabled={!activeModal || company.assets < activeModal.cost}>
                            전략 실행
                        </Button>
                    </>
                }
            >
                <p className="text-gray-400">{activeModal?.description}</p>
                <div className="mt-4 bg-gray-900 p-3 rounded-md text-sm">
                    <p><span className="font-semibold text-gray-300">예상 기간:</span> {activeModal?.duration}주</p>
                    <p><span className="font-semibold text-gray-300">예상 비용:</span> {Math.floor((activeModal?.cost || 0) / 100000000).toLocaleString()}억 원</p>
                </div>
                {activeModal && company.assets < activeModal.cost &&
                    <p className="text-red-500 text-sm mt-2">자금이 부족하여 전략을 실행할 수 없습니다.</p>
                }
            </Modal>
        </>
    );
};

export default GlobalView;