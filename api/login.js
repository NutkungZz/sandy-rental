const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ค้นหาผู้ใช้จากอีเมล
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;

    if (data) {
      // ตรวจสอบรหัสผ่าน
      const isMatch = await bcrypt.compare(password, data.password_hash);

      if (isMatch) {
        // สร้าง token (ตัวอย่างอย่างง่าย, ในระบบจริงควรใช้ JWT)
        const token = Math.random().toString(36).substr(2);
        
        res.json({ success: true, token, user: { id: data.id, email: data.email } });
      } else {
        res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      }
    } else {
      res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
};
