const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRouter = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});