const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { tenant_id, amount, payment_date, payment_method } = req.body;

      const { data, error } = await supabase
        .from('payments')
        .insert({ tenant_id, amount, payment_date, payment_method });

      if (error) throw error;

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Payment error:', error);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกการชำระเงิน' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
