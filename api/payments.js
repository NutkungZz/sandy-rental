const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const { month } = req.query;
                console.log('Received request for payments. Month:', month);
        
                if (!month || !/^\d{4}-\d{2}$/.test(month)) {
                    throw new Error('Invalid month format. Expected YYYY-MM');
                }
        
                const startDate = `${month}-01`;
                const endDate = new Date(month.slice(0, 4), parseInt(month.slice(5, 7)), 0).toISOString().split('T')[0];
        
                console.log('Fetching payments from', startDate, 'to', endDate);
        
                const { data, error } = await supabase
                    .from('payments')
                    .select(`
                        id,
                        tenant_id,
                        room_id,
                        amount,
                        payment_date,
                        payment_method,
                        payment_for_month
                    `)
                    .gte('payment_for_month', startDate)
                    .lte('payment_for_month', endDate);
                
                if (error) throw error;
        
                console.log('Fetched payments:', data);
        
                res.status(200).json(data);
            } catch (error) {
                console.error('Error in GET /api/payments:', error);
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'POST':
            try {
                const { tenant_id, room_id, amount, payment_date, payment_method, payment_for_month } = req.body;
                
                console.log('Received payment data:', req.body);
        
                if (!tenant_id || !room_id || !amount || !payment_date || !payment_method || !payment_for_month) {
                    throw new Error('Missing required fields');
                }
        
                // ตรวจสอบรูปแบบของ payment_for_month
                if (!/^\d{4}-\d{2}$/.test(payment_for_month)) {
                    throw new Error('Invalid payment_for_month format. Expected YYYY-MM');
                }
        
                const { data, error } = await supabase
                    .from('payments')
                    .insert({ 
                        tenant_id, 
                        room_id, 
                        amount, 
                        payment_date, 
                        payment_method, 
                        payment_for_month: payment_for_month + '-01' // เพิ่ม '-01' เพื่อให้เป็นรูปแบบวันที่ที่ถูกต้อง
                    });
                
                if (error) throw error;
                
                console.log('Inserted payment data:', data);
                
                res.status(201).json({ success: true, data });
            } catch (error) {
                console.error('Error in POST /api/payments:', error);
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'PUT':
            try {
                const { id } = req.query;
                const { tenant_id, room_id, amount, payment_date, payment_method, payment_for_year, payment_for_month } = req.body;
                
                const payment_for = new Date(payment_for_year, payment_for_month - 1, 1);

                const { data, error } = await supabase
                    .from('payments')
                    .update({ tenant_id, room_id, amount, payment_date, payment_method, payment_for })
                    .eq('id', id);
                
                if (error) throw error;
                res.status(200).json(data);
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                
                const { data, error } = await supabase
                    .from('payments')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                res.status(200).json({ success: true });
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
};
