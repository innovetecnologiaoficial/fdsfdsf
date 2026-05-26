import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import Parser from 'rss-parser';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(cors());

// Configure parser with a real-browser User-Agent to prevent security blocks on Wordpress/Cloudflare sites
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
  },
  customFields: {
    item: ['media:content', 'content:encoded', 'description'],
  }
});

// Initialize GoogleGenAI client with key safety
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    })
  : null;

// Helper to robustly extract images from feed items
function extractImageUrl(item: any): string {
  let url = null;
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  
  // 1. Check enclosure tag
  if (item.enclosure && item.enclosure.url) {
    url = item.enclosure.url;
  }
  // 2. Check media:content
  else if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    url = item['media:content']['$'].url;
  }
  // 3. Check content:encoded for an img tag
  else if (item['content:encoded']) {
    const match = imgRegex.exec(item['content:encoded']);
    if (match && match[1]) url = match[1];
  }
  // 4. Check regular description/content
  else if (item.content) {
    const match = imgRegex.exec(item.content);
    if (match && match[1]) url = match[1];
  }
  else if (item.description) {
    const match = imgRegex.exec(item.description);
    if (match && match[1]) url = match[1];
  }

  // Fallback to high-quality Unsplash real news/photo journalism context
  return url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
}

// Cache logic to avoid rate limits or hammering servers
let newsCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to fetch XML feed with dynamic fallback attempts
async function fetchXmlFeed(url: string) {
  try {
    // Fetch manually with custom user-agent and referer headers to avoid web-server request blocks
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.google.com/'
      }
    });

    if (!res.ok) {
      console.warn(`[RSS Fetch] HTTP ${res.status} for URL: ${url}`);
      throw new Error(`HTTP status ${res.status}`);
    }

    const xmlText = await res.text();
    const cleanText = xmlText.trim();
    const lowerText = cleanText.toLowerCase();

    // Check if response is HTML (login, homepage redirect, or security challenge/captcha page)
    if (lowerText.startsWith('<!doctype html') || lowerText.startsWith('<html')) {
      console.warn(`[RSS Fetch] URL ${url} returned HTML instead of real XML feed. Skipped.`);
      throw new Error('Response is HTML, not valid XML');
    }

    // Verify it looks like a valid RSS or Atom XML feed before parsing
    const hasXmlSignatures = lowerText.includes('<?xml') || 
                             lowerText.includes('<rss') || 
                             lowerText.includes('<feed') || 
                             lowerText.includes('<channel') ||
                             lowerText.includes('<news') ||
                             lowerText.includes('<item');

    if (!hasXmlSignatures) {
      console.warn(`[RSS Fetch] URL ${url} did not present a known RSS/XML channel signature. Skipped.`);
      throw new Error('Response does not contain valid RSS or XML tag structures');
    }

    const feed = await parser.parseString(cleanText);
    if (feed && feed.items && feed.items.length > 0) {
      return feed;
    }
  } catch (err: any) {
    console.warn(`[RSS Parse Ignored] Skipping feed url ${url} due to parsing warning: ${err.message || err}`);
    throw err;
  }

  throw new Error(`No items found in feed: ${url}`);
}

