const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const SHEET_ID = '1a5dN1qvE2EgB7iUOv7MmioytlTLWTa81rgBRbPDfkj8';
  const SHEET_NAME = 'Sheet1';
  const SHEET_RANGE = 'A2:K';
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}&range=${SHEET_RANGE}`;

  try {
    console.log('Fetching data from:', sheetUrl);
    const response = await fetch(sheetUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    console.log('Received data:', text.substring(0, 200) + '...'); // Log first 200 characters

    if (!text.trim()) {
      throw new Error('Received empty response from Google Sheets');
    }

    const rows = text.split('\n').map((row, index) => {
      console.log(`Processing row ${index + 1}:`, row);
      const cells = row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
      if (cells.length >= 10) {
        return {
          roomNumber: cells[0] || '',
          price: cells[1] || '',
          status: cells[2] || '',
          images: (cells[3] || '').split(';').filter(url => url.trim() !== ''),
          size: cells[4] || '',
          amenities: (cells[5] || '').split(';').filter(item => item.trim() !== ''),
          rentalStart: cells[6] || '',
          rentalEnd: cells[7] || '',
          latitude: cells[8] || '',
          longitude: cells[9] || '',
          description: cells[10] || ''
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
    res.status(500).json({ error: 'Failed to fetch rooms', details: error.message, stack: error.stack });
  }
};
