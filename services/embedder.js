const axios = require('axios');

const generateEmbedding = async (text) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        model: "models/embedding-001",
        content: { parts: [{ text }] }
      }
    );
    
    return response.data.embedding.values;
  } catch (error) {
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
};

module.exports = { generateEmbedding };