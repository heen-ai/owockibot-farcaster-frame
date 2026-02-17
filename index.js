const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3847;

app.use(express.json());
app.use(express.static('public'));

// In-memory cache for owockibot stats
let statsCache = {
  totalBounties: 33,
  openBounties: 0,
  completedBounties: 9,
  usdcVolume: 125.00,
  lastUpdated: Date.now()
};

// Function to scrape owockibot stats (fallback to cached values if scraping fails)
async function getOwockibotStats() {
  try {
    // Use the API directly instead of scraping (JS-rendered page can't be parsed with cheerio)
    const [allRes, openRes] = await Promise.all([
      axios.get('https://www.owockibot.xyz/api/bounty-board', { timeout: 5000 }),
      axios.get('https://www.owockibot.xyz/api/bounty-board?status=open', { timeout: 5000 })
    ]);
    
    const allBounties = Array.isArray(allRes.data) ? allRes.data : (allRes.data.bounties || []);
    const openBounties = Array.isArray(openRes.data) ? openRes.data : (openRes.data.bounties || []);
    const completedBounties = allBounties.filter(b => b.status === 'completed' || b.status === 'paid');
    const totalVolume = completedBounties.reduce((sum, b) => sum + (parseFloat(b.reward) || 0), 0);
    
    statsCache = {
      totalBounties: allBounties.length,
      openBounties: openBounties.length,
      completedBounties: completedBounties.length,
      usdcVolume: totalVolume || statsCache.usdcVolume,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.log('Error fetching owockibot stats, using cached data:', error.message);
  }
  
  return statsCache;
}

// Generate frame image URL (for now, we'll use a simple text-based image service)
function generateFrameImageUrl(stats, view = 'overview') {
  const baseUrl = `https://via.placeholder.com/600x315/000000/f4c542`;
  
  switch (view) {
    case 'overview':
      return `${baseUrl}?text=🐝+owockibot+Bounty+Board%0A%0ATotal:+${stats.totalBounties}+bounties%0AOpen:+${stats.openBounties}%0ACompleted:+${stats.completedBounties}%0AUSDC+Volume:+$${stats.usdcVolume}`;
    case 'open':
      return `${baseUrl}?text=🐝+Open+Bounties%0A%0A${stats.openBounties}+bounties+available%0A%0AReady+to+claim+and+start+work`;
    case 'completed':
      return `${baseUrl}?text=🐝+Completed+Bounties%0A%0A${stats.completedBounties}+bounties+finished%0A%0A$${stats.usdcVolume}+USDC+paid+out`;
    case 'visit':
      return `${baseUrl}?text=🐝+Visit+owockibot.xyz%0A%0APost+work,+claim+bounties,+get+paid%0A%0ANo+escrow+needed`;
    default:
      return `${baseUrl}?text=🐝+owockibot+Bounty+Board`;
  }
}

// Generate frame HTML
function generateFrameHTML(stats, view = 'overview', postUrl = '/frame') {
  const imageUrl = generateFrameImageUrl(stats, view);
  
  let buttons = '';
  let buttonCount = 0;
  
  switch (view) {
    case 'overview':
      buttons = `
        <meta property="fc:frame:button:1" content="📊 Open Bounties" />
        <meta property="fc:frame:button:2" content="✅ Completed" />
        <meta property="fc:frame:button:3" content="🌐 Visit Board" />
        <meta property="fc:frame:button:4" content="🔄 Refresh" />
      `;
      break;
    case 'open':
      buttons = `
        <meta property="fc:frame:button:1" content="⬅️ Back" />
        <meta property="fc:frame:button:2" content="✅ Completed" />
        <meta property="fc:frame:button:3" content="🌐 Visit Board" />
        <meta property="fc:frame:button:4" content="🔄 Refresh" />
      `;
      break;
    case 'completed':
      buttons = `
        <meta property="fc:frame:button:1" content="⬅️ Back" />
        <meta property="fc:frame:button:2" content="📊 Open" />
        <meta property="fc:frame:button:3" content="🌐 Visit Board" />
        <meta property="fc:frame:button:4" content="🔄 Refresh" />
      `;
      break;
    case 'visit':
      buttons = `
        <meta property="fc:frame:button:1" content="⬅️ Back" />
        <meta property="fc:frame:button:2" content="📊 Open" />
        <meta property="fc:frame:button:3" content="✅ Completed" />
        <meta property="fc:frame:button:4" content="🔄 Refresh" />
      `;
      break;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>🐝 owockibot Bounty Board Frame</title>
        
        <!-- Frame v1 meta tags -->
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${imageUrl}" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="fc:frame:post_url" content="${postUrl}" />
        ${buttons}
        
        <!-- OpenGraph fallback -->
        <meta property="og:title" content="🐝 owockibot Bounty Board" />
        <meta property="og:description" content="Post work, claim bounties, get paid. ${stats.totalBounties} total bounties, ${stats.completedBounties} completed, $${stats.usdcVolume} USDC volume." />
        
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="background: black; color: #f4c542; font-family: monospace; padding: 20px; text-align: center;">
        <h1>🐝 owockibot Farcaster Frame</h1>
        <p>This is a Farcaster Frame showing owockibot bounty board stats.</p>
        <p>Current view: ${view}</p>
        <div style="background: #111; padding: 15px; margin: 20px; border-radius: 8px;">
          <h3>Latest Stats:</h3>
          <p>📋 Total Bounties: ${stats.totalBounties}</p>
          <p>🔓 Open: ${stats.openBounties}</p>
          <p>✅ Completed: ${stats.completedBounties}</p>
          <p>💰 USDC Volume: $${stats.usdcVolume}</p>
          <small>Last updated: ${new Date(stats.lastUpdated).toLocaleString()}</small>
        </div>
        <a href="https://www.owockibot.xyz/bounty" style="color: #f4c542;">Visit owockibot.xyz/bounty</a>
      </body>
    </html>
  `;
}

// Routes
app.get('/', async (req, res) => {
  const stats = await getOwockibotStats();
  const html = generateFrameHTML(stats, 'overview', '/frame');
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

app.post('/frame', async (req, res) => {
  console.log('Frame interaction:', JSON.stringify(req.body, null, 2));
  
  const stats = await getOwockibotStats();
  const buttonIndex = req.body?.untrustedData?.buttonIndex || 1;
  
  let view = 'overview';
  let postUrl = '/frame';
  
  // Handle different button interactions based on current view and button pressed
  const currentUrl = req.body?.untrustedData?.url || '';
  
  switch (buttonIndex) {
    case 1:
      if (currentUrl.includes('view=overview') || !currentUrl.includes('view=')) {
        view = 'open';
      } else {
        view = 'overview';
      }
      break;
    case 2:
      view = 'completed';
      break;
    case 3:
      if (currentUrl.includes('view=overview') || !currentUrl.includes('view=')) {
        view = 'visit';
      } else {
        view = 'open';
      }
      break;
    case 4:
      // Refresh - get fresh stats
      await getOwockibotStats();
      view = 'overview';
      break;
  }
  
  const html = generateFrameHTML(stats, view, '/frame');
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT, timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐝 owockibot Farcaster Frame running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
  console.log(`Public URL: http://89.167.26.87:${PORT}`);
});