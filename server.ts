import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import Parser from 'rss-parser';

const app = express();
const PORT = 3000;

app.use(cors());

const parser = new Parser({
  customFields: {
    item: ['media:content', 'content:encoded', 'description'],
  }
});

// Cache the news to avoid hammering the RSS feed
let newsCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get('/api/news', async (req, res) => {
  const now = Date.now();
  if (newsCache && now - lastFetchTime < CACHE_DURATION) {
    return res.json(newsCache);
  }

  try {
    // Attempt to fetch from typical wordpress feed URLs
    const feed = await parser.parseURL('https://www.vitrinedosul.com.br/rss.xml');
    const items = feed.items.slice(0, 3).map(item => {
      // try to extract image from content or media
      let imageUrl = null;
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      
      // Check media:content
      if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
        imageUrl = item['media:content']['$'].url;
      }
      
      if (!imageUrl && item['content:encoded']) {
        const match = imgRegex.exec(item['content:encoded']);
        if (match && match[1]) imageUrl = match[1];
      }
      
      if (!imageUrl && item.content) {
        const match = imgRegex.exec(item.content);
        if (match && match[1]) imageUrl = match[1];
      }

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        description: item.contentSnippet || item.description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
      };
    });

    newsCache = items;
    lastFetchTime = now;
    res.json(items);
  } catch (error) {
    console.error('Error fetching RSS:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
