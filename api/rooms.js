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
      const cells = row.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1'));
      return {
        roomNumber: cells[0],
        price: cells[1],
        status: cells[2],
        imageUrl: cells[3],
        size: cells[4],
        amenities: cells[5],
        rentalStart: cells[6],
        rentalEnd: cells[7],
        latitude: cells[8],
        longitude: cells[9]
      };
    });

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch rooms', details: error.message });
  }
};
