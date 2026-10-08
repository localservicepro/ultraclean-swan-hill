#!/usr/bin/env node
// Static site generator for Ultraclean Swan Hill. Run: node build/build.js
const fs = require('fs');
const path = require('path');
const { SITE, IMG, SERVICES, HOME_FAQ, AREAS, ABOUT_FAQ, CONTACT_FAQ, AREAS_FAQ } = require('./data');
const { POSTS } = require('./blog');

const ROOT = path.join(__dirname, '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = (s) => String(s).replace(/<[^>]+>/g, '');
const bySlug = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));
const CSS = fs.readFileSync(path.join(ROOT, 'assets/css/site.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
// Images are served through Vercel's image optimizer (see vercel.json): resized, WebP/AVIF, cached at the edge.
const IMG_WIDTHS = [480, 768, 1080, 1600];
const optimizedUrl = (url, w, q = 72) => `/_vercel/image?url=${encodeURIComponent(url)}&w=${w}&q=${q}`;
const srcset = (url) => IMG_WIDTHS.map((w) => `${optimizedUrl(url, w)} ${w}w`).join(', ');
// Post-process: rewrite every Higgsfield PNG in <img src> / <video poster> to responsive optimized sources.
function optimizeImages(html) {
  return html
    .replace(/<img([^>]*?)src="((?:https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/|\/assets\/photos\/|\/assets\/brand\/)[^"]+)"([^>]*)>/g, (m, a, url, b) => {
      const full = /fetchpriority="high"|class="[^"]*\bhero\b/.test(a + b) || /hero-media/.test(m);
      const sizes = full ? '100vw' : '(max-width: 900px) 100vw, 640px';
      return `<img${a}src="${optimizedUrl(url, 1080)}" srcset="${srcset(url)}" sizes="${sizes}" decoding="async"${b}>`;
    })
    .replace(/poster="((?:https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/|\/assets\/photos\/|\/assets\/brand\/)[^"]+)"/g, (m, url) => `poster="${optimizedUrl(url, 1080)}"`);
}

/* ---------- brand mark ---------- */
// Ultraclean mark: a "U" formed by a rising water droplet with a clean sparkle. Works on dark and light.
const MARK = (size = 40) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="2" y="2" width="60" height="60" rx="18" fill="#23c4d4"/>
  <path d="M20 17v18a12 12 0 0 0 24 0V17" stroke="#0b1a2a" stroke-width="7" stroke-linecap="round"/>
  <path d="M32 44c0-6 5-9 5-13 0-3-2.2-5-5-5s-5 2-5 5c0 4 5 7 5 13Z" fill="#f6f4ef"/>
  <path d="M48 12l1.4 3.6L53 17l-3.6 1.4L48 22l-1.4-3.6L43 17l3.6-1.4Z" fill="#f6f4ef"/>
</svg>`;
const LOGO = () => `<a class="logo" href="/" aria-label="${SITE.name} home"><img src="/assets/img/logo-nav.png" alt="Ultra Clean Swan Hill" width="1000" height="${LOGO_NAV_H}" decoding="async"></a>`;

const LOGO_NAV_H = 650; // approx intrinsic height of logo-nav.png at 1000 wide (overridden by CSS)
const ICON = {
  arr: '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  arrNE: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
};

/* ---------- layout ---------- */
function head({ title, meta, canonical, ogImage, schema, extra = '', preload = '' }) {
  return `<!DOCTYPE html>
<html lang="en-AU">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(meta)}">
<link rel="canonical" href="${SITE.domain}${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0b1a2a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(meta)}">
<meta property="og:url" content="${SITE.domain}${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.png" type="image/png" sizes="64x64">
<link rel="icon" href="/assets/img/icon-512.png" type="image/png" sizes="512x512">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/exo-2-latin-800-normal.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/hanken-grotesk-latin-400-normal.woff2" crossorigin>
${preload ? `<link rel="preload" as="image" href="${optimizedUrl(preload, 1080)}" imagesrcset="${srcset(preload)}" imagesizes="100vw" fetchpriority="high">` : ''}
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<!-- GHL / LeadConnector form-submission tracking -->
<script defer src="https://link.msgsndr.com/js/external-tracking.js" data-tracking-id="${SITE.trackingId}"></script>
${extra}
</head>
<body>
<div class="grain" aria-hidden="true"><svg><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg></div>
`;
}

function nav(current = '') {
  const mega = SERVICES.map((s, i) => `<a href="/services/${s.slug}/"><span class="n">0${i + 1}</span>${esc(s.nav)}</a>`).join('');
  const mob = SERVICES.map((s, i) => `<a href="/services/${s.slug}/"><span>0${i + 1}</span>${esc(s.nav)}</a>`).join('');
  return `<header class="nav">
  <div class="wrap nav-in">
    ${LOGO()}
    <nav aria-label="Main">
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><button type="button" aria-haspopup="true">Services ${ICON.chev}</button><div class="mega">${mega}</div></li>
        <li><a href="/about/">About</a></li>
        <li><a href="/areas/">Areas</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </nav>
    <div class="nav-cta">
      <a class="nav-phone" href="tel:${SITE.phoneTel}">${ICON.phone}${SITE.phoneDisplay}</a>
      <a class="btn" href="/#quote" data-open-quote>Get a free quote ${ICON.arr}</a>
      <a class="nav-phone-m" href="tel:${SITE.phoneTel}" aria-label="Call ${SITE.phoneDisplay}">${ICON.phone}</a>
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false"><i></i><i></i><i></i></button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu">
  <a class="big" href="/">Home</a>
  <a class="big" href="/#services">Services</a>
  <div class="sub">${mob}</div>
  <a class="big" href="/about/">About</a>
  <a class="big" href="/areas/">Service areas</a>
  <a class="big" href="/blog/">Blog</a>
  <a class="big" href="/contact/">Contact</a>
  <div class="m-foot">
    <a class="btn" href="/#quote" data-open-quote>Get a free quote ${ICON.arr}</a>
    <a class="btn ghost" href="tel:${SITE.phoneTel}">${ICON.phone} Call ${SITE.phoneDisplay}</a>
  </div>
</div>
`;
}

function ctaStrip() {
  return `<section class="cta-strip section">
  <div class="wrap in">
    <div class="reveal"><span class="label">Ready when you are</span><h2 style="margin-top:14px">Tell us what needs cleaning.<br><span class="em">We'll quote it today.</span></h2></div>
    <div class="reveal" data-d="1" style="display:grid;gap:14px;justify-items:start">
      <a class="btn" href="/#quote" data-open-quote>Get a free quote ${ICON.arr}</a>
      <a class="link-u" href="tel:${SITE.phoneTel}">Or call ${SITE.phoneDisplay}</a>
    </div>
  </div>
</section>`;
}

function quoteModal(defaultService = '') {
  return `<div class="modal" id="quote-modal" role="dialog" aria-modal="true" aria-labelledby="qm-title" hidden>
  <div class="modal-bg" data-close-quote></div>
  <div class="modal-panel">
    <button class="modal-close" type="button" aria-label="Close" data-close-quote><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    <div class="modal-head">
      <span class="label">Free quote</span>
      <h3 id="qm-title">Tell us the job — fixed price back today.</h3>
      <p>Or call <a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a></p>
    </div>
    ${quoteForm(defaultService, 'm')}
  </div>
