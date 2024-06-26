module.exports = (req, res) => {
  const { pathname } = new URL(req.url, 'https://${req.headers.host}');
  
  if (pathname === '/api/rooms') {
    require('./rooms')(req, res);
  } else if (pathname === '/api/test') {
    res.json({ message: "API is working!" });
  } else {
    res.status(404).json({ error: "Not Found" });
  }
};
