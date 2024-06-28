module.exports = (req, res) => {
  const { pathname } = new URL(req.url, 'http://${req.headers.host}');
  
  if (pathname === '/api/rooms') {
    require('./rooms')(req, res);
  } else if (pathname === '/api/tenants') {
    require('./tenants')(req, res);
  } else if (pathname === '/api/login') {
    require('./login')(req, res);
  } else if (pathname === '/api/register') {
    require('./register')(req, res);
  } else if (pathname.startsWith('/api/tenants/')) {
    req.query = { id: pathname.split('/')[3] };
    require('./tenants')(req, res);
  } else {
    res.status(404).json({ error: "Not Found" });
  }
};
