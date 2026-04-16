// June AI API Utility — OpenAI-compatible endpoint
// Base URL: https://api.blockchain.info/ai/api/v1

const JUNE_BASE_URL = 'https://api.blockchain.info/ai/api/v1';

export interface JuneImageResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

export interface JuneModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface JuneModelsResponse {
  object: string;
  data: JuneModel[];
}

export interface JuneChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

// ---- Local Storage helpers ----
const API_KEY_STORAGE = 'june_api_key';

export function getStoredApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE);
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function clearStoredApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE);
}

// ---- API Calls ----

async function juneRequest<T>(
  endpoint: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${JUNE_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Unknown error');
    throw new Error(`June API Error (${res.status}): ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

/**
 * List available models from the June API.
 */
export async function listModels(apiKey: string): Promise<JuneModelsResponse> {
  return juneRequest<JuneModelsResponse>('/models', apiKey);
}

/**
 * Generate an image using the June API (OpenAI-compatible /images/generations).
 */
export async function generateImage(
  apiKey: string,
  prompt: string,
  options?: {
    model?: string;
    n?: number;
    size?: string;
    quality?: string;
    response_format?: 'url' | 'b64_json';
  }
): Promise<JuneImageResponse> {
  return juneRequest<JuneImageResponse>('/images/generations', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      model: options?.model || 'dall-e-3',
      prompt,
      n: options?.n || 1,
      size: options?.size || '1024x1024',
      quality: options?.quality || 'standard',
      response_format: options?.response_format || 'url',
    }),
  });
}

/**
 * Generate an AI tagline via chat completions.
 */
export async function generateTagline(apiKey: string): Promise<string> {
  const response = await juneRequest<JuneChatResponse>(
    '/chat/completions',
    apiKey,
    {
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a creative branding expert. Generate a single, short, impactful 2-4 word tagline for an AI-powered profile picture. The tagline should feel futuristic and empowering. Only respond with the tagline, no quotes or extra text.',
          },
          {
            role: 'user',
            content: 'Generate a unique AI PFP tagline.',
          },
        ],
        max_tokens: 20,
        temperature: 1.0,
      }),
    }
  );

  return response.choices?.[0]?.message?.content?.trim() || 'Digital Visionary';
}
