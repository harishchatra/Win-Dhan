/* ══════════════════════════
   SHARED NAV TEMPLATE
   (inline string, used by JS)
══════════════════════════ */

(function () {
  const NAV_HTML = `
<header id="mainNav">
  <div class="topbar" style="background:#0F2E1F; font-family:'Inter',sans-serif; font-size:11.5px; color:rgba(255,255,255,0.65); min-height:40px; display:flex; align-items:center; padding:0 20px;">
    <div style="width:100%; max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>IRE 2026 · 3–4 July 2026 · HMDA Grounds, Necklace Road, Hyderabad</div>
      <div style="display:flex; gap:15px;">
        <a href="tel:+917981869954" style="color:rgba(255,255,255,0.65); text-decoration:none;">phone</a>
        <span>|</span>
        <a href="mailto:ireexpo2026@gmail.com" style="color:rgba(255,255,255,0.65); text-decoration:none;">email</a>
        <span>|</span>
        <a href="contact.html" style="color:rgba(255,255,255,0.65); text-decoration:none;">Contact</a>
      </div>
    </div>
  </div>
  <div class="main-navbar" style="background:#FFFFFF; border-bottom:1px solid #E2E2E2; box-shadow:0 1px 4px rgba(0,0,0,0.06); height:68px; display:flex; align-items:center; padding:0 20px;">
    <div style="width:100%; max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
      <a class="nav-logo" href="index.html" style="display:flex; align-items:center; gap:12px; text-decoration:none;">
        <div style="width:42px; height:42px; background:#1A4731; border-radius:4px; display:flex; flex-direction:column; align-items:center; justify-content:center; line-height:1;">
          <div style="color:#C9943A; font-family:'Playfair Display',serif; font-weight:800; font-size:14px;">WIN</div>
          <div style="color:#FFFFFF; font-family:'Playfair Display',serif; font-weight:800; font-size:14px;">DE</div>
        </div>
        <div class="logo-text">
          <div style="font-family:'Playfair Display',serif; font-size:20px; font-weight:800; color:#111111; line-height:1.1;">Dhan Enterprise</div>
          <div style="font-family:'Inter',sans-serif; font-size:9px; color:#555555; letter-spacing:1px; text-transform:uppercase; font-weight:600; margin-top:2px;">ENCOMPASSING ENERGY REVOLUTION</div>
        </div>
      </a>
      
      <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="navLinks">
        <i class="ti ti-menu-2"></i>
      </button>

      <nav class="nav-links" id="navLinks" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <button class="nav-close" id="navClose" aria-label="Close navigation menu"><i class="ti ti-x"></i></button>
        <a href="index.html" data-page="index">Home</a>
        <div class="nav-group">
          <span class="nav-btn" data-page="about">About ▾</span>
          <div class="nav-dropdown">
            <a href="about.html#story">Our Story</a>
            <a href="about.html#team">Team</a>
            <a href="about.html#certifications">Certifications</a>
          </div>
        </div>
        <a href="services.html" data-page="services">Services</a>
        <div class="nav-group">
          <span class="nav-btn" data-page="ire"><span class="live-badge">LIVE</span>IRE 2026 ▾</span>
          <div class="nav-dropdown">
            <a href="ire.html#stall-layout">Floor Plan</a>
            <a href="ire.html#agenda">Agenda</a>
            <a href="ire.html#exhibitors">Exhibitors</a>
            <a href="ire.html#venue">Venue</a>
            <div class="nav-drop-divider"></div>
            <a href="stalls-booking/index.html" style="color:var(--green); font-weight: 700;">Book a Stall →</a>
          </div>
        </div>
        <div class="nav-group">
          <span class="nav-btn" data-page="trade">Trade ▾</span>
          <div class="nav-dropdown">
            <a href="trade.html#directory">Trade Directory</a>
            <a href="tenders.html">Tenders</a>
          </div>
        </div>
        <span class="nav-separator"></span>
        <a href="register.html" class="btn-ghost">Register</a>
        <a href="stalls-booking/index.html" class="btn-primary">Book a Stall →</a>
      </nav>
    </div>
  </div>
</header>`;

  const FOOTER_HTML = `
<footer style="background:#1C1C1C; color:#CCCCCC; padding:4rem 20px; font-family:'Inter',sans-serif;">
  <div style="max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:2rem;">
    <div class="footer-brand">
      <div style="width:42px; height:42px; background:#1A4731; border-radius:4px; display:flex; flex-direction:column; align-items:center; justify-content:center; line-height:1; margin-bottom:1rem;">
        <div style="color:#C9943A; font-family:'Playfair Display',serif; font-weight:800; font-size:14px;">WIN</div>
        <div style="color:#FFFFFF; font-family:'Playfair Display',serif; font-weight:800; font-size:14px;">DE</div>
      </div>
      <p style="font-size:0.9rem; line-height:1.6; color:#888888;">Dhan Enterprise — Encompassing Energy Revolution.<br>10+ years of renewable energy expertise from Hyderabad, India.</p>
    </div>
    <div class="footer-col" style="display:flex; flex-direction:column; gap:0.5rem;">
      <h5 style="color:#FFFFFF; font-size:1rem; font-weight:600; margin-bottom:1rem;">Services</h5>
      <a href="services.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">EV Consulting</a>
      <a href="services.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">Solar Energy</a>
      <a href="services.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">BESS &amp; Storage</a>
      <a href="services.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">Wind Energy</a>
      <a href="trade.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">Import / Export</a>
    </div>
    <div class="footer-col" style="display:flex; flex-direction:column; gap:0.5rem;">
      <h5 style="color:#FFFFFF; font-size:1rem; font-weight:600; margin-bottom:1rem;">IRE 2026</h5>
      <a href="ire.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">About IRE Expo</a>
      <a href="stalls-booking/index.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">Book a Stall</a>
      <a href="register.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">Visitor Registration</a>
      <a href="admin.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">Admin Dashboard</a>
      <a href="ire.html#sponsors" style="color:#888888; text-decoration:none; font-size:0.9rem;">Sponsors & Partners</a>
      <a href="tenders.html" style="color:#888888; text-decoration:none; font-size:0.9rem;">Gov Tenders</a>
    </div>
    <div class="footer-col" style="display:flex; flex-direction:column; gap:0.5rem;">
      <h5 style="color:#FFFFFF; font-size:1rem; font-weight:600; margin-bottom:1rem;">Contact</h5>
      <a href="tel:9849446409" style="color:#888888; text-decoration:none; font-size:0.9rem;">9849446409</a>
      <a href="tel:8331976555" style="color:#888888; text-decoration:none; font-size:0.9rem;">8331976555</a>
      <a href="mailto:hari@win-dhan.in" style="color:#888888; text-decoration:none; font-size:0.9rem;">hari@win-dhan.in</a>
      <a href="https://www.win-dhan.com" target="_blank" style="color:#888888; text-decoration:none; font-size:0.9rem;">www.win-dhan.com</a>
    </div>
  </div>
  <div style="max-width:1200px; margin:2rem auto 0; padding-top:2rem; border-top:1px solid #333333; display:flex; justify-content:space-between; flex-wrap:wrap; gap:1rem; color:#888888; font-size:0.8rem;">
    <p>© 2026 Dhan Enterprise. Co-organizer: Suprabha Trust. All rights reserved.</p>
    <p>Hyderabad · India</p>
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
    if (el.dataset.page === page || (page === 'tenders' && el.dataset.page === 'trade')) el.classList.add('active');
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
    
    // Toggle scrolled state shadow
    nav.classList.toggle('scrolled', currentScrollY > 40);

    // Slide navbar out of view when scrolling down, slide back when scrolling up
    if (navLinks && !navLinks.classList.contains('open')) {
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
    }
    lastScrollY = currentScrollY;
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
