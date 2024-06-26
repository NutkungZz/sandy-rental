module.exports = async (req, res) => {
  const SHEET_ID = '1a5dN1qvE2EgB7iUOv7MmioytlTLWTa81rgBRbPDfkj8';
  const SHEET_NAME = 'Sheet1';
  const SHEET_RANGE = 'A2:N';
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}&range=${SHEET_RANGE}`;

  try {
    const response = await fetch(sheetUrl);
    const text = await response.text();
    const data = JSON.parse(text.substr(47).slice(0, -2));
    
    if (data.table && data.table.rows) {
      const formattedData = data.table.rows.map(row => 
        row.c.map(cell => cell ? cell.v : null)
      );
      res.status(200).json(formattedData);
    } else {
      throw new Error('Invalid data structure');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};
