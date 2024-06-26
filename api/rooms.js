const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const SHEET_ID = '1a5dN1qvE2EgB7iUOv7MmioytlTLWTa81rgBRbPDfkj8';
  const SHEET_NAME = 'Sheet1';
  const SHEET_RANGE = 'A2:J';
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}&range=${SHEET_RANGE}`;

  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    
    // แปลง CSV เป็น Array และจัดการกับข้อมูล
    const rows = text.split('\n').map(row => {
      // ใช้ regular expression เพื่อแยกฟิลด์ โดยคำนึงถึง comma ใน quotes
      const cells = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (cells) {
        // ลบ quotes ที่ไม่จำเป็นและ trim whitespace
        const cleanCells = cells.map(cell => cell.replace(/^"|"$/g, '').trim());
        return {
          roomNumber: cleanCells[0],
          price: cleanCells[1],
          status: cleanCells[2],
          imageUrl: cleanCells[3].split(',').map(url => url.trim()), // แยก URL เป็น array
          size: cleanCells[4],
          amenities: cleanCells[5],
          rentalStart: cleanCells[6],
          rentalEnd: cleanCells[7],
          latitude: cleanCells[8],
          longitude: cleanCells[9]
        };
      }
      return null;
    }).filter(row => row !== null);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch rooms', details: error.message });
  }
};
