// Quick test to verify Gemini API key is loaded
console.log('=== GEMINI API KEY TEST ===');
console.log('API Key present:', !!import.meta.env.VITE_GEMINI_API_KEY);
console.log('API Key value (first 20 chars):', import.meta.env.VITE_GEMINI_API_KEY?.substring(0, 20));
console.log('OpenAI Key present:', !!import.meta.env.VITE_OPENAI_API_KEY);
