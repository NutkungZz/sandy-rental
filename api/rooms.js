const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const SHEET_ID = '1a5dN1qvE2EgB7iUOv7MmioytlTLWTa81rgBRbPDfkj8';
  const SHEET_NAME = 'Sheet1';
  const SHEET_RANGE = 'A2:K';  // เปลี่ยนเป็น K เพื่อรวม longitude
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}&range=${SHEET_RANGE}`;

  try {
    const response = await fetch(sheetUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    
    const rows = text.split('\n').map((row, index) => {
      const cells = row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
      
      if (cells.length >= 11) {  // เปลี่ยนเป็น 11 เพื่อรวม longitude
        return {
          roomNumber: cells[0] || '',
          price: cells[1] || '',
          status: cells[2] || '',
          images: cells[3].split(',').map(filename => `https://i.imgur.com/${filename.trim()}`),
          size: cells[4] || '',
          amenities: cells[5].split(',').map(item => item.trim()),
          rentalStart: cells[6] || '',
          rentalEnd: cells[7] || '',
          latitude: cells[8] || '',
          longitude: cells[9] || '',
          description: cells[10] || ''
        };
      }
      return null;
    }).filter(row => row !== null);

    if (rows.length === 0) {
      throw new Error('No valid data rows found');
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error in /api/rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms', details: error.message });
  }
};
