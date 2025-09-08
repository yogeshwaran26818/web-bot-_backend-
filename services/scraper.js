const axios = require('axios');
const cheerio = require('cheerio');

const scrapeWebsite = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    const anchorTags = [];
    const seenUrls = new Set();
    
    $('a[href]').each((i, element) => {
      if (anchorTags.length >= 15) return false;
      
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      
      if (!href || !text) return;
      
      let fullUrl = href.startsWith('http') ? href : new URL(href, url).href;
      
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        anchorTags.push({ url: fullUrl, text });
      }
    });
    
    return anchorTags;
  } catch (error) {
    throw new Error(`Scraping failed: ${error.message}`);
  }
};

const scrapePageContent = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    $('script, style, nav, footer, header').remove();
    const content = $('body').text().replace(/\s+/g, ' ').trim();
    
    return content.substring(0, 5000);
  } catch (error) {
    return '';
  }
};

module.exports = { scrapeWebsite, scrapePageContent };