const PROMPT = `You are reading a gallery price list. Extract every artwork lot and return ONLY a JSON array — no text before or after, no markdown fences.

Each lot must follow this exact shape:
{
  "artist_name": "Full Name As Printed",
  "title": "Artwork title or null",
  "year": 2022,
  "medium": "Oil on canvas or null",
  "height_cm": 100.0,
  "width_cm": 80.0,
  "price": 45000,
  "currency": "DKK",
  "lot_number": "12"
}

Rules:
- Use null for any field not present.
- Dimensions: always convert to centimetres (1 inch = 2.54 cm).
- Price: number only, no symbols or separators.
- Currency: default to DKK if not stated.
- If the same artist appears multiple times, include one entry per artwork.
- Do not infer or guess values not present in the document.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { base64, mimetype } = req.body;
    if (!base64 || !mimetype) return res.status(400).json({ error: 'Missing file data' });

    const isPdf = mimetype === 'application/pdf';
    const apiKey = process.env.GEMINI_API_KEY;
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts = isPdf
      ? [
          { inline_data: { mime_type: 'application/pdf', data: base64 } },
          { text: PROMPT }
        ]
      : [
          { inline_data: { mime_type: mimetype, data: base64 } },
          { text: PROMPT }
        ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    const lots = JSON.parse(clean);

    res.json({ lots });

  } catch (e) {
    console.error('[scan]', e);
    res.status(500).json({ error: e.message });
  }
};