</div>`;
}

function footer(defaultService = '') {
  const svc = SERVICES.map((s) => `<li><a href="/services/${s.slug}/">${esc(s.nav)}</a></li>`).join('');
  return `<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div>${LOGO()}<p class="tagline">A higher standard of clean.</p><p>Carpet, upholstery, tile, window, bond and commercial cleaning for Swan Hill &amp; all surrounding areas — over 10 years local experience.</p></div>
      <div><h4>Services</h4><ul>${svc}</ul></div>
      <div><h4>Explore</h4><ul><li><a href="/">Home</a></li><li><a href="/about/">About</a></li><li><a href="/areas/">Service areas</a></li><li><a href="/blog/">Blog</a></li><li><a href="/contact/">Contact</a></li><li><a href="/#faq">FAQ</a></li></ul></div>
      <div><h4>Contact</h4><ul>
        <li><a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li><a href="https://maps.google.com/?q=${encodeURIComponent(SITE.address.locality + ' ' + SITE.address.region + ' ' + SITE.address.postcode)}" target="_blank" rel="noopener">${SITE.address.locality} ${SITE.address.region} ${SITE.address.postcode}</a></li>
        <li><span style="color:var(--text-2);font-size:.95rem">${SITE.hours}</span></li>
      </ul></div>
    </div>
    <div class="foot-bottom">
      <span>© ${new Date().getFullYear()} ${SITE.name}</span>
      <span>Site by <a href="https://localservicepro.com.au" target="_blank" rel="noopener">Local Service Pro</a></span>
    </div>
  </div>
</footer>
${quoteModal(defaultService)}
<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
}

function quoteForm(defaultService = '', pre = 'f') {
  const opts = SERVICES.map((s) => `<option value="${esc(s.nav)}"${s.nav === defaultService ? ' selected' : ''}>${esc(s.nav)}</option>`).join('');
  return `<form class="form quote-form" id="${pre === 'f' ? 'quote-form' : pre === 'c' ? 'quote-form-contact' : 'quote-form-modal'}" method="post" action="/thank-you/" data-redirect="/thank-you/" novalidate>
  <div class="grid">
    <div class="field"><label for="${pre}-name">Name</label><input id="${pre}-name" name="full_name" type="text" autocomplete="name" placeholder="Your name" required></div>
    <div class="field"><label for="${pre}-phone">Phone</label><input id="${pre}-phone" name="phone" type="tel" autocomplete="tel" placeholder="04xx xxx xxx" required></div>
    <div class="field full f-email"><label for="${pre}-email">Email</label><input id="${pre}-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required></div>
    <div class="field full f-address"><label for="${pre}-address">Property address</label><input id="${pre}-address" name="property_address" type="text" autocomplete="street-address" placeholder="Street, town" required></div>
    <div class="field"><label for="${pre}-size">Property size / seating positions</label><select id="${pre}-size" name="property_size" required>
      <option value="" disabled selected>Select…</option>
      <option>1–2 bedrooms / small office</option>
      <option>3 bedrooms</option>
      <option>4+ bedrooms</option>
      <option>Lounge — 2–3 seating positions</option>
      <option>Lounge — 4+ seats / modular</option>
      <option>Single room, rug or item</option>
      <option>Commercial premises</option>
    </select></div>
    <div class="field"><label for="${pre}-service">Service needed</label><select id="${pre}-service" name="service_needed" required>
      ${defaultService ? '' : '<option value="" disabled selected>Select…</option>'}${opts}
      <option>Not sure / multiple</option>
    </select></div>
    <div class="field full"><label for="${pre}-notes">Job notes</label><textarea id="${pre}-notes" name="job_notes" placeholder="Rooms or seating positions, sizes, stains, dates — a photo helps, text it to 0417 327 173"></textarea></div>
    <div class="hp" aria-hidden="true" style="display:none"><label>Leave this field empty<input type="text" name="_hp_url" tabindex="-1" autocomplete="off"></label></div>
  </div>
  <button class="btn" type="submit">Send my quote request ${ICON.arr}</button>
  <p class="fine">We reply the same business day. No spam, no lock-in — just a price.</p>
  <p class="form-error" hidden>Please fill in the highlighted fields and try again.</p>
</form>`;
}

function faqBlock(items) {
  return `<div class="faq">${items.map(([q, a]) => `<details><summary>${esc(q)}<i></i></summary><div class="a">${a}</div></details>`).join('')}</div>`;
}
const faqSchema = (items) => ({ '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: stripTags(a) } })) });

const localBusiness = () => ({
  '@type': 'LocalBusiness', '@id': SITE.domain + '/#business', name: SITE.name, url: SITE.domain, telephone: SITE.phoneTel, email: SITE.email,
  image: IMG.hero, logo: SITE.domain + '/assets/img/logo.png', priceRange: '$$',
  address: { '@type': 'PostalAddress', streetAddress: SITE.address.street, addressLocality: SITE.address.locality, addressRegion: SITE.address.region, postalCode: SITE.address.postcode, addressCountry: SITE.address.country },
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '07:00', closes: '18:00' }],
  areaServed: SITE.areasAll.map((t) => ({ '@type': 'City', name: t })),
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Cleaning services', itemListElement: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.nav, url: `${SITE.domain}/services/${s.slug}/` } })) },
});

