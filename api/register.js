const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  const { email, password } = req.body;

  try {
    // สร้าง hash จากรหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // บันทึกข้อมูลลงในฐานข้อมูล
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password_hash: hashedPassword });

    if (error) throw error;

    res.json({ success: true, message: 'ลงทะเบียนสำเร็จ' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
};
