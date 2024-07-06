const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const { data, error } = await supabase
                    .from('payments')
                    .select('*, tenants(name), rooms(room_number)')
                    .order('payment_date', { ascending: false });
                
                if (error) throw error;
                res.status(200).json(data);
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'POST':
            try {
                const { tenant_id, amount, payment_date, payment_method } = req.body;
                console.log('Received payment data:', req.body);
        
                if (!tenant_id || !amount || !payment_date || !payment_method) {
                    throw new Error('Missing required fields');
                }
        
                const { data, error } = await supabase
                    .from('payments')
                    .insert({ tenant_id, amount, payment_date, payment_method });
                
                if (error) throw error;
                console.log('Inserted payment data:', data);
                res.status(201).json(data);
            } catch (error) {
                console.error('Error in POST /api/payments:', error);
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'PUT':
            try {
                const { id } = req.query;
                const { tenant_id, payment_month, amount, payment_date, payment_method, note } = req.body;
                
                const { data, error } = await supabase
                    .from('payments')
                    .update({ tenant_id, payment_month, amount, payment_date, payment_method, note })
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
