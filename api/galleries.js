const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  const { data, error } = await supabase
    .from('dk_galleries')
    .select('gallery_id, gallery_name, city, gallery_tier_score')
    .order('gallery_name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
