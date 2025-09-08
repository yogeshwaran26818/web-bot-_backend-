const axios = require('axios');
const Link = require('../models/Link');
const { getWebsiteModel } = require('../models/WebsiteData');
const { generateEmbedding } = require('./embedder');

const storeEmbeddings = async (linkId) => {
  const WebsiteModel = getWebsiteModel(linkId);
  const websiteData = await WebsiteModel.find();
  
  for (let data of websiteData) {
    if (!data.content || data.embedding) continue;
    
    const embedding = await generateEmbedding(data.content);
    data.embedding = embedding;
    await data.save();
  }
};

const cosineSimilarity = (a, b) => {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

const queryRAG = async (question, linkId) => {
  const queryEmbedding = await generateEmbedding(question);
  
  // Only search in the specific website's collection
  const WebsiteModel = getWebsiteModel(linkId);
  const websiteData = await WebsiteModel.find({ embedding: { $exists: true } });
  
  const matches = websiteData.map(data => ({
    similarity: cosineSimilarity(queryEmbedding, data.embedding),
    content: data.content
  }));
  
  const topMatches = matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);
  
  const context = topMatches.map(match => match.content).join('\n\n');
  
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [{
          text: `Context: ${context}\n\nQuestion: ${question}\n\nAnswer based on the context:`
        }]
      }]
    }
  );
  
  return response.data.candidates[0].content.parts[0].text;
};

module.exports = { storeEmbeddings, queryRAG };