/* ---------- home ---------- */
function home() {
  const marquee = [...SERVICES.map((s) => s.short), ...SITE.areasAll].map((t) => `<span>${esc(t)}</span>`).join('');
  const svcList = SERVICES.map((s, i) => `<a class="svc reveal" href="/services/${s.slug}/">
      <span class="n">0${i + 1}</span>
      <h3>${esc(s.nav)}</h3>
      <p>${esc(s.blurb)}</p>
      <span class="go">${ICON.arrNE}</span>
      <span class="svc-thumb"><img src="${IMG[s.img]}" alt="" loading="lazy"></span>
    </a>`).join('');
  const chips = (list) => list.map((t) => `<span class="chip${t === 'Lake Boga' ? ' home' : ''}">${t}</span>`).join('');
  const schema = { '@context': 'https://schema.org', '@graph': [localBusiness(), { '@type': 'WebSite', url: SITE.domain, name: SITE.name }, faqSchema(HOME_FAQ)] };

  return head({
    title: 'Carpet Cleaning Swan Hill & Surrounds | Ultraclean',
    meta: 'Carpet cleaning Swan Hill locals trust. Over 10 years experience in Swan Hill and surrounds: carpets, upholstery, tiles, windows and bond cleans. Book your free quote today.',
    canonical: '/', ogImage: IMG.hero, schema, preload: IMG.hero,
  }) + nav('home') + `
<main>
<section class="hero">
  <div class="hero-media">
    <img src="${IMG.hero}" alt="Carpet cleaning Swan Hill - Ultraclean owner Lee steam cleaning a lounge room carpet" fetchpriority="high" width="1600" height="900">
    <video muted loop playsinline preload="none" poster="${IMG.hero}" data-src="${IMG.heroVideo}" aria-hidden="true" class="hero-video"></video>
  </div>
  <div class="hero-scrim"></div>
  <div class="wrap hero-in">
    <div>
      <span class="label fadeup d1">A higher standard of clean · Swan Hill &amp; the Murray</span>
      <h1 class="fadeup d2">Professional Carpet Cleaning in Swan Hill <span class="em">&amp;</span> All Surrounding Areas</h1>
      <p class="lede bright fadeup d3">Local, reliable cleaning backed by over 10 years experience in the Swan Hill &amp; surrounding area. From carpets &amp; upholstery to tile &amp; grout, windows, bond cleans, commercial cleaning &amp; flood restoration – professional results you can rely on.</p>
      <div class="hero-ctas fadeup d4">
        <a class="btn" href="#quote" data-open-quote>Get a free quote ${ICON.arr}</a>
        <a class="hero-phone" href="tel:${SITE.phoneTel}">${ICON.phone}<span>${SITE.phoneDisplay}</span></a>
      </div>
    </div>
    <div class="hero-side fadeup d5">
      <div class="stat-card"><span class="label">Local &amp; insured</span><b>Over 10 years experience</b><p>Owner-operated in Swan Hill &amp; surrounds. The person who quotes is the person who turns up.</p></div>
      <div class="stat-card"><span class="label">Dry in hours</span><b>Truck-mounted steam</b><p>Hot-water extraction with strong recovery — no sticky residue, no soggy carpet.</p></div>
    </div>
  </div>
  <div class="scroll-hint"><i></i>Scroll</div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${marquee}${marquee}</div></div>

<section class="intro">
  <div class="wrap intro-grid">
    <p class="statement reveal">Specialty services, all areas, <span class="em">one local number.</span></p>
    <div class="intro-copy reveal" data-d="1">
      <p>Over 10 years of cleaning experience in Swan Hill &amp; the Murray. Local experience. Professional equipment. Quality work. Whether it's in home, rental or workplace, we'll get it sorted for you.</p>
      <p><strong>Ultraclean Swan Hill</strong> is locally owned and based at Lake Boga, covering Swan Hill and the surrounding towns on both sides of the river: carpet steam cleaning, upholstery and rugs, tile and grout, windows, builders cleans, bond cleans and regular commercial contracts.</p>
      <ul class="points">
        <li>${ICON.tick}<span>Fixed quotes before we start — the price you are told is the price you pay</span></li>
        <li>${ICON.tick}<span>Professional truck-mounted equipment and safe, low-residue products</span></li>
        <li>${ICON.tick}<span>Fully insured, police-checked, and happy to work around tenants and trading hours</span></li>
        <li>${ICON.tick}<span>Clear quotes up front — any travel to outlying towns is shown in the price</span></li>
      </ul>
    </div>
  </div>
</section>

<section class="services section" id="services">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal"><span class="label">What we do</span><h2>Professional cleaning for homes &amp; businesses with <span class="em">over 10 years local experience.</span></h2></div>
      <p class="reveal" data-d="1">Each service has its own page with what is included, how long it takes and what it costs to get a quote. Carpets are where we started; the rest is what customers kept asking for.</p>
    </div>
    <div class="svc-list">${svcList}</div>
  </div>
</section>

<section class="band" aria-label="Clean carpet fibre close-up">
  <img src="${IMG.carpet}" alt="Carpet cleaning Swan Hill - fresh steam cleaning lines across a bedroom carpet" loading="lazy">
  <div class="band-txt"><p class="reveal">Clean means the fibre — not just the surface you can see.</p></div>
</section>

<section class="paper section" id="about">
  <div class="wrap about-grid">
    <div class="about-media reveal">
      <div class="main"><img src="${IMG.leeWand}" alt="Lee from Ultraclean Swan Hill cleaning hard floors in a Swan Hill home" loading="lazy"></div>
      <div class="float"><img src="${IMG.vanRear}" alt="Ultraclean Swan Hill van with the truck-mounted carpet cleaning unit" loading="lazy"></div>
    </div>
    <div class="about-copy reveal" data-d="1">
      <span class="label">About Ultraclean</span>
      <h2>A new name on the van, the same local hands doing the work.</h2>
      <p>Ultraclean Swan Hill is run from Lake Boga, ten minutes down the Murray Valley Highway from Swan Hill, with over 10 years of experience in the cleaning industry locally. When you call, you talk to the person who will be cleaning your carpets, and who has probably already been to your street.</p>
      <p>We invest in the equipment that makes the difference: truck-mounted hot-water extraction, high-pressure tile turbo tools, commercial air movers and dehumidifiers for water damage, and water-fed poles for windows. The products we use are safe for kids, pets and septic systems, which matters out here.</p>
      <div class="facts">
        <div><b>Lake Boga</b><span>Home base, VIC 3584</span></div>
        <div><b>20 towns</b><span>VIC and NSW sides of the Murray</span></div>
        <div><b>10+ years</b><span>Cleaning experience in Swan Hill &amp; surrounds</span></div>
        <div><b>Fully insured</b><span>Public liability and police checked</span></div>
      </div>
      <a class="btn on-paper" href="/about/" style="margin-top:28px">More about Ultraclean ${ICON.arr}</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal"><span class="label">How it works</span><h2>From quote to clean in <span class="em">four steps.</span></h2></div>
      <p class="reveal" data-d="1">Simple on purpose. Most quotes go back the same day, and most jobs are booked within the week.</p>
    </div>
    <div class="steps">
      <div class="step reveal"><span class="n">1</span><h3>Tell us the job</h3><p>Use the quote form or call. Rooms, sizes, stains, dates — a photo helps but is not essential.</p></div>
      <div class="step reveal" data-d="1"><span class="n">2</span><h3>Fixed price back</h3><p>You get a written price for the whole job, not an hourly rate that grows on the day.</p></div>
      <div class="step reveal" data-d="2"><span class="n">3</span><h3>We turn up on time</h3><p>Confirmed time slot, text when we are on the way, gear in the van for the whole job.</p></div>
      <div class="step reveal" data-d="3"><span class="n">4</span><h3>Walk-through before we go</h3><p>We check every room with you. If something is not right, we fix it then and there.</p></div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal"><span class="label">On the job</span><h2>What a proper clean <span class="em">looks like.</span></h2></div>
    </div>
    <div class="ba reveal">
      <figure><img src="${IMG.carpetBefore}" alt="Before - soiled bedroom carpet in a Swan Hill rental before Ultraclean steam cleaning" loading="lazy"><figcaption>Before</figcaption></figure>
      <figure><img src="${IMG.carpetAfter}" alt="After - the same Swan Hill bedroom carpet after Ultraclean steam cleaning" loading="lazy"><figcaption class="after">After</figcaption></figure>
      <p>Same room, same afternoon. A three-bedroom vacate clean in Swan Hill — carpets steam cleaned, receipt supplied, bond returned in full.</p>
    </div>
    <div class="mosaic" style="margin-top:14px">
      <figure class="m1 contain reveal"><img src="${IMG.vanHero}" alt="Ultraclean Swan Hill branded van" loading="lazy"><figcaption>The Ultraclean van</figcaption></figure>
      <figure class="m2 reveal" data-d="1"><img src="${IMG.tile}" alt="Tile and grout cleaning Swan Hill - rotary turbo tool on porcelain tiles" loading="lazy"><figcaption>Tile &amp; grout</figcaption></figure>
      <figure class="m3 reveal" data-d="2"><img src="${IMG.upholstery}" alt="Upholstery cleaning Swan Hill - lounge half cleaned showing the difference" loading="lazy"><figcaption>Upholstery</figcaption></figure>
      <figure class="m4 reveal" data-d="1"><img src="${IMG.vanRear}" alt="Branded Ultraclean Swan Hill van on a carpet cleaning job with the rear doors open and hoses run into the house" loading="lazy"><figcaption>On the job</figcaption></figure>
      <figure class="m5 reveal" data-d="2"><img src="${IMG.equipment}" alt="Ultraclean carpet cleaning wand, air mover and dehumidifier" loading="lazy"><figcaption>The gear</figcaption></figure>
    </div>
  </div>
</section>

<section class="areas section" id="areas">
  <div class="ghost" aria-hidden="true">Murray</div>
  <div class="wrap areas-grid">
    <div>
      <div class="section-head" style="grid-template-columns:1fr;margin-bottom:36px">
        <div class="reveal"><span class="label">Service areas</span><h2>Swan Hill first, <span class="em">then every town around it.</span></h2></div>
        <p class="reveal" data-d="1">Ultraclean is based in Lake Boga and services twenty towns across the Swan Hill Rural City, Gannawarra and Buloke shires in Victoria, and the Murray River, Balranald and Wakool districts in New South Wales.</p>
      </div>
      <div class="area-group reveal"><span class="label muted">Victoria</span><div class="chips">${chips(SITE.areasVic)}</div></div>
      <div class="area-group reveal" data-d="1"><span class="label muted">New South Wales</span><div class="chips">${chips(SITE.areasNsw)}</div></div>
      <a class="link-u reveal" data-d="2" href="/areas/" style="margin-top:28px">See every town we cover ${ICON.arrNE.replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px;margin-left:4px"')}</a>
    </div>
    <div class="contact-card reveal" data-d="2">
      <span class="label">Get in touch</span>
      <h3 style="margin-top:12px">Ultraclean Swan Hill</h3>
      <div class="row">${ICON.phone}<div><b>Phone</b><a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a></div></div>
      <div class="row">${ICON.mail}<div><b>Email</b><a href="mailto:${SITE.email}">${SITE.email}</a></div></div>
      <div class="row">${ICON.pin}<div><b>Base</b><span>${SITE.address.locality} ${SITE.address.region} ${SITE.address.postcode}</span></div></div>
      <div class="row">${ICON.clock}<div><b>Hours</b><span>${SITE.hours}</span></div></div>
    </div>
  </div>
</section>

<section class="quote section" id="quote">
  <div class="wrap quote-grid">
    <div class="quote-copy reveal">
      <span class="label">Free quote</span>
      <h2>Get a fixed price for your job.</h2>
      <p class="lede">Tell us the property, the rooms and what needs doing. We will come back with a price the same business day.</p>
      <ul class="promise">
        <li>${ICON.tick}<span>Same-day reply, Monday to Saturday</span></li>
        <li>${ICON.tick}<span>Written fixed price — no hourly surprises</span></li>
        <li>${ICON.tick}<span>Bond clean receipts and insurance reports supplied</span></li>
        <li>${ICON.tick}<span>Prefer to talk? <a class="link-u" href="tel:${SITE.phoneTel}" style="color:var(--ink)">${SITE.phoneDisplay}</a></span></li>
      </ul>
    </div>
    <div class="reveal" data-d="1">${quoteForm()}</div>
  </div>
</section>

<section class="section" id="faq">
  <div class="wrap faq-grid">
    <div class="reveal"><span class="label">Questions</span><h2 style="margin-top:14px">Straight answers about cleaning in <span class="em">Swan Hill.</span></h2><p style="margin-top:20px;max-width:34ch">Something not covered? Call ${SITE.phoneDisplay} or send the form and we will answer it directly.</p></div>
    <div class="reveal" data-d="1">${faqBlock(HOME_FAQ)}</div>
  </div>
</section>
</main>
` + footer();
}

