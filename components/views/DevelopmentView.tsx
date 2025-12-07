import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import Modal from '../ui/Modal';
import { GAME_GENRES, PLATFORMS, TARGET_COUNTRIES, DEPARTMENT_POLICIES } from '../../constants';

const DevelopmentView: React.FC = () => {
  const state = useGameState();
  const { projects, departments, activePolicies, completedRndStrategies } = state;
  const dispatch = useGameDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    genre: GAME_GENRES[0],
    platform: PLATFORMS[0],
    budget: 1000000000, // 10억 default
    targetCountry: TARGET_COUNTRIES[0],
  });

  const inDevelopmentProjects = projects.filter(p => p.status === 'in-development');
  const releasedProjects = projects.filter(p => p.status === 'released');
  
  const devSpeedBonus = useMemo(() => {
    let bonus = 1.0;
    if (activePolicies.some(p => p.policyId === 'ai_dev')) bonus += 0.25;
    if (completedRndStrategies.some(r => r.id === 'engine')) bonus += 0.15;
    if (completedRndStrategies.some(r => r.id === 'ai_support')) bonus += 0.1;
    return bonus;
  }, [activePolicies, completedRndStrategies]);

  const devDept = departments.find(d => d.name === '개발');
  const devProgressPerWeek = devDept ? (0.5 + devDept.employees * 0.05) * (1 + (devDept.efficiency - 50) / 100) * devSpeedBonus : 0.5 * devSpeedBonus;

  const handleRelease = (projectId: string) => {
    dispatch({ type: 'RELEASE_PROJECT', payload: { projectId } });
  };

  const handleCreateProject = () => {
    if (newProject.name.trim() === '' || newProject.budget <= 0) {
      alert('프로젝트 이름과 예산을 올바르게 입력해주세요.');
      return;
    }
    dispatch({ type: 'CREATE_PROJECT', payload: newProject });
    setIsModalOpen(false);
    // Reset form
    setNewProject({
      name: '',
      genre: GAME_GENRES[0],
      platform: PLATFORMS[0],
      budget: 1000000000,
      targetCountry: TARGET_COUNTRIES[0],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseInt(value, 10) * 10000 || 0 : value,
    }));
  };
  
  const formatMoney = (amount: number) => `${Math.floor(amount / 100000000).toLocaleString('ko-KR')}억 원`;

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">게임 개발 관리</h1>
          <Button onClick={() => setIsModalOpen(true)}>신규 게임 개발</Button>
        </div>
        
        <Card title="진행중인 프로젝트">
          {inDevelopmentProjects.length > 0 ? (
            <div className="space-y-4">
              {inDevelopmentProjects.map(p => {
                const remainingProgress = 100 - p.progress;
                const weeksRemaining = devProgressPerWeek > 0 ? Math.ceil(remainingProgress / devProgressPerWeek) : Infinity;
                
                return (
                  <div key={p.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg text-cyan-400">{p.name}</h3>
                      <span className="text-sm bg-cyan-800 text-cyan-200 px-2 py-1 rounded">{p.genre} / {p.platform}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
                      <div className="bg-cyan-500 h-4 rounded-full text-center text-xs text-white" style={{ width: `${p.progress}%` }}>
                        {p.progress.toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>예산: {formatMoney(p.budget)}</span>
                        <span>예상 개발 완료 기간: {isFinite(weeksRemaining) ? `${weeksRemaining}주` : '계산 불가'}</span>
                        <span>타겟: {p.targetCountry}</span>
                    </div>
                    {p.progress >= 100 && (
                      <div className="mt-4 text-right">
                        <Button onClick={() => handleRelease(p.id)}>출시</Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400">진행중인 프로젝트가 없습니다. '신규 게임 개발' 버튼을 눌러 시작하세요.</p>
          )}
        </Card>

        <Card title="완료된 프로젝트">
          {releasedProjects.length > 0 ? (
              <div className="space-y-4">
                {releasedProjects.map(p => (
                  <div key={p.id} className="bg-gray-800 p-4 rounded-lg opacity-70">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg text-cyan-400">{p.name}</h3>
                      <span className="text-sm bg-gray-600 text-gray-200 px-2 py-1 rounded">출시 완료</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">출시일: {p.releaseDate?.toLocaleDateString('ko-KR')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">완료된 프로젝트 목록이 여기에 표시됩니다.</p>
            )}
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="신규 게임 개발"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>취소</Button>
            <Button onClick={handleCreateProject}>개발 시작</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-cyan-400">프로젝트 설정</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">프로젝트명</label>
              <input type="text" id="name" name="name" value={newProject.name} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-400 mb-1">장르</label>
              <select id="genre" name="genre" value={newProject.genre} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                {GAME_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-400 mb-1">플랫폼</label>
              <select id="platform" name="platform" value={newProject.platform} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="targetCountry" className="block text-sm font-medium text-gray-400 mb-1">타깃 국가</label>
              <select id="targetCountry" name="targetCountry" value={newProject.targetCountry} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                {TARGET_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-400 mb-1">예산 (만 원)</label>
              <input type="number" id="budget" name="budget" value={newProject.budget / 10000} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </div>
          <div className="bg-gray-900 p-4 rounded-md">
            <h3 className="font-bold text-lg text-cyan-400 mb-2">성공률 영향 요소</h3>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
              <li>팀 능력 (개발 부서 인원/효율)</li>
              <li>QA 수준 (운영 부서 인원/효율)</li>
              <li>AI 개발 지원 (R&D)</li>
              <li>특허·엔진 (R&D)</li>
              <li>시장 트렌드 (뉴스/이벤트)</li>
              <li>서버 안정성 (부동산/인프라)</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">* 이 요소들은 게임의 최종 리뷰 점수와 성공에 영향을 미칩니다.</p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DevelopmentView;
