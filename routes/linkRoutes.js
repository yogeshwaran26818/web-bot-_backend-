const express = require('express');
const Link = require('../models/Link');
const { getWebsiteModel } = require('../models/WebsiteData');
const { requireAuth } = require('../middleware/auth');
const { scrapeWebsite, scrapePageContent } = require('../services/scraper');
const router = express.Router();

router.post('/upload', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.auth.userId;
    
    const anchorTags = await scrapeWebsite(url);
    
    // Create link metadata
    const link = new Link({
      userId,
      originalUrl: url,
      anchorCount: anchorTags.length
    });
    await link.save();
    
    // Create separate collection for this website's data
    const WebsiteModel = getWebsiteModel(link._id);
    
    for (let tag of anchorTags) {
      const content = await scrapePageContent(tag.url);
      await WebsiteModel.create({
        url: tag.url,
        text: tag.text,
        content
      });
    }
    
    res.json({ ...link.toObject(), anchorTags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link || link.userId !== req.auth.userId) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Get data from separate collection
    const WebsiteModel = getWebsiteModel(link._id);
    const anchorTags = await WebsiteModel.find();
    
    res.json({ ...link.toObject(), anchorTags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;