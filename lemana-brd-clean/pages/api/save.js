export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { date, role, name, status, summary } = req.body;

  try {
    const SHEET_ID = '36f16e34d7c280758cabd85aa6e6854c';
    const SHEET_NAME = 'Результаты';

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[date, role, name, status, summary]],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Sheets API error');
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
