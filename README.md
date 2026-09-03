# A&M PrintabelleArt — Static Website

## Run locally
```
python3 -m http.server 8080
```
Then open http://localhost:8080

## Admin access
Click the 🔒 padlock icon in the header.

| Email | Password | Role |
|---|---|---|
| magellebellena@gmail.com | amprint2024 | owner |
| bellenaarniel@gmail.com | amprint2024 | owner |

Owners can add more admins under **Dashboard → Admins**.
Change the default password in `assets/js/data.js` (`SEED_ADMINS`).

## Dashboard
- **Monthly Sales** — 12-month revenue bar chart + growth table
- **Inventory** — editable stock per service, low/out-of-stock flags
- **Orders** — every online order placed on the site
- **Admins** — add/remove staff accounts

## Deploy
- GitHub Pages: push to `main`, workflow at `.github/workflows/deploy.yml` handles it.
- Netlify/Vercel: publish directory `.`, no build command.

Config summary lives in `site.yml`.

> Note: data is stored in the browser's localStorage (static site, no server).
> For multi-device shared data, connect a backend like Firebase or Supabase.
