const Anthropic = require('@anthropic-ai/sdk');
const formidable = require('formidable');
const fs = require('fs');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const form = formidable({ maxFileSize: 25 * 1024 * 1024 });

  try {
    const [, files] = await form.parse(req);
    const file = files.file[0];
    if (!file) return res.status(400).json({ error: 'No file received' });

    const buffer = fs.readFileSync(file.filepath);
    const base64 = buffer.toString('base64');
    const isPdf = file.mimetype === 'application/pdf';

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

    const content = isPdf
      ? [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: PROMPT }
        ]
      : [
          { type: 'image', source: { type: 'base64', media_type: file.mimetype, data: base64 } },
          { type: 'text', text: PROMPT }
        ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content }]
    });

    const text = response.content.find(b => b.type === 'text')?.text || '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    const lots = JSON.parse(clean);

    res.json({ lots });

  } catch (e) {
    console.error('[extract]', e);
    res.status(500).json({ error: e.message });
  }
};

module.exports.config = { api: { bodyParser: false } };
