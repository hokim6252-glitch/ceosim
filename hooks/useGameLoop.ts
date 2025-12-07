
import { useEffect, useRef } from 'react';
import { useGameState, useGameDispatch } from '../context/GameContext';
import { generateGameEvent } from '../services/geminiService';

export const useGameLoop = () => {
  const state = useGameState();
  const dispatch = useGameDispatch();
  const { isPaused, gameSpeed } = state;
  const loopRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = async () => {
      dispatch({ type: 'ADVANCE_WEEK' });

      // 10% chance to trigger a Gemini-powered event each week
      if (Math.random() < 0.1) {
        try {
          const event = await generateGameEvent(state);
          if (event) {
            dispatch({ type: 'ADD_EVENT', payload: event });
          }
        } catch (error) {
          console.error("Failed to generate game event:", error);
          // Fallback event
          dispatch({ type: 'ADD_EVENT', payload: { title: '통신 오류', description: '이벤트 서버에 연결할 수 없습니다.', type: 'negative' } });
        }
      }
    };

    if (!isPaused) {
      loopRef.current = window.setInterval(tick, gameSpeed);
    } else {
      if (loopRef.current) {
        clearInterval(loopRef.current);
      }
    }

    return () => {
      if (loopRef.current) {
        clearInterval(loopRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, gameSpeed, dispatch]);
};