/* ---------- service page ---------- */
function heroVisual(s) {
  if (s.beforeAfter) {
    const [b, a] = s.beforeAfter;
    return `<div class="hero-side hero-ba fadeup d5">
      <figure><img src="${IMG[b]}" alt="Before - ${esc(s.short)} by Ultraclean Swan Hill" loading="lazy"><figcaption>Before</figcaption></figure>
      <figure><img src="${IMG[a]}" alt="After - ${esc(s.short)} by Ultraclean Swan Hill" loading="lazy"><figcaption class="after">After</figcaption></figure>
    </div>`;
  }
  return `<div class="hero-side hero-ba single fadeup d5">
      <figure><img src="${IMG[s.jobPhoto || s.img]}" alt="${esc(s.jobAlt || (s.short + ' - recent Ultraclean job in Swan Hill'))}" loading="lazy"><figcaption>${esc(s.jobCaption || 'Recent job')}</figcaption></figure>
    </div>`;
}
function jobGallery(s) {
  if (!s.gallery) return '';
  return `<h2>${esc(s.gallery.title)}</h2>
      <div class="job-gallery">${s.gallery.items.map((g) => `<figure style="flex:${g.ratio.toFixed(3)} 1 0"><img src="${IMG[g.img]}" alt="${esc(g.alt)}" loading="lazy" style="aspect-ratio:${g.ratio.toFixed(3)}"><figcaption>${esc(g.caption)}</figcaption></figure>`).join('')}</div>`;
}
function servicePage(s) {
  const body = s.body.map(([t, v]) => {
    if (t === 'h2') return `<h2>${esc(v)}</h2>`;
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'ul') return `<ul>${v.map((li) => `<li>${ICON.tick}<span>${esc(li)}</span></li>`).join('')}</ul>`;
    return '';
  }).join('\n');
  const related = s.related.map((r) => `<li><a href="/services/${r}/">${esc(bySlug[r].nav)} ${ICON.arrNE}</a></li>`).join('');
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', '@id': `${SITE.domain}/services/${s.slug}/#service`, name: s.nav, serviceType: s.nav, description: s.meta, url: `${SITE.domain}/services/${s.slug}/`, image: IMG[s.img], provider: { '@id': SITE.domain + '/#business' }, areaServed: SITE.areasAll.map((t) => ({ '@type': 'City', name: t })) },
    localBusiness(),
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE.domain + '/' }, { '@type': 'ListItem', position: 2, name: 'Services', item: SITE.domain + '/#services' }, { '@type': 'ListItem', position: 3, name: s.nav, item: `${SITE.domain}/services/${s.slug}/` }] },
    faqSchema(s.faq),
  ] };
  return head({ title: s.title, meta: s.meta, canonical: `/services/${s.slug}/`, ogImage: IMG[s.img], schema, preload: IMG[s.img] }) + nav(s.slug) + `
<main>
<section class="page-hero">
  <div class="hero-media"><img src="${IMG[s.img]}" alt="${esc(s.alt)}" fetchpriority="high" width="1600" height="900"></div>
  <div class="hero-scrim"></div>
  <div class="wrap hero-in">
    <div>
      <div class="crumbs fadeup d1"><a href="/">Home</a><span>/</span><a href="/#services">Services</a><span>/</span><span>${esc(s.nav)}</span></div>
      <h1 class="fadeup d2">${esc(s.h1)}</h1>
      <p class="lede fadeup d3">${esc(s.lede)}</p>
      <div class="hero-ctas fadeup d4" style="margin-top:30px">
        <a class="btn" href="#quote" data-open-quote>Get a free quote ${ICON.arr}</a>
        <a class="link-u" href="tel:${SITE.phoneTel}">Call ${SITE.phoneDisplay}</a>
      </div>
    </div>
    ${heroVisual(s)}
  </div>
</section>

<section class="section">
  <div class="wrap svc-body">
    <article class="prose reveal">${body}${jobGallery(s)}</article>
    <aside class="aside">
      ${s.pricing ? `<div class="card price reveal"><span class="label">Guide pricing</span><div class="price-row"><b>${s.pricing.from}</b><span>${esc(s.pricing.unit)}</span></div><p>${esc(s.pricing.note)}</p></div>` : ''}
      <div class="card reveal" data-d="1">
        <span class="label">Free quote</span>
        <h3 style="margin-top:10px">${esc(s.short)} — priced today</h3>
        <p>Send the rooms, seating positions or a photo and we will reply with a fixed price the same business day.</p>
        <a class="btn" href="#quote" data-open-quote>Get a free quote ${ICON.arr}</a>
        <a class="tel" href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a>
      </div>
      <div class="card reveal" data-d="2">
        <span class="label muted">Towns we cover for this</span>
        <div class="towns">${s.towns.map((t) => `<span>${t}</span>`).join('')}<span>+ all service areas</span></div>
      </div>
      <div class="card reveal" data-d="3">
        <span class="label muted">Often booked together</span>
        <ul class="related" style="margin-top:10px">${related}</ul>
      </div>
    </aside>
  </div>
</section>

<section class="section" style="padding-top:0" id="faq">
  <div class="wrap faq-grid">
    <div class="reveal"><span class="label">Questions</span><h2 style="margin-top:14px">${esc(s.nav)} <span class="em">FAQ</span></h2></div>
    <div class="reveal" data-d="1">${faqBlock(s.faq)}</div>
  </div>
</section>

<section class="quote section" id="quote">
  <div class="wrap quote-grid">
    <div class="quote-copy reveal">
      <span class="label">Free quote</span>
      <h2>Book ${esc(s.short.toLowerCase())} in ${s.towns[0]}.</h2>
      <p class="lede">Tell us the property and what needs doing. Fixed price back the same business day.</p>
      <ul class="promise">
        <li>${ICON.tick}<span>Same-day reply, Monday to Saturday</span></li>
        <li>${ICON.tick}<span>Written fixed price — no hourly surprises</span></li>
        <li>${ICON.tick}<span>Prefer to talk? <a class="link-u" href="tel:${SITE.phoneTel}" style="color:var(--ink)">${SITE.phoneDisplay}</a></span></li>
      </ul>
    </div>
    <div class="reveal" data-d="1">${quoteForm(s.nav)}</div>
  </div>
</section>
</main>
` + footer(s.nav);
}

