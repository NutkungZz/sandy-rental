const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { email, password, secretKey } = req.body;

  console.log('Received registration request:', { email, secretKey: '****' });

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    console.log('Invalid secret key');
    return res.status(403).json({ success: false, message: 'รหัสลับไม่ถูกต้อง' });
  }

  try {
    console.log('Supabase client created');

    // ทดสอบการเชื่อมต่อ
    const { data: connectionTest, error: connectionError } = await supabase.from('users').select('count').single();
    if (connectionError) {
      console.error('Supabase connection error:', connectionError);
      throw new Error('Database connection failed');
    } else {
      console.log('Supabase connection successful, user count:', connectionTest.count);
    }

    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้แล้ว' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('users')
      .insert({ email, password_hash: hashedPassword, is_admin: true });

    if (error) throw error;

    res.json({ success: true, message: 'ลงทะเบียนสำเร็จ' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลงทะเบียน', error: error.message });
  }
};
