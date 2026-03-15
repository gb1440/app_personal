/// <reference types="vite/client" />
import OpenAI from 'openai';

// Ensure this key is set in .env or .env.local
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
    console.error("VITE_OPENAI_API_KEY is missing! Check your environment variables.");
}

export const openai = new OpenAI({
    apiKey: apiKey || '',
    baseURL: 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true, // Required to call from the client side
    defaultHeaders: {
        'HTTP-Referer': 'https://app-personal.vercel.app', // Substitua pelo seu domínio se necessário
        'X-Title': 'Treino App',
    }
});
