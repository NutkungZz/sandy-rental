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
    console.log('Raw data:', text);

    const rows = text.split('\n').map((row, index) => {
      // ใช้ regex เพื่อแยกข้อมูลที่อยู่ในเครื่องหมายคำพูดอย่างถูกต้อง
      const cells = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
        .map(cell => cell.replace(/^"|"$/g, '').trim());
      
      console.log(`Processed cells for row ${index + 1}:`, cells);

      if (cells.length >= 10) {
        return {
          roomNumber: cells[0],
          price: cells[1],
          status: cells[2],
          images: cells[3].split(',').map(img => img.trim()).filter(img => img !== ''),
          size: cells[4],
          amenities: cells[5].split(',').map(item => item.trim()),
          rentalStart: cells[6],
          rentalEnd: cells[7],
          latitude: cells[8],
          longitude: cells[9]
        };
      }
      console.log(`Skipping row ${index + 1} due to insufficient data`);
      return null;
    }).filter(row => row !== null);

    console.log(`Processed ${rows.length} valid rows`);

    if (rows.length === 0) {
      throw new Error('No valid data rows found');
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error in /api/rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms', details: error.message });
  }
};
