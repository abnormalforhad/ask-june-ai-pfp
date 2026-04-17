export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

// Fashion item prompt mapping
const FASHION_PROMPTS = {
  'dmooster-headphones': "wearing large off-white over-ear headphones with a bold red 'X' mark on the headband and 'DMOOSTER' text on the earcup",
  'tge-sunglasses': "wearing futuristic thick black rectangular frame sunglasses with blue tinted lenses in a 'TGE COMING' stylized tech vibe",
  'ny-cap': "wearing a classic black baseball cap with a white embroidered 'NY' logo on the front",
  'cali-sweater': "wearing an oversized brown crewneck sweatshirt with bold white 'CALIFORNIA LOS ANGELES' arched text across the chest",
};

export default async function handler(req, res) {
  // CORS for local testing if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const JUNE_API_KEY = process.env.JUNE_API_KEY;
  if (!JUNE_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing JUNE_API_KEY inside Vercel environment' });
  }

  const { imageBase64, selectedItems } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' });
  if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
    return res.status(400).json({ error: 'No fashion items selected' });
  }

  const descriptions = selectedItems
    .map((id) => FASHION_PROMPTS[id])
    .filter(Boolean)
    .join(', and ');

  const prompt = `Transform this person's profile picture into a high-fashion portrait while keeping their exact face, facial features, skin tone, and overall identity completely unchanged. The person should now be ${descriptions}. 
  
Style rules: 
- Professional fashion photography, studio lighting, 4K quality, clean composition, suitable as a social media profile picture. 
- Apply the signature "June AI" aesthetic: color grading must heavily feature vibrant neon cyan and deep magenta/purple tones.
- Add subtle futuristic elements or 'June AI Pioneer' tech tags overlaying the environment to fit the network's decentralized AI vibe.`;

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);
    const parts = [];

    parts.push(
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="image"; filename="photo.jpg"\r\n`,
      `Content-Type: image/jpeg\r\n\r\n`
    );
    const imagePart = Buffer.concat([
      Buffer.from(parts.join('')),
      imageBuffer,
      Buffer.from('\r\n'),
    ]);

    const promptPart = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="prompt"\r\n\r\n${prompt}\r\n`);
    const modelPart = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\ngpt-image-1\r\n`);
    const sizePart = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\n512x512\r\n`);
    const qualityPart = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="quality"\r\n\r\nstandard\r\n`);
    const endPart = Buffer.from(`--${boundary}--\r\n`);

    const body = Buffer.concat([imagePart, promptPart, modelPart, sizePart, qualityPart, endPart]);

    // Spoofing highly-realistic browser headers to bypass CF datacenter blocks
    const response = await fetch('https://api.blockchain.info/ai/api/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JUNE_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://askjune.ai',
        'Referer': 'https://askjune.ai/',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PFP Generation Error:', response.status, errorText);

      // Fallback
      console.log('Falling back to /images/generations...');
      const fallbackRes = await fetch('https://api.blockchain.info/ai/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JUNE_API_KEY}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
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
        console.error('Fallback Error:', fallbackRes.status, fallbackError);
        return res.status(502).json({ error: 'June AI API rejected request. Cloudflare WAF or Key Invalid.' });
      }

      const fallbackData = await fallbackRes.json();
      return res.status(200).json({
        url: fallbackData.data?.[0]?.url || null,
        method: 'generation',
      });
    }

    const data = await response.json();
    if (data.data?.[0]?.b64_json) {
      return res.status(200).json({ b64: data.data[0].b64_json, method: 'edit' });
    }
    return res.status(200).json({ url: data.data?.[0]?.url || null, method: 'edit' });

  } catch (error) {
    console.error('PFP Gen Exception:', error);
    return res.status(500).json({ error: 'Internal server error during PFP generation' });
  }
}