/* ---------- thank you ---------- */
function thankYou() {
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Thank you', isPartOf: { '@id': SITE.domain + '/#business' } };
  return head({ title: 'Thanks — we have your request | Ultraclean Swan Hill', meta: 'Your quote request has been sent to Ultraclean Swan Hill. We reply the same business day.', canonical: '/thank-you/', ogImage: IMG.hero, schema, extra: '<meta name="robots" content="noindex, follow">' }) + nav('thanks') + `
<main>
<section class="thanks">
  <div class="hero-media"><img src="${IMG.macro}" alt="" style="opacity:.35"></div>
  <div class="hero-scrim"></div>
  <div style="position:relative;z-index:2;max-width:640px">
    <div class="tick">${ICON.tick}</div>
    <span class="label fadeup d1">Request received</span>
    <h1 class="fadeup d2" style="margin-top:14px">Thanks<span id="ty-name"></span>, your details have been sent.</h1>
    <p class="lede fadeup d3" style="max-width:48ch"><span id="ty-service">We have your request</span> and will come back with a fixed price the same business day — usually within a couple of hours. If it is urgent (an inspection tomorrow, guests arriving), call us now.</p>
    <div class="next fadeup d4">
      <a class="btn" href="tel:${SITE.phoneTel}">${ICON.phone} Call ${SITE.phoneDisplay}</a>
      <a class="btn ghost" href="/">Back to home</a>
    </div>
  </div>
</section>
<script>try{var l=JSON.parse(sessionStorage.getItem('uc_lead')||'{}');if(l.name){var f=l.name.trim().split(' ')[0];document.getElementById('ty-name').textContent=' '+f.replace(/[<>]/g,'');}if(l.service&&l.service.indexOf('Not sure')<0){document.getElementById('ty-service').textContent='We have your '+l.service.toLowerCase()+' request';}}catch(e){}</script>
</main>
` + footer();
}


/* ---------- about ---------- */
function crumbs(items) {
  return `<div class="crumbs fadeup d1"><a href="/">Home</a>${items.map((i) => `<span>/</span>${i[1] ? `<a href="${i[1]}">${esc(i[0])}</a>` : `<span>${esc(i[0])}</span>`}`).join('')}</div>`;
}
const breadcrumbSchema = (items) => ({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE.domain + '/' }, ...items.map((i, n) => ({ '@type': 'ListItem', position: n + 2, name: i[0], item: SITE.domain + i[2] }))] });

