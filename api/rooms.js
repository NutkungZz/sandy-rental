import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lqskrutydtcnnszvxaur.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tydXR5ZHRjbm5zenZ4YXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk0NTUzMDgsImV4cCI6MjAzNTAzMTMwOH0.9-LvOBprRoIdjnMpWATC7gIVfYa_RoJsgfNyEZegWbk'
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
