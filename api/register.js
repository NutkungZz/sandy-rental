const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set');

// Test Supabase connection
supabase.from('users').select('count').single()
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful, user count:', data.count);
    }
  });

module.exports = async (req, res) => {
  console.log('Register API called');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { email, password, secretKey } = req.body;

    console.log('Received data:', { email, secretKey: '****' });

    if (!email || !password || !secretKey) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
    }

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      console.log('Invalid secret key');
      return res.status(403).json({ success: false, message: 'รหัสลับไม่ถูกต้อง' });
    }

    console.log('Secret key valid, proceeding with registration');

    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error checking existing user:', userError);
      throw userError;
    }

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้แล้ว' });
    }

    console.log('Email not in use, proceeding with password hashing');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Password hashed, inserting new user');

    const { data, error } = await supabase
      .from('users')
      .insert({ email, password_hash: hashedPassword, is_admin: true });

    if (error) {
      console.error('Error inserting new user:', error);
      throw error;
    }

    console.log('User registered successfully');
    res.status(200).json({ success: true, message: 'ลงทะเบียนสำเร็จ' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลงทะเบียน', error: error.message });
  }
};
