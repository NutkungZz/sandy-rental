const { createClient } = require('@supabase/supabase-js');

//const supabaseUrl = "https://lqskrutydtcnnszvxaur.supabase.co";
//const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tydXR5ZHRjbm5zenZ4YXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk0NTUzMDgsImV4cCI6MjAzNTAzMTMwOH0.9-LvOBprRoIdjnMpWATC7gIVfYa_RoJsgfNyEZegWbk";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('rooms')
        .select('*');
      if (error) {
        console.error('Error fetching rooms:', error.message);
        throw error;
      }
      res.status(200).json(data);
    } else if (req.method === 'POST') {
      const { body } = req;
      const { data, error } = await supabase
        .from('rooms')
        .insert(body);
      if (error) {
        console.error('Error inserting room:', error.message);
        throw error;
      }
      res.status(201).json(data);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Internal Server Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
