export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { role, summary, date } = req.body;

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: `${role} · ${date}` } }]
          },
          Роль: {
            rich_text: [{ text: { content: role } }]
          },
          Дата: {
            rich_text: [{ text: { content: date } }]
          },
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: summary } }]
            }
          }
        ]
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Notion API error');
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
