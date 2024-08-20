const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    const { method } = req;

    switch (method) {
case 'GET':
    try {
        console.log('Fetching rooms from database...');
        const { data, error } = await supabase
            .from('rooms')
            .select('*');
        
        if (error) throw error;
        
        console.log(`Successfully fetched ${data.length} rooms`);
        console.log('Rooms data:', data);
        
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(400).json({ success: false, message: error.message });
    }
    break;

        case 'POST':
            try {
                const { room_number, price, size, description, images, amenities, status } = req.body;
                
                const { data, error } = await supabase
                    .from('rooms')
                    .insert({ room_number, price, size, description, images, amenities, status });
                
                if (error) throw error;
                res.status(201).json(data);
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'PUT':
            try {
                const { id } = req.query;
                const { room_number, price, size, description, images, amenities } = req.body;
                
                const { data, error } = await supabase
                    .from('rooms')
                    .update({ room_number, price, size, description, images, amenities })
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
                    .from('rooms')
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
