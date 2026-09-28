/* Ultraclean Swan Hill — interactions */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* nav frost + parallax on scroll (rAF throttled) */
  const nav = $('.nav');
  const heroMedia = $('.hero-media > video, .hero-media > img');
  const bands = $$('.band img');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (nav) nav.classList.toggle('frost', y > 40);
      if (!reduce) {
        if (heroMedia) heroMedia.style.transform = 'translate3d(0,' + y * 0.28 + 'px,0)';
        bands.forEach((img) => {
          const r = img.parentElement.getBoundingClientRect();
          const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
          img.style.transform = 'translate3d(0,' + p * -60 + 'px,0)';
        });
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  const burger = $('.burger');
  const menu = $('.mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', () => {
      menu.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow = '';
    }));
  }

  /* reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.05, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));
  /* safety net: anything already scrolled past gets revealed */
  window.addEventListener('scroll', () => {
    $$('.reveal:not(.in)').forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add('in'); });
  }, { passive: true });

  /* custom cursor */
  if (!touch && !reduce) {
    const dot = document.createElement('div'); dot.className = 'cur';
    const ring = document.createElement('div'); ring.className = 'cur-ring';
    document.body.append(dot, ring);
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px)'; });
    (function loop() { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.transform = 'translate(' + (rx - 17) + 'px,' + (ry - 17) + 'px)'; requestAnimationFrame(loop); })();
    $$('a, button, summary, .svc').forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
    });
  }

  /* only one FAQ open at a time */
  $$('.faq details').forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) $$('.faq details').forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* hero video: fall back to poster if it can't play */
  const vid = $('.hero-media video');
  if (vid) {
    const p = vid.play && vid.play();
    if (p && p.catch) p.catch(() => { vid.style.display = 'none'; });
  }

  /* quote modal */
  const modal = $('#quote-modal');
  if (modal) {
    let lastFocus = null;
    const open = (e) => {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add('open'));
      document.body.classList.add('modal-open');
      if (menu && menu.classList.contains('open')) { menu.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow = ''; }
      setTimeout(() => { const f = modal.querySelector('input'); if (f) f.focus(); }, 350);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'quote_modal_open' });
    };
    const close = () => {
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      setTimeout(() => { modal.hidden = true; }, 400);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    $$('[data-open-quote]').forEach((el) => el.addEventListener('click', open));
    $$('[data-close-quote]', modal).forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
    if (location.hash === '#book') open();
  }

  /* quote form — the GHL external-tracking script captures the submit event
     (we don't stop propagation); then we send the visitor to the thank-you page */
  $$('form.quote-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (form.querySelector('.hp input') && form.querySelector('.hp input').value) return; // honeypot
      if (!form.reportValidity()) return;
      const btn = form.querySelector('button[type=submit]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        sessionStorage.setItem('uc_lead', JSON.stringify({ name: data.full_name, service: data.service_needed }));
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'quote_form_submit', form_id: form.id || 'quote', service: data.service_needed });
      } catch (err) { /* ignore */ }
      setTimeout(() => { window.location.href = form.dataset.redirect || '/thank-you/'; }, 700);
    });
  });

  /* phone click tracking hook */
  $$('a[href^="tel:"]').forEach((a) => a.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'phone_click', href: a.getAttribute('href') });
  }));
})();
