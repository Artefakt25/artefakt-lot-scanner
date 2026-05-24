const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { full_name, status, birth_year, nationality, primary_medium, based_in_city } = req.body;
  if (!full_name) return res.status(400).json({ error: 'full_name is required' });

  // Generate a unique artist_id: ART_<slug>_<4-char timestamp suffix>
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  const artist_id = 'ART_' + slugify(full_name) + '_' + suffix;

  const { data, error } = await supabase
    .from('dk_artists')
    .insert({
      artist_id,
      full_name: full_name.trim(),
      status: status || 'emerging',
      birth_year: birth_year ? String(birth_year) : null,
      nationality: (nationality || 'DK').trim().toUpperCase(),
      primary_medium: primary_medium?.trim() || null,
      based_in_city: based_in_city?.trim() || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ artist: data });
};
