export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

// Fashion item prompt mapping (mirrors frontend data)
const FASHION_PROMPTS = {
  'dmooster-headphones': "wearing large off-white over-ear headphones with a bold red 'X' mark on the headband and 'DMOOSTER' text on the earcup",
  'tge-sunglasses': "wearing futuristic thick black rectangular frame sunglasses with blue tinted lenses in a 'TGE COMING' stylized tech vibe",
  'ny-cap': "wearing a classic black baseball cap with a white embroidered 'NY' logo on the front",
  'cali-sweater': "wearing an oversized brown crewneck sweatshirt with bold white 'CALIFORNIA LOS ANGELES' arched text across the chest",
};

export default async function handler(req, res) {
  // CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const JUNE_API_KEY = process.env.JUNE_API_KEY;

  if (!JUNE_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing JUNE_API_KEY' });
  }

  const { imageBase64, selectedItems } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
    return res.status(400).json({ error: 'No fashion items selected' });
  }

  // Build fashion prompt from selected items
  const descriptions = selectedItems
    .map((id) => FASHION_PROMPTS[id])
    .filter(Boolean)
    .join(', and ');

  if (!descriptions) {
    return res.status(400).json({ error: 'Invalid fashion items selected' });
  }

  const prompt = `Transform this person's profile picture into a high-fashion portrait while keeping their exact face, facial features, skin tone, and overall identity completely unchanged. The person should now be ${descriptions}. 
  
Style rules: 
- Professional fashion photography, studio lighting, 4K quality, clean composition, suitable as a social media profile picture. 
- Apply the signature "June AI" aesthetic: color grading must heavily feature vibrant neon cyan and deep magenta/purple tones.
- Add subtle futuristic elements or 'June AI Pioneer' tech tags overlaying the environment to fit the network's decentralized AI vibe.`;

  try {
    // Convert base64 to buffer for multipart upload
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Create multipart form data manually
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);

    const parts = [];

    // Add image part
    parts.push(
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="image"; filename="photo.png"\r\n`,
      `Content-Type: image/png\r\n\r\n`
    );
    const imagePart = Buffer.concat([
      Buffer.from(parts.join('')),
      imageBuffer,
      Buffer.from('\r\n'),
    ]);

    // Add other form fields
    const promptPart = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="prompt"\r\n\r\n${prompt}\r\n`
    );

    const modelPart = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\ngpt-image-1\r\n`
    );

    const sizePart = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\n1024x1024\r\n`
    );

    const qualityPart = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="quality"\r\n\r\nmedium\r\n`
    );

    const endPart = Buffer.from(`--${boundary}--\r\n`);

    const body = Buffer.concat([imagePart, promptPart, modelPart, sizePart, qualityPart, endPart]);

    const response = await fetch('https://api.blockchain.info/ai/api/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JUNE_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PFP Generation Error:', response.status, errorText);

      // Fallback: try /images/generations with the prompt if /edits fails
      console.log('Falling back to /images/generations...');
      const fallbackRes = await fetch('https://api.blockchain.info/ai/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JUNE_API_KEY}`,
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
        return res.status(502).json({ error: 'Failed to generate PFP. Please try again.' });
      }

      const fallbackData = await fallbackRes.json();
      return res.status(200).json({
        url: fallbackData.data?.[0]?.url || null,
        method: 'generation',
      });
    }

    const data = await response.json();

    // gpt-image-1 returns b64_json by default
    if (data.data?.[0]?.b64_json) {
      return res.status(200).json({
        b64: data.data[0].b64_json,
        method: 'edit',
      });
    }

    return res.status(200).json({
      url: data.data?.[0]?.url || null,
      method: 'edit',
    });

  } catch (error) {
    console.error('PFP Gen Exception:', error);
    return res.status(500).json({ error: 'Internal server error during PFP generation' });
  }
}
