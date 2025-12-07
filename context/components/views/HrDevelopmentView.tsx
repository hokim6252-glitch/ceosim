import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const HrDevelopmentView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">신입/인재 개발</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="신입 연수">
                    <p className="text-gray-400 mb-4">신규 입사자들의 빠른 적응과 역량 강화를 위한 연수 프로그램을 운영합니다.</p>
                    <div className="space-y-3">
                        <Button variant="secondary" className="w-full justify-start text-left">
                            <div>
                                <p className="font-semibold">외부 전문 연수</p>
                                <p className="text-xs font-normal text-gray-400">높은 비용, 높은 효과</p>
                            </div>
                        </Button>
                        <Button variant="secondary" className="w-full justify-start text-left">
                            <div>
                                <p className="font-semibold">내부 자체 연수</p>
                                <p className="text-xs font-normal text-gray-400">낮은 비용, 보통 효과</p>
                            </div>
                        </Button>
                    </div>
                </Card>
                <Card title="내부 인재 개발원 설립">
                    <p className="text-gray-400 mb-4">자체적인 인재 개발원을 설립하여 전 직원의 역량을 상시적으로 강화합니다. 설립 시 '인재 개발원' 건물이 필요합니다.</p>
                     <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm mb-4">
                        <li>직원 능력치 상승</li>
                        <li>개발·운영·마케팅 효율 증가</li>
                        <li>핵심 인재의 해외 파견 또는 계열사 이동 기회 창출</li>
                    </ul>
                    <Button disabled>인재 개발원 설립</Button>
                </Card>
            </div>
        </div>
    );
};

export default HrDevelopmentView;
