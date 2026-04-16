export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const JUNE_API_KEY = process.env.JUNE_API_KEY;

  if (!JUNE_API_KEY) {
    // Return a fallback if no key is supplied
    const fallbacks = [
      'Neural Frontier Explorer',
      'Visionary Intelligence Architect',
      'Digital Consciousness Pioneer',
      'Quantum Thought Leader',
      'Synthetic Wisdom Creator',
      'Infinite Cognition Seeker',
      'Decentralized Mind Builder',
      'Emergent AI Advocate',
      'Future Protocol Architect',
      'Blockchain Intelligence Agent',
    ];
    return res.status(200).json({ tagline: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
  }

  try {
    const response = await fetch('https://api.blockchain.info/ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JUNE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a creative branding expert for a cutting-edge AI network. Generate a single, short 2-4 word tagline. The tagline should feel futuristic, empowering, and crypto/AI-native. Only respond with the tagline text, no quotes, no punctuation, no extra text.',
          },
          { role: 'user', content: 'Generate a unique AI profile tagline.' },
        ],
        max_tokens: 20,
        temperature: 1.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tagline Generation Error:', response.status, errorText);
      return res.status(response.status).json({ tagline: 'Neural Frontier Explorer' });
    }

    const data = await response.json();
    const generatedTagline = data.choices?.[0]?.message?.content?.trim() || 'Neural Frontier Explorer';
    
    return res.status(200).json({ tagline: generatedTagline });

  } catch (error) {
    console.error('Tagline Gen Exception:', error);
    return res.status(500).json({ tagline: 'Neural Frontier Explorer' });
  }
}
