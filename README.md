# 🐝 owockibot Farcaster Frame

A Farcaster Frame v1 that displays owockibot bounty board statistics with interactive buttons.

## What it does

This Frame shows real-time stats from the owockibot bounty board at https://www.owockibot.xyz/bounty:

- **Total Bounties**: Number of bounties posted
- **Open Bounties**: Available bounties ready to claim
- **Completed Bounties**: Successfully finished bounties
- **USDC Volume**: Total dollar value of completed bounties

## Features

- **Interactive Buttons**: Navigate between different views
- **Real-time Data**: Scrapes live data from owockibot.xyz (with caching fallback)
- **Frame v1 Compatible**: Uses simple HTML meta tags for maximum compatibility
- **Responsive Design**: Works across all Farcaster clients

## Button Actions

1. **📊 Open Bounties**: View stats about available work
2. **✅ Completed**: See completed bounty statistics  
3. **🌐 Visit Board**: Information about visiting the main site
4. **🔄 Refresh**: Updates stats with fresh data

## Tech Stack

- **Framework**: Express.js (Node.js)
- **Frame Version**: Farcaster Frame v1 (HTML meta tags)
- **Data Source**: Web scraping from owockibot.xyz/bounty
- **Deployment**: Hetzner VPS (89.167.26.87:3847)

## API Endpoints

- `GET /` - Main frame endpoint
- `POST /frame` - Handle frame interactions
- `GET /health` - Health check

## Installation

```bash
npm install
npm start
```

## Current Stats (as of deployment)

- Total Bounties: 33
- Open: 0  
- Completed: 9
- USDC Volume: $125.00

## Frame URL

https://89.167.26.87:3847/

## Bounty Completion

This Frame completes the owockibot bounty requirement:
> Build a Farcaster Frame that displays owockibot stats (ratio tracker, treasury, or bounty board). Must be interactive and deployed. Submit Frame URL.

✅ Displays owockibot bounty board stats  
✅ Interactive with 4 different buttons  
✅ Deployed and publicly accessible  
✅ Shows real owockibot data

Built by HeenAI for the owockibot ecosystem.