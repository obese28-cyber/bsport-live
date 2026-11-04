# BSPORT LIVE — secure mobile sports dashboard

## What is included
- Responsive red/blue BSPORT branding, basketball and football scores, Premier League standings, scrolling ticker.
- Real SportAPI.ai REST integration through a **server-side proxy** (your key is not sent to the browser).
- 60-second server caching and browser refreshing. This is a functional starter, not a hosted public website.
- No fabricated scores: missing data produces a clear empty/error message.

## Run locally (Node 20+)
1. Set `SPORTAPI_KEY` as a private environment variable. Do not commit the key.
2. `npm start`
3. Open `http://localhost:3000`.

## Publish from your phone (GitHub + Render or another Node hosting provider)
1. Create a **private GitHub repository** and upload these project files (not the ZIP as a single file). The `.env.example` is a template and does not contain a secret.
2. On a Node-capable host such as Render, connect the GitHub repository and create a Web Service.
3. Set the start command to `npm start`, runtime Node, and add private environment variable `SPORTAPI_KEY` with your real key in the host's secret/environment settings. Never add it to a GitHub file or public client-side code.
4. Deploy, then open the HTTPS URL supplied by the host in Chrome on your phone.
5. If you ever expose the key, revoke/rotate it at SportAPI.ai.

## API usage
Football: `GET /api/fixtures/date/{date}`; basketball: `GET /api/basketball/games/date/{date}`; EPL table: `GET /api/standings/24`. All requests go through the backend. Each refresh after the server's 60-second cache expires consumes up to 3 requests. With a 14,000/month free limit, this prototype is **not suitable for unattended 24/7 one-minute polling**. Reduce polling or implement a smarter scheduler before production.

## Important limits
- SportAPI's published football WebSocket exists but is NOT wired into this first version; it would require a server-side relay so the key is not exposed in browser URLs.
- Live broadcasting to TikTok is NOT configured and requires confirming external streaming eligibility.
- SportAPI's commercial redistribution/broadcast licensing and team-logo rights must be confirmed before public monetized use.
- The ticker is generic branding text, not a live news feed.
- This starter has no admin authentication; don't add private controls to public routes without securing them.
