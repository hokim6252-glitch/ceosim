import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import { AVAILABLE_BUILDINGS } from '../../constants';
import { Building } from '../../types';
import Stat from '../ui/Stat';
import Modal from '../ui/Modal';

const RealEstateView: React.FC = () => {
    const { company, buildings } = useGameState();
    const dispatch = useGameDispatch();
    const [buildingToSell, setBuildingToSell] = useState<Building | null>(null);
    const [buildingToMoveTo, setBuildingToMoveTo] = useState<Building | null>(null);

    const handleBuyBuilding = (building: Building) => {
        dispatch({ type: 'BUY_BUILDING', payload: building });
    };

    const handleSellBuildingConfirm = () => {
        if (buildingToSell) {
            dispatch({ type: 'SELL_BUILDING', payload: { buildingId: buildingToSell.id } });
            setBuildingToSell(null);
        }
    };
    
    const handleMoveConfirm = () => {
        if (buildingToMoveTo) {
            dispatch({ type: 'MOVE_HEADQUARTERS', payload: { buildingId: buildingToMoveTo.id } });
            setBuildingToMoveTo(null);
        }
    };

    const formatMoney = (amount: number) => `${Math.floor(amount / 100000000).toLocaleString()}억 원`;
    const officeBuildingsCount = buildings.filter(b => b.type === '사옥').length;
    const potentialLayoffs = buildingToSell ? Math.max(0, company.employees - (company.employeeCapacity - buildingToSell.employeeCapacity)) : 0;


    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">부동산 관리</h1>
                <Card title="부동산 현황">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Stat label="총 직원 수용량" value={`${company.employeeCapacity}명`} />
                        <Stat label="현재 직원" value={`${company.employees}명`} />
                        <Stat label="잔여 공간" value={`${company.employeeCapacity - company.employees}명`} />
                    </div>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="보유 건물">
                        {buildings.length > 0 ? (
                            <div className="space-y-3">
                                {buildings.map(b => {
                                    const isLastOffice = b.type === '사옥' && officeBuildingsCount === 1;
                                    const isHeadquarters = b.id === company.headquartersBuildingId;
                                    return (
                                        <div key={b.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-cyan-400 flex items-center">
                                                    {b.name}
                                                    {isHeadquarters && <span className="text-xs bg-cyan-700 text-cyan-200 px-2 py-0.5 rounded-full ml-2">본사</span>}
                                                </h3>
                                                <p className="text-sm text-gray-400">{b.effects.join(', ')}</p>
                                                <p className="text-xs text-gray-500 mt-1">주간 유지비: {(b.maintenanceFee / 10000).toLocaleString()}만 원</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {b.type === '사옥' && (
                                                    <Button 
                                                        variant="secondary" 
                                                        size="sm" 
                                                        disabled={isHeadquarters}
                                                        onClick={() => setBuildingToMoveTo(b)}
                                                        title={isHeadquarters ? "현재 본사입니다." : "이 건물로 본사를 이전합니다."}
                                                    >
                                                        이사
                                                    </Button>
                                                )}
                                                <Button
                                                  variant="danger"
                                                  size="sm"
                                                  onClick={() => setBuildingToSell(b)}
                                                  disabled={isLastOffice}
                                                  title={isLastOffice ? "마지막 사옥은 매각할 수 없습니다." : "건물 매각"}
                                                >
                                                  매각
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-400">보유한 건물이 없습니다.</p>
                        )}
                    </Card>
                    <Card title="건물 구매">
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {AVAILABLE_BUILDINGS.map(b => {
                                const hasBuilding = buildings.some(owned => owned.id === b.id);
                                const hasUniqueType = b.isUnique && buildings.some(owned => owned.type === b.type);
                                const canAfford = company.assets >= b.cost;
                                const isPurchasable = canAfford && !hasBuilding && !hasUniqueType;

                                return (
                                    <div key={b.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                                        <div>
                                            <h3 className={`font-bold ${isPurchasable ? 'text-cyan-400' : 'text-gray-500'}`}>{b.name}</h3>
                                            <p className="text-sm text-gray-400">{b.effects.join(', ')}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                비용: {formatMoney(b.cost)} / 유지비: {(b.maintenanceFee / 10000).toLocaleString()}만
                                            </p>
                                        </div>
                                        <Button onClick={() => handleBuyBuilding(b)} disabled={!isPurchasable} size="sm">
                                            구매
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
                 <Card title="토지 매입 및 건설">
                    <p className="text-gray-400">원하는 지역의 토지를 구매한 후, 건설사를 선정하여 건물을 신축할 수 있습니다. (추후 업데이트 예정)</p>
                </Card>
            </div>

            <Modal
                isOpen={!!buildingToSell}
                onClose={() => setBuildingToSell(null)}
                title={`${buildingToSell?.name} 매각 확인`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setBuildingToSell(null)}>취소</Button>
                        <Button variant="danger" onClick={handleSellBuildingConfirm}>매각 확정</Button>
                    </>
                }
            >
                {buildingToSell && (
                    <div className="space-y-4">
                        <p className="text-gray-300">정말로 이 건물을 매각하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                        <div className="bg-gray-900 p-3 rounded-md text-sm">
                            <p>
                                <span className="font-semibold text-gray-300">예상 매각 대금: </span> 
                                {formatMoney(buildingToSell.cost * 0.8)} (구매가의 80%)
                            </p>
                        </div>
                        {potentialLayoffs > 0 && (
                            <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-md">
                                <h4 className="font-bold">경고: 인원 감축 필요</h4>
                                <p>이 건물을 매각하면 직원 수용량이 부족해져 <span className="font-bold">{potentialLayoffs}</span>명의 직원이 즉시 해고됩니다.</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            
            <Modal
                isOpen={!!buildingToMoveTo}
                onClose={() => setBuildingToMoveTo(null)}
                title="본사 이전 확인"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setBuildingToMoveTo(null)}>취소</Button>
                        <Button onClick={handleMoveConfirm}>이사 확정</Button>
                    </>
                }
            >
                {buildingToMoveTo && (
                    <p className="text-gray-300">
                        정말로 본사를 <span className="font-bold text-cyan-400">{buildingToMoveTo.name}</span>(으)로 이전하시겠습니까?
                        모든 직원이 새로운 본사로 이동하게 됩니다.
                    </p>
                )}
            </Modal>
        </>
    );
};

export default RealEstateView;