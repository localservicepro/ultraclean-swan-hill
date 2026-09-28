#!/usr/bin/env node
// Static site generator for Ultraclean Swan Hill. Run: node build/build.js
const fs = require('fs');
const path = require('path');
const { SITE, IMG, SERVICES, HOME_FAQ } = require('./data');

const ROOT = path.join(__dirname, '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = (s) => String(s).replace(/<[^>]+>/g, '');
const bySlug = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));

/* ---------- brand mark ---------- */
// Ultraclean mark: a "U" formed by a rising water droplet with a clean sparkle. Works on dark and light.
const MARK = (size = 40) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="2" y="2" width="60" height="60" rx="18" fill="#23c4d4"/>
  <path d="M20 17v18a12 12 0 0 0 24 0V17" stroke="#0b1a2a" stroke-width="7" stroke-linecap="round"/>
  <path d="M32 44c0-6 5-9 5-13 0-3-2.2-5-5-5s-5 2-5 5c0 4 5 7 5 13Z" fill="#f6f4ef"/>
  <path d="M48 12l1.4 3.6L53 17l-3.6 1.4L48 22l-1.4-3.6L43 17l3.6-1.4Z" fill="#f6f4ef"/>
</svg>`;
const LOGO = (light = true) => `<a class="logo" href="/" aria-label="${SITE.name} home">${MARK(40)}<span class="wm"><b>ultraclean</b><small>Swan Hill</small></span></a>`;

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
function head({ title, meta, canonical, ogImage, schema, extra = '' }) {
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
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,40;1,9..144,300..700,40&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<!-- GHL / LeadConnector form-submission tracking -->
<script src="https://link.msgsndr.com/js/external-tracking.js" data-tracking-id="${SITE.trackingId}"></script>
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
        <li><a href="/#about">About</a></li>
        <li><a href="/#areas">Areas</a></li>
        <li><a href="/#quote">Contact</a></li>
      </ul>
    </nav>
    <div class="nav-cta">
      <a class="nav-phone" href="tel:${SITE.phoneTel}">${ICON.phone}${SITE.phoneDisplay}</a>
      <a class="btn" href="/#quote" data-open-quote>Get a free quote ${ICON.arr}</a>
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false"><i></i><i></i><i></i></button>
    </div>
  </div>
</header>
<div class="mobile-menu" id="mobile-menu">
  <a class="big" href="/">Home</a>
  <a class="big" href="/#services">Services</a>
  <div class="sub">${mob}</div>
  <a class="big" href="/#about">About</a>
  <a class="big" href="/#areas">Service areas</a>
  <a class="big" href="/#quote">Contact</a>
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
      <div>${LOGO()}<p>Carpet, upholstery, tile, window, bond and commercial cleaning for Swan Hill, Lake Boga, Kerang and the Murray River towns — Victorian and NSW sides.</p></div>
      <div><h4>Services</h4><ul>${svc}</ul></div>
      <div><h4>Explore</h4><ul><li><a href="/">Home</a></li><li><a href="/#about">About</a></li><li><a href="/#areas">Service areas</a></li><li><a href="/#faq">FAQ</a></li><li><a href="/#quote">Get a quote</a></li></ul></div>
      <div><h4>Contact</h4><ul>
        <li><a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li><a href="https://maps.google.com/?q=${encodeURIComponent(SITE.address.street + ', ' + SITE.address.locality + ' ' + SITE.address.region + ' ' + SITE.address.postcode)}" target="_blank" rel="noopener">${SITE.address.street}, ${SITE.address.locality} ${SITE.address.region} ${SITE.address.postcode}</a></li>
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
  return `<form class="form quote-form" id="${pre === 'f' ? 'quote-form' : 'quote-form-modal'}" method="post" action="/thank-you/" data-redirect="/thank-you/" novalidate>
  <div class="grid">
    <div class="field"><label for="${pre}-name">Name</label><input id="${pre}-name" name="full_name" type="text" autocomplete="name" placeholder="Your name" required></div>
    <div class="field"><label for="${pre}-phone">Phone</label><input id="${pre}-phone" name="phone" type="tel" autocomplete="tel" placeholder="04xx xxx xxx" required></div>
    <div class="field full f-email"><label for="${pre}-email">Email</label><input id="${pre}-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required></div>
    <div class="field full f-address"><label for="${pre}-address">Property address</label><input id="${pre}-address" name="property_address" type="text" autocomplete="street-address" placeholder="Street, town" required></div>
    <div class="field"><label for="${pre}-size">Property size</label><select id="${pre}-size" name="property_size" required>
      <option value="" disabled selected>Select…</option>
      <option>1–2 bedrooms / small office</option>
      <option>3 bedrooms</option>
      <option>4+ bedrooms</option>
      <option>Single room or item</option>
      <option>Commercial premises</option>
    </select></div>
    <div class="field"><label for="${pre}-service">Service needed</label><select id="${pre}-service" name="service_needed" required>
      ${defaultService ? '' : '<option value="" disabled selected>Select…</option>'}${opts}
      <option>Not sure / multiple</option>
    </select></div>
    <div class="field full"><label for="${pre}-notes">Job notes</label><textarea id="${pre}-notes" name="job_notes" placeholder="Rooms, stains, dates, anything we should know"></textarea></div>
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
  image: IMG.hero, logo: SITE.domain + '/assets/img/logo.svg', priceRange: '$$',
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
    meta: 'Carpet cleaning Swan Hill locals trust. Ultraclean cleans carpets, upholstery, tiles and bond cleans from Lake Boga to Kerang. Book your free quote today.',
    canonical: '/', ogImage: IMG.hero, schema,
  }) + nav('home') + `
<main>
<section class="hero">
  <div class="hero-media">
    <video autoplay muted loop playsinline preload="metadata" poster="${IMG.hero}" aria-hidden="true"><source src="${IMG.heroVideo}" type="video/mp4"></video>
  </div>
  <div class="hero-scrim"></div>
  <div class="wrap hero-in">
    <div>
      <span class="label fadeup d1">Lake Boga · Swan Hill · Kerang · the Murray</span>
      <h1 class="fadeup d2">Professional Carpet Cleaning in Swan Hill, Lake Boga <span class="em">&amp;</span> Kerang</h1>
      <p class="lede fadeup d3">Carpet cleaning Swan Hill homes and businesses can rely on — plus upholstery, tile and grout, windows, bond cleans, commercial cleaning and flood drying. One local team, every town along the river.</p>
      <div class="hero-ctas fadeup d4">
        <a class="btn" href="#quote" data-open-quote>Get a free quote ${ICON.arr}</a>
        <a class="link-u" href="tel:${SITE.phoneTel}">Call ${SITE.phoneDisplay}</a>
      </div>
    </div>
    <div class="hero-side fadeup d5">
      <div class="stat-card"><span class="label">Local &amp; insured</span><b>Based in Lake Boga</b><p>Owner-operated. The person who quotes is the person who turns up.</p></div>
      <div class="stat-card"><span class="label">Dry in hours</span><b>Truck-mounted steam</b><p>Hot-water extraction with strong recovery — no sticky residue, no soggy carpet.</p></div>
    </div>
  </div>
  <div class="scroll-hint"><i></i>Scroll</div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${marquee}${marquee}</div></div>

<section class="intro">
  <div class="wrap intro-grid">
    <p class="statement reveal">Nine services, twenty towns, <span class="em">one local number.</span> Carpet cleaning in Swan Hill done the way you would do it yourself if you had the gear.</p>
    <div class="intro-copy reveal" data-d="1">
      <p><strong>Ultraclean Swan Hill</strong> is a locally owned cleaning business based at Lake Boga, covering Swan Hill, Kerang, Nyah, Murray Downs and the Murray River towns on both sides of the border. We started with carpet steam cleaning and grew into everything a home, rental or workplace needs kept clean: upholstery and rugs, tile and grout, windows, builders cleans, bond cleans, regular commercial contracts and emergency flood drying.</p>
      <p>No franchise, no call centre. You get a fixed quote, a confirmed time, and a job that is finished properly before we leave.</p>
      <ul class="points">
        <li>${ICON.tick}<span>Fixed quotes before we start — the price you are told is the price you pay</span></li>
        <li>${ICON.tick}<span>Professional truck-mounted equipment and safe, low-residue products</span></li>
        <li>${ICON.tick}<span>Fully insured, police-checked, and happy to work around tenants and trading hours</span></li>
        <li>${ICON.tick}<span>No travel surcharge anywhere in our service area</span></li>
      </ul>
    </div>
  </div>
</section>

<section class="services section" id="services">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal"><span class="label">What we do</span><h2>Every cleaning job a Swan Hill home or business <span class="em">actually needs.</span></h2></div>
      <p class="reveal" data-d="1">Each service has its own page with what is included, how long it takes and what it costs to get a quote. Carpets are where we started; the rest is what customers kept asking for.</p>
    </div>
    <div class="svc-list">${svcList}</div>
  </div>
</section>

<section class="band" aria-label="Clean carpet fibre close-up">
  <img src="${IMG.macro}" alt="Carpet cleaning Swan Hill - freshly steam cleaned carpet fibres up close after an Ultraclean service" loading="lazy">
  <div class="band-txt"><p class="reveal">Clean means the fibre, the backing and the underlay — not just the top you can see.</p></div>
</section>

<section class="paper section" id="about">
  <div class="wrap about-grid">
    <div class="about-media reveal">
      <div class="main"><img src="${IMG.van}" alt="Ultraclean Swan Hill cleaning van parked on the Lake Boga foreshore at sunset" loading="lazy"></div>
      <div class="float"><img src="${IMG.steps}" alt="Ultraclean technician carrying a carpet cleaning machine up the steps of a Swan Hill home" loading="lazy"></div>
    </div>
    <div class="about-copy reveal" data-d="1">
      <span class="label">About Ultraclean</span>
      <h2>A new name on the van, the same local hands doing the work.</h2>
      <p>Ultraclean Swan Hill is run from Lake Boga, ten minutes down the Murray Valley Highway from Swan Hill. We are not a franchise and we are not a booking platform — when you call, you talk to the person who will be cleaning your carpets, and who has probably already been to your street.</p>
      <p>We invest in the equipment that makes the difference: truck-mounted hot-water extraction, high-pressure tile turbo tools, commercial air movers and dehumidifiers for water damage, and water-fed poles for windows. The products we use are safe for kids, pets and septic systems, which matters out here.</p>
      <div class="facts">
        <div><b>Lake Boga</b><span>Home base, 529 Lakeside Drive</span></div>
        <div><b>20 towns</b><span>VIC and NSW sides of the Murray</span></div>
        <div><b>9 services</b><span>Carpets through to flood drying</span></div>
        <div><b>Fully insured</b><span>Public liability and police checked</span></div>
      </div>
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
      <div class="step reveal" data-d="2"><span class="n">3</span><h3>We turn up on time</h3><p>Confirmed time slot, text when we are on the way, gear on the truck for the whole job.</p></div>
      <div class="step reveal" data-d="3"><span class="n">4</span><h3>Walk-through before we go</h3><p>We check every room with you. If something is not right, we fix it then and there.</p></div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="section-head">
      <div class="reveal"><span class="label">On the job</span><h2>What a proper clean <span class="em">looks like.</span></h2></div>
    </div>
    <div class="mosaic">
      <figure class="m1 reveal"><img src="${IMG.carpet}" alt="Carpet cleaning Swan Hill - clean stripe of steam cleaned carpet next to soiled carpet" loading="lazy"><figcaption>Carpet steam clean</figcaption></figure>
      <figure class="m2 reveal" data-d="1"><img src="${IMG.tile}" alt="Tile and grout cleaning Swan Hill - grout lines restored to white" loading="lazy"><figcaption>Tile &amp; grout</figcaption></figure>
      <figure class="m3 reveal" data-d="2"><img src="${IMG.bond}" alt="End of lease cleaning Swan Hill - spotless rental kitchen ready for inspection" loading="lazy"><figcaption>Bond clean</figcaption></figure>
      <figure class="m4 reveal" data-d="1"><img src="${IMG.upholstery}" alt="Upholstery cleaning Swan Hill - linen sofa being steam cleaned" loading="lazy"><figcaption>Upholstery</figcaption></figure>
      <figure class="m5 reveal" data-d="2"><img src="${IMG.window}" alt="Window cleaning Swan Hill - shopfront glass being squeegeed" loading="lazy"><figcaption>Windows</figcaption></figure>
    </div>
  </div>
</section>

<section class="areas section" id="areas">
  <div class="ghost" aria-hidden="true">Murray</div>
  <div class="wrap areas-grid">
    <div>
      <div class="section-head" style="grid-template-columns:1fr;margin-bottom:36px">
        <div class="reveal"><span class="label">Service areas</span><h2>Both sides of the river, <span class="em">no travel surcharge.</span></h2></div>
        <p class="reveal" data-d="1">Ultraclean is based in Lake Boga and services twenty towns across the Swan Hill Rural City, Gannawarra and Buloke shires in Victoria, and the Murray River, Balranald and Wakool districts in New South Wales.</p>
      </div>
      <div class="area-group reveal"><span class="label muted">Victoria</span><div class="chips">${chips(SITE.areasVic)}</div></div>
      <div class="area-group reveal" data-d="1"><span class="label muted">New South Wales</span><div class="chips">${chips(SITE.areasNsw)}</div></div>
    </div>
    <div class="contact-card reveal" data-d="2">
      <span class="label">Get in touch</span>
      <h3 style="margin-top:12px">Ultraclean Swan Hill</h3>
      <div class="row">${ICON.phone}<div><b>Phone</b><a href="tel:${SITE.phoneTel}">${SITE.phoneDisplay}</a></div></div>
      <div class="row">${ICON.mail}<div><b>Email</b><a href="mailto:${SITE.email}">${SITE.email}</a></div></div>
      <div class="row">${ICON.pin}<div><b>Base</b><span>${SITE.address.street}, ${SITE.address.locality} ${SITE.address.region} ${SITE.address.postcode}</span></div></div>
      <div class="row">${ICON.clock}<div><b>Hours</b><span>${SITE.hours}<br>Emergency flood drying by arrangement</span></div></div>
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
  return head({ title: s.title, meta: s.meta, canonical: `/services/${s.slug}/`, ogImage: IMG[s.img], schema }) + nav(s.slug) + `
