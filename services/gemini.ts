
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

  // Contexto rico extraído do livro para a IA
  const systemInstruction = `Você é o Grão-Alquimista Meridius, líder da Ordem dos Elementos em Quimera.
  Seu conhecimento abrange as 7 Províncias: Ignara (Fogo), Solventia (Água), Terranova (Terra), Aerion (Ar), Electria (Eletricidade), Ligamentum (Conexões) e Equilibrium (Centro).
  Sua voz é mística, acadêmica e encorajadora, mas severa sobre os riscos da Entropia e da Ferrugem Cinzenta.
  
  REGRAS DE QUIMERA:
  - 12 natural: "Estado de Gás Nobre" (Sucesso Perfeito).
  - 2 natural: "Isótopo Instável" (Falha Crítica/Entropia).
  - Catalisador: Uso de 3d6, mantendo os melhores.
  - Inibidor: Uso de 3d6, mantendo os piores (influência da Cabala ou Ferrugem).
  - Dano: 1d6 para medir impacto ou ferimentos (Capítulo 7).

  Sua tarefa: Comentar brevemente o resultado do dado (máximo 12 palavras). 
  Use terminologia do livro como: "Energia de Ativação", "Camada de Valência", "Reação Exotérmica", "Transmutação".`;

  try {
    let modeDescription = "";
    if (mode === 'catalyst') modeDescription = `um Teste com Catalisador (Vantagem), desconsiderando o dado ${discarded}.`;
    else if (mode === 'inhibitor') modeDescription = `um Teste com Inibidor (Desvantagem), sofrendo com a entropia do dado ${discarded}.`;
    else if (mode === 'damage') modeDescription = `uma medição de dano físico ou impacto alquímico de 1d6.`;
    else modeDescription = `um Teste de Reação padrão de 2d6.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O aprendiz obteve o valor final ${sum} em ${modeDescription}. Comente como Meridius.`,
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

    return JSON.parse(response.text.trim()) as GeminiCommentary;
  } catch (error) {
    return {
      text: mode === 'damage' ? `O impacto de ${sum} ressoa na sua estrutura atômica.` : `A energia de ${sum} flui pelo seu foco. Continue o experimento.`,
      sentiment: 'neutral'
    };
  }
};
