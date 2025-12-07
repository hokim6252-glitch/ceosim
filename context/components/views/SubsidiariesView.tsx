import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import { AVAILABLE_SUBSIDIARIES } from '../../constants';
import { Subsidiary } from '../../types';
import Modal from '../ui/Modal';

const SubsidiariesView: React.FC = () => {
    const { company, subsidiaries } = useGameState();
    const dispatch = useGameDispatch();
    const [selectedSubsidiary, setSelectedSubsidiary] = useState<Subsidiary | null>(null);

    const handleEstablish = (subsidiary: Subsidiary) => {
        dispatch({ type: 'ESTABLISH_SUBSIDIARY', payload: subsidiary });
    };

    const formatMoney = (amount: number) => `${(amount / 10000).toLocaleString()}만 원`;
    const formatMoneyBillion = (amount: number) => `${Math.floor(amount / 100000000).toLocaleString()}억 원`;

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">계열사 관리</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="보유 계열사">
                        {subsidiaries.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {subsidiaries.map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setSelectedSubsidiary(sub)}
                                        className="bg-gray-800 p-4 rounded-lg w-full text-left hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <h3 className="font-bold text-lg text-cyan-400">{sub.name}</h3>
                                        <p className="text-sm text-gray-400 mt-1 truncate">{sub.description}</p>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>주간 유지비: {formatMoney(sub.maintenanceFee)}</span>
                                            <span className="text-green-400">주간 예상 수익: {formatMoney(sub.weeklyRevenue)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">현재 보유한 계열사가 없습니다. 사업을 확장하여 새로운 수익원을 창출하세요.</p>
                        )}
                    </Card>

                    <Card title="계열사 설립">
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {AVAILABLE_SUBSIDIARIES.map(sub => {
                                const isEstablished = subsidiaries.some(owned => owned.id === sub.id);
                                const canAfford = company.assets >= sub.cost;
                                const isPurchasable = canAfford && !isEstablished;

                                return (
                                    <div key={sub.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                        <div
                                            className="flex-grow cursor-pointer pr-4"
                                            onClick={() => setSelectedSubsidiary(sub)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => e.key === 'Enter' && setSelectedSubsidiary(sub)}
                                        >
                                            <h3 className={`font-bold ${isPurchasable ? 'text-cyan-400' : 'text-gray-500'}`}>{sub.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                설립 비용: {formatMoneyBillion(sub.cost)}
                                            </p>
                                        </div>
                                        <Button onClick={() => handleEstablish(sub)} disabled={!isPurchasable} size="sm">
                                            {isEstablished ? '보유중' : canAfford ? '설립' : '자금 부족'}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
                 <Card title="효과">
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li>복수 사업을 통한 안정적인 추가 매출 발생</li>
                        <li>'복합기업' 등급 달성을 위한 핵심 조건</li>
                        <li>각 계열사마다 주간 유지비가 발생하므로 신중한 결정 필요</li>
                    </ul>
                </Card>
            </div>
            
            <Modal
                isOpen={!!selectedSubsidiary}
                onClose={() => setSelectedSubsidiary(null)}
                title={selectedSubsidiary?.name || '계열사 정보'}
                footer={<Button onClick={() => setSelectedSubsidiary(null)}>닫기</Button>}
            >
                {selectedSubsidiary && (
                    <div className="space-y-4">
                        <p className="text-gray-300">{selectedSubsidiary.description}</p>
                        <div className="bg-gray-900 p-4 rounded-md space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-400">설립 비용:</span>
                                <span className="font-mono">{formatMoneyBillion(selectedSubsidiary.cost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-400">주간 유지비:</span>
                                <span className="font-mono text-red-400">{formatMoney(selectedSubsidiary.maintenanceFee)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-400">주간 예상 수익:</span>
                                <span className="font-mono text-green-400">{formatMoney(selectedSubsidiary.weeklyRevenue)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default SubsidiariesView;