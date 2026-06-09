/* ══════════════════════════
   SHARED NAV TEMPLATE
   (inline string, used by JS)
══════════════════════════ */

/* ────────────────────────────────────
   Navigation injection
──────────────────────────────────── */
(function () {
  const NAV_HTML = `
<nav id="mainNav">
  <div class="nav-top-strip">
    <div class="nav-top-links">
      <a href="index.html">🏠 Home</a>
      <a href="about.html">About</a>
      <a href="services.html">Services</a>
      <a href="ire.html">IRE 2026</a>
      <a href="trade.html">Trade</a>
      <a href="tenders.html">Tenders</a>
      <a href="contact.html">Contact</a>
    </div>
  </div>
  <div class="nav-bottom-row">
    <a class="nav-logo" href="index.html">
      <div class="logo-mark">
        <svg viewBox="0 0 86 52" xmlns="http://www.w3.org/2000/svg">
          <rect width="86" height="52" rx="11" fill="#1A3A1A"/>
          <rect width="86" height="52" rx="11" fill="none" stroke="rgba(184,115,51,0.45)" stroke-width="1.2"/>
          <text x="2"  y="30" font-family="Georgia,serif" font-size="17" font-weight="800" fill="#C9A84C">W</text>
          <text x="16" y="30" font-family="Georgia,serif" font-size="17" font-weight="800" fill="#B87333">IN</text>
          <text x="3"  y="41" font-family="Arial,sans-serif" font-size="6.5" font-weight="400" fill="rgba(201,168,76,0.65)" letter-spacing="1.5">DHAN</text>
          <line x1="34" y1="9" x2="34" y2="43" stroke="rgba(184,115,51,0.35)" stroke-width="1"/>
          <text x="36" y="39" font-family="Georgia,serif" font-size="28" font-weight="800" fill="#B87333">D</text>
          <circle cx="55" cy="24" r="4" fill="#C9A84C"/>
          <circle cx="55" cy="24" r="2.2" fill="#B87333"/>
          <text x="57" y="39" font-family="Georgia,serif" font-size="28" font-weight="800" fill="#C9A84C">E</text>
        </svg>
      </div>
      <div class="logo-text">
        <div class="brand">Dhan Enterprise</div>
        <div class="tagline">Encompassing Energy Revolution</div>
      </div>
    </a>
    <div class="nav-links">
      <a href="index.html" data-page="index">Home</a>
      <div class="nav-group">
        <span class="nav-btn" data-page="about">About ▾</span>
        <div class="nav-dropdown">
          <a href="about.html#story"><span class="ico">📖</span> Our Story</a>
          <a href="about.html#rnd"><span class="ico">🔬</span> R&amp;D</a>
          <a href="about.html#academics"><span class="ico">🎓</span> Academics</a>
          <a href="about.html#careers"><span class="ico">💼</span> Careers</a>
        </div>
      </div>
      <a href="services.html" data-page="services">Services</a>
      <div class="nav-group">
        <span class="nav-btn" data-page="ire">IRE 2026 ▾</span>
        <div class="nav-dropdown">
          <a href="ire.html#expo"><span class="ico">🏛️</span> Expo Details</a>
          <a href="ire.html#sponsors"><span class="ico">⭐</span> Sponsorship</a>
          <a href="ire.html#stalls"><span class="ico">🏪</span> Book a Stall</a>
          <a href="ire.html#gallery"><span class="ico">🖼️</span> Gallery</a>
        </div>
      </div>
      <div class="nav-group">
        <span class="nav-btn" data-page="trade">Trade ▾</span>
        <div class="nav-dropdown">
          <a href="trade.html#export-import"><span class="ico">🚢</span> Export &amp; Import</a>
          <a href="trade.html#directory"><span class="ico">📂</span> Trade Directory</a>
          <a href="trade.html#indian"><span class="ico">🇮🇳</span> Indian Companies</a>
          <a href="trade.html#international"><span class="ico">🌐</span> International</a>
        </div>
      </div>
      <a href="tenders.html" data-page="tenders">Tenders</a>
      <a href="contact.html" class="nav-cta" data-page="contact">Contact Us</a>
    </div>
  </div>
</nav>`;

  const FOOTER_HTML = `
<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="logo-mark" style="width:80px;height:48px;margin-bottom:0.9rem;">
        <svg viewBox="0 0 86 52" xmlns="http://www.w3.org/2000/svg" width="80" height="48">
          <rect width="86" height="52" rx="11" fill="#1A3A1A"/>
          <rect width="86" height="52" rx="11" fill="none" stroke="rgba(184,115,51,0.45)" stroke-width="1.2"/>
          <text x="2" y="30" font-family="Georgia,serif" font-size="17" font-weight="800" fill="#C9A84C">W</text>
          <text x="16" y="30" font-family="Georgia,serif" font-size="17" font-weight="800" fill="#B87333">IN</text>
          <text x="3" y="41" font-family="Arial,sans-serif" font-size="6.5" fill="rgba(201,168,76,0.65)" letter-spacing="1.5">DHAN</text>
          <line x1="34" y1="9" x2="34" y2="43" stroke="rgba(184,115,51,0.35)" stroke-width="1"/>
          <text x="36" y="39" font-family="Georgia,serif" font-size="28" font-weight="800" fill="#B87333">D</text>
          <circle cx="55" cy="24" r="4" fill="#C9A84C"/>
          <circle cx="55" cy="24" r="2.2" fill="#B87333"/>
          <text x="57" y="39" font-family="Georgia,serif" font-size="28" font-weight="800" fill="#C9A84C">E</text>
        </svg>
      </div>
      <p>Dhan Enterprise — Encompassing Energy Revolution.<br>10+ years of renewable energy expertise from Hyderabad, India.</p>
    </div>
    <div class="footer-col">
      <h5>Services</h5>
      <a href="services.html">EV Consulting</a>
      <a href="services.html">Solar Energy</a>
      <a href="services.html">BESS &amp; Storage</a>
      <a href="services.html">Wind Energy</a>
      <a href="trade.html">Import / Export</a>
    </div>
    <div class="footer-col">
      <h5>IRE 2026</h5>
      <a href="ire.html">About IRE</a>
      <a href="ire.html#stalls">Book a Stall</a>
      <a href="ire.html#sponsors">Sponsorship</a>
      <a href="tenders.html">Gov Tenders</a>
      <a href="contact.html">Register</a>
    </div>
    <div class="footer-col">
      <h5>Contact</h5>
      <a href="tel:9849446409">9849446409</a>
      <a href="tel:8331976555">8331976555</a>
      <a href="mailto:hari@win-dhan.in">hari@win-dhan.in</a>
      <a href="https://www.win-dhan.com" target="_blank">www.win-dhan.com</a>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2026 Dhan Enterprise. Co-organizer: Suprabha Trust. All rights reserved.</p>
    <p style="color:var(--copper-lt);">Hyderabad · India</p>
  </div>
</footer>`;

  // Inject nav
  const navTarget = document.getElementById('nav-placeholder');
  if (navTarget) navTarget.outerHTML = NAV_HTML;

  // Inject footer
  const footerTarget = document.getElementById('footer-placeholder');
  if (footerTarget) footerTarget.outerHTML = FOOTER_HTML;

  // Mark active nav link
  const page = document.body.dataset.page || '';
  document.querySelectorAll('.nav-links a[data-page], .nav-btn[data-page]').forEach(el => {
    if (el.dataset.page === page) el.classList.add('active');
  });
  document.querySelectorAll('.nav-top-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes(page + '.html') || (page === 'index' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Scroll shadow
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  });
})();

