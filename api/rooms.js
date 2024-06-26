const { google } = require('googleapis');

module.exports = async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: 'Sheet1!A2:N',
    });

    res.status(200).json(response.data.values);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};
