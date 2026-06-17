/* ══════════════════════════
   SHARED NAV TEMPLATE
   (inline string, used by JS)
══════════════════════════ */

(function () {
  const NAV_HTML = `
<header id="mainNav">
  <div class="utility-bar">
    <div class="utility-container">
      <div class="utility-left">
        3rd–4th July 2026 · HMDA Grounds, Necklace Road, Hyderabad
      </div>
      <div class="utility-right">
        <a href="tel:+917981869954">+91 79818 69954</a>
        <span class="utility-sep">·</span>
        <a href="mailto:ireexpo2026@gmail.com">ireexpo2026@gmail.com</a>
        <span class="utility-sep">·</span>
        <a href="contact.html">Contact</a>
      </div>
    </div>
  </div>
  <div class="main-navbar">
    <div class="nav-container">
      <a class="nav-logo" href="index.html">
        <div class="logo-mark">
          <svg viewBox="0 0 86 52" xmlns="http://www.w3.org/2000/svg">
            <rect width="86" height="52" rx="11" fill="#18542a"/>
            <rect width="86" height="52" rx="11" fill="none" stroke="rgba(249,96,21,0.45)" stroke-width="1.2"/>
            <text x="2"  y="30" font-family="Georgia,serif" font-size="17" font-weight="800" fill="#ffc926">W</text>
            <text x="16" y="30" font-family="Georgia,serif" font-size="17" font-weight="800" fill="#f96015">IN</text>
            <text x="3"  y="41" font-family="Arial,sans-serif" font-size="6.5" font-weight="400" fill="rgba(255,201,38,0.65)" letter-spacing="1.5">DHAN</text>
            <line x1="34" y1="9" x2="34" y2="43" stroke="rgba(249,96,21,0.35)" stroke-width="1"/>
            <text x="36" y="39" font-family="Georgia,serif" font-size="28" font-weight="800" fill="#f96015">D</text>
            <circle cx="55" cy="24" r="4" fill="#ffc926"/>
            <circle cx="55" cy="24" r="2.2" fill="#f96015"/>
            <text x="57" y="39" font-family="Georgia,serif" font-size="28" font-weight="800" fill="#ffc926">E</text>
          </svg>
        </div>
        <div class="logo-text">
          <div class="brand">Dhan Enterprise</div>
          <div class="tagline">Encompassing Energy Revolution</div>
        </div>
      </a>
      
      <!-- Hamburger Toggle Button -->
      <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="navLinks">
        <i class="ti ti-menu-2"></i>
      </button>

      <!-- Navigation links drawer -->
      <nav class="nav-links" id="navLinks" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <button class="nav-close" id="navClose" aria-label="Close navigation menu"><i class="ti ti-x"></i></button>
        <a href="index.html" data-page="index">Home</a>
        <div class="nav-group">
          <span class="nav-btn" data-page="about">About ▾</span>
          <div class="nav-dropdown">
            <a href="about.html#story"><i class="ti ti-book-open"></i> Our Story</a>
            <a href="about.html#team"><i class="ti ti-users"></i> Team</a>
            <a href="about.html#certifications"><i class="ti ti-certificate"></i> Certifications</a>
          </div>
        </div>
        <a href="services.html" data-page="services">Services</a>
        <div class="nav-group">
          <span class="nav-btn" data-page="ire"><span class="live-badge">LIVE</span>IRE 2026 ▾</span>
          <div class="nav-dropdown">
            <a href="ire.html#stall-layout"><i class="ti ti-map"></i> Floor Plan</a>
            <a href="ire.html#agenda"><i class="ti ti-calendar-event"></i> Agenda</a>
            <a href="ire.html#exhibitors"><i class="ti ti-building-store"></i> Exhibitors</a>
            <a href="ire.html#venue"><i class="ti ti-map-pin"></i> Venue</a>
            <div class="nav-drop-divider"></div>
            <a href="stalls-booking/index.html" style="color: #B87333; font-weight: 700;"><i class="ti ti-ticket"></i> Book Your Stall →</a>
          </div>
        </div>
        <div class="nav-group">
          <span class="nav-btn" data-page="trade">Trade ▾</span>
          <div class="nav-dropdown">
            <a href="trade.html#directory"><i class="ti ti-folder"></i> Trade Directory</a>
            <a href="tenders.html"><i class="ti ti-file-text"></i> Tenders</a>
            <a href="network.html"><i class="ti ti-users"></i> Partner Network</a>
            <a href="classifieds.html"><i class="ti ti-news"></i> Classifieds</a>
          </div>
        </div>
        <span class="nav-separator"></span>
        <a href="register.html" class="btn-register">Register</a>
        <a href="stalls-booking/index.html" class="btn-book-stall">Book Your Stall →</a>
      </nav>
    </div>
  </div>
</header>`;

  const FOOTER_HTML = `
<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="logo-mark" style="width:80px;height:48px;margin-bottom:0.9rem;">
        <svg viewBox="0 0 86 52" xmlns="http://www.w3.org/2000/svg" width="80" height="48">
          <rect width="86" height="52" rx="11" fill="#18542a"/>
          <rect width="86" height="52" rx="11" fill="none" stroke="rgba(249,96,21,0.45)" stroke-width="1.2"/>
          <text x="2" y="30" font-family="Georgia,serif" font-size="17" font-weight="800" fill="#ffc926">W</text>
          <text x="16" y="30" font-family="Georgia,serif" font-size="17" font-weight="800" fill="#f96015">IN</text>
          <text x="3" y="41" font-family="Arial,sans-serif" font-size="6.5" fill="rgba(255,201,38,0.65)" letter-spacing="1.5">DHAN</text>
          <line x1="34" y1="9" x2="34" y2="43" stroke="rgba(249,96,21,0.35)" stroke-width="1"/>
          <text x="36" y="39" font-family="Georgia,serif" font-size="28" font-weight="800" fill="#f96015">D</text>
          <circle cx="55" cy="24" r="4" fill="#ffc926"/>
          <circle cx="55" cy="24" r="2.2" fill="#f96015"/>
          <text x="57" y="39" font-family="Georgia,serif" font-size="28" font-weight="800" fill="#ffc926">E</text>
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
      <a href="network.html">Partner Network</a>
      <a href="classifieds.html">Classifieds</a>
    </div>
    <div class="footer-col">
      <h5>IRE 2026</h5>
      <a href="ire.html">About IRE Expo</a>
      <a href="stalls-booking/index.html">Book Your Stall</a>
      <a href="register.html">Visitor Registration</a>
      <a href="admin.html">Admin Dashboard</a>
      <a href="ire.html#sponsors">Sponsors & Partners</a>
      <a href="tenders.html">Gov Tenders</a>
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
    if (el.dataset.page === page || ((page === 'tenders' || page === 'network' || page === 'classifieds') && el.dataset.page === 'trade')) el.classList.add('active');
  });

  // Hamburger menu toggle, focus trap, and close on ESC/backdrop
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    const toggleMenu = (open) => {
      const isOpening = (open !== undefined) ? open : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', isOpening);
      navToggle.setAttribute('aria-expanded', isOpening);
      navToggle.classList.toggle('active', isOpening);
      
      if (isOpening) {
        document.body.style.overflow = 'hidden';
        if (navClose) navClose.focus();
      } else {
        document.body.style.overflow = '';
        navToggle.focus();
      }
    };

    navToggle.addEventListener('click', () => toggleMenu());
    if (navClose) navClose.addEventListener('click', () => toggleMenu(false));

    // Close on backdrop click (outside nav content)
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        toggleMenu(false);
      }
    });

    // Keyboard Focus Trap
    navLinks.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusables = navLinks.querySelectorAll('a, button, [tabindex="0"]');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    });

    // Close menu when links are clicked (useful for anchor links on same page)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          toggleMenu(false);
        }
      });
    });
  }

  // Scroll Shadow and Scroll-driven Navbar hide/show
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    const currentScrollY = window.scrollY;
    const html = document.documentElement;
    
    // Toggle scrolled state shadow
    nav.classList.toggle('scrolled', currentScrollY > 40);

    // Slide navbar out of view when scrolling down, slide back when scrolling up
    if (navLinks && !navLinks.classList.contains('open')) {
      if (currentScrollY <= 40) {
        html.classList.remove('nav-hidden', 'nav-shrunk');
      } else if (currentScrollY > lastScrollY && currentScrollY > 120) {
        html.classList.remove('nav-shrunk');
        html.classList.add('nav-hidden');
      } else if (currentScrollY < lastScrollY) {
        html.classList.remove('nav-hidden');
        html.classList.add('nav-shrunk');
      }
    }
    lastScrollY = currentScrollY;
  });
})();

/* ────────────────────────────────────
   Countdown timer (shared)
──────────────────────────────────── */
function startCountdown(containerId) {
  const target = new Date('2026-07-03T11:00:00');
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
    el.style.borderColor = '#d52518';
    el.style.boxShadow = '0 0 0 3px rgba(213,37,24,0.1)';
    const d = document.createElement('div');
    d.className = 'err';
    d.style.cssText = 'color:#d52518;font-size:.75rem;font-weight:700;margin-top:.25rem;';
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
