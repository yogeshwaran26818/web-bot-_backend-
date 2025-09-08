require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['https://web-bot-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/links', require('./routes/linkRoutes'));
app.use('/api/rag', require('./routes/ragRoutes'));

// Debug route to see collections
app.get('/api/debug/collections', async (req, res) => {
  const Link = require('./models/Link');
  const User = require('./models/User');
  const links = await Link.find();
  const users = await User.find();
  res.json({ links, users });
});

// Create test user
app.post('/api/debug/create-user', async (req, res) => {
  const User = require('./models/User');
  const user = new User({
    clerkId: 'test-user',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  });
  await user.save();
  res.json(user);
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
