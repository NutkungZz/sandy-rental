module.exports = async (req, res) => {
  const { username, password } = req.body;

  // กำหนดค่า username และ password แบบ fixed
  const validUsername = 'admin';
  const validPassword = 'password123';

  if (username === validUsername && password === validPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }
};
