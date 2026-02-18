import { GoogleGenAI, Type } from "@google/genai";
import { GeminiCommentary } from "../types";

export const getRollCommentary = async (
  totalValue: number,
  mode: 'standard' | 'catalyst' | 'inhibitor' | 'damage'
): Promise<GeminiCommentary> => {
  
  // Inicialização obrigatória dentro da função para garantir o uso da chave atualizada
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const modeNames = {
    standard: "Reação Padrão",
    catalyst: "Reação com Catalisador",
    inhibitor: "Reação Inibida",
    damage: "Impacto de Dano"
  };

  const systemInstruction = `Você é o Grão-Alquimista Meridius. Seu tom é místico, sábio e encorajador.
  Você está observando um aprendiz em um laboratório de alquimia.
  
  CRITÉRIOS DE SOMA (2d6):
  - 12: Perfeição absoluta, Gás Nobre.
  - 10-11: Sucesso brilhante.
  - 7-9: Sucesso com custo, reação instável.
  - 3-6: Fracasso, fumaça negra.
  - 2: Catástrofe, explosão no caldeirão.

  CRITÉRIOS DE DANO (1d6):
  - 6: Destruição total.
  - 1: Apenas um arranhão.

  REGRA DE RESPOSTA:
  - Máximo 12 palavras.
  - Use termos como: Éter, Valência, Transmutação, Fulgor, Calclinação.
  - Retorne APENAS JSON puro. Não use blocos de código markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O aprendiz obteve o resultado final ${totalValue} em uma ${modeNames[mode]}. Comente brevemente.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ['lucky', 'unlucky', 'neutral', 'amazing'] }
          },
          required: ["text", "sentiment"]
        }
      }
    });

    const jsonText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonText) as GeminiCommentary;

  } catch (error) {
    console.error("Erro Alquímico:", error);
    
    // Novas frases de fallback para identificar se o código atualizou
    const fallbackMsgs = [
      `O Éter vibra na frequência ${totalValue}. Prossiga, aprendiz.`,
      `Interpreto o valor ${totalValue} como um sinal de mudança iminente.`,
      `A transmutação de nível ${totalValue} foi registrada no Codex.`,
      `Sinto uma oscilação de ${totalValue} nas correntes de energia.`
    ];

    return {
      text: fallbackMsgs[Math.floor(Math.random() * fallbackMsgs.length)],
      sentiment: 'neutral'
    };
  }
};