const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SOURCE_ID = 'SRC_045'; // Gallery Lot List (manual scan)

function generateId() {
  return 'PO_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { lots } = req.body;
  if (!Array.isArray(lots) || lots.length === 0) {
    return res.status(400).json({ error: 'No lots provided' });
  }

  const today = new Date().toISOString().split('T')[0];

  const rows = lots.map(lot => ({
    price_observation_id: generateId(),
    artist_id:            lot.artist_id,
    source_id:            SOURCE_ID,
    observation_date:     today,
    price_type:           'asking_price',
    price_context:        'gallery_lot_list',
    source_name:          lot.gallery_name || null,
    city:                 lot.city || null,
    artwork_title:        lot.title || null,
    medium:               lot.medium || null,
    height_cm:            lot.height_cm || null,
    width_cm:             lot.width_cm || null,
    currency:             lot.currency || 'DKK',
    price_original:       lot.price || null,
    // If currency is already DKK, price_dkk = price directly
    price_dkk:            lot.currency === 'DKK' ? (lot.price || null) : null,
    lot_number:           lot.lot_number || null,
    confidence_score:     90,   // Manual entry — high confidence
    notes:                null,
  }));

  const { error } = await supabase
    .from('price_observations')
    .insert(rows);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ saved: rows.length });
};
