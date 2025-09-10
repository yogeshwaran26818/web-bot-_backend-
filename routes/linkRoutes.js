const express = require('express');
const Link = require('../models/Link');
const { getWebsiteModel } = require('../models/WebsiteData');
const { requireAuth } = require('../middleware/auth');
const { scrapeWebsite, scrapePageContent } = require('../services/scraper');
const router = express.Router();

// Get all links for user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const links = await Link.find({ userId });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', requireAuth, async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.auth.userId;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Step 1: scrape anchor tags from the website
    const anchorTags = await scrapeWebsite(url);

    // Step 2: store metadata about this link
    const link = new Link({
      userId,
      originalUrl: url,
      anchorCount: anchorTags.length
    });
    await link.save();

    // Step 3: create a dynamic model for this website’s data
    const WebsiteModel = getWebsiteModel(link._id);

    // Step 4: scrape and save page content for each anchor
    for (let tag of anchorTags) {
      try {
        const content = await scrapePageContent(tag.url);
        await WebsiteModel.create({
          url: tag.url,
          text: tag.text,
          content
        });
      } catch (err) {
        console.error(`Failed scraping ${tag.url}:`, err.message);
      }
    }

    // Step 5: return response
    res.json({
      success: true,
      link: link.toObject(),
      anchorTags
    });

  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
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