const bodyParser = require('body-parser');

module.exports = (req, res) => {
  // Parse JSON bodies
  bodyParser.json()(req, res, () => {
    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const method = req.method;

    if (pathname.startsWith('/api/rooms')) {
      if (method === 'PUT' || method === 'DELETE') {
        req.query = { id: pathname.split('/')[3] };
      }
      require('./rooms')(req, res);
    } else if (pathname.startsWith('/api/tenants')) {
      if (method === 'PUT' || method === 'DELETE') {
        req.query = { id: pathname.split('/')[3] };
      }
      require('./tenants')(req, res);
    } else if (pathname.startsWith('/api/payments')) {
      if (method === 'PUT' || method === 'DELETE') {
        req.query = { id: pathname.split('/')[3] };
      }
      require('./payments')(req, res);
    } else if (pathname === '/api/login') {
      require('./login')(req, res);
    } else if (pathname === '/api/register') {
      require('./register')(req, res);
    } else {
      res.status(404).json({ error: "Not Found" });
    }
  });
};
