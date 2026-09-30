# Ultraclean Swan Hill — website

Static, dependency-free marketing site (home + 7 service pages + thank-you) built to the SEO research brief.

## Structure
- `build/data.js` — every business fact, page copy, FAQ and image URL. **Edit this, not the HTML.**
- `build/blog.js` — blog posts (title, meta, body, FAQ). Pricing figures in the cost guide are indicative — confirm with the client.
- `build/build.js` — generates the HTML. Run `node build/build.js` after any change.
- `index.html`, `services/<slug>/index.html`, `about/`, `areas/`, `contact/`, `blog/`, `blog/<slug>/`, `thank-you/` — generated output (committed so any static host can serve it as-is).
- `assets/css/site.css`, `assets/js/site.js` — design system and interactions.
- `assets/img/` — logo mark (`logo.svg`), lockups (`logo-lockup*.svg`), favicon, apple-touch-icon.
- `sitemap.xml`, `robots.txt` — generated; `/thank-you/` is noindex.

## Hosting
Built for Vercel: `vercel.json` turns on Vercel Image Optimization, and the build rewrites every Higgsfield image to `/_vercel/image?url=…&w=…` with a responsive `srcset` (AVIF/WebP, resized, edge-cached). On another static host those URLs will 404 — either self-host the images or remove `optimizeImages()` in `build/build.js`. Links are root-relative so the site must live at the domain root. Clean URLs (`/services/carpet-cleaning/`) work via `index.html` folders.

Performance notes: CSS is inlined at build time, Google Fonts load non-blocking, the GHL tracking script is `defer`red, and the hero video is only fetched on desktop after page load (mobile gets the optimized poster image).

## Before launch
1. Set the real domain in `build/data.js` (`SITE.domain`) and rebuild — canonical, OG and sitemap URLs use it.
2. Client job photos live in `assets/photos/` (from the Drive folder "Photos / Initial Web Images"). The uniform/van shots were rebranded from AustClean to the official Ultra Clean logo (`assets/brand/`) with Higgsfield and, like the hero video, are hosted on Higgsfield's CDN — download and self-host those before go-live.
3. Confirm opening hours (`SITE.hours`) — currently a placeholder of Mon–Sat 7am–6pm.
4. Test a live form submission end-to-end in GHL: the LeadConnector `external-tracking.js` script captures the submit; the form has no other endpoint.

## Local preview
`npx http-server -p 8080 .` then open http://localhost:8080
