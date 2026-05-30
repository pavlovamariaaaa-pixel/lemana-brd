export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { date, role, name, status, summary } = req.body;

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safeName = (name || 'unknown').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    const path = `results/${timestamp}-${safeName}.md`;

    const content = `# Конспект интервью · Бесконечная лента · Lemana PRO

**Дата:** ${date}
**Роль:** ${role}
**Имя:** ${name}
**Статус:** ${status}

---

${summary}
`;

    const response = await fetch(
      `https://api.github.com/repos/pavlovamariaaaa-pixel/lemana-brd/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          message: `result: ${name} (${role}) · ${date}`,
          content: Buffer.from(content).toString('base64'),
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'GitHub API error');
    res.status(200).json({ ok: true, url: data.content?.html_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
