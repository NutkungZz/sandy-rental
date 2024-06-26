module.exports = async (req, res) => {
  try {
    // ข้อมูลจำลอง (mock data)
    const mockData = [
      ["101", "3000", "ว่าง", "https://example.com/room1.jpg", "20 ตร.ม.", "เครื่องปรับอากาศ, ทีวี", "2023-01-01", "2023-12-31", "13.7563", "100.5018"],
      ["102", "3500", "มีผู้เช่า", "https://example.com/room2.jpg", "25 ตร.ม.", "เครื่องปรับอากาศ, ทีวี, ตู้เย็น", "2023-02-01", "2024-01-31", "13.7563", "100.5018"],
      // เพิ่มข้อมูลห้องอื่นๆ ตามต้องการ
    ];

    res.status(200).json(mockData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms: ' + error.message });
  }
};
