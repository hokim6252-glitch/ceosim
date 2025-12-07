import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GameEventLog, GameEventPayload } from '../types';
import { GAME_GENRES } from '../constants';

// IMPORTANT: Do not hardcode the API key. It must be provided via environment variables.
// We assume process.env.API_KEY is available in the execution environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateGameEvent = async (gameState: GameState): Promise<GameEventPayload | null> => {
  if (!API_KEY) return null;

  const { company } = gameState;

  const prompt = `
You are the Game Master for "CEO Game Company Simulation". Your role is to create dynamic world events.
The player's company status:
- Name: "${company.name}" (${company.tier})
- Assets: ${company.assets.toLocaleString()} KRW
- Reputation: ${company.reputation}

Generate a single, realistic event for the current week based on one of the following categories:
- Economic/Political News: Economic crisis/boom, government support policies.
- Game Industry Trends: A new genre or platform becomes popular. CREATE A "marketTrend" object for this.
- Competitor Actions: A rival company announces a hit game or faces a major failure.
- Internal Incidents: Server fire, hacking attempt, sudden major bug discovery.

If the event is a "Game Industry Trend", you MUST create a "marketTrend" object specifying the "genre" and "trend" ('up' or 'down'). The genre should be one of: ${GAME_GENRES.join(', ')}.
The event title and description MUST be in Korean.
If the event is a major world or market event (Economic News, Trends, Competitor Actions), set "isNews" to true. For purely internal incidents, set it to false.
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'The title of the event in Korean.' },
                    description: { type: Type.STRING, description: 'The description of the event in Korean.' },
                    type: { type: Type.STRING, description: 'The type of the event: "positive", "negative", or "neutral".' },
                    isNews: { type: Type.BOOLEAN, description: 'Set to true for major world/market events, false for internal company incidents.' },
                    marketTrend: {
                        type: Type.OBJECT,
                        description: 'An object representing a market trend, only if the event is a Game Industry Trend.',
                        properties: {
                            genre: { type: Type.STRING, description: `The genre affected by the trend. Must be one of: ${GAME_GENRES.join(', ')}` },
                            trend: { type: Type.STRING, description: 'The direction of the trend: "up" or "down".' }
                        },
                    }
                },
                required: ['title', 'description', 'type', 'isNews'],
            }
        }
    });
    
    if (response.text) {
        const jsonString = response.text.trim();
        const eventData = JSON.parse(jsonString);
        
        const isValidType = ['positive', 'negative', 'neutral'].includes(eventData.type);

        if (eventData.title && eventData.description && isValidType) {
            const eventResult: GameEventPayload = {
              title: eventData.title,
              description: eventData.description,
              type: eventData.type,
              isNews: !!eventData.isNews
            };
            if (eventData.marketTrend && eventData.marketTrend.genre && eventData.marketTrend.trend) {
                eventResult.marketTrend = eventData.marketTrend;
            }
            return eventResult;
        }
    }
    return null;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
};

export const generateWeeklyBriefing = async (previousState: GameState, newState: GameState): Promise<string> => {
    if (!API_KEY) return "AI 비활성화됨: API 키가 설정되지 않았습니다.";

    const prompt = `
    You are the CEO's AI assistant in "CEO Game Company Simulation".
    Summarize the key changes that occurred during the week ending on ${newState.date.toLocaleDateString('ko-KR')}.
    Provide a concise weekly briefing in Korean, in a professional but friendly tone.

    Here is the data for the start and end of the week:

    Previous State (Start of Week):
    - Assets: ${previousState.company.assets.toLocaleString()} KRW
    - Employees: ${previousState.company.employees}
    - Projects: ${previousState.projects.filter(p => p.status === 'in-development').map(p => `${p.name} (${p.progress.toFixed(0)}% complete)`).join(', ') || '없음'}

    Current State (End of Week):
    - Assets: ${newState.company.assets.toLocaleString()} KRW
    - Employees: ${newState.company.employees}
    - Projects: ${newState.projects.filter(p => p.status === 'in-development').map(p => `${p.name} (${p.progress.toFixed(0)}% complete)`).join(', ') || '없음'}

    Focus on the differences and provide a brief analysis. Mention financial changes (expenses), project progress, and any new hires if the employee count increased.
    Do not repeat the raw numbers unless necessary for context.
    Keep the briefing professional and under 150 words. Be direct and clear.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text?.trim() || "AI가 브리핑을 생성하지 못했습니다.";
    } catch (error) {
        console.error("Error calling Gemini API for briefing:", error);
        return "AI 브리핑 생성 중 오류가 발생했습니다.";
    }
};