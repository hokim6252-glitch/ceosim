import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

// Helper function to generate random Korean names
const KOREAN_SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권'];
const KOREAN_GIVEN_NAMES_1 = ['서', '하', '지', '시', '유', '예', '민', '주', '현', '다', '가', '나', '라', '마'];
const KOREAN_GIVEN_NAMES_2 = ['준', '윤', '아', '우', '원', '은', '진', '연', '율', '영', '빈', '솔', '봄', '결'];

const generateRandomKoreanName = () => {
    const surname = KOREAN_SURNAMES[Math.floor(Math.random() * KOREAN_SURNAMES.length)];
    const givenName1 = KOREAN_GIVEN_NAMES_1[Math.floor(Math.random() * KOREAN_GIVEN_NAMES_1.length)];
    const givenName2 = KOREAN_GIVEN_NAMES_2[Math.floor(Math.random() * KOREAN_GIVEN_NAMES_2.length)];
    return `${surname}${givenName1}${givenName2}`;
};

const EmployeeManagementView: React.FC = () => {
    const { company, departments, temporaryBoosts } = useGameState();
    const dispatch = useGameDispatch();
    
    type Tab = 'list' | 'performance' | 'compensation' | 'promotion';
    const [activeTab, setActiveTab] = useState<Tab>('list');

    // State for Employee List tab
    const [showAll, setShowAll] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<{ name: string; department: string } | null>(null);

    // State for Performance Management tab
    const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
    const [bonusAmount, setBonusAmount] = useState(10000000); // Default 1천만
    const [selectedDept, setSelectedDept] = useState<string>('');
    
    // Memoize the generated names to prevent them from changing on every re-render
    const employeeNamesByDept = useMemo(() => {
        const names: Record<string, string[]> = {};
        names['CEO'] = [generateRandomKoreanName()];
        departments.forEach(dept => {
            names[dept.name] = Array.from({ length: dept.employees }, () => generateRandomKoreanName());
        });
        return names;
    }, [departments]);
    
    const coreDepartments = ['개발', '운영'];
    const departmentsToShow = showAll ? departments : departments.filter(d => coreDepartments.includes(d.name));

    // --- Handlers for Performance Management ---
    const handleOpenBonusModal = () => {
        if (departments.length > 0) {
            setSelectedDept(departments[0].name);
        }
        setIsBonusModalOpen(true);
    };

    const handleGiveBonus = () => {
        if (!selectedDept || bonusAmount <= 0) {
            alert('부서를 선택하고 보너스 금액을 올바르게 입력하세요.');
            return;
        }
        dispatch({ type: 'GIVE_BONUS', payload: { departmentName: selectedDept, amount: bonusAmount } });
        setIsBonusModalOpen(false);
    };
    
    const getBoostsForDepartment = (deptName: string) => {
        return temporaryBoosts
            .filter(b => b.departmentName === deptName && b.type === 'efficiency')
            .map(b => `효율 +${b.amount}% (${b.weeksRemaining}주 남음)`)
            .join(', ');
    };

    // --- Tab Components ---
    const TabButton: React.FC<{ tabId: Tab; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                activeTab === tabId
                    ? 'bg-gray-800 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
            }`}
        >
            {children}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'list':
                return (
                    <Card title="직원 목록">
                        <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
                            <div>
                                <h3 className="font-bold text-lg text-cyan-400 border-b border-gray-700 pb-2 mb-2">CEO</h3>
                                <button
                                    onClick={() => setSelectedEmployee({ name: employeeNamesByDept['CEO'][0], department: 'CEO' })}
                                    className="text-gray-300 pl-4 hover:text-cyan-400 transition-colors"
                                >
                                    {employeeNamesByDept['CEO'][0]}
                                </button>
                            </div>

                            {departmentsToShow.map(dept => (
                                <div key={dept.name}>
                                    <h3 className="font-bold text-lg text-cyan-400 border-b border-gray-700 pb-2 mb-2">{dept.name}팀 ({dept.employees}명)</h3>
                                    {dept.employees > 0 ? (
                                        <ul className="list-none pl-4 text-gray-300 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-1">
                                            {employeeNamesByDept[dept.name]?.map((name, i) => (
                                                <li key={i}>
                                                    <button
                                                        onClick={() => setSelectedEmployee({ name, department: dept.name })}
                                                        className="hover:text-cyan-400 transition-colors"
                                                    >
                                                        {name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 pl-4">소속 직원이 없습니다.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 border-t border-gray-700 pt-4">
                            <Button variant="secondary" onClick={() => setShowAll(!showAll)}>
                                {showAll ? '간략히 보기' : '전체보기'}
                            </Button>
                        </div>
                    </Card>
                );
            case 'performance':
                return (
                    <div className="space-y-6">
                        <Card title="Performance Dashboard">
                            <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
                                {departments.map(dept => (
                                    <div key={dept.name} className="bg-gray-800 p-4 rounded-lg">
                                        <h3 className="font-bold text-lg text-cyan-400">{dept.name}팀</h3>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <p className="text-sm text-gray-400">주간 KPI</p>
                                                <p className="text-2xl font-bold">{dept.kpi}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">기본 효율</p>
                                                <p className="text-2xl font-bold">{dept.efficiency}%</p>
                                            </div>
                                        </div>
                                        {getBoostsForDepartment(dept.name) && (
                                            <p className="text-xs text-green-400 mt-2">
                                                진행중인 보너스: {getBoostsForDepartment(dept.name)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card title="보너스 및 인센티브">
                                <p className="text-gray-400 mb-4">뛰어난 성과를 보인 부서에 보너스를 지급하여 사기를 진작시키고 효율을 높입니다.</p>
                                <Button onClick={handleOpenBonusModal} disabled={departments.length === 0}>보너스 지급</Button>
                            </Card>

                            <Card title="성과 트렌드">
                                <p className="text-gray-400">부서/팀별 성과 추이를 그래프로 시각화합니다. (추후 업데이트 예정)</p>
                            </Card>
                        </div>
                    </div>
                );
            case 'compensation':
                return <Card title="급여 및 보상"><p className="text-gray-400">연봉 협상, 인센티브 지급 등 보상 체계를 관리합니다. (추후 업데이트 예정)</p></Card>;
            case 'promotion':
                return <Card title="승진 및 이동"><p className="text-gray-400">직원의 승진 이력과 부서 이동을 관리합니다. (추후 업데이트 예정)</p></Card>;
        }
    };

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">직원 관리</h1>
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton tabId="list">직원 목록</TabButton>
                        <TabButton tabId="performance">성과 관리</TabButton>
                        <TabButton tabId="compensation">급여 및 보상</TabButton>
                        <TabButton tabId="promotion">승진 및 이동</TabButton>
                    </nav>
                </div>
                <div className="mt-4">
                    {renderContent()}
                </div>
            </div>

            {/* Employee Info Modal */}
            <Modal
                isOpen={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                title="직원 정보"
                footer={<Button onClick={() => setSelectedEmployee(null)}>닫기</Button>}
            >
                {selectedEmployee && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400">이름</p>
                            <p className="text-lg font-bold">{selectedEmployee.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">소속</p>
                            <p className="text-lg font-bold">{selectedEmployee.department}{selectedEmployee.department !== 'CEO' ? '팀' : ''}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-700">
                           <p className="text-gray-500 text-sm">상세 정보(연봉, 성과, 능력치 등)는 추후 업데이트될 예정입니다.</p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Bonus Modal */}
            <Modal
                isOpen={isBonusModalOpen}
                onClose={() => setIsBonusModalOpen(false)}
                title="보너스 지급"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsBonusModalOpen(false)}>취소</Button>
                        <Button onClick={handleGiveBonus} disabled={company.assets < bonusAmount}>
                            {company.assets < bonusAmount ? '자금 부족' : '지급'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-gray-400">보너스를 지급할 부서와 금액을 설정하세요. 보너스 지급 시 4주간 해당 부서의 효율이 10% 상승합니다.</p>
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-400 mb-1">대상 부서</label>
                        <select
                            id="department"
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {departments.map(dept => <option key={dept.name} value={dept.name}>{dept.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bonusAmount" className="block text-sm font-medium text-gray-400 mb-1">보너스 금액 (원)</label>
                        <input
                            id="bonusAmount"
                            type="number"
                            step="1000000"
                            min="0"
                            value={bonusAmount}
                            onChange={(e) => setBonusAmount(parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <p className="text-right text-sm text-gray-400">현재 자산: {company.assets.toLocaleString()}원</p>
                </div>
            </Modal>
        </>
    );
};

export default EmployeeManagementView;