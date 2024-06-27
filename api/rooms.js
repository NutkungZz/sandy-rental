import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
    
    if (error) throw error

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