function aboutPage() {
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'AboutPage', '@id': SITE.domain + '/about/#page', url: SITE.domain + '/about/', name: 'About Ultraclean Swan Hill', about: { '@id': SITE.domain + '/#business' } },
    localBusiness(), breadcrumbSchema([['About', '/about/', '/about/']]), faqSchema(ABOUT_FAQ),
  ] };
  return head({ title: 'About Ultraclean Swan Hill | Local, Insured Cleaners', meta: 'Ultraclean Swan Hill is an owner-operated cleaning business based in Lake Boga, servicing Swan Hill, Kerang and 20 Murray River towns. Insured, local, truck-mounted equipment.', canonical: '/about/', ogImage: IMG.van, schema }) + nav('about') + `
<main>
<section class="page-hero">
  <div class="hero-media"><img src="${IMG.vanHero}" alt="Ultraclean Swan Hill branded cleaning van on a residential street" fetchpriority="high"></div>
  <div class="hero-scrim"></div>
  <div class="wrap hero-in">
    <div>
      ${crumbs([['About']])}
      <h1 class="fadeup d2">About Ultraclean Swan Hill — Local Cleaners Based in Lake Boga</h1>
      <p class="lede fadeup d3">An owner-operated cleaning business with over 10 years experience, covering Swan Hill and the surrounding towns on both sides of the river.</p>
      <div class="hero-ctas fadeup d4" style="margin-top:30px"><a class="btn" href="/contact/" data-open-quote>Get a free quote ${ICON.arr}</a><a class="link-u" href="tel:${SITE.phoneTel}">Call ${SITE.phoneDisplay}</a></div>
    </div>
    <div class="hero-side fadeup d5">
      <div class="stat-card"><span class="label">In one line</span><b>Over 10 years experience</b><p>Carpets, upholstery, tile and grout, windows, bond cleans, builders cleans and commercial contracts across Swan Hill &amp; surrounds.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap svc-body">
    <article class="prose reveal">
      <h2>Who we are</h2>
      <p><strong>Ultraclean Swan Hill</strong> is a locally owned cleaning business operating from Lake Boga VIC 3584, about 17 km south of Swan Hill, with over 10 years of experience in the cleaning industry in Swan Hill and surrounds. When you call ${SITE.phoneDisplay} you speak to the person who will quote the job and turn up to do it.</p>
      <p>The business started with carpet steam cleaning for homes and rentals around Swan Hill and Lake Boga. Customers kept asking whether we could do the lounge, the tiles, the windows and the whole house before an inspection — so the service list grew, and the run grew to twenty towns from Sea Lake to Balranald.</p>
      <h2>What we do</h2>
      <ul>${SERVICES.map((x) => `<li>${ICON.tick}<span><a href="/services/${x.slug}/" class="link-u">${esc(x.nav)}</a> — ${esc(x.blurb)}</span></li>`).join('')}</ul>
      <h2>Equipment that does the job properly</h2>
      <p>Results come down to gear as much as effort. Ultraclean runs truck-mounted hot-water extraction for carpets and upholstery (hotter water, stronger vacuum recovery, faster drying than portable units), a CRB counter-rotating brush that agitates the pre-spray deep into carpet fibres and lifts ground-in dirt, high-pressure turbo tools for tile and grout, water-fed poles for second-storey glass, and commercial air movers for fast drying. Everything travels in the van, so one visit covers the whole job.</p>
      <h2>Safe products, rural-ready</h2>
      <p>Many properties around Swan Hill and surrounds are on septic systems and tank water. We use low-residue, biodegradable products that are safe for kids, pets and septic tanks, and we rinse thoroughly so nothing sticky is left behind to attract dirt.</p>
      <h2>Insured, checked, accountable</h2>
      <p>Ultraclean carries public liability insurance and our operators are police checked. Property managers, builders and commercial clients can request certificates. If a job is not right, you call the same number and we come back and fix it.</p>
      <h2>Where we work</h2>
      <p>Victoria: ${SITE.areasVic.join(', ')}. New South Wales: ${SITE.areasNsw.join(', ')}. See the <a href="/areas/" class="link-u">service areas page</a> for details on each town. Travel to the further towns is shown in your quote.</p>
    </article>
    <aside class="aside">
      <div class="card reveal" data-d="1"><span class="label">Get in touch</span><h3 style="margin-top:10px">Talk to the person doing the work</h3><p>Fixed quote the same business day. No call centre.</p><a class="btn" href="/contact/" data-open-quote>Get a free quote ${ICON.arr}</a><a class="tel" href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a></div>
      <div class="card reveal" data-d="2"><span class="label muted">Quick facts</span>
        <ul class="related" style="margin-top:10px">
          <li><span style="color:var(--text-2)">Based</span> <span>Lake Boga VIC 3584</span></li>
          <li><span style="color:var(--text-2)">Hours</span> <span>${SITE.hours}</span></li>
          <li><span style="color:var(--text-2)">Experience</span> <span>Over 10 years</span></li>
          <li><span style="color:var(--text-2)">Coverage</span> <span>Swan Hill &amp; 19 surrounding towns</span></li>
          <li><span style="color:var(--text-2)">Insurance</span> <span>Public liability</span></li>
        </ul></div>
      <div class="card reveal" data-d="3"><span class="label muted">Explore</span><ul class="related" style="margin-top:10px"><li><a href="/areas/">Service areas ${ICON.arrNE}</a></li><li><a href="/contact/">Contact &amp; quote ${ICON.arrNE}</a></li><li><a href="/#services">All services ${ICON.arrNE}</a></li></ul></div>
    </aside>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="section-head"><div class="reveal"><span class="label">The fleet &amp; the gear</span><h2>Truck-mounted, sign-written, <span class="em">ready to go.</span></h2></div><p class="reveal" data-d="1">Everything travels in the van: the truck-mount extraction unit, rotary tile tool and air movers. One visit covers the whole job.</p></div>
    <div class="mosaic">
      <figure class="m1 reveal"><img src="${IMG.carpetScrub}" alt="Ultraclean rotary machine deep scrubbing a patterned carpet in a Swan Hill home" loading="lazy"><figcaption>Deep carpet scrub</figcaption></figure>
      <figure class="m2 reveal" data-d="1"><img src="${IMG.vanRear}" alt="Ultraclean van with rear doors open showing the truck-mount unit" loading="lazy"><figcaption>The van, set up</figcaption></figure>
      <figure class="m3 reveal" data-d="2"><img src="${IMG.rotary}" alt="Ultraclean rotary tile and carpet cleaning machine" loading="lazy"><figcaption>Rotary tile tool</figcaption></figure>
      <figure class="m4 reveal" data-d="1"><img src="${IMG.upholsteryTool}" alt="Ultraclean upholstery cleaning tool on a fabric couch" loading="lazy"><figcaption>Upholstery tool</figcaption></figure>
      <figure class="m5 reveal" data-d="2"><img src="${IMG.equipment}" alt="Ultraclean wand, air mover and dehumidifier" loading="lazy"><figcaption>Drying gear</figcaption></figure>
    </div>
  </div>
</section>

<section class="paper section">
  <div class="wrap">
    <div class="section-head"><div class="reveal"><span class="label">How we work</span><h2>Four steps, no surprises.</h2></div></div>
    <div class="steps">
      <div class="step reveal" style="border-top-color:var(--paper-line)"><span class="n">1</span><h3>Tell us the job</h3><p>Form or phone. Rooms, sizes, stains, dates.</p></div>
      <div class="step reveal" data-d="1" style="border-top-color:var(--paper-line)"><span class="n">2</span><h3>Fixed price back</h3><p>Written price for the whole job, same business day.</p></div>
      <div class="step reveal" data-d="2" style="border-top-color:var(--paper-line)"><span class="n">3</span><h3>We turn up on time</h3><p>Confirmed slot, text when on the way.</p></div>
      <div class="step reveal" data-d="3" style="border-top-color:var(--paper-line)"><span class="n">4</span><h3>Walk-through before we go</h3><p>Every room checked with you before we leave.</p></div>
    </div>
  </div>
</section>

<section class="section" id="faq">
  <div class="wrap faq-grid">
    <div class="reveal"><span class="label">Questions</span><h2 style="margin-top:14px">About <span class="em">Ultraclean</span></h2></div>
    <div class="reveal" data-d="1">${faqBlock(ABOUT_FAQ)}</div>
  </div>
</section>
${ctaStrip()}
</main>
` + footer();
}

