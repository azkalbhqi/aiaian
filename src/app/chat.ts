'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function askGemini(persona: string, prompt: string): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
    const result = await model.generateContent([persona, prompt]);

    const text = result.response.text();
    return text ?? 'No response from Gemini';
  } catch (error: any) {
    console.error('Gemini error:', error);
    return 'Failed to get response from Gemini';
  }
}