/* ────────────────────────────────────
   Countdown timer (shared)
──────────────────────────────────── */
function startCountdown(containerId) {
  const target = new Date('2026-07-03T09:00:00');
  const ids = { days: 'cd-days', hrs: 'cd-hrs', min: 'cd-min', sec: 'cd-sec' };

  function tick() {
    const diff = target - new Date();
    if (diff <= 0) {
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = '<div style="color:var(--gold-lt);font-size:1.1rem;padding:1rem;">🎉 Event is Live!</div>';
      return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2, '0'); };
    set(ids.days, d); set(ids.hrs, h); set(ids.min, m); set(ids.sec, s);
  }
  tick();
  setInterval(tick, 1000);
}

/* ────────────────────────────────────
   Contact form validation (shared)
──────────────────────────────────── */
function validateContactForm(event) {
  event.preventDefault();
  const nameInput  = document.getElementById('contactName');
  const phoneInput = document.getElementById('contactPhone');
  const emailInput = document.getElementById('contactEmail');
  const enquiryEl  = document.getElementById('contactEnquiry');
  const msgEl      = document.getElementById('contactMessage');

  document.querySelectorAll('.form-group .err').forEach(e => e.remove());
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
    el.style.borderColor = ''; el.style.boxShadow = '';
  });

  let valid = true;
  function err(el, msg) {
    valid = false;
    el.style.borderColor = '#c0392b';
    el.style.boxShadow = '0 0 0 3px rgba(192,57,43,0.1)';
    const d = document.createElement('div');
    d.className = 'err';
    d.style.cssText = 'color:#c0392b;font-size:.75rem;font-weight:700;margin-top:.25rem;';
    d.textContent = msg;
    el.parentNode.appendChild(d);
  }

  if (!nameInput?.value.trim()) err(nameInput, 'Full Name is required');
  const ph = /^\+?(\d{2})?[-. ]?([6-9]\d{9})$/;
  if (!phoneInput?.value.trim()) err(phoneInput, 'Phone number is required');
  else if (!ph.test(phoneInput.value.trim())) err(phoneInput, 'Enter a valid 10-digit mobile number');
  const em = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput?.value.trim()) err(emailInput, 'Email is required');
  else if (!em.test(emailInput.value.trim())) err(emailInput, 'Enter a valid email address');
  if (enquiryEl?.value === 'Select enquiry type') err(enquiryEl, 'Please select an enquiry type');
  if (!msgEl?.value.trim()) err(msgEl, 'Message is required');
  else if (msgEl.value.trim().length < 10) err(msgEl, 'Message must be at least 10 characters');

  if (valid) {
    const form = event.target;
    const s = document.createElement('div');
    s.style.cssText = 'background:#d4edda;color:#155724;border:1px solid #c3e6cb;padding:1rem;border-radius:10px;margin-bottom:1rem;font-size:.9rem;font-weight:700;';
    s.textContent = '🎉 Thank you! Your message has been sent. We will get back to you shortly.';
    form.parentNode.insertBefore(s, form);
    form.reset();
    setTimeout(() => s.remove(), 5000);
  }
  return false;
}

/* ────────────────────────────────────
   Tender filter pills
──────────────────────────────────── */
function initTenderFilter() {
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.cat || 'all';
      document.querySelectorAll('.tender-row').forEach(row => {
        row.style.display = (cat === 'all' || row.dataset.cat === cat) ? '' : 'none';
      });
    });
  });
}

/* ────────────────────────────────────
   Scroll reveal (lightweight)
──────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initTenderFilter();
});
