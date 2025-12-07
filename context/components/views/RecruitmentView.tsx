import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useGameDispatch, useGameState } from '../../context/GameContext';

const RecruitmentView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hires, setHires] = useState<Record<string, number>>({});
  const { recruitments, departments } = useGameState();
  const dispatch = useGameDispatch();

  const handleOpenModal = () => {
    // Reset hires state when opening the modal
    const initialHires = departments.reduce((acc, dept) => {
      // FIX: The 'dept' variable is a Department object. Use 'dept.name' as the index.
      acc[dept.name] = 0;
      return acc;
    }, {} as Record<string, number>);
    setHires(initialHires);
    setIsModalOpen(true);
  };

  const handleHireCountChange = (department: string, value: string) => {
    const count = parseInt(value, 10);
    setHires(prev => ({
      ...prev,
      [department]: isNaN(count) || count < 0 ? 0 : count,
    }));
  };

  const handlePostJobOpening = () => {
    // FIX: Refactored from Object.entries().reduce() to Object.keys().reduce()
    // to resolve a type inference issue where the `count` was incorrectly typed as `unknown`.
    // This approach is more type-safe in this environment.
    const hiresToPost = Object.keys(hires).reduce((acc, dept) => {
      const count = hires[dept];
      if (count > 0) {
        acc[dept] = count;
      }
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(hiresToPost).length > 0) {
      dispatch({ type: 'START_RECRUITMENT', payload: hiresToPost });
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">채용 관리</h1>
          <Button onClick={handleOpenModal} disabled={departments.length === 0}>신규 채용 공고</Button>
        </div>
        <Card title="진행 중인 채용">
          {recruitments.length > 0 ? (
            <ul className="space-y-3">
              {recruitments.map(rec => (
                <li key={rec.id} className="bg-gray-800 p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-cyan-400">채용 공고 #{rec.id.slice(0, 8)}</p>
                      <div className="text-sm mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        {/* FIX: Refactored from Object.entries to Object.keys to avoid a type inference issue where `count` was incorrectly typed as `unknown`. */}
                        {Object.keys(rec.hires).map(dept => (
                          <span key={dept} className="text-gray-300">{dept}: <span className="font-mono">{rec.hires[dept]}</span>명</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-1 whitespace-nowrap">{rec.weeksRemaining}주 남음</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">현재 진행 중인 채용 공고가 없습니다.</p>
          )}
        </Card>
        <Card title="인재 풀">
          <p className="text-gray-400">영입 가능한 인재 목록이 여기에 표시됩니다.</p>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="신규 채용 공고"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
            <Button onClick={handlePostJobOpening}>공고 게시</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-400">각 부서별로 채용할 인원 수를 입력하세요. (4주 소요)</p>
          {/* FIX: The 'dept' variable is a Department object. Use 'dept.name' for keys, attributes, and function arguments. */}
          {departments.map(dept => (
            <div key={dept.name} className="flex justify-between items-center bg-gray-900 p-3 rounded-md">
              <label htmlFor={`hire-${dept.name}`} className="font-semibold">{dept.name}팀</label>
              <input
                id={`hire-${dept.name}`}
                type="number"
                min="0"
                value={hires[dept.name] || 0}
                onChange={(e) => handleHireCountChange(dept.name, e.target.value)}
                className="w-24 bg-gray-700 text-white p-2 rounded-md text-right border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default RecruitmentView;