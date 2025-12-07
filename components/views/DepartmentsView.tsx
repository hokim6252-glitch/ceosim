import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import { useNavigation } from '../../context/NavigationContext';
import { Department, DepartmentPolicy } from '../../types';
import { DEPARTMENT_POLICIES } from '../../constants';

const DepartmentsView: React.FC = () => {
  const { departments, company, activePolicies } = useGameState();
  const dispatch = useGameDispatch();
  const { setActiveView } = useNavigation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAbolishModalOpen, setIsAbolishModalOpen] = useState(false);
  const [policyModalDept, setPolicyModalDept] = useState<Department | null>(null);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [departmentToAbolish, setDepartmentToAbolish] = useState('');

  const handleCreateDepartment = () => {
    if (newDepartmentName.trim() && !departments.some(d => d.name === newDepartmentName.trim())) {
      dispatch({ type: 'CREATE_DEPARTMENT', payload: newDepartmentName.trim() });
      setNewDepartmentName('');
      setIsCreateModalOpen(false);
    } else {
      alert("부서 이름이 비어있거나 이미 존재합니다.");
    }
  };

  const handleAbolishDepartment = () => {
    if (departmentToAbolish) {
      dispatch({ type: 'ABOLISH_DEPARTMENT', payload: departmentToAbolish });
      setDepartmentToAbolish('');
      setIsAbolishModalOpen(false);
    }
  };
  
  const openAbolishModal = () => {
    if (departments.length > 0) {
      setDepartmentToAbolish(departments[0].name);
    }
    setIsAbolishModalOpen(true);
  };

  const handleImplementPolicy = (policy: DepartmentPolicy) => {
    dispatch({ type: 'START_POLICY', payload: policy });
    setPolicyModalDept(null);
  };

  const isPolicyActive = (policyId: string) => {
    return activePolicies.some(p => p.policyId === policyId);
  };

  const availablePolicies = useMemo(() => {
    if (!policyModalDept) return [];
    return DEPARTMENT_POLICIES.filter(policy => policy.departments.includes(policyModalDept.name));
  }, [policyModalDept]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">부서 관리</h1>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>부서 신설</Button>
            <Button variant="danger" onClick={openAbolishModal} disabled={departments.length === 0}>부서 폐지</Button>
            <Button onClick={() => setActiveView('recruitment')}>직원 고용</Button>
          </div>
        </div>
        <Card title="부서 목록 및 효율">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <button 
                key={dept.name} 
                className="bg-gray-800 p-4 rounded-lg text-left hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onClick={() => setPolicyModalDept(dept)}
              >
                <h3 className="font-bold text-lg text-cyan-400">{dept.name}팀</h3>
                <p className="text-sm text-gray-400">직원: {dept.employees}명</p>
                <p className="text-sm text-gray-400">효율: {dept.efficiency}%</p>
              </button>
            ))}
            {departments.length === 0 && (
                <p className="text-gray-400 col-span-full">현재 부서가 없습니다. '부서 신설'을 통해 새로운 부서를 만드세요.</p>
            )}
          </div>
        </Card>
        
        <Card title="시행중인 정책">
          {activePolicies.length > 0 ? (
            <div className="space-y-3">
              {activePolicies.map(policy => (
                <div key={policy.policyId} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                  <p className="font-semibold text-cyan-400">{policy.name}</p>
                  <p className="text-sm text-gray-400">{policy.weeksRemaining}주 남음</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">현재 시행 중인 정책이 없습니다.</p>
          )}
        </Card>

        <Card title="미래전략실">
          <p className="text-gray-400">장기/글로벌 전략 수립, M&A 분석 등 데이터 기반 의사결정을 지원합니다. (대기업 단계 이상에서 활성화)</p>
        </Card>
      </div>

      {/* 부서 신설 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="부서 신설"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>취소</Button>
            <Button onClick={handleCreateDepartment}>신설</Button>
          </>
        }
      >
        <p className="text-gray-400 mb-4">새로 만들 부서의 이름을 입력하세요.</p>
        <input
          type="text"
          value={newDepartmentName}
          onChange={(e) => setNewDepartmentName(e.target.value)}
          placeholder="예: AI 연구팀"
          className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </Modal>

      {/* 부서 폐지 모달 */}
      <Modal
        isOpen={isAbolishModalOpen}
        onClose={() => setIsAbolishModalOpen(false)}
        title="부서 폐지"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAbolishModalOpen(false)}>취소</Button>
            <Button variant="danger" onClick={handleAbolishDepartment}>폐지</Button>
          </>
        }
      >
        <p className="text-gray-400 mb-4">폐지할 부서를 선택하세요. 해당 부서의 모든 직원은 퇴사 처리됩니다.</p>
        <select
            value={departmentToAbolish}
            onChange={(e) => setDepartmentToAbolish(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
            {departments.map(dept => (
                <option key={dept.name} value={dept.name}>{dept.name}</option>
            ))}
        </select>
      </Modal>

      {/* 부서 정책 모달 */}
      <Modal
        isOpen={!!policyModalDept}
        onClose={() => setPolicyModalDept(null)}
        title={`${policyModalDept?.name}팀 정책 관리`}
        footer={<Button onClick={() => setPolicyModalDept(null)}>닫기</Button>}
      >
        <div className="space-y-4">
          {availablePolicies.length > 0 ? (
            availablePolicies.map(policy => {
              const isActive = isPolicyActive(policy.id);
              const canAfford = company.assets >= policy.cost;
              return (
              <div key={policy.id} className="bg-gray-900 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-cyan-400">{policy.name}</h4>
                <p className="text-sm text-gray-300 mt-2">{policy.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                    <span>비용: {(policy.cost / 10000).toLocaleString()}만 원</span>
                    <span className="ml-4">기간: {policy.duration}주</span>
                </div>
                <div className="text-right mt-3">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleImplementPolicy(policy)}
                    disabled={isActive || !canAfford}
                  >
                    {isActive ? '시행중' : !canAfford ? '자금 부족' : '정책 시행'}
                  </Button>
                </div>
              </div>
            )})
          ) : (
            <p className="text-gray-400">이 부서에 적용 가능한 특별 정책이 없습니다.</p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DepartmentsView;
