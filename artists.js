const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { data, error } = await supabase
    .from('dk_artists')
    .select('artist_id, full_name, status, based_in_city, primary_medium')
    .order('full_name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
