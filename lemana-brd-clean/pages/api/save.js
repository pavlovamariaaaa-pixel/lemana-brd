export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { role, name, status, summary, date } = req.body;

  try {
    const webhookRes = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, role, name, status, summary }),
    });

    if (!webhookRes.ok) throw new Error(`Webhook error: ${webhookRes.status}`);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
