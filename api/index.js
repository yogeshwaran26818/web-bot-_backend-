require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).catch(console.error);
}

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend working', timestamp: new Date() });
});

// Simple links route without auth for testing
app.get('/api/links', (req, res) => {
  res.json({ message: 'Links endpoint working', links: [] });
});

app.post('/api/links/upload', (req, res) => {
  res.json({ message: 'Upload endpoint working', url: req.body.url });
});

module.exports = app;