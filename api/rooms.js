module.exports = async (req, res) => {
  const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/NutkungZz/sandy-rental/main/db.json';

  try {
    const response = await fetch(GITHUB_RAW_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.rooms || data.rooms.length === 0) {
      throw new Error('No rooms data found');
    }

    res.status(200).json(data.rooms);
  } catch (error) {
    console.error('Error in /api/rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms', details: error.message });
  }
};
