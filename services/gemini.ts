import { GoogleGenAI, Type } from "@google/genai";
import { GeminiCommentary } from "../types";

export const getRollCommentary = async (
  d1: number, 
  d2: number, 
  mode: 'standard' | 'catalyst' | 'inhibitor' | 'damage',
  discarded?: number
): Promise<GeminiCommentary> => {
  const isDamage = mode === 'damage';
  const finalValue = isDamage ? d1 : d1 + d2;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const modeDescriptions = {
    standard: "uma reação padrão (2d6)",
    catalyst: "uma reação catalisada (vantagem, rola 3d6 e descarta o menor)",
    inhibitor: "uma reação inibida (desvantagem, rola 3d6 e descarta o maior)",
    damage: "uma liberação de energia destrutiva (dano de arma, rola apenas 1d6)"
  };

  const systemInstruction = `Você é o Grão-Alquimista Meridius. Seu tom é místico e acadêmico.
  REGRAS DE REAÇÃO (2d6): 12 é Sucesso Perfeito ("Gás Nobre"), 2 é Falha Crítica ("Entropia").
  REGRAS DE DANO (1d6): 6 é um impacto violento, 1 é um ferimento superficial.
  Sua tarefa: Comentar o resultado do dado (máximo 12 palavras). 
  Contexto: O aprendiz realizou ${modeDescriptions[mode]}.
  Use termos como: "Valência", "Exotérmica", "Transmutação", "Éter", "Equilíbrio", "Cinética".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O aprendiz obteve o valor final ${finalValue} em ${modeDescriptions[mode]}. Comente como Meridius sobre este resultado específico.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            sentiment: { 
              type: Type.STRING, 
              enum: ['lucky', 'unlucky', 'neutral', 'amazing'] 
            }
          },
          required: ["text", "sentiment"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Resposta vazia da IA");
    }

    return JSON.parse(responseText.trim()) as GeminiCommentary;
  } catch (error) {
    console.error("Erro na alquimia:", error);
    return {
      text: `A energia de ${finalValue} flui pelo seu foco. Prossiga com a transmutação.`,
      sentiment: 'neutral'
    };
  }
};