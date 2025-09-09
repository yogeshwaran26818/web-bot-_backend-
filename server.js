require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// ✅ Connect DB
connectDB().catch(err => console.error('DB connection failed:', err));

// ✅ CORS middleware goes here
const allowedOrigins = [
  'https://web-bot-frontend.vercel.app',
  'http://localhost:5173'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ✅ JSON body parser
app.use(express.json());

// ✅ Routes (after CORS + body parser)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/links', require('./routes/linkRoutes'));
app.use('/api/rag', require('./routes/ragRoutes'));

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
