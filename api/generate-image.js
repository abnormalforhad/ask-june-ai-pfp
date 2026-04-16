export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  const JUNE_API_KEY = process.env.JUNE_API_KEY;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!JUNE_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const response = await fetch('https://api.blockchain.info/ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JUNE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `A high quality, stylized avatar profile picture: ${prompt}. Professional lighting, 4k resolution, clean background.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image Generation Error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Failed to generate image from Ask June AI' });
    }

    const data = await response.json();
    return res.status(200).json({ url: data.data[0].url });

  } catch (error) {
    console.error('Image Gen Exception:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