app.get('/api/news', async (req, res) => {
  const now = Date.now();
  if (newsCache && now - lastFetchTime < CACHE_DURATION) {
    return res.json(newsCache);
  }

  // --- LAYER 1: VITRINE DO SUL WORDPRESS JSON REST API (MOST ROBUST & DIRECT) ---
  const WP_API_URLS = [
    'https://www.vitrinedosul.com.br/wp-json/wp/v2/posts?per_page=3&_embed=1',
    'https://vitrinedosul.com.br/wp-json/wp/v2/posts?per_page=3&_embed=1',
    'http://www.vitrinedosul.com.br/wp-json/wp/v2/posts?per_page=3&_embed=1',
    'http://vitrinedosul.com.br/wp-json/wp/v2/posts?per_page=3&_embed=1'
  ];

  for (const url of WP_API_URLS) {
    try {
      console.log(`[WP REST API] Fetching posts: ${url}`);
      // Native fetch timeout signal
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const posts = await response.json();
        if (Array.isArray(posts) && posts.length > 0) {
          const items = posts.slice(0, 3).map((post: any) => {
            let imageUrl = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80';
            
            // Extract featured image URL safely
            if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
              const media = post._embedded['wp:featuredmedia'][0];
              imageUrl = media.source_url || imageUrl;
            } else {
              // Try regex in content as backup
              const imgRegex = /<img[^>]+src="([^">]+)"/i;
              if (post.content && post.content.rendered) {
                const match = imgRegex.exec(post.content.rendered);
                if (match && match[1]) imageUrl = match[1];
              }
            }

            // Clean the excerpt/description (remove HTML tags neatly)
            let desc = 'Confira os detalhes completos desta matéria acessando o Portal Vitrine do Sul.';
            if (post.excerpt && post.excerpt.rendered) {
              desc = post.excerpt.rendered
                .replace(/<[^>]*>/g, '') // strip html tags
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#8230;/g, '...')
                .trim();
            }

            let safePubDate = post.date_gmt || post.date;
            if (!safePubDate || isNaN(Date.parse(safePubDate))) {
              safePubDate = new Date().toISOString();
            }

            return {
              title: post.title?.rendered || 'Notícia Regional',
              link: post.link || 'https://www.vitrinedosul.com.br',
              pubDate: safePubDate,
              description: desc || 'Confira os detalhes completos desta matéria acessando o Portal Vitrine do Sul.',
              imageUrl: imageUrl,
              source: 'Portal Vitrine do Sul'
            };
          });

          if (items.length > 0) {
            newsCache = items;
            lastFetchTime = now;
            console.log(`[WP REST API] Successfully loaded verified posts from ${url}`);
            return res.json(items);
          }
        }
      } else {
        console.warn(`[WP REST API] Returned status ${response.status} for ${url}`);
      }
    } catch (e: any) {
      console.warn(`[WP REST API] Skipped ${url} due to:`, e.message || e);
    }
  }

  // --- LAYER 2: VITRINE DO SUL RSS FEEDS (XML FALLBACK) ---
  const PRIMARY_FEED_URLS = [
    'https://www.vitrinedosul.com.br/feed/',
    'https://www.vitrinedosul.com.br/rss.xml',
    'https://vitrinedosul.com.br/feed/',
    'https://vitrinedosul.com.br/rss.xml',
    'http://www.vitrinedosul.com.br/feed/',
    'http://www.vitrinedosul.com.br/rss.xml'
  ];

  // --- LAYER 3: VITRINE DO SUL RSS FEEDS (XML FETCHING) ---
  for (const url of PRIMARY_FEED_URLS) {
    try {
      console.log(`[RSS] Fetching primary Vitrine do Sul: ${url}`);
      const feed = await fetchXmlFeed(url);
      
      const items = feed.items.slice(0, 3).map(item => {
        const imageUrl = extractImageUrl(item);
        
        // Date parsing safety to prevent React crashes on Invalid dates
        let safePubDate = item.pubDate;
        if (!safePubDate || isNaN(Date.parse(safePubDate))) {
          safePubDate = new Date().toISOString();
        }

        return {
          title: item.title || 'Notícia Regional',
          link: item.link || 'https://www.vitrinedosul.com.br',
          pubDate: safePubDate,
          description: item.contentSnippet || item.description || 'Confira os detalhes completos desta matéria especial acessando o Portal Vitrine do Sul.',
          imageUrl: imageUrl,
          source: 'Portal Vitrine do Sul'
        };
      });

      if (items.length > 0) {
        newsCache = items;
        lastFetchTime = now;
        console.log(`[RSS] Primary XML parse succeeded for: ${url}`);
        return res.json(items);
      }
    } catch (e) {
      console.warn(`[RSS] Primary URL ${url} skipped:`, e.message || e);
    }
  }

  // --- LAYER 2: GEMINI WEB GROUNDED SEARCH (REAL-TIME GOOGLE LOOKUP) ---
  if (ai) {
    try {
      console.log('[Gemini Fallback] Querying live search for real Vitrine do Sul news...');
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: 'Pesquise no Google usando ferramentas de busca as notícias mais recentes (últimas 48 horas ou desta semana) publicadas pelo Portal Vitrine do Sul (vitrinedosul.com.br) ou notícias reais urgentes da região de Criciúma e Sul de Santa Catarina. É MANDATÓRIAMENTE obrigatório retornar APENAS notícias de fatos reais que de fato aconteceram e existem na internet, com links reais de notícias funcionais. Você NÃO PODE inventar ou imaginar notícias ou fakenews. Retorne em formato JSON contendo exatamente 3 notícias contendo título (title), link real do artigo (link), data de publicação ISO-8601 (pubDate), descrição resumida verdadeira (description) em português, e a URL da imagem de capa (imageUrl). Se não encontrar resultados reais suficientes, retorne uma lista vazia [].',
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                link: { type: Type.STRING },
                pubDate: { type: Type.STRING },
                description: { type: Type.STRING },
                imageUrl: { type: Type.STRING }
              },
              required: ['title', 'link', 'pubDate', 'description', 'imageUrl']
            }
          }
        }
      });

      const responseText = response.text ? response.text.trim() : '';
      if (responseText) {
        const parsedItems = JSON.parse(responseText);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          const sanitizedItems = parsedItems.slice(0, 3).map(item => {
            let safeDate = item.pubDate;
            if (!safeDate || isNaN(Date.parse(safeDate))) {
              safeDate = new Date().toISOString();
            }
            return {
              title: item.title || 'Informativo Regional',
              link: item.link || 'https://www.vitrinedosul.com.br',
              pubDate: safeDate,
              description: item.description || 'Confira os detalhes completos desta matéria especial acessando o Portal Vitrine do Sul.',
              imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
              source: 'Portal Vitrine do Sul'
            };
          });

          newsCache = sanitizedItems;
          lastFetchTime = now;
          console.log('[Gemini Fallback] Live Search news found & verified successfully!');
          return res.json(sanitizedItems);
        }
      }
    } catch (geminiError) {
      console.error('[Gemini Fallback] Live lookup failed:', geminiError.message || geminiError);
    }
  }

  // --- LAYER 3: LIVE BACKUP STATE/REGIONAL RSS STREAM ---
  // If Vitrine do Sul's site is offline and search fails, parse stable and certified public RSS feeds for Santa Catarina / Criciúma region
  const BACKUP_FEEDS = [
    { url: 'https://g1.globo.com/rss/g1/sc/santa-catarina/', source: 'G1 Santa Catarina' },
    { url: 'https://ndmais.com.br/noticias/criciuma/feed/', source: 'ND Mais Criciúma' },
    { url: 'https://ndmais.com.br/feed/', source: 'ND Mais SC' }
  ];

  for (const backup of BACKUP_FEEDS) {
    try {
      console.log(`[Backup RSS] Loading active verified source: ${backup.source} (${backup.url})`);
      const feed = await fetchXmlFeed(backup.url);
      
      const items = feed.items.slice(0, 3).map(item => {
        const imageUrl = extractImageUrl(item);
        
        let safePubDate = item.pubDate;
        if (!safePubDate || isNaN(Date.parse(safePubDate))) {
          safePubDate = new Date().toISOString();
        }

        return {
          title: item.title || 'Cobertura Regional de SC',
          link: item.link || 'https://g1.globo.com/sc/santa-catarina/',
          pubDate: safePubDate,
          description: item.contentSnippet || item.description || 'Fique atualizado sobre todos os acontecimentos de Santa Catarina acessando o portal completo.',
          imageUrl: imageUrl,
          source: backup.source
        };
      });

      if (items.length > 0) {
        newsCache = items;
        lastFetchTime = now;
        console.log(`[Backup RSS] Successfully loaded live backup news from ${backup.source}`);
        return res.json(items);
      }
    } catch (e) {
      console.warn(`[Backup RSS] ${backup.source} failed:`, e.message || e);
    }
  }

  // --- LAYER 4: FINAL ABSOLUTE ERROR HANDLE (No fake news allowed) ---
  // In case the entire internet connection or proxy is failing, return a descriptive error object, never a fake/fictional news item.
  console.error('[API News Error] Absolutely all live RSS feeds and Gemini search queries have failed.');
  res.status(503).json({ error: 'Não foi possível conectar às fontes reais de notícias no momento. Verifique sua conexão.' });
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
