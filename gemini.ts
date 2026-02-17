import { GoogleGenAI, Type } from "@google/genai";
import { GeminiCommentary } from "../types";

export const getRollCommentary = async (
  d1: number, 
  d2: number, 
  mode: 'standard' | 'catalyst' | 'inhibitor' | 'damage',
  discarded?: number
): Promise<GeminiCommentary> => {
  const sum = d2 === 0 ? d1 : d1 + d2;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `Você é o Grão-Alquimista Meridius. Seu tom é místico e acadêmico.
  REGRAS: 12 é Sucesso Perfeito ("Gás Nobre"), 2 é Falha Crítica ("Entropia").
  Sua tarefa: Comentar o resultado do dado (máximo 10 palavras). 
  Use termos como: "Valência", "Exotérmica", "Transmutação", "Éter".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O aprendiz obteve o valor final ${sum}. Comente como Meridius.`,
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

    // Correção do erro TS18048: Verificamos se response.text existe antes de usar
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Resposta vazia da IA");
    }

    return JSON.parse(responseText.trim()) as GeminiCommentary;
  } catch (error) {
    console.error("Erro na alquimia:", error);
    return {
      text: `A energia de ${sum} flui pelo seu foco. Prossiga.`,
      sentiment: 'neutral'
    };
  }
};