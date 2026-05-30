export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;
    console.log('Request model:', body.model);
    console.log('Messages count:', body.messages?.length);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data));
    }

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Chat API error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
