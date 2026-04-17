// June AI API Client Utility 
// Bypasses Vercel/Cloudflare blocks by running directly in the user browser

import { FASHION_PROMPTS } from '../data/fashionItems';

const JUNE_BASE_URL = 'https://api.blockchain.info/ai/api/v1';

/**
 * Base64 to Blob helper
 */
function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mimeString });
}

export async function generateClientPFP(
  apiKey: string,
  imageBase64: string,
  selectedItems: string[]
): Promise<{ url?: string; b64?: string; method: string }> {
  
  if (!apiKey) throw new Error('Missing June AI API Key');
  if (!imageBase64) throw new Error('No image provided');
  if (selectedItems.length === 0) throw new Error('No fashion items selected');

  const descriptions = selectedItems
    .map((id) => FASHION_PROMPTS[id as keyof typeof FASHION_PROMPTS])
    .filter(Boolean)
    .join(', and ');

  const prompt = `Transform this person's profile picture into a high-fashion portrait while keeping their exact face, facial features, skin tone, and overall identity completely unchanged. The person should now be ${descriptions}. 
  
Style rules: 
- Professional fashion photography, studio lighting, 4K quality, clean composition, suitable as a social media profile picture. 
- Apply the signature "June AI" aesthetic: color grading must heavily feature vibrant neon cyan and deep magenta/purple tones.
- Add subtle futuristic elements or 'June AI Pioneer' tech tags overlaying the environment to fit the network's decentralized AI vibe.`;

  try {
    const imageBlob = dataURItoBlob(imageBase64);
    const formData = new FormData();
    formData.append('image', imageBlob, 'photo.png');
    formData.append('prompt', prompt);
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');
    formData.append('quality', 'medium');

    // 1. Try Primary Edits Endpoint
    const response = await fetch(`${JUNE_BASE_URL}/images/edits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        // Note: Do NOT set Content-Type here; browser sets it automatically with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PFP Generation Error (/edits):', response.status, errorText);

      // 2. Try Fallback Generations Endpoint
      console.log('Falling back to /images/generations...');
      const fallbackRes = await fetch(`${JUNE_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
      });

      if (!fallbackRes.ok) {
        const fallbackError = await fallbackRes.text();
        console.error('Fallback Error (/generations):', fallbackRes.status, fallbackError);
        throw new Error(`API Error: Your image request was rejected (Status ${fallbackRes.status}). Check API Key limits or CORS configuration.`);
      }

      const fallbackData = await fallbackRes.json();
      return {
        url: fallbackData.data?.[0]?.url || null,
        method: 'generation',
      };
    }

    const data = await response.json();
    if (data.data?.[0]?.b64_json) {
      return {
        b64: data.data[0].b64_json,
        method: 'edit',
      };
    }

    return {
      url: data.data?.[0]?.url || null,
      method: 'edit',
    };

  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error("CORS Blocked: The June AI API does not allow browser connections. We will need a proxy.");
    }
    throw error;
  }
}
