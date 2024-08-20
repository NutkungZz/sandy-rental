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
                    .from('tenants')
                    .select('*, rooms(room_number)')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                res.status(200).json(data);
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'POST':
            try {
                const { name, phone, email, room_id, move_in_date } = req.body;
                
                const { data, error } = await supabase
                    .from('tenants')
                    .insert({ name, phone, email, room_id, move_in_date });
                
                if (error) throw error;

                // Update room status
                const { error: roomError } = await supabase
                    .from('rooms')
                    .update({ status: 'มีผู้เช่า' })
                    .eq('id', room_id);

                if (roomError) throw roomError;

                res.status(201).json(data);
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'PUT':
            try {
                const { id } = req.query;
                const { name, phone, email, room_id, move_in_date, move_out_date } = req.body;
                
                const { data, error } = await supabase
                    .from('tenants')
                    .update({ name, phone, email, room_id, move_in_date, move_out_date })
                    .eq('id', id);
                
                if (error) throw error;

                // Update room status if room has changed
                if (req.body.oldRoomId && req.body.oldRoomId !== room_id) {
                    await supabase
                        .from('rooms')
                        .update({ status: 'ว่าง' })
                        .eq('id', req.body.oldRoomId);

                    await supabase
                        .from('rooms')
                        .update({ status: 'มีผู้เช่า' })
                        .eq('id', room_id);
                }

                res.status(200).json(data);
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

case 'DELETE':
    try {
        const { id } = req.query;
        console.log('Attempting to soft delete tenant with ID:', id);
        
        // Soft delete the tenant
        const { data, error } = await supabase
            .from('tenants')
            .update({ is_deleted: true })
            .eq('id', id);
        
        if (error) {
            console.error('Error soft deleting tenant:', error);
            throw error;
        }

        console.log('Tenant soft deleted successfully');

        // Update room status to 'ว่าง'
        const { data: roomData, error: roomError } = await supabase
            .from('rooms')
            .update({ status: 'ว่าง' })
            .eq('id', data[0].room_id);
        
        if (roomError) {
            console.error('Error updating room status:', roomError);
            throw roomError;
        }

        console.log('Room status updated successfully');

        res.status(200).json({ success: true, message: 'ลบข้อมูลผู้เช่าและอัปเดตสถานะห้องเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Error in DELETE /api/tenants:', error);
        res.status(400).json({ success: false, message: error.message });
    }
    break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
};
