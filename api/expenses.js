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
                    .from('expenses')
                    .select(`
                        *,
                        rooms (
                            room_number
                        )
                    `)
                    .order('date', { ascending: false });

                if (error) throw error;
                res.status(200).json(data);
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'POST':
            try {
                const { date, type, amount, details, room_id } = req.body;
                const { data, error } = await supabase
                    .from('expenses')
                    .insert({ date, type, amount, details, room_id });

                if (error) throw error;
                res.status(201).json({ success: true, data });
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'PUT':
            try {
                const { id } = req.query;
                const { date, type, amount, details, room_id } = req.body;
                const { data, error } = await supabase
                    .from('expenses')
                    .update({ date, type, amount, details, room_id })
                    .eq('id', id);

                if (error) throw error;
                res.status(200).json({ success: true, data });
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                const { data, error } = await supabase
                    .from('expenses')
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
