const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
  const { username, password } = req.body;

  // ในสถานการณ์จริง คุณควรดึงข้อมูลผู้ใช้จากฐานข้อมูล
  const validUsername = process.env.ADMIN_USERNAME;
  const hashedPassword = process.env.ADMIN_PASSWORD; // ควรเป็น hashed password

  if (username === validUsername) {
    try {
      const isValid = await bcrypt.compare(password, hashedPassword);
      if (isValid) {
        // สร้าง session หรือ token ตามความเหมาะสม
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน' });
    }
  } else {
    res.status(401).json({ success: false, message: 'ไม่พบชื่อผู้ใช้' });
  }
};
