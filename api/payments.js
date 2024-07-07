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
            
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    id,
                    tenant_id,
                    room_id,
                    amount,
                    payment_date,
                    payment_method,
                    payment_for_month,
                    tenants (id, name),
                    rooms (id, room_number)
                `)
                .eq('payment_for_month', month + '-01');
            
            if (error) throw error;
            res.status(200).json(data);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
        break;

        case 'POST':
            try {
                const { tenant_id, room_id, amount, payment_date, payment_method, payment_for_month } = req.body;
                
                console.log('Received payment data:', req.body); // เพิ่ม log นี้เพื่อตรวจสอบข้อมูลที่ได้รับ
        
                if (!tenant_id || !room_id || !amount || !payment_date || !payment_method || !payment_for_month) {
                    throw new Error('Missing required fields');
                }
        
                const { data, error } = await supabase
                    .from('payments')
                    .insert({ 
                        tenant_id, 
                        room_id, 
                        amount, 
                        payment_date, 
                        payment_method, 
                        payment_for_month 
                    });
                
                if (error) throw error;
                
                console.log('Inserted payment data:', data); // เพิ่ม log นี้เพื่อตรวจสอบข้อมูลที่ถูกบันทึก
                
                res.status(201).json(data);
            } catch (error) {
                console.error('Error in POST /api/payments:', error); // เพิ่ม log นี้เพื่อตรวจสอบข้อผิดพลาด
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
