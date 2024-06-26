module.exports = (req, res) => {
  try {
    const mockData = [
      ["101", "3000", "ว่าง", "https://example.com/room1.jpg", "20 ตร.ม.", "เครื่องปรับอากาศ, ทีวี", "2023-01-01", "2023-12-31", "13.7563", "100.5018"],
      ["102", "3500", "มีผู้เช่า", "https://example.com/room2.jpg", "25 ตร.ม.", "เครื่องปรับอากาศ, ทีวี, ตู้เย็น", "2023-02-01", "2024-01-31", "13.7563", "100.5018"],
    ];

    res.status(200).json(mockData);
  } catch (error) {
    console.error('Error in /api/rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