/* ---------- contact ---------- */
function contactPage() {
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'ContactPage', '@id': SITE.domain + '/contact/#page', url: SITE.domain + '/contact/', name: 'Contact Ultraclean Swan Hill', about: { '@id': SITE.domain + '/#business' } },
    Object.assign(localBusiness(), { contactPoint: { '@type': 'ContactPoint', telephone: SITE.phoneTel, email: SITE.email, contactType: 'customer service', areaServed: 'AU', availableLanguage: 'en' } }),
    breadcrumbSchema([['Contact', '/contact/', '/contact/']]), faqSchema(CONTACT_FAQ),
  ] };
  return head({ title: 'Contact Ultraclean Swan Hill | Free Cleaning Quote', meta: 'Contact Ultraclean Swan Hill for a free fixed-price cleaning quote. Call 0417 327 173 or send the form — same business day reply. Based in Lake Boga, servicing Swan Hill, Kerang and the Murray.', canonical: '/contact/', ogImage: IMG.hero, schema }) + nav('contact') + `
<main>
<section class="contact-hero">
  <div class="hero-media"><img src="${IMG.hero}" alt="Lee from Ultraclean Swan Hill steam cleaning a lounge carpet" fetchpriority="high"></div>
  <div class="hero-scrim"></div>
  <div class="wrap contact-hero-in">
    <div class="contact-intro">
      ${crumbs([['Contact']])}
      <h1 class="fadeup d2">Contact Ultraclean Swan Hill for a Free Cleaning Quote</h1>
      <p class="lede fadeup d3">Send the form and get a fixed price back the same business day. Or call — you will speak to the person who does the work.</p>
      <div class="contact-rows fadeup d4">
        <a class="crow" href="tel:${SITE.phoneTel}">${ICON.phone}<span><b>Phone</b>${SITE.phoneDisplay}</span></a>
        <a class="crow" href="mailto:${SITE.email}">${ICON.mail}<span><b>Email</b>${SITE.email}</span></a>
        <div class="crow">${ICON.pin}<span><b>Base</b>${SITE.address.locality} ${SITE.address.region} ${SITE.address.postcode}</span></div>
        <div class="crow">${ICON.clock}<span><b>Hours</b>${SITE.hours}</span></div>
      </div>
    </div>
    <div class="contact-form fadeup d3">${quoteForm('', 'c')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap svc-body">
    <article class="prose reveal">
      <h2>Getting a quote from Ultraclean Swan Hill</h2>
      <p>Ultraclean Swan Hill provides free, fixed-price quotes for carpet cleaning, upholstery and rug cleaning, tile and grout cleaning, window cleaning, end of lease cleaning, and commercial and builders cleaning across Swan Hill and the surrounding towns. Quotes are answered the same business day, Monday to Saturday.</p>
      <h2>What to include</h2>
      <ul>
        <li>${ICON.tick}<span>The property address or town, so we can schedule you on the right run</span></li>
        <li>${ICON.tick}<span>Number of rooms or the areas to be cleaned, with rough sizes</span></li>
        <li>${ICON.tick}<span>Any stains, pet issues, water damage or problem areas</span></li>
        <li>${ICON.tick}<span>Deadlines — an inspection date, settlement or handover</span></li>
        <li>${ICON.tick}<span>Preferred days or times, including after hours for commercial premises</span></li>
      </ul>
      <h2>Property managers, builders and businesses</h2>
      <p>For vacate cleans between tenancies, builders cleans at handover and regular commercial contracts, email ${SITE.email} or call ${SITE.phoneDisplay} and ask for a site visit. We supply insurance certificates and bond clean receipts.</p>
      <h2>Where we are</h2>
      <p>Ultraclean operates from Lake Boga VIC 3584 — about 17 km south of Swan Hill on the Murray Valley Highway. We do not run a shopfront; all work is done at your property. See the full list of towns on the <a href="/areas/" class="link-u">service areas page</a>.</p>
    </article>
    <aside class="aside">
      <div class="card reveal" data-d="1"><span class="label">Urgent?</span><h3 style="margin-top:10px">Inspection tomorrow?</h3><p>Call now. For urgent jobs in Swan Hill and surrounds we will fit you in wherever we can.</p><a class="btn" href="tel:${SITE.phoneTel}">${ICON.phone} Call ${SITE.phoneDisplay}</a></div>
      <div class="card reveal" data-d="2"><span class="label muted">Find us</span><p style="margin-top:8px">${SITE.address.locality} ${SITE.address.region} ${SITE.address.postcode}</p><a class="link-u" style="margin-top:12px;display:inline-block" href="https://maps.google.com/?q=${encodeURIComponent(SITE.address.locality + ' ' + SITE.address.region + ' ' + SITE.address.postcode)}" target="_blank" rel="noopener">Open in Google Maps</a></div>
    </aside>
  </div>
</section>

<section class="section" style="padding-top:0" id="faq">
  <div class="wrap faq-grid">
    <div class="reveal"><span class="label">Questions</span><h2 style="margin-top:14px">Booking &amp; <span class="em">quotes</span></h2></div>
    <div class="reveal" data-d="1">${faqBlock(CONTACT_FAQ)}</div>
  </div>
</section>
</main>
` + footer();
}

/* ---------- areas ---------- */
function areasPage() {
  const vic = AREAS.filter((a) => a.state === 'VIC'), nsw = AREAS.filter((a) => a.state === 'NSW');
  const card = (a) => `<div class="area-card reveal"><div class="ac-head"><h3>${a.name}</h3><span class="ac-km">${a.km === 0 ? 'Home base' : a.state}</span></div><p>${esc(a.note)}</p><a class="link-u" href="/contact/" data-open-quote>Quote for ${a.name}</a></div>`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': SITE.domain + '/areas/#page', url: SITE.domain + '/areas/', name: 'Service Areas — Ultraclean Swan Hill', about: { '@id': SITE.domain + '/#business' } },
    localBusiness(),
    { '@type': 'ItemList', name: 'Towns serviced by Ultraclean Swan Hill', itemListElement: AREAS.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: `${a.name}, ${a.state}` })) },
    breadcrumbSchema([['Service areas', '/areas/', '/areas/']]), faqSchema(AREAS_FAQ),
  ] };
  return head({ title: 'Service Areas | Cleaners Swan Hill & Surrounds | Ultraclean', meta: 'Ultraclean services Swan Hill and 19 surrounding towns from Lake Boga: Kerang, Cohuna, Barham, Balranald, Nyah, Tooleybuc, Sea Lake and more. See every town we cover.', canonical: '/areas/', ogImage: IMG.carpet, schema }) + nav('areas') + `
<main>
<section class="page-hero">
  <div class="hero-media"><img src="${IMG.vanRear}" alt="Branded Ultraclean Swan Hill van on a job, rear doors open with cleaning hoses run inside" fetchpriority="high"></div>
  <div class="hero-scrim"></div>
  <div class="wrap hero-in">
    <div>
      ${crumbs([['Service areas']])}
      <h1 class="fadeup d2">Cleaners for Swan Hill &amp; All Surrounding Areas</h1>
      <p class="lede fadeup d3">Ultraclean travels from Lake Boga to every town on this page — Swan Hill first, then 19 towns around it across Victoria and New South Wales.</p>
      <div class="hero-ctas fadeup d4" style="margin-top:30px"><a class="btn" href="/contact/" data-open-quote>Get a free quote ${ICON.arr}</a><a class="link-u" href="tel:${SITE.phoneTel}">Call ${SITE.phoneDisplay}</a></div>
    </div>
    <div class="hero-side fadeup d5">
      <div class="stat-card"><span class="label">Coverage</span><b>Swan Hill &amp; surrounds</b><p>Further towns are grouped into scheduled runs; any travel is shown in your quote up front.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal"><span class="label">Victoria</span><h2>Swan Hill Rural City, Gannawarra &amp; Buloke.</h2></div>
      <p class="reveal" data-d="1">Ultraclean Swan Hill is based at Lake Boga and services these Victorian towns for carpet, upholstery, tile, window, bond and commercial cleaning.</p>
    </div>
    <div class="area-grid">${vic.map(card).join('')}</div>
  </div>
</section>

<section class="paper section">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal"><span class="label">New South Wales</span><h2>Across the Murray — Murray River, Balranald &amp; Wakool districts.</h2></div>
      <p class="reveal" data-d="1">The NSW side of the river is serviced on the same terms as Victoria. Property managers and holiday-home owners in Murray Downs and Tooleybuc are regular clients.</p>
    </div>
    <div class="area-grid">${nsw.map(card).join('')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><div class="reveal"><span class="label">Services in every town</span><h2>What we bring to <span class="em">each one.</span></h2></div></div>
    <div class="svc-list">${SERVICES.map((x, i) => `<a class="svc reveal" href="/services/${x.slug}/"><span class="n">0${i + 1}</span><h3>${esc(x.nav)}</h3><p>${esc(x.blurb)}</p><span class="go">${ICON.arrNE}</span></a>`).join('')}</div>
  </div>
</section>

<section class="section" style="padding-top:0" id="faq">
  <div class="wrap faq-grid">
    <div class="reveal"><span class="label">Questions</span><h2 style="margin-top:14px">Service area <span class="em">FAQ</span></h2></div>
    <div class="reveal" data-d="1">${faqBlock(AREAS_FAQ)}</div>
  </div>
</section>
${ctaStrip()}
</main>
` + footer();
}


