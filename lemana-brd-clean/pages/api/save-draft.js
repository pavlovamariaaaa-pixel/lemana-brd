export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, role, checkpoint, messages, date } = req.body;

  try {
    const safeName = (name || 'unknown').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    const safeRole = (role || 'unknown').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    const path = `results/drafts/${safeName}-${safeRole}-draft.md`;

    const messagesMd = Array.isArray(messages) && messages.length
      ? messages
          .map(m => {
            const label = m.role === 'user' ? `**${name}:**` : '**Агент:**';
            return `${label}\n${m.text}`;
          })
          .join('\n\n---\n\n')
      : '_Диалог пуст_';

    const content = `# Черновик интервью · Бесконечная лента · Lemana PRO

**Дата:** ${date}
**Роль:** ${role}
**Имя:** ${name}
**Последний блок:** ${checkpoint || '—'}

---

## Диалог (в процессе)

${messagesMd}
`;

    // Get sha of existing file for overwrite
    let sha;
    const getRes = await fetch(
      `https://api.github.com/repos/pavlovamariaaaa-pixel/lemana-brd/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    const body = {
      message: `draft: ${name} (${role}) · ${checkpoint}`,
      content: Buffer.from(content).toString('base64'),
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(
      `https://api.github.com/repos/pavlovamariaaaa-pixel/lemana-brd/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await putRes.json();
    if (!putRes.ok) throw new Error(data.message || 'GitHub API error');
    res.status(200).json({ ok: true, url: data.content?.html_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
