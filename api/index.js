const express = require('express');
const app = express();

app.get('/api/rooms', require('./rooms'));
app.get('/api/test', (req, res) => {
  res.json({ message: "API is working!" });
});

module.exports = app;
