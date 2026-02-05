
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const geminiService = {
  /**
   * Generates a brief insight for a movie using Gemini.
   */
  getMovieInsight: async (movieTitle: string, overview: string) => {
    // Re-initializing to ensure the most current API key is used as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Forneça um resumo muito breve (máximo 2 frases), em português, de por que alguém deveria assistir ao filme "${movieTitle}" no ThCine. Contexto: ${overview}. Use um tom de crítico de cinema profissional.`,
      });
      // response.text is a property, not a method.
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Não foi possível gerar a análise da IA no momento.";
    }
  },

  /**
   * Handles chat interaction with the assistant.
   */
  chatWithAssistant: async (history: any[], message: string) => {
    // Re-initializing right before call to ensure up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        // history is correctly passed to preserve context in chat sessions.
        history: history,
        config: {
          systemInstruction: 'Você é o ThCine AI, um assistente especializado em cinema. Você ajuda os usuários a encontrar filmes, fornece curiosidades interessantes e explica pontos da trama. Seja amigável, cinematográfico e conhecedor. Responda sempre em Português do Brasil de forma concisa.',
        }
      });
      
      const response: GenerateContentResponse = await chat.sendMessage({ message });
      // response.text is a property, not a method.
      return response.text;
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "Estou com problemas para acessar meus arquivos de filmes. Tente novamente em um instante!";
    }
  }
};
