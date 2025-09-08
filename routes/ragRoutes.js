const express = require('express');
const Link = require('../models/Link');
const { requireAuth } = require('../middleware/auth');
const { storeEmbeddings, queryRAG } = require('../services/rag');
const router = express.Router();

router.post('/train/:linkId', requireAuth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.linkId);
    if (!link || link.userId !== req.auth.userId) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    await storeEmbeddings(link._id);
    
    link.isEmbedded = true;
    await link.save();
    
    res.json({ message: 'Training completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/query/:linkId', requireAuth, async (req, res) => {
  try {
    const { question } = req.body;
    const { linkId } = req.params;
    const answer = await queryRAG(question, linkId);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;