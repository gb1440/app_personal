/// <reference types="vite/client" />
import OpenAI from 'openai';

// Ensure this key is set in .env or .env.local
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export const openai = new OpenAI({
    apiKey: apiKey || '',
    dangerouslyAllowBrowser: true // Required to call from the client side
});