<main>
<section class="page-hero">
  <div class="hero-media"><img src="${IMG[s.img]}" alt="${esc(s.alt)}" fetchpriority="high"></div>
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
    <div class="hero-side fadeup d5">
      <div class="stat-card"><span class="label">Who it is for</span><b>${esc(s.audience)}</b><p>Serving ${s.towns.slice(0, 3).join(', ')} and every town in our service area.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap svc-body">
    <article class="prose reveal">${body}</article>
    <aside class="aside">
      <div class="card reveal" data-d="1">
        <span class="label">Free quote</span>
        <h3 style="margin-top:10px">${esc(s.short)} — priced today</h3>
        <p>Send the rooms and rough sizes and we will reply with a fixed price the same business day.</p>
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
    <p class="lede fadeup d3" style="max-width:48ch"><span id="ty-service">We have your request</span> and will come back with a fixed price the same business day — usually within a couple of hours. If it is urgent (flooding, an inspection tomorrow), call us now.</p>
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

/* ---------- write ---------- */
function write(rel, content) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

write('index.html', home());
SERVICES.forEach((s) => write(`services/${s.slug}/index.html`, servicePage(s)));
write('thank-you/index.html', thankYou());
write('assets/img/logo.svg', MARK(64).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ''));
write('assets/img/favicon.svg', MARK(64).replace(' aria-hidden="true"', ''));
write('assets/img/logo-lockup.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="80" viewBox="0 0 420 80">
  <g transform="translate(8 8)">${MARK(64).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
  <text x="90" y="46" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="38" letter-spacing="-1" fill="#f6f4ef">ultraclean</text>
  <text x="92" y="66" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="4" fill="#23c4d4">SWAN HILL</text>
</svg>`);
write('assets/img/logo-lockup-dark.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="80" viewBox="0 0 420 80">
  <g transform="translate(8 8)">${MARK(64).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
  <text x="90" y="46" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="38" letter-spacing="-1" fill="#0b1a2a">ultraclean</text>
  <text x="92" y="66" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="4" fill="#0e9aa8">SWAN HILL</text>
</svg>`);

const urls = ['/', ...SERVICES.map((s) => `/services/${s.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE.domain}${u}</loc><changefreq>monthly</changefreq><priority>${u === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /thank-you/\n\nSitemap: ${SITE.domain}/sitemap.xml\n`);
