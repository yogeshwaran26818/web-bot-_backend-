const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Manual CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://web-bot-frontend.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
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

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API working', env: process.env.NODE_ENV });
});

// Links endpoints without auth for testing
app.get('/api/links', (req, res) => {
  res.json({ links: [], message: 'Links endpoint working' });
});

app.post('/api/links/upload', (req, res) => {
  const { url } = req.body;
  res.json({ success: true, message: 'Upload working', url });
});

// RAG endpoints
app.post('/api/rag/train/:linkId', (req, res) => {
  res.json({ message: 'Training endpoint working' });
});

app.post('/api/rag/query/:linkId', (req, res) => {
  const { question } = req.body;
  res.json({ answer: 'This is a test response from the chatbot.' });
});

module.exports = app;