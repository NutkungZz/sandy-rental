import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-supabase-url.supabase.co'
const supabaseKey = 'your-api-key'
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  try {
    // Attempt a simple query to check the connection
    const { data, error } = await supabase
      .from('rooms')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Error checking Supabase connection:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    } else {
      res.status(200).json({ message: 'Supabase connection successful' })
    }
  } catch (error) {
    console.error('Error checking Supabase connection:', error.message)
    res.status(500).json({ error: error.message })
  }
}
