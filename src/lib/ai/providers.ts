import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Anthropic (Claude) - for logic/analysis
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

export const anthropic = anthropicApiKey
  ? createAnthropic({ apiKey: anthropicApiKey })
  : null;

export function isAnthropicConfigured(): boolean {
  return (
    anthropicApiKey !== undefined &&
    anthropicApiKey !== '' &&
    anthropicApiKey !== 'sk-ant-your_anthropic_key' &&
    anthropicApiKey !== 'sk-ant-xxx'
  );
}

// Google (Gemini) - for vision/image analysis
const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export const google = googleApiKey
  ? createGoogleGenerativeAI({ apiKey: googleApiKey })
  : null;

export function isGoogleConfigured(): boolean {
  return (
    googleApiKey !== undefined &&
    googleApiKey !== '' &&
    googleApiKey !== 'your_gemini_api_key' &&
    googleApiKey !== 'xxx'
  );
}
