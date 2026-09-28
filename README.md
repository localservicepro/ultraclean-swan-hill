# Ultraclean Swan Hill — website

Static, dependency-free marketing site (home + 7 service pages + thank-you) built to the SEO research brief.

## Structure
- `build/data.js` — every business fact, page copy, FAQ and image URL. **Edit this, not the HTML.**
- `build/build.js` — generates the HTML. Run `node build/build.js` after any change.
- `index.html`, `services/<slug>/index.html`, `thank-you/index.html` — generated output (committed so any static host can serve it as-is).
- `assets/css/site.css`, `assets/js/site.js` — design system and interactions.
- `assets/img/` — logo mark (`logo.svg`), lockups (`logo-lockup*.svg`), favicon, apple-touch-icon.
- `sitemap.xml`, `robots.txt` — generated; `/thank-you/` is noindex.

## Hosting
Any static host (Netlify, Vercel, Cloudflare Pages, GHL). Serve the repo root; links are root-relative so the site must live at the domain root. Clean URLs (`/services/carpet-cleaning/`) work via `index.html` folders.

## Before launch
1. Set the real domain in `build/data.js` (`SITE.domain`) and rebuild — canonical, OG and sitemap URLs use it.
2. Imagery is Higgsfield-generated and hosted on Higgsfield's CDN. Download and self-host it (or replace with real job photos) before go-live.
3. Confirm opening hours (`SITE.hours`) — currently a placeholder of Mon–Sat 7am–6pm.
4. Test a live form submission end-to-end in GHL: the LeadConnector `external-tracking.js` script captures the submit; the form has no other endpoint.

## Local preview
`npx http-server -p 8080 .` then open http://localhost:8080
