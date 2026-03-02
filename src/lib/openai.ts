/// <reference types="vite/client" />
import OpenAI from 'openai';

// Ensure this key is set in .env or .env.local
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export const openai = new OpenAI({
    apiKey: apiKey || '',
    baseURL: 'https://openrouter.ai/api/v1',
    dangerouslyAllowBrowser: true // Required to call from the client side
});
