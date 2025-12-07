import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import { FinancialAsset, AssetType, AssetHolding } from '../../types';
import Stat from '../ui/Stat';

const formatMoney = (amount: number) => `${amount.toLocaleString()}원`;
const formatMoneyShort = (amount: number) => `${Math.floor(amount / 100000000).toLocaleString()}억 원`;

const FinanceView: React.FC = () => {
    const { company, portfolio, financialAssets } = useGameState();
    const dispatch = useGameDispatch();

    const [modalData, setModalData] = useState<{ asset: FinancialAsset; type: 'buy' | 'sell' } | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeCorpFinanceModal, setActiveCorpFinanceModal] = useState<'ipo' | 'mna' | 'bond' | 'funding' | null>(null);


    const portfolioValue = useMemo(() => {
        return portfolio.holdings.reduce((sum, holding) => {
            const asset = financialAssets.find(a => a.id === holding.assetId);
            return sum + (asset ? asset.price * holding.quantity : 0);
        }, 0);
    }, [portfolio.holdings, financialAssets]);

    const handleOpenModal = (asset: FinancialAsset, type: 'buy' | 'sell') => {
        setQuantity(1);
        setModalData({ asset, type });
    };

    const handleCloseModal = () => {
        setModalData(null);
    };

    const handleTransaction = () => {
        if (!modalData) return;
        const { asset, type } = modalData;

        if (type === 'buy') {
            dispatch({ type: 'BUY_ASSET', payload: { assetId: asset.id, quantity } });
        } else {
            dispatch({ type: 'SELL_ASSET', payload: { assetId: asset.id, quantity } });
        }
        handleCloseModal();
    };
    
    const getHoldingForAsset = (assetId: string): AssetHolding | undefined => {
        return portfolio.holdings.find(h => h.assetId === assetId);
    };
    
    const renderAssetList = (type: AssetType) => {
        const assets = financialAssets.filter(a => a.type === type);
        return (
            <div className="space-y-2">
                {assets.map(asset => {
                    const holding = getHoldingForAsset(asset.id);
                    return (
                        <div key={asset.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-cyan-400">{asset.name}</p>
                                <p className="text-sm text-gray-300">{formatMoney(asset.price)}</p>
                                {holding && <p className="text-xs text-gray-500">보유: {holding.quantity}주</p>}
                            </div>
                            <div className="flex space-x-2">
                                <Button size="sm" onClick={() => handleOpenModal(asset, 'buy')}>매수</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleOpenModal(asset, 'sell')} disabled={!holding || holding.quantity === 0}>매도</Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">금융/투자/계약</h1>

                <Card title="포트폴리오 요약">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Stat label="총 자산 가치" value={formatMoneyShort(company.assets + portfolioValue)} />
                        <Stat label="보유 현금" value={formatMoneyShort(company.assets)} />
                        <Stat label="투자 자산 평가액" value={formatMoneyShort(portfolioValue)} />
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="포트폴리오">
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {portfolio.holdings.length > 0 ? portfolio.holdings.map(holding => {
                            const asset = financialAssets.find(a => a.id === holding.assetId);
                            if (!asset) return null;
                            const currentValue = asset.price * holding.quantity;
                            const profit = currentValue - (holding.averagePrice * holding.quantity);
                            const profitRate = (currentValue / (holding.averagePrice * holding.quantity) - 1) * 100;
                            return (
                                <div key={holding.assetId} className="bg-gray-800 p-3 rounded-lg">
                                    <p className="font-semibold text-cyan-400">{asset.name}</p>
                                    <div className="flex justify-between items-end text-sm">
                                        <span className="text-gray-400">{holding.quantity}주 @ {formatMoney(holding.averagePrice)}</span>
                                        <span className={`font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {profit.toLocaleString()}원 ({profitRate.toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : <p className="text-gray-400">보유한 투자 자산이 없습니다.</p>}
                        </div>
                    </Card>

                    <Card title="기업 금융 활동">
                        <div className="space-y-3">
                            <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveCorpFinanceModal('ipo')}>IPO (기업 공개)</Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveCorpFinanceModal('mna')}>기업 인수·합병(M&A)</Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveCorpFinanceModal('bond')}>회사채 발행</Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={() => setActiveCorpFinanceModal('funding')}>외부 투자 유치</Button>
                        </div>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card title="국내 주식">
                        <div className="max-h-48 overflow-y-auto pr-2">
                            {renderAssetList('국내 주식')}
                        </div>
                    </Card>
                    <Card title="해외 주식">
                        <div className="max-h-48 overflow-y-auto pr-2">
                            {renderAssetList('해외 주식')}
                        </div>
                    </Card>
                    <Card title="ETF/채권">
                        <div className="max-h-48 overflow-y-auto pr-2">
                            {renderAssetList('ETF')}
                            <div className="my-4 border-t border-gray-700"></div>
                            {renderAssetList('채권')}
                        </div>
                    </Card>
                    <Card title="가상자산" className="md:col-span-2 lg:col-span-3">
                        <div className="max-h-48 overflow-y-auto pr-2">
                            {renderAssetList('가상자산')}
                        </div>
                    </Card>
                </div>

            </div>
            
            {modalData && (
                <Modal
                    isOpen={!!modalData}
                    onClose={handleCloseModal}
                    title={`${modalData.asset.name} ${modalData.type === 'buy' ? '매수' : '매도'}`}
                    footer={
                        <>
                            <Button variant="secondary" onClick={handleCloseModal}>취소</Button>
                            <Button onClick={handleTransaction}>{modalData.type === 'buy' ? '매수 확정' : '매도 확정'}</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-gray-400">현재가: {formatMoney(modalData.asset.price)}</p>
                        {modalData.type === 'sell' && (
                            <p className="text-gray-400">보유 수량: {getHoldingForAsset(modalData.asset.id)?.quantity || 0}</p>
                        )}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-1">수량</label>
                            <input
                                type="number"
                                id="quantity"
                                min="1"
                                max={modalData.type === 'sell' ? getHoldingForAsset(modalData.asset.id)?.quantity : undefined}
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div className="text-right font-bold text-lg">
                            <p>총 금액: {formatMoney(modalData.asset.price * quantity)}</p>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Corporate Finance Modals */}
            <Modal
                isOpen={activeCorpFinanceModal === 'ipo'}
                onClose={() => setActiveCorpFinanceModal(null)}
                title="IPO (기업 공개)"
                footer={<Button onClick={() => setActiveCorpFinanceModal(null)}>확인</Button>}
            >
                <p className="text-gray-400">회사를 주식 시장에 상장하여 대규모 자금을 조달하고 기업 가치를 높입니다. 복잡한 절차와 높은 비용이 수반되지만, 성공 시 막대한 성장의 기회가 됩니다. 상장을 진행하시겠습니까? (기능 구현 예정)</p>
            </Modal>

            <Modal
                isOpen={activeCorpFinanceModal === 'mna'}
                onClose={() => setActiveCorpFinanceModal(null)}
                title="기업 인수·합병(M&A)"
                footer={<Button onClick={() => setActiveCorpFinanceModal(null)}>확인</Button>}
            >
                <p className="text-gray-400">다른 회사를 인수하거나 합병하여 기술력, IP, 시장 점유율을 단숨에 확보하는 전략입니다. 신중한 기업 분석과 막대한 자금이 필요합니다. M&A 대상을 물색하시겠습니까? (기능 구현 예정)</p>
            </Modal>

            <Modal
                isOpen={activeCorpFinanceModal === 'bond'}
                onClose={() => setActiveCorpFinanceModal(null)}
                title="회사채 발행"
                footer={<Button onClick={() => setActiveCorpFinanceModal(null)}>확인</Button>}
            >
                <p className="text-gray-400">대규모 자금 조달이 필요할 때, 회사의 신용을 바탕으로 채권을 발행하여 자금을 빌립니다. 정기적인 이자 지급 의무가 발생합니다. 회사채 발행을 검토하시겠습니까? (기능 구현 예정)</p>
            </Modal>

            <Modal
                isOpen={activeCorpFinanceModal === 'funding'}
                onClose={() => setActiveCorpFinanceModal(null)}
                title="외부 투자 유치"
                footer={<Button onClick={() => setActiveCorpFinanceModal(null)}>확인</Button>}
            >
                <p className="text-gray-400">회사의 지분 일부를 매각하여 외부로부터 투자를 유치합니다. 자금 확보와 함께 전략적 파트너를 얻을 수 있지만, 경영권 일부가 희석될 수 있습니다. 투자 유치를 진행하시겠습니까? (기능 구현 예정)</p>
            </Modal>
        </>
    );
};

export default FinanceView;
