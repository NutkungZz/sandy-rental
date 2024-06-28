const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

module.exports = async (req, res) => {
  const { email, password, secretKey } = req.body;

  if (secretKey !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ success: false, message: 'รหัสลับไม่ถูกต้อง' });
  }

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

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
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
};
