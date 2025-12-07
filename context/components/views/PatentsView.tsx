import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import { RND_STRATEGIES } from '../../constants';
import { RnDStrategy } from '../../types';


const PatentsView: React.FC = () => {
    const { company, rndStrategies, completedRndStrategies } = useGameState();
    const dispatch = useGameDispatch();
    const [activeModal, setActiveModal] = useState<RnDStrategy | null>(null);

    const handleStartStrategy = (strategy: RnDStrategy) => {
        dispatch({ type: 'START_RND_STRATEGY', payload: strategy });
        setActiveModal(null);
    };

    const isStrategyInProgress = (strategyId: string) => {
        return rndStrategies.some(s => s.strategyId === strategyId);
    };
    
    const isStrategyCompleted = (strategyId: string) => {
        return completedRndStrategies.some(s => s.id === strategyId);
    }

    const currentProject = activeModal;

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">R&D/특허</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="R&D 프로젝트">
                        <div className="space-y-3">
                            <p className="text-gray-400 text-sm mb-4">회사의 기술적 우위를 확보하기 위한 연구 개발 프로젝트를 시작할 수 있습니다.</p>
                            {RND_STRATEGIES.map(project => {
                                const inProgress = isStrategyInProgress(project.id);
                                const completed = isStrategyCompleted(project.id);
                                return (
                                <Button 
                                    key={project.id} 
                                    variant="secondary" 
                                    className="w-full justify-start text-left" 
                                    onClick={() => setActiveModal(project)}
                                    disabled={inProgress || completed}
                                >
                                    {project.name} {completed && '(완료)'}
                                </Button>
                            )})}
                        </div>
                    </Card>

                    <Card title="R&D 효과">
                        <div className="space-y-3">
                            <p className="text-gray-400 text-sm mb-4">R&D 투자는 다음과 같은 긍정적인 효과를 가져옵니다.</p>
                            <ul className="list-disc list-inside text-gray-300 space-y-2">
                                <li>게임 품질 향상</li>
                                <li>리뷰 점수 상승</li>
                                <li>개발 기간 단축</li>
                                <li>경쟁사 대비 기술 우위 확보</li>
                                <li>특허를 통한 추가 수익 창출</li>
                            </ul>
                        </div>
                    </Card>
                </div>
                
                <Card title="개발중인 시스템">
                     {rndStrategies.length > 0 ? (
                        <div className="space-y-4">
                            {rndStrategies.map(rnd => {
                                const progress = ((rnd.totalWeeks - rnd.weeksRemaining) / rnd.totalWeeks) * 100;
                                return (
                                    <div key={rnd.id} className="bg-gray-800 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-lg text-cyan-400">{rnd.name}</h3>
                                            <span className="text-sm text-gray-400">{rnd.weeksRemaining}주 남음</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-400">현재 진행 중인 연구 개발 프로젝트가 여기에 표시됩니다.</p>
                    )}
                </Card>

                <Card title="완료된 연구">
                     {completedRndStrategies.length > 0 ? (
                        <div className="space-y-2">
                            {completedRndStrategies.map(rnd => (
                                <div key={rnd.id} className="bg-gray-800 p-3 rounded-lg">
                                    <p className="font-semibold text-cyan-400">{rnd.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">완료된 연구가 여기에 표시됩니다.</p>
                    )}
                </Card>
            </div>

            <Modal
                isOpen={!!currentProject}
                onClose={() => setActiveModal(null)}
                title={currentProject?.name || ''}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setActiveModal(null)}>취소</Button>
                        <Button 
                            onClick={() => currentProject && handleStartStrategy(currentProject)}
                            disabled={!currentProject || company.assets < currentProject.cost}
                        >
                            연구 시작
                        </Button>
                    </>
                }
            >
                <p className="text-gray-400">{currentProject?.description}</p>
                <div className="mt-4 bg-gray-900 p-3 rounded-md text-sm">
                    <p><span className="font-semibold text-gray-300">예상 기간:</span> {currentProject?.duration}주</p>
                    <p><span className="font-semibold text-gray-300">예상 비용:</span> {Math.floor((currentProject?.cost || 0) / 100000000).toLocaleString()}억 원</p>
                </div>
                 {currentProject && company.assets < currentProject.cost &&
                    <p className="text-red-500 text-sm mt-2">자금이 부족하여 연구를 시작할 수 없습니다.</p>
                }
            </Modal>
        </>
    );
};

export default PatentsView;