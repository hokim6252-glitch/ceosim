import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import { IP_STRATEGIES } from '../../constants';
import { IpStrategy } from '../../types';

const IpView: React.FC = () => {
    const { company, ipStrategies, completedIpStrategies } = useGameState();
    const dispatch = useGameDispatch();
    const [activeModal, setActiveModal] = useState<IpStrategy | null>(null);
    
    const handleStartStrategy = (strategy: IpStrategy) => {
        dispatch({ type: 'START_IP_STRATEGY', payload: strategy });
        setActiveModal(null);
    };

    const isStrategyInProgress = (strategyId: string) => {
        return ipStrategies.some(s => s.strategyId === strategyId);
    };

    const isStrategyCompleted = (strategyId: string) => {
        return completedIpStrategies.some(s => s.id === strategyId);
    }

    const currentStrategy = activeModal;

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">합작·IP·콘텐츠</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="IP 및 콘텐츠 전략">
                        <div className="space-y-3">
                            {IP_STRATEGIES.map(strategy => {
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

                    <Card title="IP/콘텐츠 확장 효과">
                        <ul className="list-disc list-inside text-gray-300 space-y-2">
                            <li>브랜드 가치 상승</li>
                            <li>신규 팬덤 확보 및 기존 팬덤 강화</li>
                            <li>원 소스 멀티 유즈(OSMU)를 통한 추가 수익 창출</li>
                            <li>IP 생명력 연장</li>
                            <li>글로벌 인지도 상승</li>
                        </ul>
                    </Card>
                </div>
                
                <Card title="진행중인 프로젝트">
                    {ipStrategies.length > 0 ? (
                        <div className="space-y-4">
                            {ipStrategies.map(ip => {
                                const progress = ((ip.totalWeeks - ip.weeksRemaining) / ip.totalWeeks) * 100;
                                return (
                                    <div key={ip.id} className="bg-gray-800 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-lg text-cyan-400">{ip.name}</h3>
                                            <span className="text-sm text-gray-400">{ip.weeksRemaining}주 남음</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400">현재 진행 중인 IP/콘텐츠 프로젝트가 여기에 표시됩니다.</p>
                    )}
                </Card>
                
                <Card title="완료된 IP/콘텐츠 프로젝트">
                     {completedIpStrategies.length > 0 ? (
                        <div className="space-y-2">
                            {completedIpStrategies.map(ip => (
                                <div key={ip.id} className="bg-gray-800 p-3 rounded-lg">
                                    <p className="font-semibold text-cyan-400">{ip.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">완료된 IP/콘텐츠 프로젝트가 여기에 표시됩니다.</p>
                    )}
                </Card>
            </div>

            <Modal
                isOpen={!!currentStrategy}
                onClose={() => setActiveModal(null)}
                title={currentStrategy?.name || ''}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setActiveModal(null)}>취소</Button>
                        <Button 
                            onClick={() => currentStrategy && handleStartStrategy(currentStrategy)}
                            disabled={!currentStrategy || company.assets < currentStrategy.cost}
                        >
                            프로젝트 시작
                        </Button>
                    </>
                }
            >
                <p className="text-gray-400">{currentStrategy?.description}</p>
                 <div className="mt-4 bg-gray-900 p-3 rounded-md text-sm">
                    <p><span className="font-semibold text-gray-300">예상 기간:</span> {currentStrategy?.duration}주</p>
                    <p><span className="font-semibold text-gray-300">예상 비용:</span> {Math.floor((currentStrategy?.cost || 0) / 100000000).toLocaleString()}억 원</p>
                </div>
                {currentStrategy && company.assets < currentStrategy.cost &&
                    <p className="text-red-500 text-sm mt-2">자금이 부족하여 프로젝트를 시작할 수 없습니다.</p>
                }
            </Modal>
        </>
    );
};

export default IpView;