/* ---------- blog ---------- */
const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
const postBySlug = Object.fromEntries(POSTS.map((p) => [p.slug, p]));
const wordCount = (p) => p.body.map(([t, v]) => Array.isArray(v) ? v.join(' ') : v).join(' ').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;

function postCard(p, d = 0) {
  return `<a class="post-card reveal" data-d="${d}" href="/blog/${p.slug}/">
    <div class="pc-img"><img src="${IMG[p.img]}" alt="${esc(p.alt)}" loading="lazy"></div>
    <div class="pc-body"><span class="label">${esc(p.category)} · ${p.readMins} min read</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><span class="link-u">Read the guide</span></div>
  </a>`;
}

function blogIndex() {
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Blog', '@id': SITE.domain + '/blog/#blog', url: SITE.domain + '/blog/', name: 'Ultraclean Swan Hill guides', publisher: { '@id': SITE.domain + '/#business' },
      blogPost: POSTS.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE.domain}/blog/${p.slug}/`, datePublished: p.date, image: IMG[p.img] })) },
    localBusiness(), breadcrumbSchema([['Blog', '/blog/', '/blog/']]),
  ] };
  return head({ title: 'Cleaning Guides for Swan Hill Homes & Renters | Ultraclean Blog', meta: 'Plain-English guides from Ultraclean Swan Hill: carpet cleaning costs and the end of lease checklist local agents use.', canonical: '/blog/', ogImage: IMG.carpet, schema }) + nav('blog') + `
<main>
<section class="page-hero" style="min-height:60svh">
  <div class="hero-media"><img src="${IMG.rug}" alt="Freshly cleaned patterned rug in a Swan Hill home" fetchpriority="high"></div>
  <div class="hero-scrim"></div>
  <div class="wrap hero-in">
    <div>
      ${crumbs([['Blog']])}
      <h1 class="fadeup d2">Cleaning guides for Swan Hill homes, renters &amp; landlords</h1>
      <p class="lede fadeup d3">Prices, checklists and what to do when something goes wrong — written for the Murray region, by the people who do the work.</p>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap"><div class="post-grid">${POSTS.map((p, i) => postCard(p, i)).join('')}</div></div>
</section>
${ctaStrip()}
</main>
` + footer();
}

function blogPost(p) {
  const body = p.body.map(([t, v]) => {
    if (t === 'h2') return `<h2>${esc(v)}</h2>`;
    if (t === 'h3') return `<h3>${esc(v)}</h3>`;
    if (t === 'p') return `<p>${v}</p>`;
    if (t === 'ul') return `<ul>${v.map((li) => `<li>${ICON.tick}<span>${li}</span></li>`).join('')}</ul>`;
    if (t === 'ol') return `<ol>${v.map((li) => `<li>${li}</li>`).join('')}</ol>`;
    return '';
  }).join('\n');
  const related = p.related.map((r) => postBySlug[r]).filter(Boolean);
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BlogPosting', '@id': `${SITE.domain}/blog/${p.slug}/#post`, headline: p.title, description: p.meta, image: IMG[p.img], datePublished: p.date, dateModified: p.date,
      author: { '@type': 'Organization', name: SITE.name, url: SITE.domain }, publisher: { '@id': SITE.domain + '/#business' },
      mainEntityOfPage: `${SITE.domain}/blog/${p.slug}/`, keywords: p.keyword, wordCount: wordCount(p), inLanguage: 'en-AU',
      about: { '@type': 'Place', name: 'Swan Hill, Victoria, Australia' } },
    localBusiness(), breadcrumbSchema([['Blog', '/blog/', '/blog/'], [p.title, `/blog/${p.slug}/`, `/blog/${p.slug}/`]]), faqSchema(p.faq),
  ] };
  return head({ title: p.metaTitle, meta: p.meta, canonical: `/blog/${p.slug}/`, ogImage: IMG[p.img], schema, extra: '<meta property="og:type" content="article">' }) + nav('blog') + `
<main>
<section class="page-hero" style="min-height:70svh">
  <div class="hero-media"><img src="${IMG[p.img]}" alt="${esc(p.alt)}" fetchpriority="high"></div>
  <div class="hero-scrim"></div>
  <div class="wrap hero-in">
    <div>
      ${crumbs([['Blog', '/blog/'], [p.category]])}
      <h1 class="fadeup d2" style="max-width:18ch;font-size:clamp(2.1rem,4.6vw,4rem)">${esc(p.title)}</h1>
      <p class="byline fadeup d3">By ${SITE.name} · ${fmtDate(p.date)} · ${p.readMins} min read</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap svc-body">
    <article class="prose post reveal">${body}
      <h2>Frequently asked questions</h2>
      ${faqBlock(p.faq)}
      <h2>Need it done? Ultraclean Swan Hill</h2>
      <p>Ultraclean Swan Hill is an owner-operated cleaning business based in Lake Boga, servicing Swan Hill and surrounds — Lake Boga, Kerang, Nyah, Murray Downs, Cohuna, Barham, Balranald, Sea Lake and the Murray River towns on both sides of the border. Over 10 years experience, fixed quotes, truck-mounted equipment, fully insured. Call <a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a> or <a href="/contact/">request a free quote</a> and hear back the same business day.</p>
    </article>
    <aside class="aside">
      <div class="card reveal" data-d="1"><span class="label">Free quote</span><h3 style="margin-top:10px">Fixed price, same business day</h3><p>Tell us the property and what needs doing.</p><a class="btn" href="/contact/" data-open-quote>Get a free quote ${ICON.arr}</a><a class="tel" href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a></div>
      <div class="card reveal" data-d="2"><span class="label muted">Related services</span><ul class="related" style="margin-top:10px">${SERVICES.filter((x) => p.body.some(([, v]) => String(v).includes(`/services/${x.slug}/`))).map((x) => `<li><a href="/services/${x.slug}/">${esc(x.nav)} ${ICON.arrNE}</a></li>`).join('')}</ul></div>
      <div class="card reveal" data-d="3"><span class="label muted">More guides</span><ul class="related" style="margin-top:10px">${related.map((r) => `<li><a href="/blog/${r.slug}/">${esc(r.title)} ${ICON.arrNE}</a></li>`).join('')}</ul></div>
    </aside>
  </div>
</section>
${ctaStrip()}
</main>
` + footer();
}

/* ---------- write ---------- */
function write(rel, content) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (rel.endsWith('.html')) content = optimizeImages(content);
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

write('index.html', home());
SERVICES.forEach((s) => write(`services/${s.slug}/index.html`, servicePage(s)));
write('thank-you/index.html', thankYou());
write('about/index.html', aboutPage());
write('contact/index.html', contactPage());
write('areas/index.html', areasPage());
write('blog/index.html', blogIndex());
POSTS.forEach((p) => write(`blog/${p.slug}/index.html`, blogPost(p)));

const urls = ['/', ...SERVICES.map((s) => `/services/${s.slug}/`), '/about/', '/areas/', '/contact/', '/blog/', ...POSTS.map((p) => `/blog/${p.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE.domain}${u}</loc><changefreq>monthly</changefreq><priority>${u === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /thank-you/\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
