import React, { useState } from 'react';
import { useGameState, useGameDispatch } from '../../context/GameContext';
import Card from '../ui/Card';
import Stat from '../ui/Stat';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { generateGameEvent, generateWeeklyBriefing } from '../../services/geminiService';
import { gameReducer } from '../../context/GameContext';
import Modal from '../ui/Modal';
import { GameState } from '../../types';

const HomeView: React.FC = () => {
  const state = useGameState();
  const dispatch = useGameDispatch();
  const { company, date, eventLog } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [briefings, setBriefings] = useState<{ week: number; text: string; date: Date }[] | null>(null);

  const formatDate = (d: Date) => d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const formatMoney = (amount: number) => `${Math.floor(amount / 100000000).toLocaleString()}억 원`;

  const handleAdvanceTime = async (weeks: number) => {
    setIsLoading(true);
    setBriefings(null);

    let previousState: GameState = state;
    let simulatedState: GameState = state;
    const generatedBriefings: { week: number; text: string; date: Date }[] = [];

    try {
      // Simulate future weeks, generating events and briefings for each week
      for (let i = 0; i < weeks; i++) {
        // First, apply deterministic weekly changes
        simulatedState = gameReducer(previousState, { type: 'ADVANCE_WEEK' });

        // Second, check for a random AI-generated event for this specific week
        // Increasing probability to 15% to make events more frequent
        if (Math.random() < 0.15) {
          const event = await generateGameEvent(simulatedState);
          if (event) {
            // If an event occurs, apply it to the state immediately
            simulatedState = gameReducer(simulatedState, { type: 'ADD_EVENT', payload: event });
          }
        }
        
        // Third, generate the weekly briefing based on the final state of the week (after events)
        const briefingText = await generateWeeklyBriefing(previousState, simulatedState);
        generatedBriefings.push({
          week: i + 1,
          text: briefingText,
          date: simulatedState.date,
        });
        
        // Finally, update the 'previousState' for the next loop iteration
        previousState = simulatedState;
      }

      // The loop is done, so simulatedState is the final state after all weeks.
      // Apply the final state to the game.
      dispatch({ type: 'SET_STATE', payload: simulatedState });
      
      // Show all the collected briefings in a modal.
      setBriefings(generatedBriefings);

    } catch (error) {
      console.error("Error during time advance:", error);
      dispatch({ type: 'ADD_EVENT', payload: { title: 'AI 브리핑 오류', description: '주간 브리핑을 생성하는 데 실패했습니다.', type: 'negative' } });
      // If something fails, apply the state from before the error
      dispatch({ type: 'SET_STATE', payload: previousState });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = () => {
    setSaveStatus('saving');
    // The game auto-saves via useEffect in GameContext, so this is just for UX feedback.
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 100); // A small delay to simulate action
  };


  const getEventTypeStyles = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive': return 'border-l-4 border-green-500';
      case 'negative': return 'border-l-4 border-red-500';
      default: return 'border-l-4 border-gray-500';
    }
  };

  const latestNews = eventLog.find(log => log.isNews);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
                 <Button variant="secondary" onClick={handleSave} disabled={saveStatus !== 'idle'} size="sm">
                    {saveStatus === 'idle' ? '저장하기' : saveStatus === 'saving' ? '저장 중...' : '저장 완료!'}
                </Button>
                <div className="h-8 border-l border-gray-700"></div>
                <Stat label="현재 날짜" value={formatDate(date)} size="sm" icon={Icon.Calendar}/>
                <Stat label="보유 자산" value={formatMoney(company.assets)} size="sm" icon={Icon.Money}/>
                <Stat label="직원 수" value={`${company.employees}/${company.employeeCapacity}명`} size="sm" icon={Icon.Users}/>
                <Stat label="회사 평판" value={company.reputation} size="sm" icon={Icon.Reputation}/>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={() => handleAdvanceTime(1)} disabled={isLoading} size="sm">
                  {isLoading ? '진행 중...' : '다음 주'}
              </Button>
              <Button variant="secondary" onClick={() => handleAdvanceTime(3)} disabled={isLoading} size="sm">
                  {isLoading ? '진행 중...' : '3주 진행'}
              </Button>
              <Button variant="secondary" onClick={() => handleAdvanceTime(4)} disabled={isLoading} size="sm">
                  {isLoading ? '진행 중...' : '1개월 진행'}
              </Button>
          </div>
        </div>

        <Card title="뉴스">
            {latestNews ? (
                <div>
                    <h3 className="font-bold text-lg">{latestNews.title}</h3>
                    <p className="text-gray-300 mt-1">{latestNews.description}</p>
                    <p className="text-xs text-gray-500 text-right mt-2">{formatDate(latestNews.date)}</p>
                </div>
            ) : (
                <p className="text-gray-400">최신 시장 동향, 경쟁사 소식, 기술 트렌드 등 주요 뉴스가 여기에 표시됩니다.</p>
            )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="진행중인 프로젝트" className="lg:col-span-1">
            {state.projects.filter(p => p.status === 'in-development').length > 0 ? (
              <ul className="space-y-4">
                {state.projects.filter(p => p.status === 'in-development').map(p => (
                  <li key={p.id}>
                    <p className="font-semibold">{p.name}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                      <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                    </div>
                    <p className="text-right text-xs text-gray-400">{Math.floor(p.progress)}%</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-400">진행중인 프로젝트가 없습니다.</p>}
          </Card>
          <Card title="주간 이벤트 로그" className="lg:col-span-2">
              <div className="h-96 overflow-y-auto pr-2 space-y-3">
                  {eventLog.map(log => (
                      <div key={log.id} className={`p-3 bg-gray-800 rounded-md ${getEventTypeStyles(log.type)}`}>
                          <div className="flex justify-between items-baseline">
                              <p className="font-bold">{log.title}</p>
                              <p className="text-xs text-gray-500">{formatDate(log.date)}</p>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">{log.description}</p>
                      </div>
                  ))}
              </div>
          </Card>
        </div>
      </div>
      <Modal
        isOpen={briefings !== null}
        onClose={() => setBriefings(null)}
        title="AI 주간 브리핑"
        footer={<Button onClick={() => setBriefings(null)}>확인</Button>}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {briefings?.map((briefing) => (
            <div key={briefing.week} className="p-3 bg-gray-900 rounded-md border border-gray-700">
              <h3 className="font-bold text-cyan-400">
                {briefing.date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 주차 보고
              </h3>
              <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">{briefing.text}</p>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default HomeView;
