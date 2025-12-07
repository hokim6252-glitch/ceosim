import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import { AVAILABLE_FOUNDATIONS } from '../../constants';
import { Foundation } from '../../types';
import Modal from '../ui/Modal';

const FoundationView: React.FC = () => {
    const { company, foundations } = useGameState();
    const dispatch = useGameDispatch();
    const [selectedFoundation, setSelectedFoundation] = useState<Foundation | null>(null);

    const handleEstablish = (foundation: Foundation) => {
        dispatch({ type: 'ESTABLISH_FOUNDATION', payload: foundation });
    };

    const formatMoney = (amount: number) => `${Math.floor(amount / 100000000).toLocaleString()}억 원`;
    const formatMoneyMaintenance = (amount: number) => `${(amount / 10000).toLocaleString()}만 원`;

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">재단 관리</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="보유 재단">
                        {foundations.length > 0 ? (
                            <div className="space-y-3">
                                {foundations.map(found => (
                                    <button
                                        key={found.id}
                                        onClick={() => setSelectedFoundation(found)}
                                        className="bg-gray-800 p-4 rounded-lg w-full text-left hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <h3 className="font-bold text-lg text-cyan-400">{found.name}</h3>
                                        <p className="text-sm text-gray-400 mt-1 truncate">{found.description}</p>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>주간 유지비: {formatMoneyMaintenance(found.maintenanceFee)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">현재 운영 중인 재단이 없습니다. 재단 설립을 통해 사회에 기여하고 기업 이미지를 제고할 수 있습니다.</p>
                        )}
                    </Card>

                    <Card title="재단 설립">
                        <div className="space-y-3">
                            {AVAILABLE_FOUNDATIONS.map(found => {
                                const isEstablished = foundations.some(owned => owned.id === found.id);
                                const canAfford = company.assets >= found.cost;
                                const isPurchasable = canAfford && !isEstablished;

                                return (
                                    <div key={found.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                        <div
                                            className="flex-grow cursor-pointer pr-4"
                                            onClick={() => setSelectedFoundation(found)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => e.key === 'Enter' && setSelectedFoundation(found)}
                                        >
                                            <h3 className={`font-bold ${isPurchasable ? 'text-cyan-400' : 'text-gray-500'}`}>{found.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                설립 비용: {formatMoney(found.cost)}
                                            </p>
                                        </div>
                                        <Button onClick={() => handleEstablish(found)} disabled={!isPurchasable} size="sm">
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
                        <li>사회적 이미지 및 회사 평판 상승</li>
                        <li>정부 신뢰도 상승 및 정책적 혜택 가능성</li>
                        <li>긍정적 뉴스 보도 확률 증가</li>
                        <li>글로벌 대기업으로 성장하기 위한 보조 요건 충족</li>
                    </ul>
                </Card>
            </div>
            
            <Modal
                isOpen={!!selectedFoundation}
                onClose={() => setSelectedFoundation(null)}
                title={selectedFoundation?.name || '재단 정보'}
                footer={<Button onClick={() => setSelectedFoundation(null)}>닫기</Button>}
            >
                {selectedFoundation && (
                    <div className="space-y-4">
                        <p className="text-gray-300">{selectedFoundation.description}</p>
                        <div className="bg-gray-900 p-4 rounded-md space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-400">설립 비용:</span>
                                <span className="font-mono">{formatMoney(selectedFoundation.cost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-400">주간 유지비:</span>
                                <span className="font-mono text-red-400">{formatMoneyMaintenance(selectedFoundation.maintenanceFee)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="font-semibold text-gray-400">주간 평판 보너스:</span>
                                <span className="font-mono text-green-400">+{selectedFoundation.reputationBonus.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default FoundationView;
